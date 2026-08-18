import { Box } from "@mui/material";
import type { Result, WorkspaceTab } from "@/types";

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

function walk(v: unknown, dep: number): string {
  const pad = "  ".repeat(dep);
  if (v === null) return `<span class="j-null">null</span>`;
  if (typeof v === "string") return `<span class="j-str">"${esc(v)}"</span>`;
  if (typeof v === "number") return `<span class="j-num">${v}</span>`;
  if (typeof v === "boolean") return `<span class="j-bool">${v}</span>`;
  if (Array.isArray(v)) {
    if (!v.length) return `<span class="j-punct">[]</span>`;
    const items = v.map((i) => walk(i, dep + 1)).join(`,\n${pad}  `);
    return `<span class="j-punct">[</span>\n${pad}  ${items}\n${pad}<span class="j-punct">]</span>`;
  }
  const keys = Object.keys(v as object);
  if (!keys.length) return `<span class="j-punct">{}</span>`;
  const items = keys
    .map((k) => `<span class="j-key">"${esc(k)}"</span><span class="j-punct">:</span> ${walk((v as Record<string, unknown>)[k], dep + 1)}`)
    .join(`,\n${pad}  `);
  return `<span class="j-punct">{</span>\n${pad}  ${items}\n${pad}<span class="j-punct">}</span>`;
}

export default function JsonView({ results, tab }: { results: Result[]; tab: WorkspaceTab }) {
  const data = {
    query: { tab: tab.title, sources: tab.submenu },
    count: results.length,
    results: results.map((r) => ({ id: r.id, source: r.source, type: r.type, title: r.title, date: r.date, ok: r.ok })),
  };
  const html = walk(data, 0);
  return (
    <Box sx={{ fontFamily: "monospace", fontSize: 12.5, lineHeight: 1.7 }}>
      <pre style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: html }} />
    </Box>
  );
}