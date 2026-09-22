import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/games": "http://localhost:3000",
      "/activities": "http://localhost:3000",
      "/achievements": "http://localhost:3000",
      "/learning": "http://localhost:3000",
    },
  },
});
