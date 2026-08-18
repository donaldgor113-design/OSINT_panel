import { Box, Typography, Chip } from "@mui/material";
import type { TimelineEvent } from "@/types";
import { SourceIcon } from "@/utils/sourceIcons";

export default function Timeline({ events }: { events: TimelineEvent[] }) {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Box sx={{ position: "relative", pl: 3, py: 1 }}>
      <Box sx={{ position: "absolute", left: 7, top: 0, bottom: 0, width: "2px", bgcolor: "divider" }} />
      {sorted.map((e) => (
        <Box key={e.id} sx={{ position: "relative", mb: 3, pl: 2.5 }}>
          <Box
            sx={{
              position: "absolute", left: "-25px", top: "4px",
              width: 14, height: 14, borderRadius: "50%",
              bgcolor: "background.default", border: "2px solid #8B5CF6",
            }}
          />
          <Typography sx={{ fontSize: 11, color: "text.faint", fontFamily: "monospace", mb: 0.5 }}>{e.date}</Typography>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, p: 1.75, borderRadius: 2, bgcolor: "background.paper", border: 1, borderColor: "divider" }}>
            <SourceIcon id={e.source} sx={{ fontSize: 16, color: "secondary.main", mt: "2px", flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{e.title}</Typography>
              <Typography sx={{ fontSize: 12.5, color: "text.secondary", lineHeight: 1.5, mt: 0.25 }}>{e.description}</Typography>
            </Box>
            <Chip
              label={`${e.confidence}/10`}
              size="small"
              sx={{
                ml: "auto", flexShrink: 0, fontSize: 10, height: 20,
                color: e.confidence >= 7 ? "success.main" : e.confidence >= 5 ? "warning.main" : "error.main",
              }}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
