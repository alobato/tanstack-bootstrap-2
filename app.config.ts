// https://github.com/Nipsuli/tanstack-start-cloudflare-worker/tree/main
import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "unenv";
import { paraglide } from "@inlang/paraglide-vite";

import nitroCloudflareBindings from "nitro-cloudflare-dev";

export default defineConfig({
  tsr: {
    appDirectory: 'src',
  },
  server: {
    preset: "cloudflare-module",
    unenv: cloudflare,

    modules: [nitroCloudflareBindings],
  },
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      paraglide({
        project: "./project.inlang",
        outdir: "./src/paraglide",
      }),
    ],
  },
});