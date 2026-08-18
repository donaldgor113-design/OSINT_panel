import { createTheme, alpha } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface TypeText {
    faint: string;
  }
  interface Palette {
    accent: Palette["primary"];
  }
  interface PaletteOptions {
    accent?: PaletteOptions["primary"];
  }
}

// OSINT HUB Design System — slate neutral scale + semantic accents.
// Source: OSINT_HUB_DESIGN_SYSTEM.md (Color System / Design Tokens)
export const slate = {
  900: "#0F172A",
  800: "#1E293B",
  700: "#334155",
  600: "#475569",
  500: "#64748B",
  400: "#94A3B8",
  300: "#CBD5E1",
  200: "#E2E8F0",
  100: "#F1F5F9",
};

export const semantic = {
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
  accent: "#8B5CF6", // "highlight/active" — current selection, active tabs, focused elements
};

// Legacy alias kept so existing `import { palette } from "@/theme"` call sites
// (mock data, per-source badge colors) keep working without a rename pass.
export const palette = {
  bg: slate[900],
  bg2: slate[900],
  card: slate[700],
  card2: slate[600],
  card3: slate[600],
  cyan: semantic.accent,
  orange: semantic.warning,
  green: semantic.success,
  red: semantic.error,
  yellow: semantic.warning,
  text: slate[100],
  textDim: slate[300],
  textFaint: slate[400],
};

const radius = { sm: 4, md: 8, lg: 16 };
const shadow = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
};

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: slate[600], light: slate[500], dark: slate[700], contrastText: slate[100] },
    secondary: { main: semantic.accent },
    accent: { main: semantic.accent },
    success: { main: semantic.success },
    error: { main: semantic.error },
    warning: { main: semantic.warning },
    info: { main: semantic.info },
    background: { default: slate[800], paper: slate[700] },
    text: { primary: slate[100], secondary: slate[300], faint: slate[400], disabled: slate[600] },
    divider: alpha(slate[600], 0.6),
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    fontSize: 13,
    h1: { fontSize: "2.375rem", fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em" },
    h2: { fontSize: "1.875rem", fontWeight: 600, lineHeight: 1.3 },
    h3: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.4 },
    h4: { fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: "1.125rem", fontWeight: 500, lineHeight: 1.5 },
    h6: { fontSize: "1rem", fontWeight: 600, lineHeight: 1.4 },
    body1: { fontSize: "1rem", fontWeight: 400, lineHeight: 1.6 },
    body2: { fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.5 },
    caption: { fontSize: "0.75rem", fontWeight: 400, lineHeight: 1.5, color: slate[400] },
    button: { textTransform: "none", fontWeight: 500 },
  },
  shape: { borderRadius: radius.md },
  transitions: {
    duration: { shortest: 150, shorter: 150, short: 250, standard: 250, complex: 350 },
    easing: { easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `radial-gradient(1200px 600px at 70% -10%, ${alpha(semantic.accent, 0.06)}, transparent 60%),
            radial-gradient(900px 500px at 10% 110%, ${alpha(semantic.info, 0.05)}, transparent 60%),
            ${slate[800]}`,
        },
        "*::-webkit-scrollbar": { width: 9, height: 9 },
        "*::-webkit-scrollbar-thumb": { background: slate[600], borderRadius: 9 },
        "@media (prefers-reduced-motion: reduce)": {
          "*": {
            animationDuration: "0.01ms !important",
            animationIterationCount: "1 !important",
            transitionDuration: "0.01ms !important",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: slate[700],
          border: `1px solid ${slate[600]}`,
          boxShadow: shadow.sm,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: radius.lg,
          transition: `border-color 250ms cubic-bezier(0.4,0,0.2,1), box-shadow 250ms cubic-bezier(0.4,0,0.2,1), transform 250ms cubic-bezier(0.4,0,0.2,1)`,
          "&:hover": { borderColor: slate[500], boxShadow: shadow.md, transform: "translateY(-2px)" },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          borderRadius: radius.md,
          transition: "all 150ms cubic-bezier(0.4,0,0.2,1)",
        },
        containedPrimary: {
          backgroundColor: slate[600],
          color: slate[100],
          "&:hover": { backgroundColor: slate[700], transform: "translateY(-2px)", boxShadow: shadow.md },
          "&:active": { backgroundColor: slate[800], transform: "translateY(0)" },
        },
        outlined: { borderColor: slate[600] },
        sizeMedium: { height: 40, padding: "10px 16px" },
        sizeSmall: { height: 32, padding: "6px 12px" },
        sizeLarge: { height: 48, padding: "12px 20px" },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: slate[800],
          borderRadius: radius.md,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: slate[600] },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: slate[500] },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: semantic.info, borderWidth: 2 },
          "&.Mui-focused": { boxShadow: `0 0 0 3px ${alpha(semantic.info, 0.1)}` },
          "&.Mui-error .MuiOutlinedInput-notchedOutline": { borderColor: semantic.error },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: semantic.accent, height: 2 },
        root: { borderBottom: `2px solid ${slate[600]}` },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          color: slate[400],
          "&:hover": { color: slate[300] },
          "&.Mui-selected": { color: slate[100] },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderColor: slate[600],
          "&.Mui-selected": { color: semantic.accent, borderColor: semantic.accent, backgroundColor: alpha(semantic.accent, 0.1) },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: radius.lg, fontWeight: 600 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: slate[900],
          border: `1px solid ${slate[600]}`,
          borderRadius: radius.md,
          boxShadow: shadow.lg,
          fontSize: "0.75rem",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: radius.lg, boxShadow: shadow.xl },
      },
    },
  },
});
