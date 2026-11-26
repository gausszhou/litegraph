import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        include: ["./src/main.ts"],
        environment: "jsdom",
        setupFiles: ["./src/setup/webaudio.ts"]
    },
})
