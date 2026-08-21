import { Box, Typography, Card } from "@mui/material";
import type { SvgIconProps } from "@mui/material";
import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import PageHeader from "./PageHeader";

export default function PlaceholderPage({
  title, subtitle, icon: Icon, plan,
}: {
  title: string;
  subtitle: string;
  icon: React.ComponentType<SvgIconProps>;
  plan: string[];
}) {
  return (
    <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
      <PageHeader title={title} subtitle={subtitle} />
      <Card sx={{ p: 4, textAlign: "center", maxWidth: 560, mx: "auto", mt: 4 }}>
        <Icon sx={{ fontSize: 40, color: "secondary.main", mb: 2 }} />
        <Typography sx={{ fontSize: 14, color: "text.secondary", mb: 3 }}>
          Розділ у навігації є, глибокий функціонал — наступною чергою (Phase 3+ за архітектурним документом).
        </Typography>
        <Box sx={{ textAlign: "left", display: "inline-block" }}>
          {plan.map((item, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1 }}>
              <ConstructionOutlinedIcon sx={{ fontSize: 15, color: "text.faint", mt: "2px" }} />
              <Typography sx={{ fontSize: 12.5, color: "text.faint" }}>{item}</Typography>
            </Box>
          ))}
        </Box>
      </Card>
    </Box>
  );
}
