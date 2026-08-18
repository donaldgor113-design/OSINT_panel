import { Box } from "@mui/material";
import PageHeader from "@/components/common/PageHeader";
import ChatAssistant from "@/components/ai/ChatAssistant";
import AgentDashboard from "@/components/ai/AgentDashboard";

export default function AiAssistant() {
  return (
    <Box sx={{ flex: 1, overflow: "hidden", p: 3, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageHeader title="AI-асистент" subtitle="Чат, аналіз та автономні агенти для розслідування" />
      <Box sx={{ flex: 1, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 2.5, minHeight: 0 }}>
        <Box sx={{ borderRadius: 2, border: 1, borderColor: "divider", bgcolor: "background.paper", p: 2.5, minHeight: 0 }}>
          <ChatAssistant />
        </Box>
        <Box sx={{ overflowY: "auto", pr: 0.5 }}>
          <AgentDashboard />
        </Box>
      </Box>
    </Box>
  );
}
