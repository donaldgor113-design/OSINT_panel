import { useEffect, useState } from "react";
import {
  Box, Typography, Checkbox, Slider, Divider, LinearProgress, Tooltip, IconButton,
} from "@mui/material";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSource, toggleAllSources, setFilters, tickSessions } from "@/store/workspaceSlice";

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const sources = useAppSelector((s) => s.workspace.sources);
  const sessions = useAppSelector((s) => s.workspace.sessions);
  const filters = useAppSelector((s) => s.workspace.filters);

  useEffect(() => {
    const t = setInterval(() => dispatch(tickSessions()), 2200);
    return () => clearInterval(t);
  }, [dispatch]);

  return (
    <Box
      sx={{
        width: 280,
        flexShrink: 0,
        bgcolor: "#0D1322",
        borderLeft: "1px solid rgba(0,229,255,0.14)",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Sources */}
      <Box sx={{ p: 1.75 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography sx={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "text.secondary", fontWeight: 700 }}>
            🔌 Менеджер джерел
          </Typography>
          <Tooltip title="Активувати всі">
            <IconButton size="small" onClick={() => dispatch(toggleAllSources())}>
              <DoneAllIcon sx={{ fontSize: 15, color: "text.secondary" }} />
            </IconButton>
          </Tooltip>
        </Box>
        {sources.map((s) => (
          <Box
            key={s.id}
            sx={{
              display: "flex", alignItems: "center", gap: 1, py: 0.6, px: 0.8,
              borderRadius: 1, cursor: "pointer",
              "&:hover": { bgcolor: "rgba(0,229,255,0.05)" },
            }}
          >
            <Checkbox
              size="small"
              checked={s.active}
              onChange={() => dispatch(toggleSource(s.id))}
              sx={{ p: 0.2, color: "primary.main" }}
            />
            <Typography sx={{ fontSize: 12.5, color: s.color }}>{s.name}</Typography>
            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 0.8 }}>
              <Typography sx={{ fontSize: 9.5, color: s.online ? "success.main" : "text.faint", border: 1, borderColor: "rgba(255,255,255,0.08)", px: 0.6, borderRadius: 5 }}>
                {s.online ? "online" : "down"}
              </Typography>
              <Typography sx={{ fontSize: 10, color: s.active ? "success.main" : "text.faint" }}>
                {s.active ? "активний" : "вимк."}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.07)" }} />

      {/* Quick filters */}
      <Box sx={{ p: 1.75 }}>
        <Typography sx={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "text.secondary", fontWeight: 700, mb: 1 }}>
          ⚡ Швидкі фільтри
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "text.secondary" }}>
          <span>Період:</span>
          <b style={{ color: "#00E5FF", fontFamily: "monospace" }}>{filters.from}–2026</b>
        </Box>
        <Slider
          min={2020}
          max={2026}
          step={1}
          value={filters.from}
          onChange={(_, v) => dispatch(setFilters({ from: v as number }))}
          size="small"
          sx={{ color: "primary.main" }}
        />
        <FilterToggle label="Тільки зображення" checked={filters.img} onChange={(v) => dispatch(setFilters({ img: v }))} />
        <FilterToggle label="Тільки текст" checked={filters.txt} onChange={(v) => dispatch(setFilters({ txt: v }))} />
        <FilterToggle label="Тільки гео" checked={filters.geo} onChange={(v) => dispatch(setFilters({ geo: v }))} />
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.07)" }} />

      {/* Sessions */}
      <Box sx={{ p: 1.75 }}>
        <Typography sx={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "text.secondary", fontWeight: 700, mb: 1 }}>
          🕐 Активні сесії
        </Typography>
        {sessions.map((s) => (
          <Box key={s.id} sx={{ mb: 1.25, p: 1, borderRadius: 1, bgcolor: "rgba(10,14,23,0.9)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{s.label}</Typography>
              <Typography
                sx={{
                  fontSize: 11, fontFamily: "monospace",
                  color: s.state === "done" ? "success.main" : s.state === "err" ? "error.main" : "primary.main",
                }}
              >
                {s.state === "done" ? "✓ 100%" : s.state === "err" ? "✕ помилка" : s.pct + "%"}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={s.state === "err" ? 0 : s.state === "done" ? 100 : s.pct}
              color={s.state === "err" ? "error" : s.pct > 70 ? "warning" : "primary"}
              sx={{ height: 5, borderRadius: 4, bgcolor: "#2A3F6B" }}
            />
            <Typography sx={{ fontSize: 10.5, color: "text.faint", mt: 0.5 }}>{s.tooltip}</Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ mt: "auto", p: 1.5, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <Typography sx={{ fontSize: 10.5, color: "text.faint", lineHeight: 1.8 }}>
          Сесія: <SessionTimer /> · 2FA ✓
          <br />CSP active · Proxy: on
        </Typography>
      </Box>
    </Box>
  );
}

function FilterToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", my: 0.6 }}>
      <Checkbox
        size="small"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        sx={{ p: 0.2, color: "primary.main" }}
      />
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{label}</Typography>
    </Box>
  );
}

function SessionTimer() {
  const [secs, setSecs] = useState(15 * 60);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return <b style={{ fontFamily: "monospace", color: secs <= 60 ? "#FF4D5E" : "#FF6D00" }}>{m}:{s}</b>;
}