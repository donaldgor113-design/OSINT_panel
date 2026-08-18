import { useState } from "react";
import { Box, ToggleButtonGroup, ToggleButton } from "@mui/material";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import TimelineIcon from "@mui/icons-material/Timeline";
import KnowledgeGraph from "@/components/analysis/KnowledgeGraph";
import Timeline from "@/components/analysis/Timeline";
import PageHeader from "@/components/common/PageHeader";
import { ENTITIES, RELATIONSHIPS, TIMELINE_EVENTS } from "@/data/mock";

type View = "graph" | "timeline";

export default function Analysis() {
  const [view, setView] = useState<View>("graph");

  return (
    <Box sx={{ flex: 1, overflow: "auto", p: 3, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageHeader
        title="Analysis Lab"
        subtitle="Knowledge graph та timeline поточного розслідування"
        actions={
          <ToggleButtonGroup size="small" exclusive value={view} onChange={(_, v) => v && setView(v)}>
            <ToggleButton value="graph" sx={{ gap: 0.75, px: 1.5 }}><HubOutlinedIcon sx={{ fontSize: 16 }} /> Граф</ToggleButton>
            <ToggleButton value="timeline" sx={{ gap: 0.75, px: 1.5 }}><TimelineIcon sx={{ fontSize: 16 }} /> Timeline</ToggleButton>
          </ToggleButtonGroup>
        }
      />
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {view === "graph"
          ? <KnowledgeGraph entities={ENTITIES} relationships={RELATIONSHIPS} />
          : <Timeline events={TIMELINE_EVENTS} />}
      </Box>
    </Box>
  );
}
