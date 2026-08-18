import { Paper, Box, Typography, Chip, ClickAwayListener } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeNotifications } from "@/store/uiSlice";

const ITEMS = [
  { dot: "red", title: "VirusTotal", body: "Перевищено ліміт API (429)" },
  { dot: "yellow", title: "Сеанс", body: "Обробка завершена, 124 результати" },
  { dot: "blue", title: "shodan", body: "Знайдено новий порт" },
];

const DOT_COLOR: Record<string, string> = { red: "#EF4444", yellow: "#F59E0B", blue: "#8B5CF6" };

export default function NotificationsPanel() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.notificationsOpen);

  return (
    <ClickAwayListener onClickAway={() => dispatch(closeNotifications())}>
      <Paper
        sx={{
          position: "fixed", top: 72, right: 20, zIndex: 300,
          width: 340,
          display: open ? "block" : "none",
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Сповіщення</Typography>
          <Chip label="3" size="small" sx={{ bgcolor: "#F59E0B", color: "#fff", fontSize: 10, height: 18 }} />
        </Box>
        {ITEMS.map((item, i) => (
          <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, p: 1.5, borderBottom: 1, borderColor: "divider", fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, mt: "5px", bgcolor: DOT_COLOR[item.dot] }} />
            <Box>
              <Box component="b" sx={{ color: "text.primary" }}>{item.title}</Box>{" "}
              {item.body}
            </Box>
          </Box>
        ))}
      </Paper>
    </ClickAwayListener>
  );
}
