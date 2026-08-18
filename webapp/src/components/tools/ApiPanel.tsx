import { Box, Card, Typography, Chip } from "@mui/material";
import ApiIcon from "@mui/icons-material/Api";

const STATUS_STYLE: Record<string, { color: string; label: string }> = {
  connected: { color: "success.main", label: "підключено" },
  disconnected: { color: "text.faint", label: "відключено" },
  rate_limited: { color: "warning.main", label: "ліміт вичерпано" },
};

import { API_INTEGRATIONS } from "@/data/mock";

export default function ApiPanel() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {API_INTEGRATIONS.map((api) => {
        const st = STATUS_STYLE[api.status];
        return (
          <Card key={api.id} sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: "background.default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ApiIcon sx={{ fontSize: 18, color: "secondary.main" }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{api.name}</Typography>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{api.quota}</Typography>
            </Box>
            <Box sx={{ textAlign: "right", flexShrink: 0 }}>
              <Chip label={st.label} size="small" sx={{ fontSize: 10, color: st.color, mb: 0.5 }} />
              <Typography sx={{ fontSize: 11, color: "text.faint" }}>{api.lastUsed}</Typography>
            </Box>
          </Card>
        );
      })}
    </Box>
  );
}
