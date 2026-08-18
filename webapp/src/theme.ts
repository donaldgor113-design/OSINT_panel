import { createTheme, alpha } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface TypeText {
    faint: string;
  }
}

export const palette = {
  bg: "#0A0E17",
  bg2: "#0D1322",
  card: "#1A2B4C",
  card2: "#22345A",
  card3: "#2A3F6B",
  cyan: "#00E5FF",
  orange: "#FF6D00",
  green: "#2EFFB0",
  red: "#FF4D5E",
  yellow: "#FFD60A",
  text: "#E6EDFF",
  textDim: "#8B9BBF",
  textFaint: "#5A6A8C",
};

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: palette.cyan },
    secondary: { main: palette.orange },
    success: { main: palette.green },
    error: { main: palette.red },
    warning: { main: palette.yellow },
    background: { default: palette.bg, paper: palette.card },
    text: { primary: palette.text, secondary: palette.textDim, faint: palette.textFaint },
  },
  typography: {
    fontFamily: '"Segoe UI", Inter, system-ui, sans-serif',
    fontSize: 13,
    h6: { fontWeight: 700 },
    body2: { fontSize: 12.5 },
    caption: { fontSize: 10.5, color: palette.textFaint },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `radial-gradient(1200px 600px at 70% -10%, ${alpha(palette.cyan, 0.06)}, transparent 60%),
            radial-gradient(900px 500px at 10% 110%, ${alpha(palette.orange, 0.05)}, transparent 60%),
            ${palette.bg}`,
        },
        "*::-webkit-scrollbar": { width: 9, height: 9 },
        "*::-webkit-scrollbar-thumb": { background: "#24334F", borderRadius: 9 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: `1px solid ${alpha(palette.cyan, 0.14)}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600 },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          "&.Mui-selected": { color: palette.cyan, borderColor: palette.cyan },
        },
      },
    },
  },
});
