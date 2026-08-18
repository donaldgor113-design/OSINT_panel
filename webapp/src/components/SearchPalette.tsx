import { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, Box, TextField, Typography, Chip, List, ListItemButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import TagIcon from "@mui/icons-material/Tag";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closePalette, openPalette, openReport, openExport } from "@/store/uiSlice";
import { addTab, setTabResults } from "@/store/workspaceSlice";
import { FACETS, RESULTS } from "@/data/mock";
import type { Result } from "@/types";

const QUICK_ACTIONS = [
  { action: "new-tab", icon: AddIcon, label: "Нова вкладка", key: "Ctrl+T" },
  { action: "report", icon: DescriptionOutlinedIcon, label: "Створити звіт", key: "Ctrl+R" },
  { action: "export", icon: WarningAmberIcon, label: "Екстрений експорт", key: "" },
  { action: "ai", icon: AutoAwesomeIcon, label: "AI Insights", key: "" },
];

export default function SearchPalette() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.paletteOpen);
  const activeTab = useAppSelector((s) => s.workspace.activeTab);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (open) setQ("");
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        dispatch(open ? closePalette() : openPalette());
      }
      if (e.key === "Escape") dispatch(closePalette());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dispatch]);

  // filter facets
  const facetRows = useMemo(() => {
    const ql = q.toLowerCase();
    if (!ql) return [];
    return FACETS.filter((f) => f.includes(ql)).slice(0, 8);
  }, [q]);

  const runSearch = (query: string) => {
    let pool: Result[] = RESULTS.slice();
    const tokens = query.toLowerCase().split(/\s+/);
    tokens.forEach((t) => {
      if (t.startsWith("type:")) pool = pool.filter((r) => r.type === t.slice(5) || r.tags.some((x) => x === t));
      else if (t.startsWith("source:")) pool = pool.filter((r) => r.source === t.slice(7));
      else if (t.startsWith("date:")) {
        const m = t.match(/^date:([><]?=?)(\d{4})-?(\d{2})?-?(\d{2})?$/);
        if (m) {
          const [, op, y, mo, d] = m;
          const bound = (mo ? y + "-" + mo : y + "-12") + (d ? "-" + d : "-31");
          pool = pool.filter((r) => {
            const rd = r.date.replace(/[.\/]/g, "-");
            if (op === ">") return rd > bound;
            if (op === "<") return rd < bound;
            return rd.startsWith(y);
          });
        }
      } else if (t.startsWith("geo:")) pool = pool.filter((r) => r.tags.some((x) => x.startsWith("geo:")));
      else pool = pool.filter((r) => r.tags.some((x) => x === t) || r.title.toLowerCase().includes(t) || r.body.toLowerCase().includes(t));
    });
    dispatch(setTabResults({ tabId: activeTab, results: pool.length ? pool : [{
      id: "empty", source: "dorks", type: "text", title: "Нічого не знайдено",
      body: `Запит «${query}» не дав результатів серед поточних даних.`, tags: [], date: "—", ok: false,
    }] }));
    dispatch(closePalette());
  };

  const runAction = (action: string) => {
    if (action === "new-tab") dispatch(addTab());
    else if (action === "report") dispatch(openReport());
    else if (action === "export") dispatch(openExport());
    else if (action === "ai") { /* ai toggle */ }
    dispatch(closePalette());
  };

  return (
    <Dialog
      open={open}
      onClose={() => dispatch(closePalette())}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { border: "1px solid rgba(139,92,246,0.3)", borderRadius: 2.5, boxShadow: "0 20px 60px rgba(0,0,0,0.7)" } }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 2.5, py: 1.75, borderBottom: 1, borderColor: "divider" }}>
          <SearchIcon sx={{ color: "text.faint", fontSize: 20 }} />
          <TextField
            autoFocus
            fullWidth
            variant="standard"
            placeholder="Фасетний пошук…  e.g. type:image source:telegram date:>2024.01.01"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            InputProps={{ disableUnderline: true }}
            sx={{ "& input": { fontSize: 15 } }}
          />
          <Chip label="ESC" size="small" sx={{ fontFamily: "monospace", fontSize: 10 }} />
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0.5, minHeight: 200 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, px: 1.5, py: 1 }}>
          {q.split(/\s+/).filter((f) => /^(type|source|date|geo|risk):/.test(f)).map((f) => (
            <Chip key={f} label={f} size="small" sx={{ color: "secondary.main", border: "1px solid rgba(139,92,246,0.3)" }} />
          ))}
        </Box>
        <List dense>
          {q.trim()
            ? (
              <>
                <Typography variant="caption" sx={{ px: 1.5, display: "block", color: "text.faint", letterSpacing: 1 }}>
                  Знайдено джерел: {facetRows.length}
                </Typography>
                {facetRows.map((f) => (
                  <ListItemButton key={f} onClick={() => setQ((prev) => (prev.trim() ? prev.trim() + " " + f : f))} sx={{ fontSize: 13, gap: 1 }}>
                    <TagIcon sx={{ fontSize: 15, color: "text.faint" }} /> {f}
                  </ListItemButton>
                ))}
                <ListItemButton onClick={() => runSearch(q)} sx={{ fontSize: 13, gap: 1 }}>
                  <SearchIcon sx={{ fontSize: 15, color: "text.faint" }} />
                  Виконати розумний пошук: <b style={{ color: "#8B5CF6" }}>{q}</b>
                </ListItemButton>
              </>
            )
            : (
              <>
                <Typography variant="caption" sx={{ px: 1.5, display: "block", color: "text.faint", letterSpacing: 1 }}>
                  Швидкі дії
                </Typography>
                {QUICK_ACTIONS.map((a) => (
                  <ListItemButton key={a.action} onClick={() => runAction(a.action)} sx={{ fontSize: 13, gap: 1 }}>
                    <a.icon sx={{ fontSize: 16, color: "text.faint" }} />
                    {a.label}
                    {a.key && <Chip label={a.key} size="small" sx={{ ml: "auto", fontFamily: "monospace", fontSize: 10 }} />}
                  </ListItemButton>
                ))}
              </>
            )}
        </List>
      </DialogContent>
    </Dialog>
  );
}