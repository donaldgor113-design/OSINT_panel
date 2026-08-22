import { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, IconButton, Typography, CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import { listReportTemplates, createReport } from "@/api/reports";
import { listCaseEntities } from "@/api/cases";
import type { ApiReportTemplate, ApiEntity } from "@/types/api";

export default function GenerateReportDialog({
  caseId, open, onClose,
}: {
  caseId: string;
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<ApiReportTemplate[]>([]);
  const [entities, setEntities] = useState<ApiEntity[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [primaryEntityId, setPrimaryEntityId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      listReportTemplates().then((ts) => { setTemplates(ts); setTemplateId(ts[0]?.id ?? ""); });
      listCaseEntities(caseId).then(setEntities);
      setPrimaryEntityId("");
      setError(null);
    }
  }, [open, caseId]);

  const template = templates.find((t) => t.id === templateId);
  const candidateEntities = template?.primary_entity_type
    ? entities.filter((e) => e.entity_type === template.primary_entity_type)
    : [];
  const needsPrimary = !!template?.primary_entity_type;

  const submit = async () => {
    setGenerating(true);
    setError(null);
    try {
      const report = await createReport(caseId, {
        template_id: templateId,
        primary_entity_id: needsPrimary ? primaryEntityId : undefined,
      });
      onClose();
      navigate(`/reports/${report.id}`);
    } catch {
      setError("Не вдалося згенерувати звіт.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        Сформувати звіт
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        <TextField select size="small" label="Шаблон" value={templateId} onChange={(e) => { setTemplateId(e.target.value); setPrimaryEntityId(""); }}>
          {templates.map((t) => <MenuItem key={t.id} value={t.id}>{t.icon} {t.name}</MenuItem>)}
        </TextField>
        {template && <Typography sx={{ fontSize: 12, color: "text.faint" }}>{template.description}</Typography>}

        {needsPrimary && (
          <TextField
            select size="small" label="Суб'єкт звіту" value={primaryEntityId}
            onChange={(e) => setPrimaryEntityId(e.target.value)}
          >
            {candidateEntities.map((e) => <MenuItem key={e.id} value={e.id}>{e.display_name}</MenuItem>)}
          </TextField>
        )}
        {needsPrimary && candidateEntities.length === 0 && (
          <Typography sx={{ fontSize: 11.5, color: "warning.main" }}>
            У справі ще немає сутностей типу «{template?.primary_entity_type}» — спершу додай через "Додати сутність" або "Пошук через джерела".
          </Typography>
        )}
        {error && <Typography sx={{ fontSize: 12, color: "error.main" }}>{error}</Typography>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: "text.secondary" }}>Скасувати</Button>
        <Button
          variant="contained" color="secondary" onClick={submit}
          disabled={generating || !templateId || (needsPrimary && !primaryEntityId)}
        >
          {generating ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Згенерувати"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
