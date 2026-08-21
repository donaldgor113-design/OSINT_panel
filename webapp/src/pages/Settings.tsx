import { useState } from "react";
import { Box, Tabs, Tab, Card, TextField, Switch, Typography, Button, Divider } from "@mui/material";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import SecurityIcon from "@mui/icons-material/Security";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import PageHeader from "@/components/common/PageHeader";
import RegistriesPanel from "@/components/tools/RegistriesPanel";
import AuditLogTable from "@/components/settings/AuditLogTable";

type Section = "registries" | "security" | "ai" | "profile" | "audit";
const TABS: { id: Section; label: string; icon: typeof HubOutlinedIcon }[] = [
  { id: "registries", label: "Реєстри", icon: HubOutlinedIcon },
  { id: "security", label: "Безпека", icon: SecurityIcon },
  { id: "ai", label: "AI", icon: AutoAwesomeOutlinedIcon },
  { id: "profile", label: "Профіль", icon: PersonOutlineIcon },
  { id: "audit", label: "Аудит-лог", icon: FactCheckOutlinedIcon },
];

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5 }}>
      <Box>
        <Typography sx={{ fontSize: 13.5, fontWeight: 500 }}>{label}</Typography>
        {hint && <Typography sx={{ fontSize: 12, color: "text.faint", mt: 0.25 }}>{hint}</Typography>}
      </Box>
      {children}
    </Box>
  );
}

export default function Settings() {
  const [section, setSection] = useState<Section>("registries");

  return (
    <Box sx={{ flex: 1, overflow: "auto", p: 3, maxWidth: 900 }}>
      <PageHeader title="Налаштування" subtitle="Реєстри, безпека, AI, профіль аналітика та аудит-лог" />

      <Tabs value={section} onChange={(_, v) => setSection(v)} sx={{ mb: 3 }}>
        {TABS.map((t) => (
          <Tab key={t.id} value={t.id} label={<Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}><t.icon sx={{ fontSize: 17 }} />{t.label}</Box>} />
        ))}
      </Tabs>

      {section === "registries" && <RegistriesPanel />}

      {section === "security" && (
        <Card sx={{ p: 2.5 }}>
          <Row label="Двофакторна автентифікація" hint="Обов'язкова для доступу до класифікованих джерел">
            <Switch defaultChecked />
          </Row>
          <Divider />
          <Row label="Автоблокування сесії" hint="Через 15 хвилин бездіяльності">
            <Switch defaultChecked />
          </Row>
          <Divider />
          <Row label="Шифрування локального сховища" hint="AES-256, ключ похідний від пароля">
            <Switch defaultChecked disabled />
          </Row>
          <Divider />
          <Row label="Watermark на експортах" hint="Підпис аналітика на кожному документі">
            <Switch defaultChecked />
          </Row>
        </Card>
      )}

      {section === "ai" && (
        <Card sx={{ p: 2.5 }}>
          <Row label="AI-асистент увімкнено" hint="Claude API для аналізу та звітів">
            <Switch defaultChecked />
          </Row>
          <Divider />
          <TextField
            size="small" label="Anthropic API ключ" type="password" fullWidth
            placeholder="sk-ant-…" sx={{ mt: 2 }}
          />
          <Row label="Автономні агенти" hint="Research / Analysis / Verification / Report">
            <Switch defaultChecked />
          </Row>
          <Divider />
          <Row label="Human-in-the-loop підтвердження" hint="Схвалення перед чутливими діями агентів">
            <Switch defaultChecked disabled />
          </Row>
        </Card>
      )}

      {section === "profile" && (
        <Card sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2, maxWidth: 500 }}>
          <TextField size="small" label="Ім'я користувача" defaultValue="analyst_1" />
          <TextField size="small" label="Email" defaultValue="analyst@intel.gov" />
          <TextField size="small" label="Мова інтерфейсу" defaultValue="Українська" />
          <Button variant="contained" color="secondary" sx={{ alignSelf: "flex-start" }}>Зберегти профіль</Button>
        </Card>
      )}

      {section === "audit" && <AuditLogTable />}
    </Box>
  );
}
