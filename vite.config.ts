import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";
import svgr from "vite-plugin-svgr";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "REACT_APP_");

  return {
    plugins: [
      react(),
      nodePolyfills({
        // To add only specific polyfills, add them here. If no option is passed, adds all polyfills
        include: [
          "buffer",
          "process",
          "crypto",
          "stream",
          "assert",
          "http",
          "https",
          "os",
          "url",
          "path",
        ],
        // To exclude specific polyfills, add them to this list.
        exclude: [],
        // Whether to polyfill `node:` protocol imports.
        protocolImports: true,
      }),
      svgr({
        svgrOptions: {
          plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
          svgoConfig: {
            plugins: [
              {
                name: "removeViewBox",
                active: false,
              },
            ],
          },
        },
      }),
      viteStaticCopy({
        targets: [
          {
            src: "public/*",
            dest: ".",
          },
        ],
      }),
    ],
    resolve: {
      alias: {
        // Absolute imports from src directory using @ prefix
        "@": resolve(__dirname, "src"),
      },
    },
    define: {
      global: "globalThis",
      "process.env.NODE_ENV": JSON.stringify(mode),
      // Dynamically create process.env definitions from loaded env vars
      ...Object.keys(env).reduce(
        (acc, key) => {
          if (key.startsWith("REACT_APP_")) {
            // Handle boolean values
            if (key.includes("SINGLE_TENANT_MODE") || key.includes("USE_SSO")) {
              acc[`process.env.${key}`] = JSON.stringify(env[key]?.toLowerCase() === "true");
            } else {
              acc[`process.env.${key}`] = JSON.stringify(env[key] || "");
            }
          }
          return acc;
        },
        {} as Record<string, string>,
      ),
    },
    server: {
      host: true,
      hmr: {
        overlay: true,
        clientPort: undefined, // Use same port as dev server
      },
      // Improve file watching
      watch: {
        usePolling: false,
        interval: 100,
        ignored: ["**/node_modules/**", "**/.git/**", "**/build/**"],
      },
    },
    css: {
      devSourcemap: mode === "development",
      // Improve CSS HMR
      hmr: mode === "development",
    },
    // Improve dependency pre-bundling for faster HMR
    cacheDir: "node_modules/.vite",
    build: {
      outDir: "build",
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react-redux": [
              "react",
              "react-dom",
              "react-router-dom",
              "react-redux",
              "redux",
              "@reduxjs/toolkit",
            ],
            "vendor-stellar": ["@stellar/design-system"],
            "vendor-query": ["@tanstack/react-query"],
          },
          assetFileNames: (assetInfo) => {
            const fileName = assetInfo.names?.[0];
            if (!fileName) return "assets/[name]-[hash][extname]";

            const ext = fileName.split(".").pop()?.toLowerCase();
            if (ext && /^(png|jpe?g|svg|gif|tiff|bmp|ico)$/.test(ext)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
          chunkFileNames: "static/[name]-[hash].js",
          entryFileNames: "static/[name]-[hash].js",
        },
      },
    },
    optimizeDeps: {
      include: [
        "buffer",
        "process",
        "react",
        "react-dom",
        "react-router-dom",
        "react-redux",
        "@reduxjs/toolkit",
        "@tanstack/react-query",
        "lodash",
        "date-fns",
        "uuid",
      ],
    },
    esbuild: {
      define: {
        global: "globalThis",
      },
      // Faster rebuilds in development
      ...(mode === "development" && {
        keepNames: true,
      }),
    },
  };
});
