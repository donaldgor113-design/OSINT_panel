import { useEffect, useState } from "react";
import {
  AppBar, Box, Typography, Button, IconButton,
  Avatar, Tooltip, Chip, useTheme, Menu, MenuItem, ListItemIcon, Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CircleIcon from "@mui/icons-material/Circle";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openExport, openReport, toggleNotifications, openPalette } from "@/store/uiSlice";
import { logoutThunk } from "@/store/authSlice";

export default function Navbar() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [apiOnline, setApiOnline] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

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
        height: 64,
        flexDirection: "row",
        alignItems: "center",
        px: 3,
        gap: 2,
        bgcolor: "background.paper",
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
        <Box
          sx={{
            width: 36, height: 36, borderRadius: 2,
            display: "flex", alignItems: "center", justifyContent: "center",
            bgcolor: "rgba(139,92,246,0.12)", color: "secondary.main",
          }}
        >
          <SatelliteAltIcon sx={{ fontSize: 20 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: 15, letterSpacing: 0.5, lineHeight: 1.2 }}>OSINT HUB</Typography>
          <Typography sx={{ fontSize: 11, letterSpacing: 1.5, color: "text.faint", textTransform: "uppercase" }}>
            Command Center
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <Button
          onClick={() => dispatch(openPalette())}
          startIcon={<SearchIcon sx={{ fontSize: 18 }} />}
          sx={{
            width: "min(560px, 70%)",
            justifyContent: "flex-start",
            gap: 1,
            height: 40,
            color: "text.secondary",
            bgcolor: "background.default",
            border: `1px solid ${theme.palette.divider}`,
            "&:hover": { borderColor: "secondary.main", bgcolor: "background.default" },
          }}
        >
          Пошук по всіх джерелах…
          <Box
            component="span"
            sx={{
              ml: "auto", fontFamily: "monospace", fontSize: 11, color: "text.faint",
              border: `1px solid ${theme.palette.divider}`, px: 0.8, py: 0.2, borderRadius: 1,
            }}
          >
            Ctrl K
          </Box>
        </Button>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Chip
          icon={<CircleIcon sx={{ fontSize: "10px !important" }} />}
          label={apiOnline ? "API online" : "API offline"}
          size="small"
          sx={{
            color: apiOnline ? "success.main" : "error.main",
            border: 1,
            borderColor: apiOnline ? "success.main" : "error.main",
            bgcolor: apiOnline ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
            "& .MuiChip-icon": { color: "inherit" },
          }}
        />
        <Tooltip title="Створити звіт (Ctrl+R)">
          <IconButton onClick={() => dispatch(openReport())} sx={{ color: "text.secondary" }}>
            <DescriptionOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Button
          variant="contained"
          size="small"
          startIcon={<WarningAmberIcon sx={{ fontSize: 16 }} />}
          sx={{
            background: "linear-gradient(135deg,#EF4444,#DC2626)",
            color: "#fff",
            "&:hover": { filter: "brightness(1.1)" },
          }}
          onClick={() => dispatch(openExport())}
        >
          Екстрений експорт
        </Button>
        <IconButton onClick={() => dispatch(toggleNotifications())} sx={{ color: "text.secondary" }}>
          <NotificationsOutlinedIcon fontSize="small" />
        </IconButton>
        <Box sx={{ width: "1px", height: 28, bgcolor: theme.palette.divider }} />
        <Tooltip title={user?.email ?? user?.username ?? ""}>
          <Avatar
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            sx={{ width: 34, height: 34, bgcolor: "secondary.main", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            {(user?.username ?? "??").slice(0, 2).toUpperCase()}
          </Avatar>
        </Tooltip>
        <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
          <Box sx={{ px: 2, py: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{user?.username}</Typography>
            <Typography sx={{ fontSize: 11.5, color: "text.faint" }}>{user?.email}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { setMenuAnchor(null); dispatch(logoutThunk()); }}>
            <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
            Вийти
          </MenuItem>
        </Menu>
      </Box>
    </AppBar>
  );
}
