import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Chip, Button, IconButton, CircularProgress, Card,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import ChecklistIcon from "@mui/icons-material/Checklist";
import SearchIcon from "@mui/icons-material/Search";
import { getCase, listCaseEntities, listCaseRelationships, listCaseEvents } from "@/api/cases";
import type { ApiCase, ApiEntity, ApiRelationship, ApiEvent } from "@/types/api";
import { ENTITY_FIELDS, ENTITY_TYPE_COLOR, ENTITY_TYPE_ICON, ENTITY_TYPE_LABEL, CONFIDENCE_COLOR, CONFIDENCE_LABEL } from "@/utils/entityFields";
import AddEntityDialog from "@/components/cases/AddEntityDialog";

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<ApiCase | null>(null);
  const [entities, setEntities] = useState<ApiEntity[]>([]);
  const [relationships, setRelationships] = useState<ApiRelationship[]>([]);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const load = () => {
    if (!id) return;
    Promise.all([getCase(id), listCaseEntities(id), listCaseRelationships(id), listCaseEvents(id)])
      .then(([c, e, r, ev]) => { setCaseData(c); setEntities(e); setRelationships(r); setEvents(ev); })
      .catch(() => setError("Не вдалося завантажити справу."));
  };

  useEffect(load, [id]);

  if (error) return <Box sx={{ p: 3 }}><Typography sx={{ color: "error.main", fontSize: 13 }}>{error}</Typography></Box>;
  if (!caseData) return <Box sx={{ p: 3 }}><CircularProgress size={24} /></Box>;

  const entityById = Object.fromEntries(entities.map((e) => [e.id, e]));
  const grouped = entities.reduce<Record<string, ApiEntity[]>>((acc, e) => {
    (acc[e.entity_type] ??= []).push(e);
    return acc;
  }, {});

  const missingFieldsCount = entities.reduce((n, e) => {
    const fields = ENTITY_FIELDS[e.entity_type] ?? [];
    return n + fields.filter((f) => f.key !== "notes" && !e.details[f.key]).length;
  }, 0);

  return (
    <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <IconButton size="small" onClick={() => navigate("/cases")}><ArrowBackIcon fontSize="small" /></IconButton>
        <Typography sx={{ fontSize: 20, fontWeight: 600, flex: 1 }}>{caseData.title}</Typography>
        <Button size="small" variant="outlined" startIcon={<SearchIcon sx={{ fontSize: 16 }} />} onClick={() => navigate(`/cases/${id}/search`)}>
          Пошук через джерела
        </Button>
        <Chip label={caseData.status} size="small" sx={{ fontSize: 10 }} />
      </Box>
      {caseData.goal && <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2, ml: 5 }}>{caseData.goal}</Typography>}

      {missingFieldsCount > 0 && (
        <Card sx={{ p: 1.5, mb: 3, display: "flex", alignItems: "center", gap: 1.25, bgcolor: "rgba(245,158,11,0.06)", borderColor: "warning.main" }}>
          <ChecklistIcon sx={{ fontSize: 18, color: "warning.main" }} />
          <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
            Незаповнених полів у сутностях: <b>{missingFieldsCount}</b> — це чекліст того, чого ще бракує для звіту
          </Typography>
        </Card>
      )}

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Typography sx={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "text.faint", fontWeight: 600 }}>
          Сутності ({entities.length})
        </Typography>
        <Button size="small" variant="outlined" startIcon={<AddIcon sx={{ fontSize: 16 }} />} onClick={() => setAddOpen(true)}>
          Додати сутність
        </Button>
      </Box>

      {entities.length === 0 && (
        <Typography sx={{ fontSize: 13, color: "text.faint", mb: 3 }}>
          Ще немає жодної сутності. Додай вручну зараз — пошук через джерела (SourceModulePanel) підключимо наступною частиною.
        </Typography>
      )}

      {Object.entries(grouped).map(([type, items]) => {
        const Icon = ENTITY_TYPE_ICON[type as keyof typeof ENTITY_TYPE_ICON];
        return (
          <Box key={type} sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: 12, color: "text.faint", mb: 1 }}>{ENTITY_TYPE_LABEL[type as keyof typeof ENTITY_TYPE_LABEL]}</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 1.5 }}>
              {items.map((e) => (
                <Card key={e.id} sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Icon sx={{ fontSize: 16, color: ENTITY_TYPE_COLOR[type as keyof typeof ENTITY_TYPE_COLOR] }} />
                    <Typography sx={{ fontSize: 13.5, fontWeight: 600, flex: 1 }}>{e.display_name}</Typography>
                  </Box>
                  <Chip
                    label={CONFIDENCE_LABEL[e.confidence]}
                    size="small"
                    sx={{ fontSize: 9.5, height: 18, mb: 1, color: CONFIDENCE_COLOR[e.confidence] }}
                  />
                  {Object.entries(e.details).filter(([, v]) => v).map(([k, v]) => (
                    <Typography key={k} sx={{ fontSize: 11.5, color: "text.secondary" }}>{k}: {String(v)}</Typography>
                  ))}
                </Card>
              ))}
            </Box>
          </Box>
        );
      })}

      {relationships.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "text.faint", fontWeight: 600, mb: 1.5 }}>
            Зв'язки ({relationships.length})
          </Typography>
          {relationships.map((r) => (
            <Typography key={r.id} sx={{ fontSize: 12.5, color: "text.secondary", mb: 0.5 }}>
              <Tooltip title={entityById[r.source_entity_id]?.entity_type ?? ""}>
                <b style={{ color: "inherit" }}>{entityById[r.source_entity_id]?.display_name ?? "?"}</b>
              </Tooltip>
              {" — "}{r.relationship_type}{" → "}
              <Tooltip title={entityById[r.target_entity_id]?.entity_type ?? ""}>
                <b style={{ color: "inherit" }}>{entityById[r.target_entity_id]?.display_name ?? "?"}</b>
              </Tooltip>
            </Typography>
          ))}
        </Box>
      )}

      {events.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "text.faint", fontWeight: 600, mb: 1.5 }}>
            Таймлайн ({events.length})
          </Typography>
          {events.map((ev) => (
            <Typography key={ev.id} sx={{ fontSize: 12.5, color: "text.secondary", mb: 0.5 }}>
              <b style={{ color: "inherit" }}>{ev.title}</b>{ev.description ? ` — ${ev.description}` : ""}
            </Typography>
          ))}
        </Box>
      )}

      <AddEntityDialog
        caseId={caseData.id}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={(e) => setEntities((prev) => [...prev, e])}
      />
    </Box>
  );
}
