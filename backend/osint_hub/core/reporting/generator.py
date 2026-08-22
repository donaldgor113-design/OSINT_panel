import uuid
from typing import Any

from jinja2 import Template
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from osint_hub.core.entities.details import get_details_dict
from osint_hub.core.reporting.templates import ReportTemplateDef
from osint_hub.infrastructure.database.models import Case, Entity, Event, Relationship

_HTML_TEMPLATE = Template("""
<div class="report">
  <h1>{{ title }}</h1>
  <p class="meta">Справа: {{ case.title }}{% if case.goal %} · {{ case.goal }}{% endif %}</p>

  {% if primary %}
  <h2>{{ primary.display_name }}</h2>
  <table class="fields">
    {% for f in primary.fields %}
    <tr class="{{ 'missing' if f.required and not f.value else '' }}">
      <th>{{ f.label }}{% if f.required %} *{% endif %}</th>
      <td>{{ f.value if f.value else '—' }}</td>
    </tr>
    {% endfor %}
  </table>
  {% endif %}

  {% for section in related_sections %}
    {% if section.entries %}
    <h3>{{ section.label }} ({{ section.entries|length }})</h3>
    <ul>
      {% for item in section.entries %}
      <li>
        <b>{{ item.display_name }}</b>
        {% if item.relationship_type %} — {{ item.relationship_type }}{% endif %}
        ({{ item.confidence }})
        {% if item.details %}
        <div class="detail-line">
          {% for k, v in item.details.items() if v %}{{ k }}: {{ v }}; {% endfor %}
        </div>
        {% endif %}
      </li>
      {% endfor %}
    </ul>
    {% endif %}
  {% endfor %}

  {% if events %}
  <h3>Таймлайн</h3>
  <ul>
    {% for e in events %}
    <li>{% if e.date %}<b>{{ e.date }}</b> — {% endif %}{{ e.title }}{% if e.description %}: {{ e.description }}{% endif %}</li>
    {% endfor %}
  </ul>
  {% endif %}

  {% if missing %}
  <h3 class="missing-header">Не вистачає даних</h3>
  <ul class="missing-list">
    {% for m in missing %}<li>{{ m }}</li>{% endfor %}
  </ul>
  {% endif %}
</div>
""", autoescape=True)  # entity field values are user-controlled input — must be HTML-escaped


async def _related_entities(db: AsyncSession, primary_id: uuid.UUID) -> list[tuple[Relationship, Entity]]:
    result = await db.execute(
        select(Relationship).where(
            or_(Relationship.source_entity_id == primary_id, Relationship.target_entity_id == primary_id)
        )
    )
    rels = result.scalars().all()

    pairs: list[tuple[Relationship, Entity]] = []
    for rel in rels:
        other_id = rel.target_entity_id if rel.source_entity_id == primary_id else rel.source_entity_id
        other = await db.get(Entity, other_id)
        if other is not None:
            pairs.append((rel, other))
    return pairs


async def generate_report(
    db: AsyncSession,
    *,
    case: Case,
    template: ReportTemplateDef,
    primary_entity: Entity | None,
    title: str,
) -> tuple[dict[str, Any], list[str], str]:
    """Returns (structured_content, missing_required_field_labels, rendered_html)."""

    missing: list[str] = []
    primary_content: dict[str, Any] | None = None

    if primary_entity is not None:
        details = await get_details_dict(db, primary_entity.entity_type, primary_entity.id)
        fields = []
        for f in template.primary_fields:
            value = details.get(f.field_key)
            fields.append({"key": f.field_key, "label": f.label, "required": f.required, "value": value})
            if f.required and not value:
                missing.append(f"{primary_entity.display_name}: {f.label}")
        primary_content = {"display_name": primary_entity.display_name, "fields": fields}

    related_by_type: dict[str, list[dict[str, Any]]] = {}
    if primary_entity is not None:
        for rel, other in await _related_entities(db, primary_entity.id):
            other_details = await get_details_dict(db, other.entity_type, other.id)
            related_by_type.setdefault(other.entity_type, []).append(
                {
                    "display_name": other.display_name,
                    "relationship_type": rel.relationship_type,
                    "confidence": other.confidence,
                    "details": {k: v for k, v in other_details.items() if v and k != "notes"},
                }
            )

    related_sections = [
        {"entity_type": etype, "label": label, "entries": related_by_type.get(etype, [])}
        for etype, label in template.related_sections
    ]

    events_result = await db.execute(select(Event).where(Event.case_id == case.id).order_by(Event.event_date))
    events = [
        {"title": e.title, "description": e.description, "date": e.event_date.isoformat() if e.event_date else None}
        for e in events_result.scalars().all()
    ]

    content = {
        "case": {"id": str(case.id), "title": case.title, "goal": case.goal, "status": case.status},
        "primary": primary_content,
        "related_sections": related_sections,
        "events": events,
        "missing": missing,
    }

    html = _HTML_TEMPLATE.render(title=title, **content)
    return content, missing, html
