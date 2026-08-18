import type { SvgIconProps } from "@mui/material";
import RadarIcon from "@mui/icons-material/Radar";
import HubIcon from "@mui/icons-material/Hub";
import SendIcon from "@mui/icons-material/Send";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import TagIcon from "@mui/icons-material/Tag";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import ContentPasteOutlinedIcon from "@mui/icons-material/ContentPasteOutlined";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import StorageIcon from "@mui/icons-material/Storage";
import type { SourceId } from "@/types";

const ICONS: Record<SourceId, React.ComponentType<SvgIconProps>> = {
  shodan: RadarIcon,
  maltego: HubIcon,
  telegram: SendIcon,
  dorks: ManageSearchIcon,
  virustotal: BugReportOutlinedIcon,
  twitter: TagIcon,
  instagram: PhotoCameraOutlinedIcon,
  pastebin: ContentPasteOutlinedIcon,
  dnstwist: AltRouteIcon,
};

export function SourceIcon({ id, ...props }: { id: SourceId } & SvgIconProps) {
  const Icon = ICONS[id] ?? StorageIcon;
  return <Icon {...props} />;
}
