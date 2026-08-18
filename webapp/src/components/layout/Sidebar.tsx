import { useEffect, useState } from "react";
import {
  Box, Typography, Checkbox, Slider, Divider, LinearProgress, Tooltip, IconButton,
} from "@mui/material";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import TuneIcon from "@mui/icons-material/Tune";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSource, toggleAllSources, setFilters, tickSessions } from "@/store/workspaceSlice";
import { SourceIcon } from "@/utils/sourceIcons";

function SectionHeader({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
      <Box sx={{ display: "flex", color: "text.faint" }}>{icon}</Box>
      <Typography sx={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "text.secondary", fontWeight: 600 }}>
        {children}
      </Typography>
    </Box>
  );
}

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
        width: 300,
        flexShrink: 0,
        bgcolor: "background.default",
        borderLeft: (t) => `1px solid ${t.palette.divider}`,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Sources */}
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <SectionHeader icon={<HubOutlinedIcon sx={{ fontSize: 16 }} />}>Менеджер джерел</SectionHeader>
          <Tooltip title="Активувати всі">
            <IconButton size="small" onClick={() => dispatch(toggleAllSources())}>
              <DoneAllIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            </IconButton>
          </Tooltip>
        </Box>
        {sources.map((s) => (
          <Box
            key={s.id}
            sx={{
              display: "flex", alignItems: "center", gap: 1, py: 0.9, px: 1,
              borderRadius: 1.5, cursor: "pointer",
              "&:hover": { bgcolor: "rgba(139,92,246,0.06)" },
            }}
          >
            <Checkbox
              size="small"
              checked={s.active}
              onChange={() => dispatch(toggleSource(s.id))}
              sx={{ p: 0.3, color: "secondary.main" }}
            />
            <SourceIcon id={s.id} sx={{ fontSize: 16, color: s.color, flexShrink: 0 }} />
            <Typography sx={{ fontSize: 13, color: "text.primary" }}>{s.name}</Typography>
            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                sx={{
                  fontSize: 10, color: s.online ? "success.main" : "text.faint",
                  border: 1, borderColor: "divider", px: 0.8, py: 0.1, borderRadius: 5,
                }}
              >
                {s.online ? "online" : "down"}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Divider />

      {/* Quick filters */}
      <Box sx={{ p: 2.5 }}>
        <SectionHeader icon={<TuneIcon sx={{ fontSize: 16 }} />}>Швидкі фільтри</SectionHeader>
        <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "text.secondary", mb: 0.5 }}>
          <span>Період:</span>
          <b style={{ color: "#8B5CF6", fontFamily: "monospace" }}>{filters.from}–2026</b>
        </Box>
        <Slider
          min={2020}
          max={2026}
          step={1}
          value={filters.from}
          onChange={(_, v) => dispatch(setFilters({ from: v as number }))}
          size="small"
          sx={{ color: "secondary.main" }}
        />
        <Box sx={{ mt: 0.5 }}>
          <FilterToggle label="Тільки зображення" checked={filters.img} onChange={(v) => dispatch(setFilters({ img: v }))} />
          <FilterToggle label="Тільки текст" checked={filters.txt} onChange={(v) => dispatch(setFilters({ txt: v }))} />
          <FilterToggle label="Тільки гео" checked={filters.geo} onChange={(v) => dispatch(setFilters({ geo: v }))} />
        </Box>
      </Box>

      <Divider />

      {/* Sessions */}
      <Box sx={{ p: 2.5 }}>
        <SectionHeader icon={<ScheduleIcon sx={{ fontSize: 16 }} />}>Активні сесії</SectionHeader>
        {sessions.map((s) => (
          <Box key={s.id} sx={{ mb: 1.5, p: 1.5, borderRadius: 2, bgcolor: "background.paper", border: (t) => `1px solid ${t.palette.divider}` }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, mb: 0.75 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {s.label}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                {s.state === "done" && <CheckCircleIcon sx={{ fontSize: 14, color: "success.main" }} />}
                {s.state === "err" && <ErrorIcon sx={{ fontSize: 14, color: "error.main" }} />}
                <Typography
                  sx={{
                    fontSize: 11, fontFamily: "monospace",
                    color: s.state === "done" ? "success.main" : s.state === "err" ? "error.main" : "secondary.main",
                  }}
                >
                  {s.state === "done" ? "100%" : s.state === "err" ? "помилка" : s.pct + "%"}
                </Typography>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={s.state === "err" ? 0 : s.state === "done" ? 100 : s.pct}
              color={s.state === "err" ? "error" : s.pct > 70 ? "warning" : "secondary"}
              sx={{ height: 5, borderRadius: 4, bgcolor: "divider" }}
            />
            <Typography sx={{ fontSize: 11, color: "text.faint", mt: 0.75 }}>{s.tooltip}</Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ mt: "auto", p: 2, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
        <Typography sx={{ fontSize: 11, color: "text.faint", lineHeight: 1.8 }}>
          Сесія: <SessionTimer /> · 2FA ✓
          <br />CSP active · Proxy: on
        </Typography>
      </Box>
    </Box>
  );
}

function FilterToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", my: 0.4 }}>
      <Checkbox
        size="small"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        sx={{ p: 0.3, color: "secondary.main" }}
      />
      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{label}</Typography>
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
  return <b style={{ fontFamily: "monospace", color: secs <= 60 ? "#EF4444" : "#F59E0B" }}>{m}:{s}</b>;
}
