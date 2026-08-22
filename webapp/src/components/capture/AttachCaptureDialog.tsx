import { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, IconButton, Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { listCases, listCaseEntities } from "@/api/cases";
import { attachCaptureItem } from "@/api/capture";
import type { ApiCase, ApiEntity, ApiCaptureItem } from "@/types/api";

export default function AttachCaptureDialog({
  item, open, onClose, onAttached,
}: {
  item: ApiCaptureItem;
  open: boolean;
  onClose: () => void;
  onAttached: (item: ApiCaptureItem) => void;
}) {
  const [cases, setCases] = useState<ApiCase[]>([]);
  const [entities, setEntities] = useState<ApiEntity[]>([]);
  const [caseId, setCaseId] = useState("");
  const [entityId, setEntityId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) listCases().then(setCases);
  }, [open]);

  useEffect(() => {
    setEntityId("");
    if (caseId) listCaseEntities(caseId).then(setEntities);
    else setEntities([]);
  }, [caseId]);

  const submit = async () => {
    if (!caseId || !entityId) return;
    setSaving(true);
    try {
      const updated = await attachCaptureItem(item.id, caseId, entityId);
      onAttached(updated);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        Прикріпити файл
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>{item.file_name}</Typography>

        <TextField select size="small" label="Справа" value={caseId} onChange={(e) => setCaseId(e.target.value)}>
          {cases.map((c) => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
        </TextField>

        <TextField
          select size="small" label="Сутність" value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
          disabled={!caseId}
        >
          {entities.map((e) => <MenuItem key={e.id} value={e.id}>{e.display_name} ({e.entity_type})</MenuItem>)}
        </TextField>
        {caseId && entities.length === 0 && (
          <Typography sx={{ fontSize: 11.5, color: "text.faint" }}>У цій справі ще немає сутностей.</Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: "text.secondary" }}>Скасувати</Button>
        <Button variant="contained" color="secondary" onClick={submit} disabled={saving || !caseId || !entityId}>
          Прикріпити
        </Button>
      </DialogActions>
    </Dialog>
  );
}
