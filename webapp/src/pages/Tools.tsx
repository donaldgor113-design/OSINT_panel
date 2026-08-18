import { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import PublicIcon from "@mui/icons-material/Public";
import ApiIcon from "@mui/icons-material/Api";
import Workspace from "@/components/layout/Workspace";
import Sidebar from "@/components/layout/Sidebar";
import RegistriesPanel from "@/components/tools/RegistriesPanel";
import BrowserPanel from "@/components/tools/BrowserPanel";
import ApiPanel from "@/components/tools/ApiPanel";

type SubTab = "search" | "registries" | "browsers" | "apis";

const TABS: { id: SubTab; label: string; icon: typeof SearchIcon }[] = [
  { id: "search", label: "Пошук", icon: SearchIcon },
  { id: "registries", label: "Реєстри", icon: HubOutlinedIcon },
  { id: "browsers", label: "Браузери", icon: PublicIcon },
  { id: "apis", label: "API", icon: ApiIcon },
];

export default function Tools() {
  const [tab, setTab] = useState<SubTab>("search");

  return (
    <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <Box sx={{ px: 3, pt: 2.5, pb: 0, bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          {TABS.map((t) => (
            <Tab
              key={t.id} value={t.id}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <t.icon sx={{ fontSize: 17 }} /> {t.label}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      {tab === "search" && (
        <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>
          <Workspace />
          <Sidebar />
        </Box>
      )}
      {tab === "registries" && <Box sx={{ flex: 1, overflow: "auto", p: 3 }}><RegistriesPanel /></Box>}
      {tab === "browsers" && <Box sx={{ flex: 1, overflow: "auto", p: 3 }}><BrowserPanel /></Box>}
      {tab === "apis" && <Box sx={{ flex: 1, overflow: "auto", p: 3, maxWidth: 700 }}><ApiPanel /></Box>}
    </Box>
  );
}
