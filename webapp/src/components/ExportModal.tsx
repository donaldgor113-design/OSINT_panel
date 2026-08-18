import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Button, Alert } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeExport } from "@/store/uiSlice";

export default function ExportModal() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.exportOpen);
  const [toast, setToast] = useState("");

  const doExport = (label: string) => {
    setToast(label);
    setTimeout(() => setToast(""), 2600);
  };

  return (
    <Dialog open={open} onClose={() => dispatch(closeExport())} fullWidth maxWidth="xs" PaperProps={{ sx: { bgcolor: "#1A2B4C", border: "1px solid rgba(0,229,255,0.3)", borderRadius: 2.5 } }}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 0 }}>
        ⛑️ Екстрений експорт
        <Button onClick={() => dispatch(closeExport())} sx={{ color: "text.secondary", minWidth: 30 }}>✕</Button>
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.6, mb: 2 }}>
          Миттєва вигрузка всіх активних результатів у захищений архів. Файли підписуються водяним знаком аналітика.
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Button variant="outlined" onClick={() => doExport("Повний дамп зібрано · watermarking done")}>📦 Повний дамп (.zip)</Button>
          <Button variant="outlined" onClick={() => doExport("Експорт звітів розпочато")}>🗂️ Лише звіти (.pdf)</Button>
          <Button variant="outlined" onClick={() => doExport("Експорт медіа розпочато")}>🖼️ Лише медіа (.zip)</Button>
        </Box>
        {toast && <Alert severity="success" sx={{ mt: 1.5 }}>{toast}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={() => dispatch(closeExport())} sx={{ color: "text.secondary" }}>Закрити</Button>
      </DialogActions>
    </Dialog>
  );
}