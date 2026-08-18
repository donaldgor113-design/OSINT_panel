import { Box, Card, Typography, Chip, Button, List, ListItemButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { useAppDispatch } from "@/store/hooks";
import { openReport } from "@/store/uiSlice";
import { TEMPLATES, REPORT_ARCHIVE } from "@/data/mock";
import PageHeader from "@/components/common/PageHeader";

export default function Reports() {
  const dispatch = useAppDispatch();

  return (
    <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
      <PageHeader
        title="Звіти"
        subtitle="Шаблони, автозаповнення полів та архів згенерованих звітів"
        actions={
          <Button variant="contained" color="secondary" startIcon={<AddIcon sx={{ fontSize: 18 }} />} onClick={() => dispatch(openReport())}>
            Новий звіт
          </Button>
        }
      />

      <Typography sx={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "text.faint", fontWeight: 600, mb: 1.5 }}>
        Шаблони
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 2, mb: 4 }}>
        {(Object.keys(TEMPLATES) as (keyof typeof TEMPLATES)[]).map((id) => {
          const t = TEMPLATES[id];
          return (
            <Card key={id} sx={{ p: 2.5, cursor: "pointer" }} onClick={() => dispatch(openReport())}>
              <Box sx={{ fontSize: 26, mb: 1 }}>{t.icon}</Box>
              <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 0.5 }}>{t.name}</Typography>
              <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>{t.desc}</Typography>
            </Card>
          );
        })}
      </Box>

      <Typography sx={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "text.faint", fontWeight: 600, mb: 1.5 }}>
        Архів звітів
      </Typography>
      <Card sx={{ p: 0 }}>
        <List disablePadding>
          {REPORT_ARCHIVE.map((r) => (
            <ListItemButton key={r.id} sx={{ py: 1.5, px: 2.5, borderBottom: 1, borderColor: "divider", "&:last-child": { borderBottom: 0 } }}>
              {r.format === "pdf"
                ? <PictureAsPdfOutlinedIcon sx={{ fontSize: 20, color: "error.main", mr: 1.5 }} />
                : <DescriptionOutlinedIcon sx={{ fontSize: 20, color: "info.main", mr: 1.5 }} />}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 13.5, fontWeight: 500 }}>{r.title}</Typography>
                <Typography sx={{ fontSize: 11.5, color: "text.faint" }}>{r.createdAt} · {TEMPLATES[r.template].name}</Typography>
              </Box>
              <Chip
                label={r.status === "final" ? "готовий" : "чернетка"}
                size="small"
                sx={{ fontSize: 10, color: r.status === "final" ? "success.main" : "warning.main" }}
              />
            </ListItemButton>
          ))}
        </List>
      </Card>
    </Box>
  );
}
