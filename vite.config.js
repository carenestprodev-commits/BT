import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  base: "/",
  plugins: [react(), svgr()],
  server: {
    port: 5175,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom", "react-redux", "@reduxjs/toolkit"],
          charts: ["chart.js", "react-chartjs-2", "recharts"],
          editor: ["react-quill"],
          realtimekit: ["@cloudflare/realtimekit-react", "@cloudflare/realtimekit-react-ui"],
        },
      },
    },
  },
  publicDir: "public", // Ensures files from public folder are copied to dist
});
