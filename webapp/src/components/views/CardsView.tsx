import { Box, Chip, Typography } from "@mui/material";
import type { Result, SourceId } from "@/types";
import { SOURCES } from "@/data/mock";

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
  type: "#00E5FF",
  src: "#FF6D00",
  geo: "#2EFFB0",
  ioc: "#FF4D5E",
};

function srcIcon(id: SourceId) {
  return SOURCES.find((s) => s.id === id)?.icon ?? "";
}
function srcColor(id: SourceId) {
  return SOURCES.find((s) => s.id === id)?.color ?? "";
}

export default function CardsView({ results }: { results: Result[] }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 1.75 }}>
      {results.map((r) => (
        <Box
          key={r.id}
          draggable
          sx={{
            p: 1.75, borderRadius: 2, cursor: "grab",
            bgcolor: "#1A2B4C",
            border: 1,
            borderColor: r.ok ? "rgba(255,255,255,0.07)" : "rgba(255,77,94,0.6)",
            background: r.ok ? undefined : "rgba(255,77,94,0.05)",
            transition: "all .18s",
            "&:hover": { transform: "translateY(-3px)", borderColor: "rgba(0,229,255,0.4)", boxShadow: "0 8px 30px rgba(0,0,0,0.45)" },
            "&:active": { cursor: "grabbing" },
          }}
          onDragStart={(e) => e.dataTransfer.setData("text/plain", r.id)}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.25 }}>
            <Typography sx={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: srcColor(r.source) }}>
              {srcIcon(r.source)} {r.source}
            </Typography>
            <Typography sx={{ ml: "auto", fontSize: 11, color: "text.faint" }}>{r.date}</Typography>
          </Box>
          <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.75 }}>{r.title}</Typography>
          <Typography sx={{ fontSize: 12.5, color: "text.secondary", lineHeight: 1.55 }}>{r.body}</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1.25 }}>
            {r.tags.map((t) => (
              <Chip
                key={t}
                label={t}
                size="small"
                sx={{
                  fontSize: 10.5, height: 20,
                  color: chipColors[tagCls(t)] ?? "#00E5FF",
                  border: "1px solid rgba(255,255,255,0.08)",
                  bgcolor: "rgba(13,19,34,0.9)",
                }}
              />
            ))}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.25 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: r.ok ? "success.main" : "error.main" }}>
              {r.ok ? "● Успішно" : "● Помилка"}
            </Typography>
          </Box>
          {!r.ok && (
            <Typography sx={{ fontSize: 12, color: "error.main", mt: 1, display: "flex", gap: 0.75 }}>
              ⚠ {SRC_ERR[r.source] ?? "Помилка отримання даних від джерела."}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
}