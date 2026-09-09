import { intersects, validRange } from "semver";
import { z } from "zod";

export const CheckSetupInputSchema = z
    .object({
        packageJson: z.string().min(1),
        appSource: z.string().optional(),
    })
    .strict();

export type CheckSetupInput = z.infer<typeof CheckSetupInputSchema>;

type Pkg = {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
};

/** Core's required peers (llms.txt / packages/core/package.json). */
export const CORE_PEERS = ["react", "react-dom", "lodash", "marked", "react-responsive-carousel"] as const;

/** tengrids peer: React 16.12 through 19.x. */
export const SUPPORTED_REACT_RANGE = ">=16.12.0 <20.0.0";

function allDeps(pkg: Pkg): Record<string, string> {
    return { ...pkg.peerDependencies, ...pkg.devDependencies, ...pkg.dependencies };
}

/** True when `range` is a valid semver range that intersects 16.12–19. */
export function isSupportedReact(range: string): boolean {
    const cleaned = range.trim();
    if (cleaned.length === 0) return false;
    const valid = validRange(cleaned);
    if (valid === null) return false;
    return intersects(valid, SUPPORTED_REACT_RANGE);
}

function stripComments(source: string): string {
    return source
        .replace(/\/\*[\s\S]*?\*\//gu, "")
        .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/gu, "")
        .replace(/(^|[^:\\\w])\/\/.*$/gmu, "$1");
}

function hasCssImport(source: string): boolean {
    const code = stripComments(source);
    return /(?:import|require)\s*(?:\(\s*)?["']tengrids\/(?:dist\/)?index\.css["']/u.test(code);
}

type PortalStatus = "present" | "missing" | "uncertain";

function portalStatus(source: string): PortalStatus {
    const code = stripComments(source);
    const created =
        /id\s*=\s*(?:["']portal["']|\{\s*["']portal["']\s*\})/u.test(code) || /portalElementRef\s*=\s*\{/u.test(code);
    if (created) return "present";
    if (/getElementById\(\s*["']portal["']\s*\)/u.test(code)) return "uncertain";
    return "missing";
}

export function checkSetup(input: CheckSetupInput): string {
    let pkg: Pkg;
    try {
        pkg = JSON.parse(input.packageJson) as Pkg;
        if (typeof pkg !== "object" || pkg === null || Array.isArray(pkg)) {
            throw new Error("not an object");
        }
    } catch {
        return ["check_setup", "", "✗ packageJson is not valid JSON"].join("\n");
    }

    const deps = allDeps(pkg);
    const ok: string[] = [];
    const issues: string[] = [];
    const notes: string[] = [];

    if (typeof deps.tengrids === "string" && deps.tengrids.length > 0) {
        ok.push(`tengrids is listed (${deps.tengrids})`);
    } else {
        issues.push("tengrids is missing from dependencies / peerDependencies");
    }

    for (const peer of CORE_PEERS) {
        const version = deps[peer];
        if (typeof version !== "string" || version.length === 0) {
            issues.push(`${peer} is missing from dependencies / peerDependencies`);
            continue;
        }
        if (peer === "react" || peer === "react-dom") {
            if (isSupportedReact(version)) {
                ok.push(`${peer} ${version} is supported (16.12–19)`);
            } else {
                issues.push(`${peer} ${version} is not supported (need ^16.12 || 17 || 18 || 19)`);
            }
        } else {
            ok.push(`${peer} is listed (${version})`);
        }
    }

    for (const extra of ["tengrids-schema", "tengrids-ai"] as const) {
        const version = deps[extra];
        if (typeof version === "string" && version.length > 0) {
            notes.push(`${extra} is listed (${version})`);
        }
    }

    if (input.appSource !== undefined && input.appSource.length > 0) {
        if (hasCssImport(input.appSource)) {
            ok.push("CSS imported (tengrids/dist/index.css)");
        } else {
            issues.push(
                'Missing `import "tengrids/dist/index.css"` — the grid will look unstyled and overlays may not size'
            );
        }
        const portal = portalStatus(input.appSource);
        if (portal === "present") {
            ok.push("#portal (or portalElementRef) is present");
        } else if (portal === "uncertain") {
            notes.push(
                'Uncertain: found getElementById("portal") but no #portal element or portalElementRef. Overlay editors need a real portal node.'
            );
        } else {
            issues.push(
                'Missing `#portal` — overlay editors mount into document.getElementById("portal"). Add `<div id="portal" style="position:fixed;left:0;top:0;z-index:9999" />` as the last child of <body>, or pass portalElementRef'
            );
        }
    } else {
        ok.push("appSource omitted; skipped CSS and #portal checks");
    }

    const lines = ["check_setup", ""];
    for (const line of ok) lines.push(`✓ ${line}`);
    for (const line of notes) lines.push(`• ${line}`);
    for (const line of issues) lines.push(`✗ ${line}`);
    lines.push("");
    const uncertain = notes.some(line => line.startsWith("Uncertain"));
    if (issues.length === 0 && !uncertain) {
        lines.push("All checks passed.");
    } else if (issues.length === 0) {
        lines.push("Checks passed with warnings.");
    } else {
        lines.push(`${issues.length} issue(s) to fix.`);
    }
    return lines.join("\n");
}
