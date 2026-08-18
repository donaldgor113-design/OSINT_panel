import { Box, Card, Typography, Chip, LinearProgress } from "@mui/material";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import ArticleIcon from "@mui/icons-material/Article";
import { AGENT_TASKS } from "@/data/mock";
import type { AgentTask, AgentType } from "@/types";

const AGENT_ICON: Record<AgentType, typeof TravelExploreIcon> = {
  research: TravelExploreIcon, analysis: AnalyticsIcon, verification: FactCheckIcon, report: ArticleIcon,
};
const AGENT_LABEL: Record<AgentType, string> = {
  research: "Research Agent", analysis: "Analysis Agent", verification: "Verification Agent", report: "Report Agent",
};
const STATUS_STYLE: Record<AgentTask["status"], { color: string; label: string }> = {
  queued: { color: "text.faint", label: "у черзі" },
  running: { color: "secondary.main", label: "виконується" },
  completed: { color: "success.main", label: "завершено" },
  failed: { color: "error.main", label: "помилка" },
};

export default function AgentDashboard() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {AGENT_TASKS.map((t) => {
        const Icon = AGENT_ICON[t.agentType];
        const st = STATUS_STYLE[t.status];
        return (
          <Card key={t.id} sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: "background.default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon sx={{ fontSize: 16, color: "secondary.main" }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: 11, color: "text.faint", letterSpacing: 0.5, textTransform: "uppercase" }}>{AGENT_LABEL[t.agentType]}</Typography>
                <Typography sx={{ fontSize: 13.5, fontWeight: 500 }}>{t.description}</Typography>
              </Box>
              <Chip label={st.label} size="small" sx={{ fontSize: 10, color: st.color, flexShrink: 0 }} />
            </Box>
            <LinearProgress
              variant="determinate"
              value={t.progress}
              color={t.status === "failed" ? "error" : t.status === "completed" ? "success" : "secondary"}
              sx={{ height: 4, borderRadius: 4 }}
            />
            {t.confidence !== undefined && (
              <Typography sx={{ fontSize: 10.5, color: "text.faint", mt: 0.75 }}>Впевненість: {t.confidence}/10</Typography>
            )}
          </Card>
        );
      })}
    </Box>
  );
}
