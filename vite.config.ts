import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

function sitemapPlugin(): Plugin {
  return {
    name: "vite-plugin-sitemap",
    closeBundle: {
      sequential: true,
      async handler() {
        const { writeSitemap } = await import("./scripts/generate-sitemap");
        writeSitemap(path.resolve(__dirname, "dist"));
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    sitemapPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
