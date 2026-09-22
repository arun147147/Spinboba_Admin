import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    /*
     * Every migrated file imports through "@/", so nothing keeps a
     * relative path back into the customer application.
     */
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    /*
     * 5174 so the admin app and the storefront (3001) can run at
     * the same time without fighting over a port.
     */
    port: 5174,
    open: true,
  },

  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
