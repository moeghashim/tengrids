import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadBundle } from "./bundle.js";
import { refreshBundle } from "./refresh.js";
import {
    CheckSetupInputSchema,
    checkSetupTool,
    formatZodError,
    GetDocInputSchema,
    getDoc,
    GetExampleInputSchema,
    getExample,
    ListDocsInputSchema,
    listDocs,
    ScaffoldInputSchema,
    scaffoldTool,
    SearchDocsInputSchema,
    searchDocsTool,
} from "./tools.js";
import type { DocBundle } from "./types.js";
import { packageVersion } from "./version.js";

type TextResult = { content: [{ type: "text"; text: string }]; isError?: boolean };

function asText(result: { text: string; isError: boolean }): TextResult {
    const payload: TextResult = { content: [{ type: "text", text: result.text }] };
    if (result.isError) payload.isError = true;
    return payload;
}

export function createTengridsServer(bundle: DocBundle, version = packageVersion()): McpServer {
    const state = { bundle };
    const server = new McpServer(
        { name: "tengrids-mcp", version },
        {
            instructions:
                "Prefer these tools over guessing tengrids APIs. Use search_docs, then get_doc. Use scaffold to generate a working grid. Never read files outside the bundled docs.",
        }
    );

    server.registerTool(
        "list_docs",
        {
            title: "List tengrids docs",
            description: "List bundled documentation ids, titles, and sizes.",
            inputSchema: ListDocsInputSchema,
            annotations: { readOnlyHint: true, idempotentHint: true },
        },
        () => asText(listDocs(state.bundle))
    );

    server.registerTool(
        "get_doc",
        {
            title: "Get a tengrids doc",
            description: "Return a bundled document, or one heading within it.",
            inputSchema: GetDocInputSchema,
            annotations: { readOnlyHint: true, idempotentHint: true },
        },
        args => {
            const parsed = GetDocInputSchema.safeParse(args);
            if (!parsed.success) return asText({ text: formatZodError(parsed.error), isError: true });
            return asText(getDoc(state.bundle, parsed.data));
        }
    );

    server.registerTool(
        "search_docs",
        {
            title: "Search tengrids docs",
            description: "BM25 search over bundled documentation sections.",
            inputSchema: SearchDocsInputSchema,
            annotations: { readOnlyHint: true, idempotentHint: true },
        },
        args => {
            const parsed = SearchDocsInputSchema.safeParse(args);
            if (!parsed.success) return asText({ text: formatZodError(parsed.error), isError: true });
            return asText(searchDocsTool(state.bundle, parsed.data));
        }
    );

    server.registerTool(
        "get_example",
        {
            title: "Get a Storybook example",
            description: "Return the source of the best-matching *.stories.tsx file plus its Pages URL.",
            inputSchema: GetExampleInputSchema,
            annotations: { readOnlyHint: true, idempotentHint: true },
        },
        args => {
            const parsed = GetExampleInputSchema.safeParse(args);
            if (!parsed.success) return asText({ text: formatZodError(parsed.error), isError: true });
            return asText(getExample(state.bundle, parsed.data));
        }
    );

    server.registerTool(
        "scaffold",
        {
            title: "Scaffold a tengrids grid",
            description:
                "Emit a complete TypeScript snippet from a JSON schema via createSchema and schema.print(). Optional filters, AI cells, and Next.js ssr:false wrapper.",
            inputSchema: ScaffoldInputSchema,
            annotations: { readOnlyHint: true, idempotentHint: true },
        },
        args => {
            const parsed = ScaffoldInputSchema.safeParse(args);
            if (!parsed.success) return asText({ text: formatZodError(parsed.error), isError: true });
            return asText(scaffoldTool(parsed.data));
        }
    );

    server.registerTool(
        "check_setup",
        {
            title: "Check a tengrids app setup",
            description: "Check peer deps, CSS import, #portal, and supported React version.",
            inputSchema: CheckSetupInputSchema,
            annotations: { readOnlyHint: true, idempotentHint: true },
        },
        args => {
            const parsed = CheckSetupInputSchema.safeParse(args);
            if (!parsed.success) return asText({ text: formatZodError(parsed.error), isError: true });
            return asText(checkSetupTool(parsed.data));
        }
    );

    server.registerResource(
        "docs",
        new ResourceTemplate("tengrids://docs/{id}", {
            list: () => ({
                resources: state.bundle.docs.map(doc => ({
                    uri: `tengrids://docs/${doc.id}`,
                    name: doc.title,
                    mimeType: "text/markdown",
                })),
            }),
        }),
        {
            title: "tengrids docs",
            description: "Bundled documentation. Mirrors get_doc.",
            mimeType: "text/markdown",
        },
        (uri, variables) => {
            const id = typeof variables.id === "string" ? variables.id : "";
            const result = getDoc(state.bundle, { id });
            return {
                contents: [{ uri: uri.href, mimeType: "text/markdown", text: result.text }],
            };
        }
    );

    return server;
}

export async function startStdioServer(options: { refresh?: boolean; docsDir?: string } = {}): Promise<void> {
    let bundle = loadBundle(options.docsDir);
    if (options.refresh === true) {
        try {
            const result = await refreshBundle(bundle);
            bundle = result.bundle;
            console.error(
                `tengrids-mcp: refresh ${result.refreshed} ok, ${result.failed} fell back to bundle (${bundle.docs.length} docs)`
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`tengrids-mcp: refresh failed, using bundle (${message})`);
        }
    }
    const server = createTengridsServer(bundle);
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
