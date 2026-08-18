import { Box, ToggleButton, ToggleButtonGroup, Button, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTabView, setTabResults } from "@/store/workspaceSlice";
import CardsView from "./CardsView";
import JsonView from "./JsonView";
import MapView from "./MapView";
import MediaView from "./MediaView";

const VIEWS = [
  { id: "cards" as const, label: "▦ Картки" },
  { id: "json" as const, label: "{} JSON" },
  { id: "map" as const, label: "🗺️ Мапа" },
  { id: "media" as const, label: "🖼️ Медіа" },
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
          height: 46, flexShrink: 0, px: 1.5,
          display: "flex", alignItems: "center", gap: 1.5,
          borderBottom: "1px solid rgba(255,255,255,0.07)", bgcolor: "rgba(13,19,34,0.6)",
        }}
      >
        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
          Режим:{" "}
          <Box component="b" sx={{ color: "text.primary" }}>
            {VIEWS.find((v) => v.id === tab.view)?.label}
          </Box>
        </Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={tab.view}
          onChange={(_, v) => v && setView(v)}
        >
          {VIEWS.map((v) => (
            <ToggleButton key={v.id} value={v.id} sx={{ fontSize: 12, py: 0.4 }}>
              {v.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Box sx={{ flex: 1 }} />
        <Button size="small" variant="text" sx={{ color: "text.secondary" }} onClick={() => { /* DnD hint */ }}>
          ⤵ Drag & Drop
        </Button>
        <Button size="small" variant="text" sx={{ color: "text.secondary" }} onClick={() => dispatch(setTabResults({ tabId: tab.id, results: [] }))}>
          🗑 Очистити
        </Button>
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", p: 2, position: "relative", minHeight: 0 }}>
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
      <Typography sx={{ fontSize: 46 }}>🛰️</Typography>
      <Typography sx={{ fontSize: 15, color: "text.secondary" }}>Канва порожня</Typography>
      <Typography sx={{ fontSize: 12 }}>
        Активуйте джерела зправа або зробіть запит через глобальний пошук (Ctrl+K)
      </Typography>
    </Box>
  );
}