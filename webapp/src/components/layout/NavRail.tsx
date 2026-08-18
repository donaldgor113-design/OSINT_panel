import { Box, Tooltip } from "@mui/material";
import { NavLink } from "react-router-dom";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import HandymanOutlinedIcon from "@mui/icons-material/HandymanOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";

const SECTIONS = [
  { to: "/", label: "Дашборд", icon: SpaceDashboardOutlinedIcon, end: true },
  { to: "/tools", label: "Інструменти", icon: HandymanOutlinedIcon },
  { to: "/analysis", label: "Аналітика", icon: HubOutlinedIcon },
  { to: "/map", label: "Мапа", icon: MapOutlinedIcon },
  { to: "/reports", label: "Звіти", icon: DescriptionOutlinedIcon },
  { to: "/ai", label: "AI-асистент", icon: AutoAwesomeOutlinedIcon },
  { to: "/settings", label: "Налаштування", icon: SettingsOutlinedIcon },
  { to: "/audit", label: "Аудит-лог", icon: FactCheckOutlinedIcon },
];

export default function NavRail() {
  return (
    <Box
      sx={{
        width: 76, flexShrink: 0,
        bgcolor: "background.paper", borderRight: 1, borderColor: "divider",
        display: "flex", flexDirection: "column", alignItems: "center",
        py: 2, gap: 0.75,
      }}
    >
      {SECTIONS.map((s) => (
        <Tooltip key={s.to} title={s.label} placement="right" arrow>
          <Box
            component={NavLink}
            to={s.to}
            end={s.end}
            sx={{
              width: 60, height: 56, borderRadius: 2,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 0.4, textDecoration: "none", color: "text.faint",
              transition: "all 150ms cubic-bezier(0.4,0,0.2,1)",
              "&:hover": { bgcolor: "rgba(139,92,246,0.08)", color: "text.secondary" },
              "&.active": { bgcolor: "rgba(139,92,246,0.14)", color: "secondary.main" },
            }}
          >
            <s.icon sx={{ fontSize: 21 }} />
            <Box component="span" sx={{ fontSize: 9.5, fontWeight: 500, letterSpacing: 0.2, textAlign: "center", lineHeight: 1.1 }}>
              {s.label}
            </Box>
          </Box>
        </Tooltip>
      ))}
    </Box>
  );
}
