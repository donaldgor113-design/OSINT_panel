import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

function cspInlinePlugin(): Plugin {
  return {
    name: "csp-inline-dev",
    transformIndexHtml(html, ctx) {
      const scriptSrc = ctx.server ? "'self' 'unsafe-inline'" : "'self'";
      return html.replace("%CSP_SCRIPT_SRC%", scriptSrc);
    },
  };
}

export default defineConfig({
  plugins: [react(), cspInlinePlugin()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});