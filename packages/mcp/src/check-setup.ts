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

const REACT_WITNESSES = ["16.12.0", "16.14.0", "17.0.0", "17.0.2", "18.0.0", "18.3.1", "19.0.0", "19.2.8"] as const;

function allDeps(pkg: Pkg): Record<string, string> {
    return { ...pkg.peerDependencies, ...pkg.devDependencies, ...pkg.dependencies };
}

function parseVersion(value: string): [number, number, number] | undefined {
    const match = /^(\d+)(?:\.(\d+)(?:\.(\d+))?)?/u.exec(value.trim());
    if (match === null) return undefined;
    return [Number(match[1]), Number(match[2]), Number(match[3] ?? 0)];
}

function cmp(a: [number, number, number], b: [number, number, number]): number {
    return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

function satisfiesOne(spec: string, version: string): boolean {
    const v = parseVersion(version);
    if (v === undefined) return false;
    const token = spec.trim();
    if (token === "*" || token === "x" || token === "X") return true;
    if (/^\d+\.x$/iu.test(token) || /^\d+$/u.test(token)) {
        return v[0] === Number(token.split(".")[0]);
    }
    if (token.startsWith("^")) {
        const base = parseVersion(token.slice(1));
        if (base === undefined) return false;
        return cmp(v, base) >= 0 && v[0] === base[0];
    }
    if (token.startsWith("~")) {
        const base = parseVersion(token.slice(1));
        if (base === undefined) return false;
        return cmp(v, base) >= 0 && v[0] === base[0] && v[1] === base[1];
    }
    if (token.startsWith(">=")) {
        const base = parseVersion(token.slice(2));
        return base !== undefined && cmp(v, base) >= 0;
    }
    if (token.startsWith("<=")) {
        const base = parseVersion(token.slice(2));
        return base !== undefined && cmp(v, base) <= 0;
    }
    if (token.startsWith(">")) {
        const base = parseVersion(token.slice(1));
        return base !== undefined && cmp(v, base) > 0;
    }
    if (token.startsWith("<")) {
        const base = parseVersion(token.slice(1));
        return base !== undefined && cmp(v, base) < 0;
    }
    const exact = parseVersion(token.startsWith("=") ? token.slice(1) : token);
    return exact !== undefined && cmp(v, exact) === 0;
}

function rangeIncludes(range: string, version: string): boolean {
    return range.split("||").some(part => {
        const tokens = part.trim().split(/\s+/u).filter(Boolean);
        return tokens.length > 0 && tokens.every(token => satisfiesOne(token, version));
    });
}

/** True when the given npm range includes at least one React 16.12–19 release. */
export function isSupportedReact(range: string): boolean {
    const cleaned = range.trim();
    if (cleaned.length === 0) return false;
    if (/latest|workspace:|file:|git\+|https?:/iu.test(cleaned)) return false;
    return REACT_WITNESSES.some(witness => rangeIncludes(cleaned, witness));
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
