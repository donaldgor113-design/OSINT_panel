import { Box, Tooltip } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSourceSubmenu } from "@/store/workspaceSlice";
import { SOURCES } from "@/data/mock";
import { SourceIcon } from "@/utils/sourceIcons";

export default function Submenu() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((s) => s.workspace.activeTab);
  const tabs = useAppSelector((s) => s.workspace.tabs);
  const tab = tabs.find((t) => t.id === activeTab);

  return (
    <Box
      sx={{
        width: 58, flexShrink: 0, py: 1,
        bgcolor: "#0F172A", borderRight: "1px solid rgba(139,92,246,0.14)",
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
                width: 40, height: 40, borderRadius: 1.5, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid rgba(139,92,246,0.3)",
                bgcolor: "rgba(139,92,246,0.1)",
                transition: "all .15s cubic-bezier(0.4,0,0.2,1)",
                "&:hover": { transform: "translateX(2px)", boxShadow: "0 0 14px rgba(139,92,246,0.25)" },
              }}
            >
              <SourceIcon id={src.id} sx={{ fontSize: 18, color: "secondary.main" }} />
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}