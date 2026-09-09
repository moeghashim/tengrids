import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { describe, expect, it } from "vitest";
import { EXAMPLE_SCHEMA } from "../src/scaffold.js";

const cli = join(dirname(fileURLToPath(import.meta.url)), "..", "dist", "cli.js");

describe("C1 stdio client", () => {
    it("starts dist/cli.js and calls list_docs, search_docs, scaffold", async () => {
        expect(existsSync(cli), "dist/cli.js missing — run npm run build -w packages/mcp").toBe(true);
        const transport = new StdioClientTransport({ command: process.execPath, args: [cli] });
        const client = new Client({ name: "tengrids-mcp-c1", version: "0.0.0" });
        await client.connect(transport);
        try {
            const listed = await client.callTool({ name: "list_docs", arguments: {} });
            const listText = JSON.stringify(listed);
            expect(listText).toMatch(/api/u);

            const searched = await client.callTool({
                name: "search_docs",
                arguments: { query: "frozen columns" },
            });
            expect(JSON.stringify(searched)).toMatch(/frozen|freeze/iu);

            const built = await client.callTool({
                name: "scaffold",
                arguments: { schema: EXAMPLE_SCHEMA },
            });
            expect(JSON.stringify(built)).toContain("createSchema");
        } finally {
            await client.close();
        }
    }, 20_000);
});
