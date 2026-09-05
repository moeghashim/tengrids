import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [react()],
    test: {
        include: ["test/**/*.test.tsx", "test/**/*.test.ts"],
        environment: "jsdom",
        setupFiles: "vitest.setup.ts",
        // One worker process, files run one after another (was threads: false / singleThread).
        pool: "forks",
        maxWorkers: 1,
        watch: false,
        clearMocks: true,
        fakeTimers: {
            // The timer set Vitest 0.34 faked by default, plus the animation/perf APIs the
            // grid uses. Vitest 3+ would otherwise fake everything (idle callbacks, hrtime, ...).
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
