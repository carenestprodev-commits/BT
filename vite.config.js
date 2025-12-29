import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  base: "./",
  plugins: [react(), svgr()],
  server: {
    port: 5175,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  publicDir: "public", // Ensures files from public folder are copied to dist
});
