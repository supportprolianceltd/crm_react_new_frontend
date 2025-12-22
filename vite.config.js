import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    strictPort: false,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "370a-102-90-98-83.ngrok-free.app", // ✅ Add your ngrok domain here
    ],
    proxy: {
      "/nhs": {
        target: "https://sandbox.api.service.nhs.uk",
        changeOrigin: true,
        secure: true, // Ensures HTTPS forwarding
        rewrite: (path) => path.replace(/^\/nhs/, ""), // Strips '/nhs' prefix
      },
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      // Exclude msw/browser from the build
      external: ["msw/browser"],
    },
  },
});
