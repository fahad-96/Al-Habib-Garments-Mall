import process from "node:process";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Link-preview crawlers (WhatsApp, Facebook, X) read index.html without running the app and ignore
// relative og:image URLs, so index.html writes absolute URLs as %SITE_URL%/path. Netlify sets URL
// to the site's primary address at build time; elsewhere set VITE_SITE_URL (env or .env file).
function siteUrl(mode) {
  const env = loadEnv(mode, process.cwd(), "");
  return String(process.env.URL || env.VITE_SITE_URL || "").trim().replace(/\/+$/, "");
}

const siteUrlPlugin = (url) => ({
  name: "ahgm-site-url",
  transformIndexHtml: {
    order: "pre",
    handler: (html) => html.replaceAll("%SITE_URL%", url),
  },
});

// Long-lived code gets its own chunks so a deploy of app code does not make returning visitors
// re-download it. Everything React needs to boot (react-dom/client's renderer, scheduler, router)
// goes in "react"; matching by path catches the react-dom/client entry that a name list missed.
const SPLIT_CHUNKS = [
  ["react", /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom|cookie|set-cookie-parser)[\\/]/],
  ["motion", /[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/],
  ["supabase", /[\\/]node_modules[\\/]@supabase[\\/]/],
  // The demo catalog is plain data (no imports): its own chunk keeps it cached across code deploys.
  ["demo", /[\\/]src[\\/]data[\\/]demo-products\.js$/],
];

export default defineConfig(({ mode }) => ({
  plugins: [react(), siteUrlPlugin(siteUrl(mode))],
  build: {
    target: "es2020",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          for (const [name, test] of SPLIT_CHUNKS) if (test.test(id)) return name;
          return undefined;
        },
      },
    },
  },
  server: { port: 5173 },
}));
