import { useState } from "react";
import { Box, Card, TextField, Button, Typography, Alert } from "@mui/material";
import { Navigate } from "react-router-dom";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginThunk } from "@/store/authSlice";

export default function Login() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((s) => s.auth);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (status === "authenticated") {
    return <Navigate to="/" replace />;
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginThunk({ username, password }));
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default" }}>
      <Card component="form" onSubmit={submit} sx={{ width: 380, p: 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
          <Box
            sx={{
              width: 48, height: 48, borderRadius: 2.5, mb: 1.5,
              display: "flex", alignItems: "center", justifyContent: "center",
              bgcolor: "rgba(139,92,246,0.12)", color: "secondary.main",
            }}
          >
            <SatelliteAltIcon sx={{ fontSize: 26 }} />
          </Box>
          <Typography sx={{ fontSize: 18, fontWeight: 600 }}>OSINT HUB</Typography>
          <Typography sx={{ fontSize: 12, color: "text.faint", letterSpacing: 1, textTransform: "uppercase" }}>Command Center</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TextField
          label="Логін" fullWidth required autoFocus
          value={username} onChange={(e) => setUsername(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Пароль" type="password" fullWidth required
          value={password} onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 3 }}
        />
        <Button
          type="submit" fullWidth variant="contained" color="secondary"
          disabled={status === "loading"}
          sx={{ height: 44 }}
        >
          {status === "loading" ? "Вхід…" : "Увійти"}
        </Button>
      </Card>
    </Box>
  );
}
