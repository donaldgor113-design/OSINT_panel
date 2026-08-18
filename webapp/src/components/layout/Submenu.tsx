import { Box, Tooltip } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSourceSubmenu } from "@/store/workspaceSlice";
import { SOURCES } from "@/data/mock";

export default function Submenu() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((s) => s.workspace.activeTab);
  const tabs = useAppSelector((s) => s.workspace.tabs);
  const tab = tabs.find((t) => t.id === activeTab);

  return (
    <Box
      sx={{
        width: 58, flexShrink: 0, py: 1,
        bgcolor: "#0D1322", borderRight: "1px solid rgba(0,229,255,0.14)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75,
        overflowY: "auto",
      }}
    >
      {tab?.submenu.map((id) => {
        const src = SOURCES.find((s) => s.id === id);
        if (!src) return null;
        return (
          <Tooltip key={id} title={`${src.name} — активний`} placement="right" arrow>
            <Box
              onClick={() => dispatch(toggleSourceSubmenu(id))}
              sx={{
                width: 38, height: 38, fontSize: 18, borderRadius: 1.5, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid rgba(0,229,255,0.3)",
                bgcolor: "rgba(0,229,255,0.1)",
                boxShadow: "0 0 14px rgba(0,229,255,0.2)",
                transition: "all .15s",
                "&:hover": { transform: "translateX(2px)" },
              }}
            >
              {src.icon}
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}