import { Box, Card, Chip, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import type { Result, SourceId } from "@/types";
import { SOURCES } from "@/data/mock";
import { SourceIcon } from "@/utils/sourceIcons";

const SRC_ERR: Record<string, string> = {
  virustotal: "VirusTotal повернув 429 (rate limit). Ключ перевищив квоту.",
  shodan: "Shodan: таймаут підключення.",
};

function tagCls(t: string): string {
  if (t.startsWith("type:")) return "type";
  if (t.startsWith("source:")) return "src";
  if (t.startsWith("geo:") || t.startsWith("lat:") || t.startsWith("lon:")) return "geo";
  if (t.startsWith("ioc:") || t === "hash" || t === "malware") return "ioc";
  return "type";
}

const chipColors: Record<string, string> = {
  type: "#8B5CF6",
  src: "#F59E0B",
  geo: "#10B981",
  ioc: "#EF4444",
};

function srcColor(id: SourceId) {
  return SOURCES.find((s) => s.id === id)?.color ?? "";
}

export default function CardsView({ results }: { results: Result[] }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 2 }}>
      {results.map((r) => (
        <Card
          key={r.id}
          draggable
          sx={{
            p: 2, cursor: "grab",
            borderColor: r.ok ? undefined : "rgba(239,68,68,0.5)",
            bgcolor: r.ok ? "background.paper" : "rgba(239,68,68,0.04)",
            "&:active": { cursor: "grabbing" },
          }}
          onDragStart={(e) => e.dataTransfer.setData("text/plain", r.id)}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.5 }}>
            <SourceIcon id={r.source} sx={{ fontSize: 14, color: srcColor(r.source) }} />
            <Typography sx={{ fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", color: srcColor(r.source), fontWeight: 600 }}>
              {r.source}
            </Typography>
            <Typography sx={{ ml: "auto", fontSize: 12, color: "text.faint" }}>{r.date}</Typography>
          </Box>
          <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 0.75, lineHeight: 1.4 }}>{r.title}</Typography>
          <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.6 }}>{r.body}</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1.5 }}>
            {r.tags.map((t) => (
              <Chip
                key={t}
                label={t}
                size="small"
                sx={{
                  fontSize: 10.5, height: 22, fontWeight: 500, textTransform: "none",
                  color: chipColors[tagCls(t)] ?? "#8B5CF6",
                  border: `1px solid ${chipColors[tagCls(t)] ?? "#8B5CF6"}40`,
                  bgcolor: "background.default",
                }}
              />
            ))}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mt: 1.5, pt: 1.5, borderTop: 1, borderColor: "divider" }}>
            {r.ok ? (
              <CheckCircleIcon sx={{ fontSize: 15, color: "success.main" }} />
            ) : (
              <ErrorIcon sx={{ fontSize: 15, color: "error.main" }} />
            )}
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: r.ok ? "success.main" : "error.main" }}>
              {r.ok ? "Успішно" : "Помилка"}
            </Typography>
          </Box>
          {!r.ok && (
            <Typography sx={{ fontSize: 12, color: "error.main", mt: 1, display: "flex", alignItems: "flex-start", gap: 0.75 }}>
              <WarningAmberIcon sx={{ fontSize: 15, mt: "1px" }} />
              {SRC_ERR[r.source] ?? "Помилка отримання даних від джерела."}
            </Typography>
          )}
        </Card>
      ))}
    </Box>
  );
}
