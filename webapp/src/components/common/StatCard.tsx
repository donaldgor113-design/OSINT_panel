import { Box, Card, Typography } from "@mui/material";
import type { SvgIconProps } from "@mui/material";

export default function StatCard({
  label, value, icon: Icon, color = "secondary.main", trend,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<SvgIconProps>;
  color?: string;
  trend?: string;
}) {
  return (
    <Card sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
      <Box
        sx={{
          width: 44, height: 44, borderRadius: 2, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          bgcolor: "background.default", color,
        }}
      >
        <Icon sx={{ fontSize: 22 }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 22, fontWeight: 600, lineHeight: 1.2 }}>{value}</Typography>
        <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>{label}</Typography>
        {trend && <Typography sx={{ fontSize: 11, color: "text.faint", mt: 0.25 }}>{trend}</Typography>}
      </Box>
    </Card>
  );
}
