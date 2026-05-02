import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  // FIX: uncommenting this resolves the bug by forcing @solidjs/signals to be
  // pre-bundled as its own entry instead of being inlined into the solid-js chunk.
  // This should be handled automatically by vite-plugin-solid.
  //
  // optimizeDeps: {
  //   include: ["@solidjs/signals"],
  // },
});
