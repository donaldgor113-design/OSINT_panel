import { Box, Typography } from "@mui/material";
import { PINS } from "@/data/mock";

const KIND_ICON: Record<string, string> = { geo: "📍", c2: "☠️", host: "🖥️", ip: "📡" };

export default function MapView() {
  return (
    <Box sx={{ position: "relative", height: "100%", minHeight: 460, borderRadius: 2, overflow: "hidden" }}>
      <Box className="map-grid">
        {PINS.map((p) => (
          <Box key={p.id} className="map-pin" sx={{ left: `${p.x}%`, top: `${p.y}%`, color: p.color }}>
            <Box className="map-pin__tip">{p.name}</Box>
            {KIND_ICON[p.kind]}
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          position: "absolute", bottom: 12, left: 12,
          bgcolor: "rgba(10,14,23,0.85)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 1.5, px: 1.5, py: 1, fontSize: 11, color: "text.secondary",
          display: "flex", gap: 1.75,
        }}
      >
        <Legend color="#00E5FF" label="IP-вузол" />
        <Legend color="#FFD60A" label="Геолокація" />
        <Legend color="#FF6D00" label="Хостинг" />
        <Legend color="#FF4D5E" label="C2" />
      </Box>
    </Box>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <Typography sx={{ display: "flex", alignItems: "center", gap: 0.6, fontSize: 11 }}>
      <span style={{ width: 9, height: 9, borderRadius: "50%", background: color, display: "inline-block" }} />
      {label}
    </Typography>
  );
}