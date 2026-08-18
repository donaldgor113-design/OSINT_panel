import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Button,
  List, ListItemButton, Radio, LinearProgress, Chip,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeReport } from "@/store/uiSlice";
import { setReportTemplate } from "@/store/workspaceSlice";
import { TEMPLATES } from "@/data/mock";

export default function ReportModal() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.reportOpen);
  const templateId = useAppSelector((s) => s.workspace.reportTemplate);
  const template = TEMPLATES[templateId];
  const [format, setFormat] = useState<"pdf" | "docx">("pdf");
  const [progress, setProgress] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const close = () => { dispatch(closeReport()); setProgress(null); setDone(false); };

  const generate = () => {
    let p = 0;
    const t = setInterval(() => {
      p += Math.floor(Math.random() * 12) + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(t);
        setDone(true);
      }
      setProgress(p);
    }, 260);
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="md" PaperProps={{ sx: { bgcolor: "#1A2B4C", border: "1px solid rgba(0,229,255,0.3)", borderRadius: 2.5 } }}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 0 }}>
        📄 Генератор звітів
        <Button onClick={close} sx={{ color: "text.secondary", minWidth: 30 }}>✕</Button>
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "text.secondary", fontWeight: 700, mt: 1, mb: 0.75 }}>
          Крок 1 — Виберіть шаблон
        </Typography>
        <List dense>
          {(Object.keys(TEMPLATES) as (keyof typeof TEMPLATES)[]).map((id) => {
            const t = TEMPLATES[id];
            return (
              <ListItemButton
                key={id}
                selected={templateId === id}
                onClick={() => dispatch(setReportTemplate(id))}
                sx={{
                  borderRadius: 1.5, mb: 0.5,
                  "&.Mui-selected": { bgcolor: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.4)" },
                }}
              >
                <Box sx={{ fontSize: 22, mr: 1 }}>{t.icon}</Box>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{t.name}</Typography>
                  <Typography sx={{ fontSize: 11, color: "text.faint" }}>{t.desc}</Typography>
                </Box>
              </ListItemButton>
            );
          })}
        </List>

        <Typography sx={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "text.secondary", fontWeight: 700, mt: 1.5, mb: 0.75 }}>
          Крок 2 — Автоматичний мапінг полів
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6 }}>
          {template.fields.map((f) => (
            <Box key={f.from} sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: 12, color: "text.secondary", p: 0.75, borderRadius: 1, bgcolor: "rgba(10,14,23,0.9)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <b style={{ fontFamily: "monospace", fontSize: 11.5, color: "text.primary", flex: 1 }}>{f.from}</b>
              <span style={{ color: "#00E5FF" }}>→</span>
              <span>{f.to}</span>
              <Chip label={f.status === "warn" ? "⚠ ручне" : "✓ авто"} size="small" sx={{ fontSize: 10.5, height: 18, color: f.status === "warn" ? "warning.main" : "success.main" }} />
            </Box>
          ))}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mt: 1.5 }}>
          <Typography sx={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "text.secondary", fontWeight: 700, mr: 1 }}>
            Формат:
          </Typography>
          <Box onClick={() => setFormat("pdf")} sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer" }}>
            <Radio checked={format === "pdf"} size="small" /> PDF
          </Box>
          <Box onClick={() => setFormat("docx")} sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer" }}>
            <Radio checked={format === "docx"} size="small" /> DOCX
          </Box>
          <Chip label="📊 Графіки" size="small" sx={{ fontSize: 11 }} />
          <Chip label="💧 Водяний знак" size="small" sx={{ fontSize: 11 }} />
        </Box>

        {progress !== null && (
          <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
            <LinearProgress variant="determinate" value={progress} sx={{ flex: 1, height: 6, borderRadius: 4, bgcolor: "#2A3F6B" }} />
            <Typography sx={{ fontSize: 11, fontFamily: "monospace", color: done ? "success.main" : "text.secondary" }}>
              {done ? "✓ Готово" : progress + "%"}
            </Typography>
          </Box>
        )}
        {done && (
          <Typography sx={{ mt: 1, color: "success.main", fontSize: 12 }}>
            ✓ Звіт «{template.name}».{format} згенеровано та підписано водяним знаком
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={close} sx={{ color: "text.secondary" }}>Скасувати</Button>
        <Button
          variant="contained"
          onClick={generate}
          disabled={progress !== null && !done}
          sx={{ bgcolor: "primary.main", color: "#04121F", fontWeight: 800, boxShadow: "0 0 14px rgba(0,229,255,0.35)", "&:hover": { filter: "brightness(1.1)" } }}
        >
          ⚡ Згенерувати звіт
        </Button>
      </DialogActions>
    </Dialog>
  );
}