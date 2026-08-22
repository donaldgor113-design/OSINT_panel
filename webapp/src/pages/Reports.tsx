import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Card, Typography, Chip, List, ListItemButton, CircularProgress } from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PageHeader from "@/components/common/PageHeader";
import { listReportTemplates, listReports } from "@/api/reports";
import type { ApiReportTemplate, ApiReport } from "@/types/api";

export default function Reports() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<ApiReportTemplate[] | null>(null);
  const [reports, setReports] = useState<ApiReport[] | null>(null);

  useEffect(() => {
    listReportTemplates().then(setTemplates);
    listReports().then(setReports);
  }, []);

  return (
    <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
      <PageHeader
        title="Звіти"
        subtitle="Шаблони + автозаповнення з полів справи. Формуються з конкретної справи (кнопка «Сформувати звіт»)."
      />

      <Typography sx={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "text.faint", fontWeight: 600, mb: 1.5 }}>
        Шаблони
      </Typography>
      {!templates && <CircularProgress size={20} sx={{ mb: 2 }} />}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 2, mb: 4 }}>
        {templates?.map((t) => (
          <Card key={t.id} sx={{ p: 2.5 }}>
            <Box sx={{ fontSize: 26, mb: 1 }}>{t.icon}</Box>
            <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 0.5 }}>{t.name}</Typography>
            <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>{t.description}</Typography>
          </Card>
        ))}
      </Box>

      <Typography sx={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "text.faint", fontWeight: 600, mb: 1.5 }}>
        Архів звітів
      </Typography>
      {!reports && <CircularProgress size={20} />}
      {reports?.length === 0 && (
        <Typography sx={{ fontSize: 13, color: "text.faint" }}>
          Ще немає жодного звіту — зайди у справу й натисни «Сформувати звіт».
        </Typography>
      )}
      {reports && reports.length > 0 && (
        <Card sx={{ p: 0 }}>
          <List disablePadding>
            {reports.map((r) => {
              const template = templates?.find((t) => t.id === r.template_id);
              return (
                <ListItemButton
                  key={r.id} onClick={() => navigate(`/reports/${r.id}`)}
                  sx={{ py: 1.5, px: 2.5, borderBottom: 1, borderColor: "divider", "&:last-child": { borderBottom: 0 } }}
                >
                  <DescriptionOutlinedIcon sx={{ fontSize: 20, color: "info.main", mr: 1.5 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 500 }}>{r.title}</Typography>
                    <Typography sx={{ fontSize: 11.5, color: "text.faint" }}>
                      {new Date(r.created_at).toLocaleDateString("uk-UA")} · {template?.name ?? r.template_id}
                      {r.missing_fields && r.missing_fields.length > 0 && ` · бракує ${r.missing_fields.length} полів`}
                    </Typography>
                  </Box>
                  <Chip
                    label={r.status === "final" ? "готовий" : "чернетка"}
                    size="small"
                    sx={{ fontSize: 10, color: r.status === "final" ? "success.main" : "warning.main" }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Card>
      )}
    </Box>
  );
}
