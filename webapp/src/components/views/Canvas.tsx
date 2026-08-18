import { Box, ToggleButton, ToggleButtonGroup, Button, Typography } from "@mui/material";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import DataObjectIcon from "@mui/icons-material/DataObject";
import MapIcon from "@mui/icons-material/Map";
import PermMediaIcon from "@mui/icons-material/PermMedia";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTabView, setTabResults } from "@/store/workspaceSlice";
import CardsView from "./CardsView";
import JsonView from "./JsonView";
import MapView from "./MapView";
import MediaView from "./MediaView";

const VIEWS = [
  { id: "cards" as const, label: "Картки", icon: ViewModuleIcon },
  { id: "json" as const, label: "JSON", icon: DataObjectIcon },
  { id: "map" as const, label: "Мапа", icon: MapIcon },
  { id: "media" as const, label: "Медіа", icon: PermMediaIcon },
];

export default function Canvas() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((s) => s.workspace.activeTab);
  const tabs = useAppSelector((s) => s.workspace.tabs);
  const tab = tabs.find((t) => t.id === activeTab);
  if (!tab) return null;

  const setView = (v: (typeof VIEWS)[number]["id"]) => dispatch(setTabView({ tabId: tab.id, view: v }));

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>
      <Box
        sx={{
          height: 56, flexShrink: 0, px: 2,
          display: "flex", alignItems: "center", gap: 2,
          borderBottom: 1, borderColor: "divider", bgcolor: "background.paper",
        }}
      >
        <ToggleButtonGroup
          size="small"
          exclusive
          value={tab.view}
          onChange={(_, v) => v && setView(v)}
        >
          {VIEWS.map((v) => (
            <ToggleButton key={v.id} value={v.id} sx={{ fontSize: 13, py: 0.6, px: 1.5, gap: 0.75 }}>
              <v.icon sx={{ fontSize: 16 }} />
              {v.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Box sx={{ flex: 1 }} />
        <Button size="small" variant="text" startIcon={<OpenWithIcon sx={{ fontSize: 16 }} />} sx={{ color: "text.secondary" }}>
          Drag &amp; Drop
        </Button>
        <Button
          size="small" variant="text" startIcon={<DeleteOutlineIcon sx={{ fontSize: 16 }} />} sx={{ color: "text.secondary" }}
          onClick={() => dispatch(setTabResults({ tabId: tab.id, results: [] }))}
        >
          Очистити
        </Button>
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", p: 2.5, position: "relative", minHeight: 0 }}>
        {tab.results.length === 0 && tab.view !== "map" && tab.view !== "media" ? (
          <EmptyState />
        ) : (
          <>
            {tab.view === "cards" && <CardsView results={tab.results} />}
            {tab.view === "json" && <JsonView results={tab.results} tab={tab} />}
            {tab.view === "map" && <MapView />}
            {tab.view === "media" && <MediaView />}
          </>
        )}
      </Box>
    </Box>
  );
}

function EmptyState() {
  return (
    <Box sx={{ height: "60%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1.5, color: "text.faint" }}>
      <SatelliteAltIcon sx={{ fontSize: 42 }} />
      <Typography sx={{ fontSize: 16, fontWeight: 500, color: "text.secondary" }}>Канва порожня</Typography>
      <Typography sx={{ fontSize: 13 }}>
        Активуйте джерела зправа або зробіть запит через глобальний пошук (Ctrl+K)
      </Typography>
    </Box>
  );
}
