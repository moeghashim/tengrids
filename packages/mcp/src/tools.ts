import { z } from "zod";
import { findDoc } from "./bundle.js";
import { checkSetup, CheckSetupInputSchema } from "./check-setup.js";
import { firstExportedStory, headingWithChildren, storybookSlug } from "./markdown.js";
import { scaffold, ScaffoldInputSchema } from "./scaffold.js";
import { searchDocs } from "./search.js";
import type { DocBundle } from "./types.js";

export const ListDocsInputSchema = z.object({}).strict();

export const GetDocInputSchema = z
    .object({
        id: z.string().min(1),
        heading: z.string().min(1).optional(),
    })
    .strict();

export const SearchDocsInputSchema = z
    .object({
        query: z.string().min(1),
        limit: z.number().int().min(1).max(50).optional(),
    })
    .strict();

export const GetExampleInputSchema = z
    .object({
        query: z.string().min(1),
    })
    .strict();

export { ScaffoldInputSchema, CheckSetupInputSchema };

export type ToolResult = {
    text: string;
    isError: boolean;
};

function ok(text: string): ToolResult {
    return { text, isError: false };
}

function fail(text: string): ToolResult {
    return { text, isError: true };
}

export function listDocs(bundle: DocBundle): ToolResult {
    const lines = bundle.docs.map(doc => {
        const size = Buffer.byteLength(doc.text, "utf8");
        return `${doc.id}\t${doc.title}\t${size}`;
    });
    return ok(`id\ttitle\tsize\n${lines.join("\n")}`);
}

export function getDoc(bundle: DocBundle, input: z.infer<typeof GetDocInputSchema>): ToolResult {
    const doc = findDoc(bundle, input.id);
    if (doc === undefined) {
        return fail(`unknown doc id "${input.id}"`);
    }
    if (input.heading === undefined) {
        return ok(doc.text);
    }
    const needle = input.heading.toLowerCase();
    const index = doc.headings.findIndex(
        h => h.heading.toLowerCase() === needle || h.heading.toLowerCase().includes(needle)
    );
    if (index < 0) {
        const available = doc.headings.map(h => h.heading).filter(h => h.length > 0);
        return fail(
            `heading "${input.heading}" not found in ${doc.id}` +
                (available.length > 0 ? `. Headings: ${available.join("; ")}` : "")
        );
    }
    return ok(headingWithChildren(doc.headings, index));
}

export function searchDocsTool(bundle: DocBundle, input: z.infer<typeof SearchDocsInputSchema>): ToolResult {
    const limit = input.limit ?? 10;
    const hits = searchDocs(bundle, input.query, limit);
    if (hits.length === 0) {
        return ok(`No matches for ${JSON.stringify(input.query)}.`);
    }
    const body = hits.map(hit => `${hit.id}\t${hit.heading}\t${hit.score.toFixed(3)}\n${hit.excerpt}`).join("\n\n");
    return ok(body);
}

export function getExample(bundle: DocBundle, input: z.infer<typeof GetExampleInputSchema>): ToolResult {
    const hits = searchDocs(bundle, input.query, 1, { storiesOnly: true });
    if (hits.length === 0) {
        return fail(`no story matched ${JSON.stringify(input.query)}`);
    }
    const doc = findDoc(bundle, hits[0].id);
    if (doc === undefined) {
        return fail(`no story matched ${JSON.stringify(input.query)}`);
    }
    const exportName = firstExportedStory(doc.text) ?? "Story";
    const slug = storybookSlug(doc.title, exportName);
    const url = `https://moeghashim.github.io/tengrids/?path=/story/${slug}`;
    return ok(`title: ${doc.title}\nurl: ${url}\nid: ${doc.id}\n\n${doc.text}`);
}

export function scaffoldTool(input: z.infer<typeof ScaffoldInputSchema>): ToolResult {
    try {
        return ok(scaffold(input));
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return fail(`scaffold failed: ${message}`);
    }
}

export function checkSetupTool(input: z.infer<typeof CheckSetupInputSchema>): ToolResult {
    return ok(checkSetup(input));
}

export function formatZodError(error: z.ZodError): string {
    return error.issues.map(issue => `${issue.path.join(".") || "(root)"}: ${issue.message}`).join("; ");
}
