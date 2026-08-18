import { Box } from "@mui/material";
import { MEDIA } from "@/data/mock";

export default function MediaView() {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 1.5 }}>
      {MEDIA.map((m) => (
        <Box
          key={m.id}
          title={`Відкрити ${m.label}`}
          sx={{
            aspectRatio: "4/3", borderRadius: 2, overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.07)", position: "relative", cursor: "zoom-in",
            transition: "all .18s",
            "&:hover": { borderColor: "primary.main", boxShadow: "0 0 14px rgba(0,229,255,0.35)", transform: "scale(1.02)" },
          }}
        >
          <Box className={`media-ph--${m.pal}`} sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44 }}>
            {m.type === "video" ? "🎬" : "🖼️"}
          </Box>
          {m.type === "video" && (
            <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 40, height: 40, borderRadius: "50%", bgcolor: "rgba(0,229,255,0.25)", border: "1px solid #00E5FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#00E5FF" }}>
              ▶
            </Box>
          )}
          <Box
            sx={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "linear-gradient(transparent, rgba(0,0,0,0.8))", color: "#fff",
              px: 1, py: 1, fontSize: 10.5,
            }}
          >
            {m.label}
          </Box>
          <Box sx={{ position: "absolute", top: 8, right: 8, fontSize: 10, color: "success.main", bgcolor: "rgba(0,0,0,0.6)", px: 0.75, py: 0.25, borderRadius: 0.7, border: "1px solid rgba(46,255,176,0.3)" }}>
            {m.exif}
          </Box>
        </Box>
      ))}
    </Box>
  );
}