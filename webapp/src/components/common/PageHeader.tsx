import { Box, Typography } from "@mui/material";

export default function PageHeader({
  title, subtitle, actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 3, gap: 2 }}>
      <Box>
        <Typography sx={{ fontSize: 20, fontWeight: 600 }}>{title}</Typography>
        {subtitle && <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}>{subtitle}</Typography>}
      </Box>
      {actions && <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>{actions}</Box>}
    </Box>
  );
}
