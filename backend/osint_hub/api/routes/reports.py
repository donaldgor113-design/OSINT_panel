import uuid
from datetime import datetime, timezone
from io import BytesIO
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from osint_hub.api.routes.cases import _get_own_case_or_404
from osint_hub.api.routes.entities import _get_own_entity_or_404
from osint_hub.api.schemas.report import (
    ReportCreate,
    ReportDetail,
    ReportPublic,
    ReportTemplatePublic,
    ReportUpdate,
)
from osint_hub.core.reporting.docx_export import build_docx
from osint_hub.core.reporting.generator import generate_report
from osint_hub.core.reporting.templates import TEMPLATES
from osint_hub.dependencies import get_current_user
from osint_hub.infrastructure.database.connection import get_db
from osint_hub.infrastructure.database.models import Report, User

router = APIRouter(tags=["reports"])


@router.get("/report-templates", response_model=list[ReportTemplatePublic])
async def list_report_templates() -> list[ReportTemplatePublic]:
    return [
        ReportTemplatePublic(
            id=t.id,
            name=t.name,
            description=t.description,
            icon=t.icon,
            primary_entity_type=t.primary_entity_type,
            primary_fields=[
                {"entity_type": f.entity_type, "field_key": f.field_key, "label": f.label, "required": f.required}
                for f in t.primary_fields
            ],
            related_sections=[{"entity_type": etype, "label": label} for etype, label in t.related_sections],
        )
        for t in TEMPLATES.values()
    ]


async def _get_own_report_or_404(db: AsyncSession, report_id: uuid.UUID, user: User) -> Report:
    result = await db.execute(select(Report).where(Report.id == report_id, Report.user_id == user.id))
    report = result.scalar_one_or_none()
    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "REPORT_NOT_FOUND", "message": "Звіт не знайдено"}},
        )
    return report


@router.post("/cases/{case_id}/reports", response_model=ReportDetail, status_code=status.HTTP_201_CREATED)
async def create_report(
    case_id: uuid.UUID,
    payload: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ReportDetail:
    case = await _get_own_case_or_404(db, case_id, current_user)

    template = TEMPLATES.get(payload.template_id)
    if template is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": {"code": "UNKNOWN_TEMPLATE", "message": "Невідомий шаблон звіту"}},
        )

    primary_entity = None
    if template.primary_entity_type:
        if payload.primary_entity_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": {"code": "PRIMARY_ENTITY_REQUIRED", "message": "Цей шаблон потребує обрати сутність-суб'єкт"}},
            )
        primary_entity = await _get_own_entity_or_404(db, payload.primary_entity_id, current_user)
        if primary_entity.entity_type != template.primary_entity_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": {"code": "ENTITY_TYPE_MISMATCH", "message": "Тип сутності не відповідає шаблону"}},
            )

    title = payload.title or f"{template.name} · {primary_entity.display_name if primary_entity else case.title}"
    content, missing, html = await generate_report(db, case=case, template=template, primary_entity=primary_entity, title=title)

    report = Report(
        user_id=current_user.id,
        case_id=case_id,
        primary_entity_id=primary_entity.id if primary_entity else None,
        template_id=template.id,
        title=title,
        status="draft",
        content_html=html,
        content_json=content,
        missing_fields=missing,
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report


@router.get("/reports", response_model=list[ReportPublic])
async def list_reports(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Report]:
    result = await db.execute(select(Report).where(Report.user_id == current_user.id).order_by(Report.created_at.desc()))
    return list(result.scalars().all())


@router.get("/cases/{case_id}/reports", response_model=list[ReportPublic])
async def list_case_reports(
    case_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Report]:
    await _get_own_case_or_404(db, case_id, current_user)
    result = await db.execute(
        select(Report).where(Report.case_id == case_id, Report.user_id == current_user.id).order_by(Report.created_at.desc())
    )
    return list(result.scalars().all())


@router.get("/reports/{report_id}", response_model=ReportDetail)
async def get_report(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Report:
    return await _get_own_report_or_404(db, report_id, current_user)


@router.patch("/reports/{report_id}", response_model=ReportDetail)
async def update_report(
    report_id: uuid.UUID,
    payload: ReportUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Report:
    report = await _get_own_report_or_404(db, report_id, current_user)
    if payload.title is not None:
        report.title = payload.title
    if payload.status is not None:
        report.status = payload.status
    await db.commit()
    await db.refresh(report)
    return report


@router.delete("/reports/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    report = await _get_own_report_or_404(db, report_id, current_user)
    await db.delete(report)
    await db.commit()


@router.get("/reports/{report_id}/export")
async def export_report(
    report_id: uuid.UUID,
    export_format: str = "docx",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    report = await _get_own_report_or_404(db, report_id, current_user)

    if export_format != "docx":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": {"code": "UNSUPPORTED_FORMAT", "message": "Наразі підтримується тільки docx"}},
        )
    if not report.content_json:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": {"code": "NO_CONTENT", "message": "Звіт не має збереженого контенту"}},
        )

    docx_bytes = build_docx(report.title, report.content_json)

    report.exported_formats = {**(report.exported_formats or {}), "docx": datetime.now(timezone.utc).isoformat()}
    await db.commit()

    filename = f"{report.title}.docx".replace("/", "-")
    ascii_fallback = filename.encode("ascii", "replace").decode("ascii")
    encoded_filename = quote(filename)
    return StreamingResponse(
        BytesIO(docx_bytes),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f"attachment; filename=\"{ascii_fallback}\"; filename*=UTF-8''{encoded_filename}"
        },
    )
