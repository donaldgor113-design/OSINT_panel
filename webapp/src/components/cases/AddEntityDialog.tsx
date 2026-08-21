import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, Box, IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { createEntity } from "@/api/cases";
import { ENTITY_FIELDS, ENTITY_TYPE_LABEL } from "@/utils/entityFields";
import type { ApiEntity, EntityType } from "@/types/api";

export default function AddEntityDialog({
  caseId, open, onClose, onCreated,
}: {
  caseId: string;
  open: boolean;
  onClose: () => void;
  onCreated: (entity: ApiEntity) => void;
}) {
  const [entityType, setEntityType] = useState<EntityType>("person");
  const [displayName, setDisplayName] = useState("");
  const [confidence, setConfidence] = useState("unverified");
  const [details, setDetails] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setEntityType("person");
    setDisplayName("");
    setConfidence("unverified");
    setDetails({});
  };

  const submit = async () => {
    if (!displayName.trim()) return;
    setSaving(true);
    try {
      const entity = await createEntity(caseId, {
        entity_type: entityType,
        display_name: displayName,
        confidence,
        details,
      });
      onCreated(entity);
      reset();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        Нова сутність
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        <TextField
          select size="small" label="Тип сутності" value={entityType}
          onChange={(e) => { setEntityType(e.target.value as EntityType); setDetails({}); }}
        >
          {(Object.keys(ENTITY_TYPE_LABEL) as EntityType[]).map((t) => (
            <MenuItem key={t} value={t}>{ENTITY_TYPE_LABEL[t]}</MenuItem>
          ))}
        </TextField>

        <TextField
          size="small" label="Назва / ім'я (для відображення)" required
          value={displayName} onChange={(e) => setDisplayName(e.target.value)}
        />

        <TextField
          select size="small" label="Рівень довіри" value={confidence}
          onChange={(e) => setConfidence(e.target.value)}
        >
          <MenuItem value="unverified">Неперевірено</MenuItem>
          <MenuItem value="probable">Ймовірно</MenuItem>
          <MenuItem value="confirmed">Підтверджено</MenuItem>
        </TextField>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          {ENTITY_FIELDS[entityType].map((f) => (
            <TextField
              key={f.key} size="small" label={f.label} type={f.type === "date" ? "date" : f.type}
              InputLabelProps={f.type === "date" ? { shrink: true } : undefined}
              value={details[f.key] ?? ""}
              onChange={(e) => setDetails((d) => ({ ...d, [f.key]: e.target.value }))}
              sx={f.label === "Примітки" ? { gridColumn: "1 / -1" } : undefined}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: "text.secondary" }}>Скасувати</Button>
        <Button variant="contained" color="secondary" onClick={submit} disabled={saving || !displayName.trim()}>
          Додати
        </Button>
      </DialogActions>
    </Dialog>
  );
}
