import { Box, Card, Typography, Chip } from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import SensorsIcon from "@mui/icons-material/Sensors";
import StorageIcon from "@mui/icons-material/Storage";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import PendingIcon from "@mui/icons-material/Pending";
import { useAppSelector } from "@/store/hooks";
import { ENTITIES, RELATIONSHIPS, TIMELINE_EVENTS } from "@/data/mock";
import StatCard from "@/components/common/StatCard";
import PageHeader from "@/components/common/PageHeader";

export default function Dashboard() {
  const sources = useAppSelector((s) => s.workspace.sources);
  const sessions = useAppSelector((s) => s.workspace.sessions);
  const tabs = useAppSelector((s) => s.workspace.tabs);

  const onlineSources = sources.filter((s) => s.online).length;
  const runningSessions = sessions.filter((s) => s.state === "run").length;
  const totalResults = tabs.reduce((n, t) => n + t.results.length, 0);

  return (
    <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
      <PageHeader title="Дашборд" subtitle="Загальний стан активних розслідувань та джерел" />

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 2, mb: 3 }}>
        <StatCard label="Активні вкладки" value={tabs.length} icon={PersonOutlineIcon} color="secondary.main" />
        <StatCard label="Сутностей знайдено" value={ENTITIES.length} icon={HubOutlinedIcon} color="info.main" trend={`${RELATIONSHIPS.length} зв'язків`} />
        <StatCard label="Джерел онлайн" value={`${onlineSources} / ${sources.length}`} icon={StorageIcon} color="success.main" />
        <StatCard label="Активних сесій" value={runningSessions} icon={SensorsIcon} color="warning.main" trend={`${totalResults} результатів зібрано`} />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 2, alignItems: "start" }}>
        <Card sx={{ p: 2.5 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 2 }}>Останні події (timeline)</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {TIMELINE_EVENTS.slice(-4).reverse().map((e) => (
              <Box key={e.id} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "secondary.main", mt: "6px", flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{e.title}</Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{e.description}</Typography>
                  <Typography sx={{ fontSize: 11, color: "text.faint", mt: 0.25 }}>{e.date}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Card>

        <Card sx={{ p: 2.5 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 2 }}>Стан сесій</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {sessions.map((s) => (
              <Box key={s.id} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {s.state === "done" && <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />}
                {s.state === "err" && <ErrorIcon sx={{ fontSize: 16, color: "error.main" }} />}
                {s.state === "run" && <PendingIcon sx={{ fontSize: 16, color: "secondary.main" }} />}
                <Typography sx={{ fontSize: 12.5, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {s.label}
                </Typography>
                <Chip
                  label={s.state === "run" ? `${s.pct}%` : s.state === "done" ? "готово" : "помилка"}
                  size="small"
                  sx={{
                    fontSize: 10, height: 20,
                    color: s.state === "err" ? "error.main" : s.state === "done" ? "success.main" : "secondary.main",
                  }}
                />
              </Box>
            ))}
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
