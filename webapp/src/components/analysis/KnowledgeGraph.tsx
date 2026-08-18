import { useMemo, useState } from "react";
import { Box, Typography, Chip } from "@mui/material";
import CytoscapeComponent from "react-cytoscapejs";
import type { Entity, Relationship, EntityType } from "@/types";

const TYPE_COLOR: Record<EntityType, string> = {
  person: "#8B5CF6",
  company: "#3B82F6",
  address: "#F59E0B",
  phone: "#10B981",
  email: "#EF4444",
};

const TYPE_LABEL: Record<EntityType, string> = {
  person: "Особа", company: "Компанія", address: "Адреса", phone: "Телефон", email: "Email",
};

export default function KnowledgeGraph({ entities, relationships }: { entities: Entity[]; relationships: Relationship[] }) {
  const [selected, setSelected] = useState<Entity | null>(null);

  const elements = useMemo(
    () => [
      ...entities.map((e) => ({
        data: { id: e.id, label: e.label, color: TYPE_COLOR[e.type] },
      })),
      ...relationships.map((r) => ({
        data: { id: r.id, source: r.source, target: r.target, label: r.type },
      })),
    ],
    [entities, relationships]
  );

  return (
    <Box sx={{ display: "flex", height: "100%", minHeight: 460, gap: 2 }}>
      <Box sx={{ flex: 1, position: "relative", borderRadius: 2, border: 1, borderColor: "divider", overflow: "hidden", bgcolor: "background.default" }}>
        <CytoscapeComponent
          elements={CytoscapeComponent.normalizeElements(elements)}
          style={{ width: "100%", height: "100%" }}
          layout={{ name: "cose", animate: false, padding: 40 }}
          stylesheet={[
            {
              selector: "node",
              style: {
                "background-color": "data(color)",
                label: "data(label)",
                color: "#F1F5F9",
                "font-size": 10,
                "text-valign": "bottom",
                "text-margin-y": 6,
                width: 26,
                height: 26,
                "border-width": 2,
                "border-color": "#1E293B",
              },
            },
            {
              selector: "edge",
              style: {
                width: 1.5,
                "line-color": "#475569",
                "target-arrow-color": "#475569",
                "target-arrow-shape": "triangle",
                "curve-style": "bezier",
                label: "data(label)",
                "font-size": 8,
                color: "#94A3B8",
                "text-rotation": "autorotate",
              },
            },
            {
              selector: "node:selected",
              style: { "border-color": "#8B5CF6", "border-width": 3 },
            },
          ]}
          cy={(cy) => {
            cy.off("tap", "node");
            cy.on("tap", "node", (evt) => {
              const id = evt.target.id();
              setSelected(entities.find((e) => e.id === id) ?? null);
            });
          }}
        />
        <Box sx={{ position: "absolute", left: 12, bottom: 12, display: "flex", gap: 1, flexWrap: "wrap", maxWidth: "70%" }}>
          {(Object.keys(TYPE_COLOR) as EntityType[]).map((t) => (
            <Chip
              key={t}
              label={TYPE_LABEL[t]}
              size="small"
              sx={{ fontSize: 10, height: 20, bgcolor: "background.paper", color: TYPE_COLOR[t], border: `1px solid ${TYPE_COLOR[t]}55` }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ width: 260, flexShrink: 0, borderRadius: 2, border: 1, borderColor: "divider", p: 2, bgcolor: "background.paper" }}>
        <Typography sx={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "text.faint", fontWeight: 600, mb: 1.5 }}>
          Деталі сутності
        </Typography>
        {selected ? (
          <>
            <Chip
              label={TYPE_LABEL[selected.type]}
              size="small"
              sx={{ fontSize: 10, mb: 1, color: TYPE_COLOR[selected.type], border: `1px solid ${TYPE_COLOR[selected.type]}55` }}
            />
            <Typography sx={{ fontSize: 15, fontWeight: 600, mb: 0.5 }}>{selected.label}</Typography>
            {selected.meta && <Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: 1.5 }}>{selected.meta}</Typography>}
            <Typography sx={{ fontSize: 11, color: "text.faint" }}>Довіра: {selected.confidence}/10</Typography>
            <Typography sx={{ fontSize: 11, color: "text.faint", mt: 1.5 }}>
              Зв'язків: {relationships.filter((r) => r.source === selected.id || r.target === selected.id).length}
            </Typography>
          </>
        ) : (
          <Typography sx={{ fontSize: 12.5, color: "text.faint" }}>Натисніть на вузол графа, щоб побачити деталі</Typography>
        )}
      </Box>
    </Box>
  );
}
