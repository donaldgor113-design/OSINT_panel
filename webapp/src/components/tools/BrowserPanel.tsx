import { Box, Card, Typography, Chip, Button } from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import PublicIcon from "@mui/icons-material/Public";
import { BROWSER_PROFILES } from "@/data/mock";

const STATUS_COLOR: Record<string, string> = { running: "success.main", idle: "text.faint", offline: "error.main" };
const STATUS_LABEL: Record<string, string> = { running: "активний", idle: "очікує", offline: "офлайн" };

export default function BrowserPanel() {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 2 }}>
      {BROWSER_PROFILES.map((b) => (
        <Card key={b.id} sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: "background.default", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PublicIcon sx={{ fontSize: 18, color: "secondary.main" }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{b.name}</Typography>
              <Chip label={STATUS_LABEL[b.status]} size="small" sx={{ fontSize: 9.5, height: 16, mt: 0.25, color: STATUS_COLOR[b.status] }} />
            </Box>
          </Box>
          <Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: 0.5 }}>Проксі: {b.proxy}</Typography>
          <Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: 1.5 }}>Активних сесій: {b.sessions}</Typography>
          <Button size="small" variant="outlined" fullWidth startIcon={<LaunchIcon sx={{ fontSize: 16 }} />}>
            Відкрити керування
          </Button>
        </Card>
      ))}
    </Box>
  );
}
