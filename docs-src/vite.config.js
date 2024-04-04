import { defineConfig } from "vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

// https://vitejs.dev/config/
export default defineConfig({
    base: "/numflow.py",
    build: {
        outDir: "../docs",
        emptyOutDir: true,
    },
    plugins: [
        ViteImageOptimizer({
            png: {
                quality: 50,
            },
            webp: {
                quality: 50,
            },
            jpeg: {
                quality: 50,
            },
        }),
    ],
});
