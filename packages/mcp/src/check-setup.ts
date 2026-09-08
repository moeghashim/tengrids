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

function allDeps(pkg: Pkg): Record<string, string> {
    return { ...pkg.peerDependencies, ...pkg.devDependencies, ...pkg.dependencies };
}

/** React 16.12+ through 19.x, matching tengrids peer range. */
export function isSupportedReact(range: string): boolean {
    const match = /(\d+)\.(\d+)/u.exec(range);
    if (match === null) {
        if (/\b16\b/u.test(range)) return true;
        if (/\b17\b/u.test(range) || /\b18\b/u.test(range) || /\b19\b/u.test(range)) return true;
        return false;
    }
    const major = Number(match[1]);
    const minor = Number(match[2]);
    if (major === 16) return minor >= 12 || range.includes("^16") || range.includes("16.x");
    return major === 17 || major === 18 || major === 19;
}

function hasCssImport(source: string): boolean {
    return /tengrids\/(dist\/)?index\.css/u.test(source);
}

function hasPortal(source: string): boolean {
    return (
        /id=["']portal["']/u.test(source) ||
        /getElementById\(\s*["']portal["']\s*\)/u.test(source) ||
        /portalElementRef/u.test(source)
    );
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

    if (typeof deps.tengrids === "string" && deps.tengrids.length > 0) {
        ok.push(`tengrids is listed (${deps.tengrids})`);
    } else {
        issues.push("tengrids is missing from dependencies / peerDependencies");
    }

    const react = deps.react;
    if (typeof react === "string" && react.length > 0 && isSupportedReact(react)) {
        ok.push(`React ${react} is supported (16.12–19)`);
    } else if (typeof react === "string" && react.length > 0) {
        issues.push(`React ${react} is not supported (need ^16.12 || 17 || 18 || 19)`);
    } else {
        issues.push("react is missing from dependencies / peerDependencies");
    }

    if (input.appSource !== undefined && input.appSource.length > 0) {
        if (hasCssImport(input.appSource)) {
            ok.push("CSS imported (tengrids/dist/index.css)");
        } else {
            issues.push(
                'Missing `import "tengrids/dist/index.css"` — the grid will look unstyled and overlays may not size'
            );
        }
        if (hasPortal(input.appSource)) {
            ok.push("#portal (or portalElementRef) is present");
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
    for (const line of issues) lines.push(`✗ ${line}`);
    lines.push("");
    lines.push(issues.length === 0 ? "All checks passed." : `${issues.length} issue(s) to fix.`);
    return lines.join("\n");
}
