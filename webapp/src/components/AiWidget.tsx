import { Box, Paper, Typography, TextField, Collapse } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleAi } from "@/store/uiSlice";

export default function AiWidget() {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((s) => s.ui.aiCollapsed);

  return (
    <Paper
      sx={{
        position: "fixed", right: 16, bottom: 16, zIndex: 200,
        width: collapsed ? 180 : 340,
        bgcolor: "rgba(26,43,76,0.92)", backdropFilter: "blur(12px)",
        overflow: "hidden", transition: "all .25s ease",
      }}
    >
      <Box
        onClick={() => dispatch(toggleAi())}
        sx={{
          display: "flex", alignItems: "center", gap: 1, px: 1.75, py: 1.25,
          cursor: "pointer", background: "linear-gradient(90deg, rgba(0,229,255,0.12), transparent)",
        }}
      >
        <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: "primary.main", boxShadow: "0 0 12px #00E5FF", animation: "pulse 2s infinite" }} />
        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>AI Insights</Typography>
        <Typography sx={{ ml: "auto", color: "text.secondary" }}>{collapsed ? "▸" : "▾"}</Typography>
      </Box>
      <Collapse in={!collapsed}>
        <Box sx={{ p: 1.75 }}>
          <AiCard color="#00E5FF" icon={<svg viewBox="0 0 24 24" width="18" height="18"><path d="M2 13h2v2H2zM4 9h2v2H4zM6 5h2v2H6zM10 3h2v2h-2zM14 3h2v2h-2zM18 5h2v2h-2zM20 9h2v2h-2zM20 13h2v2h-2zM18 17h2v2h-2z" fill="currentColor"/></svg>}
            title="Зв'язок IP → домени"
            body={<>IP <code>185.220.101.34</code> пов'язаний з <b>5 доменами</b> (TOR exit). Перекривається з поточним запитом.</>}
          />
          <AiCard color="#FF6D00" icon={<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 2l2.4 7.2H22l-6 4.4 2.3 7.3-6.3-4.6-6.3 4.6 2.3-7.3-6-4.4h7.6z" fill="currentColor"/></svg>}
            title="Аномалія геолокації"
            body={<>Координати EXIF фото не збігаються з IP-localization на <b>2 300 км</b>.</>}
          />
          <TextField
            size="small"
            fullWidth
            placeholder="Запитати AI про поточні дані…"
            sx={{ mt: 1, "& .MuiOutlinedInput-root": { bgcolor: "rgba(10,14,23,0.9)" } }}
          />
        </Box>
      </Collapse>
    </Paper>
  );
}

function AiCard({ color, icon, title, body }: { color: string; icon: React.ReactNode; title: string; body: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex", gap: 1, p: 1, borderRadius: 1.5, mb: 0.75,
        bgcolor: "rgba(10,14,23,0.9)", border: "1px solid rgba(255,255,255,0.07)",
        borderLeft: `3px solid ${color}`, fontSize: 12,
      }}
    >
      <Box sx={{ color, flexShrink: 0, mt: 0.25 }}>{icon}</Box>
      <Box>
        <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.25 }}>{title}</Typography>
        <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.5 }}>{body}</Typography>
      </Box>
    </Box>
  );
}