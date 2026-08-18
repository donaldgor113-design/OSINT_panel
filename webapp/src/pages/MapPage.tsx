import { Box } from "@mui/material";
import MapView from "@/components/views/MapView";
import PageHeader from "@/components/common/PageHeader";

export default function MapPage() {
  return (
    <Box sx={{ flex: 1, overflow: "auto", p: 3, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageHeader title="Мапа" subtitle="Геолокація, маршрути та точки інтересу поточного розслідування" />
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <MapView />
      </Box>
    </Box>
  );
}
