import { useEffect, useRef, useState } from "react";
import { Box, Typography, Card, Button, CircularProgress } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import PageHeader from "@/components/common/PageHeader";
import { listCaptureItems, uploadCapture, discardCaptureItem } from "@/api/capture";
import type { ApiCaptureItem } from "@/types/api";
import CaptureCard from "@/components/capture/CaptureCard";
import AttachCaptureDialog from "@/components/capture/AttachCaptureDialog";

export default function CaptureInbox() {
  const [items, setItems] = useState<ApiCaptureItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachTarget, setAttachTarget] = useState<ApiCaptureItem | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = () => {
    listCaptureItems().then(setItems).catch(() => setError("Не вдалося завантажити Capture Inbox."));
  };

  useEffect(load, []);

  const uploadFiles = async (files: FileList | File[]) => {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const item = await uploadCapture(file);
        setItems((prev) => (prev ? [item, ...prev] : [item]));
      }
    } finally {
      setUploading(false);
    }
  };

  const discard = async (item: ApiCaptureItem) => {
    await discardCaptureItem(item.id);
    setItems((prev) => prev?.filter((i) => i.id !== item.id) ?? null);
  };

  const pending = items?.filter((i) => i.status === "pending") ?? [];
  const attached = items?.filter((i) => i.status === "attached") ?? [];

  return (
    <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
      <PageHeader
        title="Capture Inbox"
        subtitle="Фаза 1: ручний імпорт без автопарсингу — перетягни файл, потім вручну прикріпи до справи/сутності"
      />

      <Card
        sx={{
          p: 4, textAlign: "center", mb: 3, cursor: "pointer",
          border: dragOver ? "2px dashed" : "2px dashed transparent",
          borderColor: dragOver ? "secondary.main" : "divider",
          bgcolor: dragOver ? "rgba(139,92,246,0.06)" : "background.paper",
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInput.current?.click()}
      >
        <UploadFileIcon sx={{ fontSize: 36, color: "secondary.main", mb: 1 }} />
        <Typography sx={{ fontSize: 14, color: "text.secondary", mb: 1 }}>
          Перетягни файли сюди або натисни, щоб обрати
        </Typography>
        <Button variant="outlined" component="span" disabled={uploading}>
          {uploading ? <CircularProgress size={18} /> : "Обрати файли"}
        </Button>
        <input
          ref={fileInput} type="file" multiple hidden
          onChange={(e) => { if (e.target.files?.length) uploadFiles(e.target.files); e.target.value = ""; }}
        />
      </Card>

      {error && <Typography sx={{ fontSize: 13, color: "error.main" }}>{error}</Typography>}

      <Typography sx={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "text.faint", fontWeight: 600, mb: 1.5 }}>
        Очікують тегування ({pending.length})
      </Typography>
      {pending.length === 0 && !uploading && (
        <Box sx={{ textAlign: "center", py: 4, color: "text.faint" }}>
          <InboxOutlinedIcon sx={{ fontSize: 32, mb: 1 }} />
          <Typography sx={{ fontSize: 13 }}>Порожньо</Typography>
        </Box>
      )}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 1.5, mb: 4 }}>
        {pending.map((item) => (
          <CaptureCard key={item.id} item={item} onAttach={() => setAttachTarget(item)} onDiscard={() => discard(item)} />
        ))}
      </Box>

      {attached.length > 0 && (
        <>
          <Typography sx={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "text.faint", fontWeight: 600, mb: 1.5 }}>
            Прикріплені ({attached.length})
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 1.5 }}>
            {attached.map((item) => <CaptureCard key={item.id} item={item} />)}
          </Box>
        </>
      )}

      {attachTarget && (
        <AttachCaptureDialog
          item={attachTarget}
          open
          onClose={() => setAttachTarget(null)}
          onAttached={(updated) => setItems((prev) => prev?.map((i) => (i.id === updated.id ? updated : i)) ?? null)}
        />
      )}
    </Box>
  );
}
