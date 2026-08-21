import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, Box, IconButton, Typography, Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { createEntity, updateEntity } from "@/api/cases";
import { ENTITY_FIELDS } from "@/utils/entityFields";
import type { ApiEntity } from "@/types/api";

const NEW_ENTITY = "__new__";

export default function AttachResultDialog({
  caseId, sourceName, result, existingPersons, open, onClose, onAttached,
}: {
  caseId: string;
  sourceName: string;
  result: Record<string, unknown>;
  existingPersons: ApiEntity[];
  open: boolean;
  onClose: () => void;
  onAttached: (entity: ApiEntity) => void;
}) {
  const personFields = ENTITY_FIELDS.person;
  const matched = Object.fromEntries(
    personFields.map((f) => [f.key, result[f.key] != null ? String(result[f.key]) : ""])
  );

  const [target, setTarget] = useState<string>(NEW_ENTITY);
  const [displayName, setDisplayName] = useState("");
  const [fields, setFields] = useState<Record<string, string>>(matched);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const details = Object.fromEntries(Object.entries(fields).filter(([, v]) => v.trim() !== ""));
    setSaving(true);
    try {
      let entity: ApiEntity;
      if (target === NEW_ENTITY) {
        entity = await createEntity(caseId, {
          entity_type: "person",
          display_name: displayName || sourceName,
          confidence: "probable",
          details,
          source_module: "source_module_panel",
          source_name: sourceName,
        });
      } else {
        entity = await updateEntity(target, {
          details,
          confidence: "probable",
          source_module: "source_module_panel",
          source_name: sourceName,
        });
      }
      onAttached(entity);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        Прикріпити результат до сутності
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        <Typography sx={{ fontSize: 12, color: "text.faint" }}>Джерело: {sourceName}</Typography>

        <TextField select size="small" label="Куди прикріпити" value={target} onChange={(e) => setTarget(e.target.value)}>
          <MenuItem value={NEW_ENTITY}>+ Нова особа</MenuItem>
          {existingPersons.map((p) => <MenuItem key={p.id} value={p.id}>{p.display_name}</MenuItem>)}
        </TextField>

        {target === NEW_ENTITY && (
          <TextField
            size="small" label="Назва для відображення" required
            value={displayName} onChange={(e) => setDisplayName(e.target.value)}
          />
        )}

        <Divider />
        <Typography sx={{ fontSize: 11, color: "text.faint", textTransform: "uppercase", letterSpacing: 0.5 }}>
          Поля для запису (перевір і виправ перед збереженням)
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          {personFields.map((f) => (
            <TextField
              key={f.key} size="small" label={f.label}
              value={fields[f.key] ?? ""}
              onChange={(e) => setFields((prev) => ({ ...prev, [f.key]: e.target.value }))}
              sx={f.label === "Примітки" ? { gridColumn: "1 / -1" } : undefined}
            />
          ))}
        </Box>

        <Divider />
        <Typography sx={{ fontSize: 11, color: "text.faint", textTransform: "uppercase", letterSpacing: 0.5 }}>
          Сирі дані результату (для звірки)
        </Typography>
        <Box sx={{ p: 1.25, borderRadius: 1.5, bgcolor: "background.default", fontFamily: "monospace", fontSize: 11, maxHeight: 140, overflow: "auto" }}>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(result, null, 2)}</pre>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: "text.secondary" }}>Скасувати</Button>
        <Button
          variant="contained" color="secondary" onClick={submit}
          disabled={saving || (target === NEW_ENTITY && !displayName.trim())}
        >
          Зберегти
        </Button>
      </DialogActions>
    </Dialog>
  );
}
