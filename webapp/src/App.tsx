import { useEffect } from "react";
import { Box } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import NavRail from "@/components/layout/NavRail";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import ReportModal from "@/components/ReportModal";
import ExportModal from "@/components/ExportModal";
import SearchPalette from "@/components/SearchPalette";
import NotificationsPanel from "@/components/NotificationsPanel";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Cases from "@/pages/Cases";
import CaseDetail from "@/pages/CaseDetail";
import CaseSearch from "@/pages/CaseSearch";
import Surveillance from "@/pages/Surveillance";
import RecognitionLab from "@/pages/RecognitionLab";
import Monitoring from "@/pages/Monitoring";
import CaptureInbox from "@/pages/CaptureInbox";
import Reports from "@/pages/Reports";
import ReportDetail from "@/pages/ReportDetail";
import Graph from "@/pages/Graph";
import Settings from "@/pages/Settings";
import MapPage from "@/pages/MapPage";
import Tools from "@/pages/Tools";
import Analysis from "@/pages/Analysis";
import AiAssistant from "@/pages/AiAssistant";
import AuditLogs from "@/pages/AuditLogs";
import { useAppDispatch } from "@/store/hooks";
import { forceLogout } from "@/store/authSlice";

function AppShell() {
  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="watermark">
        <span>CONFIDENTIAL · analyst@intel.gov · OSINT-HUB</span>
      </div>

      <Navbar />

      <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>
        <NavRail />
        <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/cases/:id" element={<CaseDetail />} />
            <Route path="/cases/:id/search" element={<CaseSearch />} />
            <Route path="/surveillance" element={<Surveillance />} />
            <Route path="/recognition" element={<RecognitionLab />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/capture" element={<CaptureInbox />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/:id" element={<ReportDetail />} />
            <Route path="/graph" element={<Graph />} />
            <Route path="/settings" element={<Settings />} />

            {/* Old IA — not linked in nav anymore, kept reachable so nothing already working breaks */}
            <Route path="/map" element={<MapPage />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/ai" element={<AiAssistant />} />
            <Route path="/audit" element={<AuditLogs />} />
          </Routes>
        </Box>
      </Box>

      <SearchPalette />
      <ReportModal />
      <ExportModal />
      <NotificationsPanel />
    </Box>
  );
}

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const onUnauthorized = () => dispatch(forceLogout());
    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", onUnauthorized);
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={<AppShell />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
