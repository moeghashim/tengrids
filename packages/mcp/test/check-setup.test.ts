import { describe, expect, it } from "vitest";
import { checkSetup, isSupportedReact } from "../src/check-setup.js";

describe("check_setup", () => {
    it("accepts supported React ranges", () => {
        expect(isSupportedReact("17.0.2")).toBe(true);
        expect(isSupportedReact("^16.12.0")).toBe(true);
        expect(isSupportedReact("19.2.8")).toBe(true);
        expect(isSupportedReact("15.0.0")).toBe(false);
        expect(isSupportedReact("16.8.0")).toBe(false);
    });

    it("rejects invalid JSON", () => {
        expect(checkSetup({ packageJson: "nope" })).toMatch(/not valid JSON/u);
    });

    it("passes a complete setup", () => {
        const report = checkSetup({
            packageJson: JSON.stringify({
                dependencies: { tengrids: "6.0.4-alpha26", react: "17.0.2" },
            }),
            appSource: `import "tengrids/dist/index.css";\n<div id="portal" />`,
        });
        expect(report).toMatch(/All checks passed/u);
        expect(report).not.toMatch(/^✗ /mu);
    });

    it("flags missing CSS and portal", () => {
        const report = checkSetup({
            packageJson: JSON.stringify({ dependencies: { tengrids: "1", react: "18.0.0" } }),
            appSource: "export default function App() { return null; }",
        });
        expect(report).toMatch(/Missing `import/u);
        expect(report).toMatch(/Missing `#portal`/u);
    });

    it("accepts portalElementRef as the portal", () => {
        const report = checkSetup({
            packageJson: JSON.stringify({ dependencies: { tengrids: "1", react: "18.3.1" } }),
            appSource: `import "tengrids/index.css";\n<DataEditor portalElementRef={ref} />`,
        });
        expect(report).toMatch(/All checks passed/u);
    });

    it("skips source checks when appSource is omitted", () => {
        const report = checkSetup({
            packageJson: JSON.stringify({ dependencies: { tengrids: "1", react: "19.0.0" } }),
        });
        expect(report).toMatch(/appSource omitted/u);
        expect(report).toMatch(/All checks passed/u);
    });
});
