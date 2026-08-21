import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, Typography, Chip, Button, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import PageHeader from "@/components/common/PageHeader";
import { listCases, createCase } from "@/api/cases";
import type { ApiCase } from "@/types/api";

const STATUS_COLOR: Record<string, string> = { active: "success.main", paused: "warning.main", closed: "text.faint", archived: "text.faint" };
const STATUS_LABEL: Record<string, string> = { active: "активна", paused: "призупинена", closed: "закрита", archived: "архів" };
const CASE_TYPE_LABEL: Record<string, string> = {
  person: "Пошук особи", legal_entity: "Юридична особа", surveillance: "Відеонагляд",
  recognition: "Розпізнання", monitoring: "Моніторинг", mixed: "Змішана",
};

export default function Cases() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<ApiCase[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [caseType, setCaseType] = useState("person");
  const [saving, setSaving] = useState(false);

  const load = () => {
    listCases()
      .then(setCases)
      .catch(() => setError("Не вдалося завантажити справи з бекенду."));
  };

  useEffect(load, []);

  const submit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const created = await createCase({ title, goal: goal || undefined, case_type: caseType });
      setDialogOpen(false);
      setTitle("");
      setGoal("");
      navigate(`/cases/${created.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
      <PageHeader
        title="Справи"
        subtitle="Робочий простір для збору по людині/юрособі — усі знахідки прив'язуються до полів сутностей справи"
        actions={
          <Button variant="contained" color="secondary" startIcon={<AddIcon sx={{ fontSize: 18 }} />} onClick={() => setDialogOpen(true)}>
            Нова справа
          </Button>
        }
      />

      {error && <Typography sx={{ fontSize: 13, color: "error.main" }}>{error}</Typography>}
      {!error && !cases && <CircularProgress size={24} />}

      {cases && cases.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8, color: "text.faint" }}>
          <FolderOutlinedIcon sx={{ fontSize: 42, mb: 1.5 }} />
          <Typography sx={{ fontSize: 14 }}>Ще немає жодної справи — створи першу</Typography>
        </Box>
      )}

      {cases && cases.length > 0 && (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 2 }}>
          {cases.map((c) => (
            <Card key={c.id} sx={{ p: 2.5, cursor: "pointer" }} onClick={() => navigate(`/cases/${c.id}`)}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600, flex: 1 }}>{c.title}</Typography>
                <Chip label={STATUS_LABEL[c.status] ?? c.status} size="small" sx={{ fontSize: 10, color: STATUS_COLOR[c.status] ?? "text.faint" }} />
              </Box>
              {c.case_type && (
                <Chip label={CASE_TYPE_LABEL[c.case_type] ?? c.case_type} size="small" variant="outlined" sx={{ fontSize: 10, mb: 1 }} />
              )}
              {c.goal && <Typography sx={{ fontSize: 12.5, color: "text.secondary", lineHeight: 1.5 }}>{c.goal}</Typography>}
              <Typography sx={{ fontSize: 11, color: "text.faint", mt: 1.5 }}>
                Створено {new Date(c.created_at).toLocaleDateString("uk-UA")}
              </Typography>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Нова справа
          <IconButton size="small" onClick={() => setDialogOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField size="small" label="Назва справи" required value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextField select size="small" label="Тип" value={caseType} onChange={(e) => setCaseType(e.target.value)}>
            {Object.entries(CASE_TYPE_LABEL).map(([id, label]) => <MenuItem key={id} value={id}>{label}</MenuItem>)}
          </TextField>
          <TextField size="small" label="Мета / intelligence requirement" multiline rows={2} value={goal} onChange={(e) => setGoal(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: "text.secondary" }}>Скасувати</Button>
          <Button variant="contained" color="secondary" onClick={submit} disabled={saving || !title.trim()}>Створити</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
