import { Box } from "@mui/material";
import KnowledgeGraph from "@/components/analysis/KnowledgeGraph";
import PageHeader from "@/components/common/PageHeader";
import { ENTITIES, RELATIONSHIPS } from "@/data/mock";

export default function Graph() {
  return (
    <Box sx={{ flex: 1, overflow: "auto", p: 3, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageHeader
        title="Граф зв'язків"
        subtitle="Демо-дані поки що — після SourceModulePanel-пілота тут буде граф сутностей поточної справи"
      />
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <KnowledgeGraph entities={ENTITIES} relationships={RELATIONSHIPS} />
      </Box>
    </Box>
  );
}
