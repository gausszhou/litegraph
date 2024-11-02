import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: "dist",
        lib: {
            name: "nodes-basic",
            entry: resolve(__dirname, "src/index.ts"),
            formats: ["es", "umd"],
        },
    }
});
