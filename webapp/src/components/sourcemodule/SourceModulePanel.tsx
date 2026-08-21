import { useEffect, useState } from "react";
import {
  Box, TextField, Button, Typography, Chip, Card, CircularProgress, IconButton, Collapse,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AddLinkIcon from "@mui/icons-material/AddLink";
import StorageIcon from "@mui/icons-material/Storage";
import { listRegistries, queryRegistry } from "@/api/registries";
import { listCaseEntities } from "@/api/cases";
import { deriveConnectorStatus, CONNECTOR_STATUS_COLOR, CONNECTOR_STATUS_LABEL } from "@/utils/connectorStatus";
import type { ApiRegistry, ApiEntity } from "@/types/api";
import AttachResultDialog from "./AttachResultDialog";

type SourceState = {
  status: "idle" | "loading" | "done" | "error";
  results: Record<string, unknown>[];
  message?: string;
  expanded: boolean;
};

export default function SourceModulePanel({ caseId }: { caseId: string }) {
  const [registries, setRegistries] = useState<ApiRegistry[]>([]);
  const [persons, setPersons] = useState<ApiEntity[]>([]);
  const [sourceState, setSourceState] = useState<Record<string, SourceState>>({});
  const [attach, setAttach] = useState<{ sourceName: string; result: Record<string, unknown> } | null>(null);

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [patronymic, setPatronymic] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    listRegistries().then((regs) => {
      setRegistries(regs);
      setSourceState(Object.fromEntries(regs.map((r) => [r.id, { status: "idle", results: [], expanded: false }])));
    });
    listCaseEntities(caseId).then((entities) => setPersons(entities.filter((e) => e.entity_type === "person")));
  }, [caseId]);

  const buildQueryText = () => {
    const parts = [lastName, firstName, patronymic].filter(Boolean).join(" ");
    const extra = [phone && `phone:${phone}`, email && `email:${email}`].filter(Boolean).join(" ");
    return [parts, extra].filter(Boolean).join(" ").trim();
  };

  const searchAll = async () => {
    const queryText = buildQueryText();
    if (!queryText) return;

    setSourceState((prev) => {
      const next = { ...prev };
      registries.forEach((r) => { next[r.id] = { ...next[r.id], status: "loading", expanded: true }; });
      return next;
    });

    await Promise.allSettled(
      registries.map(async (r) => {
        try {
          const res = await queryRegistry(r.id, queryText);
          setSourceState((prev) => ({
            ...prev,
            [r.id]: {
              ...prev[r.id],
              status: res.error ? "error" : "done",
              results: res.results,
              message: res.error ?? undefined,
            },
          }));
        } catch {
          setSourceState((prev) => ({ ...prev, [r.id]: { ...prev[r.id], status: "error", message: "Помилка запиту" } }));
        }
      })
    );
  };

  return (
    <Box sx={{ display: "flex", gap: 2, height: "100%", minHeight: 0 }}>
      {/* Зона 1: параметри пошуку */}
      <Box sx={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Typography sx={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "text.faint", fontWeight: 600 }}>
          Параметри пошуку
        </Typography>
        <TextField size="small" label="Прізвище" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <TextField size="small" label="Ім'я" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <TextField size="small" label="По батькові" value={patronymic} onChange={(e) => setPatronymic(e.target.value)} />
        <TextField size="small" label="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <TextField size="small" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button
          variant="contained" color="secondary" startIcon={<SearchIcon sx={{ fontSize: 16 }} />}
          onClick={searchAll} disabled={!buildQueryText()}
        >
          Шукати по всіх джерелах
        </Button>
      </Box>

      {/* Зона 2: джерела (конектори) */}
      <Box sx={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 1.25, minWidth: 0 }}>
        <Typography sx={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "text.faint", fontWeight: 600 }}>
          Джерела ({registries.length})
        </Typography>
        {registries.map((r) => {
          const state = sourceState[r.id] ?? { status: "idle", results: [], expanded: false };
          const connStatus = deriveConnectorStatus(r);
          return (
            <Card key={r.id} sx={{ p: 1.75 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <StorageIcon sx={{ fontSize: 16, color: "secondary.main" }} />
                <Typography sx={{ fontSize: 13.5, fontWeight: 600, flex: 1 }}>{r.name}</Typography>
                <Chip
                  label={CONNECTOR_STATUS_LABEL[connStatus]}
                  size="small"
                  sx={{ fontSize: 9.5, height: 18, color: CONNECTOR_STATUS_COLOR[connStatus] }}
                />
                {state.status === "loading" && <CircularProgress size={16} />}
                <IconButton
                  size="small"
                  onClick={() => setSourceState((prev) => ({ ...prev, [r.id]: { ...prev[r.id], expanded: !prev[r.id].expanded } }))}
                >
                  {state.expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </IconButton>
              </Box>

              <Collapse in={state.expanded}>
                <Box sx={{ mt: 1.5 }}>
                  {state.status === "idle" && (
                    <Typography sx={{ fontSize: 12, color: "text.faint" }}>Ще не шукали цим джерелом.</Typography>
                  )}
                  {state.status === "error" && (
                    <Typography sx={{ fontSize: 12, color: "error.main" }}>{state.message}</Typography>
                  )}
                  {state.status === "done" && state.results.length === 0 && (
                    <Typography sx={{ fontSize: 12, color: "text.faint" }}>Нічого не знайдено.</Typography>
                  )}
                  {state.status === "done" && state.results.map((res, i) => (
                    <Box
                      key={i}
                      sx={{ p: 1.25, mb: 1, borderRadius: 1.5, bgcolor: "background.default", border: 1, borderColor: "divider" }}
                    >
                      <Box sx={{ fontFamily: "monospace", fontSize: 11, color: "text.secondary", mb: 1 }}>
                        {Object.entries(res).slice(0, 4).map(([k, v]) => (
                          <Box key={k}>{k}: {String(v)}</Box>
                        ))}
                      </Box>
                      <Button
                        size="small" variant="outlined" startIcon={<AddLinkIcon sx={{ fontSize: 14 }} />}
                        onClick={() => setAttach({ sourceName: r.name, result: res })}
                      >
                        Прикріпити до сутності
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Card>
          );
        })}
      </Box>

      {attach && (
        <AttachResultDialog
          caseId={caseId}
          sourceName={attach.sourceName}
          result={attach.result}
          existingPersons={persons}
          open
          onClose={() => setAttach(null)}
          onAttached={(entity) => {
            setPersons((prev) => {
              const exists = prev.some((p) => p.id === entity.id);
              return exists ? prev.map((p) => (p.id === entity.id ? entity : p)) : [...prev, entity];
            });
          }}
        />
      )}
    </Box>
  );
}
