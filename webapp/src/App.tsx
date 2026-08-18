import { Box } from "@mui/material";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Workspace from "@/components/layout/Workspace";
import AiWidget from "@/components/AiWidget";
import ReportModal from "@/components/ReportModal";
import ExportModal from "@/components/ExportModal";
import SearchPalette from "@/components/SearchPalette";
import NotificationsPanel from "@/components/NotificationsPanel";

export default function App() {
  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="watermark">
        <span>CONFIDENTIAL · analyst@intel.gov · OSINT-CC</span>
      </div>

      <Navbar />

      <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>
        <Workspace />
        <Sidebar />
      </Box>

      <AiWidget />
      <SearchPalette />
      <ReportModal />
      <ExportModal />
      <NotificationsPanel />
    </Box>
  );
}