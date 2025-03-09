import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/themes": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      "/theme/reload": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      "/theme": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      "/name": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
