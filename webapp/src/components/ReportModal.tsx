import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Button,
  List, ListItemButton, Radio, LinearProgress, Chip, IconButton,
} from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import BarChartIcon from "@mui/icons-material/BarChart";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import BoltIcon from "@mui/icons-material/Bolt";
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
    <Dialog open={open} onClose={close} fullWidth maxWidth="md" PaperProps={{ sx: { border: "1px solid rgba(139,92,246,0.3)", borderRadius: 2.5 } }}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 0, gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DescriptionOutlinedIcon sx={{ fontSize: 20, color: "secondary.main" }} />
          Генератор звітів
        </Box>
        <IconButton onClick={close} size="small" sx={{ color: "text.secondary" }}><CloseIcon fontSize="small" /></IconButton>
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
                  "&.Mui-selected": { bgcolor: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.4)" },
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
            <Box key={f.from} sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: 12, color: "text.secondary", p: 0.75, borderRadius: 1, bgcolor: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <b style={{ fontFamily: "monospace", fontSize: 11.5, color: "text.primary", flex: 1 }}>{f.from}</b>
              <span style={{ color: "#8B5CF6" }}>→</span>
              <span>{f.to}</span>
              <Chip
                icon={f.status === "warn" ? <WarningAmberIcon sx={{ fontSize: "13px !important" }} /> : <CheckCircleOutlineIcon sx={{ fontSize: "13px !important" }} />}
                label={f.status === "warn" ? "ручне" : "авто"}
                size="small"
                sx={{ fontSize: 10.5, height: 18, color: f.status === "warn" ? "warning.main" : "success.main", "& .MuiChip-icon": { color: "inherit" } }}
              />
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
          <Chip icon={<BarChartIcon sx={{ fontSize: "14px !important" }} />} label="Графіки" size="small" sx={{ fontSize: 11 }} />
          <Chip icon={<WaterDropOutlinedIcon sx={{ fontSize: "14px !important" }} />} label="Водяний знак" size="small" sx={{ fontSize: 11 }} />
        </Box>

        {progress !== null && (
          <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
            <LinearProgress variant="determinate" value={progress} sx={{ flex: 1, height: 6, borderRadius: 4, bgcolor: "#475569" }} />
            <Typography sx={{ fontSize: 11, fontFamily: "monospace", color: done ? "success.main" : "text.secondary" }}>
              {done ? "Готово" : progress + "%"}
            </Typography>
          </Box>
        )}
        {done && (
          <Typography sx={{ mt: 1.5, color: "success.main", fontSize: 12.5, display: "flex", alignItems: "center", gap: 0.75 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
            Звіт «{template.name}».{format} згенеровано та підписано водяним знаком
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={close} sx={{ color: "text.secondary" }}>Скасувати</Button>
        <Button
          variant="contained"
          startIcon={<BoltIcon sx={{ fontSize: 16 }} />}
          onClick={generate}
          disabled={progress !== null && !done}
          sx={{ bgcolor: "secondary.main", color: "#fff", fontWeight: 600, "&:hover": { filter: "brightness(1.1)" } }}
        >
          Згенерувати звіт
        </Button>
      </DialogActions>
    </Dialog>
  );
}