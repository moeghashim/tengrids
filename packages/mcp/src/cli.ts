#!/usr/bin/env node
import { startStdioServer } from "./server.js";

const refresh = process.argv.includes("--refresh");

try {
    await startStdioServer({ refresh });
} catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`tengrids-mcp: ${message}`);
    process.exit(1);
}
