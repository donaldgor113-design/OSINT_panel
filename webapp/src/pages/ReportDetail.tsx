import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Chip, Button, IconButton, CircularProgress, Card, Alert } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { getReport, updateReport, deleteReport, downloadReportDocx } from "@/api/reports";
import type { ApiReportDetail } from "@/types/api";

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<ApiReportDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (id) getReport(id).then(setReport).catch(() => setError("Не вдалося завантажити звіт."));
  }, [id]);

  if (error) return <Box sx={{ p: 3 }}><Typography sx={{ color: "error.main", fontSize: 13 }}>{error}</Typography></Box>;
  if (!report) return <Box sx={{ p: 3 }}><CircularProgress size={24} /></Box>;

  const markFinal = async () => {
    setBusy(true);
    try {
      const updated = await updateReport(report.id, { status: "final" });
      setReport(updated);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    await deleteReport(report.id);
    navigate("/reports");
  };

  return (
    <Box sx={{ flex: 1, overflow: "auto", p: 3, maxWidth: 900 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <IconButton size="small" onClick={() => navigate("/reports")}><ArrowBackIcon fontSize="small" /></IconButton>
        <Typography sx={{ fontSize: 18, fontWeight: 600, flex: 1 }}>{report.title}</Typography>
        <Chip
          label={report.status === "final" ? "готовий" : "чернетка"}
          size="small"
          sx={{ fontSize: 10, color: report.status === "final" ? "success.main" : "warning.main" }}
        />
      </Box>

      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <Button size="small" variant="outlined" startIcon={<DownloadIcon sx={{ fontSize: 16 }} />} onClick={() => downloadReportDocx(report.id, report.title)}>
          Завантажити .docx
        </Button>
        {report.status !== "final" && (
          <Button size="small" variant="outlined" color="success" startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />} onClick={markFinal} disabled={busy}>
            Позначити готовим
          </Button>
        )}
        <Button size="small" variant="outlined" color="error" startIcon={<DeleteOutlineIcon sx={{ fontSize: 16 }} />} onClick={remove}>
          Видалити
        </Button>
      </Box>

      {report.missing_fields && report.missing_fields.length > 0 && (
        <Alert severity="warning" icon={<WarningAmberIcon sx={{ fontSize: 18 }} />} sx={{ mb: 2 }}>
          Не вистачає обов'язкових полів: {report.missing_fields.join(", ")}
        </Alert>
      )}

      <Card sx={{ p: 3 }}>
        <Box
          className="report-view"
          dangerouslySetInnerHTML={{ __html: report.content_html ?? "" }}
          sx={{
            "& h1": { fontSize: 20, fontWeight: 600, mb: 0.5 },
            "& h2": { fontSize: 16, fontWeight: 600, mt: 2, mb: 1 },
            "& h3": { fontSize: 13, fontWeight: 600, mt: 2, mb: 1, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5 },
            "& .meta": { fontSize: 12.5, color: "text.faint", mb: 2 },
            "& table.fields": { width: "100%", borderCollapse: "collapse", mb: 2 },
            "& table.fields th": { textAlign: "left", fontSize: 12.5, color: "text.faint", fontWeight: 500, py: 0.75, pr: 2, borderBottom: "1px solid", borderColor: "divider", width: "35%" },
            "& table.fields td": { fontSize: 13, py: 0.75, borderBottom: "1px solid", borderColor: "divider" },
            "& table.fields tr.missing th": { color: "error.main" },
            "& ul": { pl: 2.5, m: 0, mb: 1.5 },
            "& li": { fontSize: 13, mb: 0.75, lineHeight: 1.5 },
            "& .detail-line": { fontSize: 11.5, color: "text.faint", mt: 0.25 },
            "& .missing-header": { color: "error.main" },
            "& .missing-list li": { color: "error.main" },
          }}
        />
      </Card>
    </Box>
  );
}
