import { Paper, Box, Typography, Chip, ClickAwayListener } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeNotifications } from "@/store/uiSlice";

const ITEMS = [
  { dot: "red", text: [["VirusTotal", "b"], ["Перевищено ліміт API (429)", "s"]] },
  { dot: "yellow", text: [["Сеанс", "b"], ["Обробка завершена, 124 результати", "s"]] },
  { dot: "blue", text: [["shodan", "b"], ["Знайдено новий порт", "s"]] },
];

export default function NotificationsPanel() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.notificationsOpen);

  return (
    <ClickAwayListener onClickAway={() => dispatch(closeNotifications())}>
      <Paper
        sx={{
          position: "fixed", top: 66, right: 12, zIndex: 300,
          width: 320, bgcolor: "#1A2B4C",
          display: open ? "block" : "none",
        }}
      >
        <Box sx={{ px: 1.75, py: 1.25, borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 0.75 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700 }}>Сповіщення</Typography>
          <Chip label="3" size="small" sx={{ bgcolor: "#FF6D00", color: "#fff", fontSize: 10, height: 18 }} />
        </Box>
        {ITEMS.map((item, i) => (
          <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1, p: 1.25, borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 12, color: "text.secondary", lineHeight: 1.5 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 4, background: { red: "#FF4D5E", yellow: "#FFD60A", blue: "#00E5FF" }[item.dot] as string, boxShadow: "0 0 8px rgba(255,255,255,0.2)" }} />
            <Box>
              <Box component="b" sx={{ color: "text.primary" }}>{item.text[0][0]}</Box>{" "}
              {item.text[0][1]}
            </Box>
          </Box>
        ))}
      </Paper>
    </ClickAwayListener>
  );
}