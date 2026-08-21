import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getCase } from "@/api/cases";
import type { ApiCase } from "@/types/api";
import SourceModulePanel from "@/components/sourcemodule/SourceModulePanel";

export default function CaseSearch() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<ApiCase | null>(null);

  useEffect(() => {
    if (id) getCase(id).then(setCaseData);
  }, [id]);

  if (!id) return null;
  if (!caseData) return <Box sx={{ p: 3 }}><CircularProgress size={24} /></Box>;

  return (
    <Box sx={{ flex: 1, overflow: "hidden", p: 3, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <IconButton size="small" onClick={() => navigate(`/cases/${id}`)}><ArrowBackIcon fontSize="small" /></IconButton>
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 600 }}>Пошук: {caseData.title}</Typography>
          <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>SourceModulePanel — пілот на пошуку людини</Typography>
        </Box>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <SourceModulePanel caseId={id} />
      </Box>
    </Box>
  );
}
