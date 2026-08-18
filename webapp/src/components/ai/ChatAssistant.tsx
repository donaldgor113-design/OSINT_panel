import { useState } from "react";
import { Box, TextField, IconButton, Typography, Avatar } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { CHAT_HISTORY } from "@/data/mock";
import type { ChatMessage } from "@/types";

export default function ChatAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>(CHAT_HISTORY);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setMessages((prev) => [
      ...prev,
      { id: "m" + Date.now(), role: "user", text: input, time },
      {
        id: "m" + (Date.now() + 1), role: "assistant",
        text: "Аналізую наявні дані розслідування… (демо-відповідь, реальна інтеграція з Claude API — наступний етап бекенду)",
        time,
      },
    ]);
    setInput("");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <Box sx={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2, p: 0.5 }}>
        {messages.map((m) => (
          <Box key={m.id} sx={{ display: "flex", gap: 1.25, alignItems: "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
            <Avatar sx={{ width: 28, height: 28, bgcolor: m.role === "user" ? "primary.main" : "rgba(139,92,246,0.15)", color: m.role === "user" ? "text.primary" : "secondary.main" }}>
              {m.role === "assistant" && <AutoAwesomeIcon sx={{ fontSize: 15 }} />}
            </Avatar>
            <Box sx={{ maxWidth: "72%" }}>
              <Box
                sx={{
                  p: 1.5, borderRadius: 2, fontSize: 13, lineHeight: 1.6,
                  bgcolor: m.role === "user" ? "primary.main" : "background.paper",
                  border: m.role === "assistant" ? 1 : 0, borderColor: "divider",
                  color: "text.primary",
                }}
              >
                {m.text}
              </Box>
              <Typography sx={{ fontSize: 10.5, color: "text.faint", mt: 0.5, textAlign: m.role === "user" ? "right" : "left" }}>{m.time}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
        <TextField
          fullWidth size="small" placeholder="Запитати AI про поточне розслідування…"
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <IconButton onClick={send} sx={{ bgcolor: "secondary.main", color: "#fff", "&:hover": { bgcolor: "secondary.dark" } }}>
          <SendIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
