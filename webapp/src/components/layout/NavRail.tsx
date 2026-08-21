import { Box, Tooltip } from "@mui/material";
import { NavLink } from "react-router-dom";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import FaceRetouchingNaturalOutlinedIcon from "@mui/icons-material/FaceRetouchingNaturalOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

const SECTIONS = [
  { to: "/", label: "Дашборд", icon: SpaceDashboardOutlinedIcon, end: true },
  { to: "/cases", label: "Справи", icon: FolderOutlinedIcon },
  { to: "/surveillance", label: "Відеонагляд", icon: VideocamOutlinedIcon },
  { to: "/recognition", label: "Recognition Lab", icon: FaceRetouchingNaturalOutlinedIcon },
  { to: "/monitoring", label: "Моніторинг", icon: VisibilityOutlinedIcon },
  { to: "/capture", label: "Capture Inbox", icon: InboxOutlinedIcon },
  { to: "/reports", label: "Звіти", icon: DescriptionOutlinedIcon },
  { to: "/graph", label: "Граф зв'язків", icon: HubOutlinedIcon },
  { to: "/settings", label: "Налаштування", icon: SettingsOutlinedIcon },
];

export default function NavRail() {
  return (
    <Box
      sx={{
        width: 76, flexShrink: 0,
        bgcolor: "background.paper", borderRight: 1, borderColor: "divider",
        display: "flex", flexDirection: "column", alignItems: "center",
        py: 2, gap: 0.75, overflowY: "auto",
      }}
    >
      {SECTIONS.map((s) => (
        <Tooltip key={s.to} title={s.label} placement="right" arrow>
          <Box
            component={NavLink}
            to={s.to}
            end={s.end}
            sx={{
              width: 60, minHeight: 52, borderRadius: 2, py: 0.75,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 0.4, textDecoration: "none", color: "text.faint",
              transition: "all 150ms cubic-bezier(0.4,0,0.2,1)",
              "&:hover": { bgcolor: "rgba(139,92,246,0.08)", color: "text.secondary" },
              "&.active": { bgcolor: "rgba(139,92,246,0.14)", color: "secondary.main" },
            }}
          >
            <s.icon sx={{ fontSize: 20 }} />
            <Box component="span" sx={{ fontSize: 9, fontWeight: 500, letterSpacing: 0.2, textAlign: "center", lineHeight: 1.15 }}>
              {s.label}
            </Box>
          </Box>
        </Tooltip>
      ))}
    </Box>
  );
}
