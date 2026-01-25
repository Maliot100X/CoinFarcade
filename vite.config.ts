import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    proxy: {
      '/base-rpc': 'http://localhost:3000',
      '/zora_explore_new': 'http://localhost:3000',
      '/zora_get_coin': 'http://localhost:3000',
      '/zora_get_profile': 'http://localhost:3000',
    }
  },
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    exclude: ['pg'],
  },
});
