import babel from "@rolldown/plugin-babel";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { telefunc } from "telefunc/vite";
import vike from "vike/plugin";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    allowedHosts: true,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    vike({}),
    telefunc(),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
});
