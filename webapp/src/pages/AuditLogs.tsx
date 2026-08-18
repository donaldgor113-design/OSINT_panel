import { Box, Card, Table, TableHead, TableBody, TableRow, TableCell, Chip } from "@mui/material";
import PageHeader from "@/components/common/PageHeader";
import { AUDIT_LOG } from "@/data/mock";

export default function AuditLogs() {
  return (
    <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
      <PageHeader title="Аудит-лог" subtitle="Незмінний журнал усіх дій: вхід, доступ до даних, запити, експорти" />
      <Card sx={{ p: 0, overflow: "hidden" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {["Час", "Подія", "Користувач", "Ресурс", "Дія", "IP", "Статус"].map((h) => (
                <TableCell key={h} sx={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "text.faint", fontWeight: 600, borderColor: "divider" }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {AUDIT_LOG.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ fontSize: 12, fontFamily: "monospace", color: "text.secondary", borderColor: "divider" }}>{row.time}</TableCell>
                <TableCell sx={{ fontSize: 12.5, borderColor: "divider" }}>{row.eventType}</TableCell>
                <TableCell sx={{ fontSize: 12.5, color: "text.secondary", borderColor: "divider" }}>{row.user}</TableCell>
                <TableCell sx={{ fontSize: 12.5, color: "text.secondary", borderColor: "divider" }}>{row.resource}</TableCell>
                <TableCell sx={{ fontSize: 12.5, color: "text.secondary", borderColor: "divider" }}>{row.action}</TableCell>
                <TableCell sx={{ fontSize: 12, fontFamily: "monospace", color: "text.faint", borderColor: "divider" }}>{row.ip}</TableCell>
                <TableCell sx={{ borderColor: "divider" }}>
                  <Chip
                    label={row.status === "success" ? "успіх" : "помилка"}
                    size="small"
                    sx={{ fontSize: 10, color: row.status === "success" ? "success.main" : "error.main" }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
