import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Button, Alert, IconButton } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CloseIcon from "@mui/icons-material/Close";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import FolderZipOutlinedIcon from "@mui/icons-material/FolderZipOutlined";
import PermMediaOutlinedIcon from "@mui/icons-material/PermMediaOutlined";
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
    <Dialog open={open} onClose={() => dispatch(closeExport())} fullWidth maxWidth="xs" PaperProps={{ sx: { border: "1px solid rgba(139,92,246,0.3)", borderRadius: 2.5 } }}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 0, gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningAmberIcon sx={{ fontSize: 20, color: "error.main" }} />
          Екстрений експорт
        </Box>
        <IconButton onClick={() => dispatch(closeExport())} size="small" sx={{ color: "text.secondary" }}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.6, mb: 2.5 }}>
          Миттєва вигрузка всіх активних результатів у захищений архів. Файли підписуються водяним знаком аналітика.
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Button variant="outlined" startIcon={<ArchiveOutlinedIcon sx={{ fontSize: 18 }} />} onClick={() => doExport("Повний дамп зібрано · watermarking done")} sx={{ justifyContent: "flex-start" }}>
            Повний дамп (.zip)
          </Button>
          <Button variant="outlined" startIcon={<FolderZipOutlinedIcon sx={{ fontSize: 18 }} />} onClick={() => doExport("Експорт звітів розпочато")} sx={{ justifyContent: "flex-start" }}>
            Лише звіти (.pdf)
          </Button>
          <Button variant="outlined" startIcon={<PermMediaOutlinedIcon sx={{ fontSize: 18 }} />} onClick={() => doExport("Експорт медіа розпочато")} sx={{ justifyContent: "flex-start" }}>
            Лише медіа (.zip)
          </Button>
        </Box>
        {toast && <Alert severity="success" sx={{ mt: 2 }}>{toast}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={() => dispatch(closeExport())} sx={{ color: "text.secondary" }}>Закрити</Button>
      </DialogActions>
    </Dialog>
  );
}
