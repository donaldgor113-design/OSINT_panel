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
import Tools from "@/pages/Tools";
import Analysis from "@/pages/Analysis";
import MapPage from "@/pages/MapPage";
import Reports from "@/pages/Reports";
import AiAssistant from "@/pages/AiAssistant";
import Settings from "@/pages/Settings";
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
            <Route path="/tools" element={<Tools />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/ai" element={<AiAssistant />} />
            <Route path="/settings" element={<Settings />} />
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
