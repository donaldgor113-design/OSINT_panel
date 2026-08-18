import { useEffect, useState } from "react";
import { Box, Card, Typography, Chip, Button, CircularProgress, TextField, Collapse } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SearchIcon from "@mui/icons-material/Search";
import StorageIcon from "@mui/icons-material/Storage";
import { listRegistries, testRegistry, queryRegistry } from "@/api/registries";
import type { ApiRegistry } from "@/types/api";

function RegistryCard({ registry, onUpdated }: { registry: ApiRegistry; onUpdated: (r: ApiRegistry) => void }) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [queryOpen, setQueryOpen] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [querying, setQuerying] = useState(false);
  const [queryResults, setQueryResults] = useState<Record<string, unknown>[] | null>(null);

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testRegistry(registry.id);
      setTestResult(res.message);
      onUpdated({ ...registry, is_healthy: res.is_healthy, last_tested_at: new Date().toISOString() });
    } catch {
      setTestResult("Не вдалося зв'язатись із бекендом");
    } finally {
      setTesting(false);
    }
  };

  const runQuery = async () => {
    if (!queryText.trim()) return;
    setQuerying(true);
    try {
      const res = await queryRegistry(registry.id, queryText);
      setQueryResults(res.results);
    } finally {
      setQuerying(false);
    }
  };

  return (
    <Card sx={{ p: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.25 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: "background.default", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <StorageIcon sx={{ fontSize: 18, color: "secondary.main" }} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{registry.name}</Typography>
          {registry.is_healthy !== null && (
            <Chip
              label={registry.is_healthy ? "healthy" : "unhealthy"}
              size="small"
              sx={{ fontSize: 9.5, height: 16, mt: 0.25, color: registry.is_healthy ? "success.main" : "error.main" }}
            />
          )}
        </Box>
      </Box>
      <Typography sx={{ fontSize: 12.5, color: "text.secondary", lineHeight: 1.5, mb: 1.5, minHeight: 38 }}>
        {registry.description ?? "Без опису"}
      </Typography>

      <Box sx={{ display: "flex", gap: 1 }}>
        <Button size="small" variant="outlined" fullWidth onClick={runTest} disabled={testing} startIcon={testing ? <CircularProgress size={14} /> : <PlayArrowIcon sx={{ fontSize: 16 }} />}>
          Перевірити
        </Button>
        <Button size="small" variant="outlined" fullWidth onClick={() => setQueryOpen((v) => !v)} startIcon={<SearchIcon sx={{ fontSize: 16 }} />}>
          Запит
        </Button>
      </Box>

      {testResult && <Typography sx={{ fontSize: 11.5, color: "text.faint", mt: 1 }}>{testResult}</Typography>}

      <Collapse in={queryOpen}>
        <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
          <TextField
            size="small" fullWidth placeholder="Текст запиту…"
            value={queryText} onChange={(e) => setQueryText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runQuery()}
          />
          <Button size="small" variant="contained" color="secondary" onClick={runQuery} disabled={querying}>
            {querying ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "OK"}
          </Button>
        </Box>
        {queryResults && (
          <Box sx={{ mt: 1.5, p: 1.25, borderRadius: 1.5, bgcolor: "background.default", fontFamily: "monospace", fontSize: 11, maxHeight: 160, overflow: "auto" }}>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(queryResults, null, 2)}</pre>
          </Box>
        )}
      </Collapse>
    </Card>
  );
}

export default function RegistriesPanel() {
  const [registries, setRegistries] = useState<ApiRegistry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listRegistries()
      .then(setRegistries)
      .catch(() => setError("Не вдалося завантажити реєстри з бекенду. Перевірте, чи запущений сервер."));
  }, []);

  if (error) return <Typography sx={{ fontSize: 13, color: "error.main" }}>{error}</Typography>;
  if (!registries) return <CircularProgress size={24} />;

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 2 }}>
      {registries.map((r) => (
        <RegistryCard
          key={r.id}
          registry={r}
          onUpdated={(updated) => setRegistries((prev) => prev!.map((x) => (x.id === updated.id ? updated : x)))}
        />
      ))}
    </Box>
  );
}
