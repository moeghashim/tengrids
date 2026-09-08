import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [react()],
    test: {
        include: ["test/**/*.test.tsx", "test/**/*.test.ts"],
        environment: "jsdom",
        setupFiles: "vitest.setup.ts",
        pool: "forks",
        maxWorkers: 1,
        watch: false,
        clearMocks: true,
        fakeTimers: {
            toFake: [
                "setTimeout",
                "clearTimeout",
                "setImmediate",
                "clearImmediate",
                "setInterval",
                "clearInterval",
                "Date",
                "performance",
                "requestAnimationFrame",
                "cancelAnimationFrame",
            ],
        },
        deps: {
            optimizer: {
                client: {
                    include: ["vitest-canvas-mock"],
                },
            },
        },
    },
});
