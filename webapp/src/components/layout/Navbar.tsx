import { useEffect, useState } from "react";
import {
  AppBar, Box, Typography, Button, IconButton,
  Avatar, Tooltip, Chip, useTheme,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DescriptionIcon from "@mui/icons-material/Description";
import { useAppDispatch } from "@/store/hooks";
import { openExport, openReport, toggleNotifications, openPalette } from "@/store/uiSlice";

export default function Navbar() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [apiOnline, setApiOnline] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      const down = Math.random() < 0.12;
      setApiOnline(!down);
    }, 9000);
    return () => clearInterval(t);
  }, []);

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        height: 58,
        flexDirection: "row",
        alignItems: "center",
        px: 2,
        background: "linear-gradient(180deg, #0F1626, #0B111F)",
        borderBottom: `1px solid ${theme.palette.primary.main}22`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography sx={{ fontSize: 24 }}>🛰️</Typography>
        <Box>
          <Typography sx={{ fontWeight: 800, letterSpacing: 2, lineHeight: 1 }}>OSINT·CC</Typography>
          <Typography sx={{ fontSize: 9, letterSpacing: 3, color: "text.secondary", textTransform: "uppercase" }}>
            Command Center
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <Button
          onClick={() => dispatch(openPalette())}
          sx={{
            width: "min(480px, 60%)",
            justifyContent: "flex-start",
            gap: 1,
            color: "text.secondary",
            bgcolor: "rgba(13,19,34,0.9)",
            border: "1px solid rgba(255,255,255,0.08)",
            "&:hover": { borderColor: "primary.main", boxShadow: "0 0 14px rgba(0,229,255,0.35)" },
          }}
        >
          🔎 Пошук по всіх джерелах…{" "}
          <Box component="span" sx={{ ml: "auto", fontFamily: "monospace", fontSize: 10, border: "1px solid rgba(255,255,255,0.1)", px: 0.6, borderRadius: 0.5 }}>
            Ctrl K
          </Box>
        </Button>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Chip
          label={apiOnline ? "API online" : "API offline — проксі повторює"}
          size="small"
          sx={{
            color: apiOnline ? "success.main" : "error.main",
            border: 1,
            borderColor: apiOnline ? "success.main" : "error.main",
            bgcolor: apiOnline ? "rgba(46,255,176,0.06)" : "rgba(255,77,94,0.07)",
          }}
        />
        <Tooltip title="Створити звіт (Ctrl+R)">
          <IconButton onClick={() => dispatch(openReport())} sx={{ color: "text.secondary" }}>
            <DescriptionIcon />
          </IconButton>
        </Tooltip>
        <Button
          variant="contained"
          size="small"
          sx={{
            bgcolor: "linear-gradient(135deg,#FF6D00,#FF3D00)",
            background: "linear-gradient(135deg,#FF6D00,#FF3D00)",
            boxShadow: "0 0 14px rgba(255,109,0,0.4)",
            "&:hover": { filter: "brightness(1.12)" },
          }}
          onClick={() => dispatch(openExport())}
        >
          ⛑️ Екстрений експорт
        </Button>
        <IconButton onClick={() => dispatch(toggleNotifications())} sx={{ color: "text.secondary" }}>
          <NotificationsIcon />
        </IconButton>
        <Box sx={{ width: 1, height: 26, bgcolor: "rgba(255,255,255,0.07)" }} />
        <Tooltip title="analyst@intel.gov">
          <Avatar sx={{ bgcolor: "primary.main", color: "#04121F", fontWeight: 800, boxShadow: "0 0 12px rgba(0,229,255,0.4)" }}>
            OP
          </Avatar>
        </Tooltip>
      </Box>
    </AppBar>
  );
}