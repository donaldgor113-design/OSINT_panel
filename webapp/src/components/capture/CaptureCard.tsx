import { useEffect, useState } from "react";
import { Box, Card, Typography, IconButton, Tooltip } from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import LinkIcon from "@mui/icons-material/Link";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { fetchCaptureFileBlob } from "@/api/capture";
import type { ApiCaptureItem } from "@/types/api";

const MEDIA_ICON: Record<string, typeof ImageOutlinedIcon> = {
  image: ImageOutlinedIcon,
  video: VideocamOutlinedIcon,
  document: DescriptionOutlinedIcon,
  other: InsertDriveFileOutlinedIcon,
};

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

export default function CaptureCard({
  item, onAttach, onDiscard,
}: {
  item: ApiCaptureItem;
  onAttach?: () => void;
  onDiscard?: () => void;
}) {
  const [thumb, setThumb] = useState<string | null>(null);
  const Icon = MEDIA_ICON[item.media_type ?? "other"] ?? InsertDriveFileOutlinedIcon;

  useEffect(() => {
    let url: string | null = null;
    if (item.media_type === "image") {
      fetchCaptureFileBlob(item.id).then((blob) => {
        url = URL.createObjectURL(blob);
        setThumb(url);
      });
    }
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [item.id, item.media_type]);

  return (
    <Card sx={{ p: 2 }}>
      <Box sx={{ height: 120, borderRadius: 1.5, bgcolor: "background.default", display: "flex", alignItems: "center", justifyContent: "center", mb: 1.5, overflow: "hidden" }}>
        {thumb ? (
          <img src={thumb} alt={item.file_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Icon sx={{ fontSize: 36, color: "text.faint" }} />
        )}
      </Box>
      <Tooltip title={item.file_name}>
        <Typography sx={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.file_name}
        </Typography>
      </Tooltip>
      <Typography sx={{ fontSize: 11, color: "text.faint", mb: 1 }}>{formatSize(item.file_size_bytes)}</Typography>

      {item.status === "pending" && (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton size="small" onClick={onAttach} sx={{ color: "secondary.main" }} title="Прикріпити до сутності">
            <LinkIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onDiscard} sx={{ color: "error.main" }} title="Видалити">
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
      {item.status === "attached" && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "success.main" }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 15 }} />
          <Typography sx={{ fontSize: 11 }}>Прикріплено</Typography>
        </Box>
      )}
    </Card>
  );
}
