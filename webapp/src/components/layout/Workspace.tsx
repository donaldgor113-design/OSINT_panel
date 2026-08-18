import { Box, Tabs, Tab, IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addTab, closeTab, setActiveTab } from "@/store/workspaceSlice";
import Submenu from "./Submenu";
import Canvas from "@/components/views/Canvas";

export default function Workspace() {
  const dispatch = useAppDispatch();
  const tabs = useAppSelector((s) => s.workspace.tabs);
  const activeTab = useAppSelector((s) => s.workspace.activeTab);

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>
      {/* Tab bar */}
      <Box
        sx={{
          display: "flex", alignItems: "center", gap: 0.5,
          height: 44, px: 1.5, flexShrink: 0,
          bgcolor: "background.default", borderBottom: 1, borderColor: "divider",
          overflowX: "auto",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => dispatch(setActiveTab(v))}
          variant="scrollable"
          scrollButtons={false}
          sx={{
            flex: 1, minHeight: 40,
            "& .MuiTabs-indicator": { bgcolor: "secondary.main", height: 2 },
          }}
        >
          {tabs.map((t) => {
            const hasErr = t.results.some((r) => !r.ok);
            return (
              <Tab
                key={t.id}
                value={t.id}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, textTransform: "none" }}>
                    <Box
                      sx={{
                        width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                        bgcolor: hasErr ? "#EF4444" : "rgba(90,106,140,0.6)",
                      }}
                    />
                    <span>{t.title}</span>
                    <CloseIcon
                      sx={{ fontSize: 13, color: "text.faint", "&:hover": { color: "error.main" } }}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(closeTab(t.id));
                      }}
                    />
                  </Box>
                }
                sx={{
                  minHeight: 40, px: 1.5, maxWidth: 230,
                  color: "text.secondary",
                  "&.Mui-selected": { color: "text.primary" },
                }}
              />
            );
          })}
        </Tabs>
        <Tooltip title="Нова вкладка">
          <IconButton size="small" onClick={() => dispatch(addTab())} sx={{ color: "text.secondary" }}>
            <AddIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Split: submenu + canvas */}
      <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>
        <Submenu />
        <Canvas />
      </Box>
    </Box>
  );
}