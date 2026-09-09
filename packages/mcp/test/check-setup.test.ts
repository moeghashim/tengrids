import { describe, expect, it } from "vitest";
import { checkSetup, isSupportedReact } from "../src/check-setup.js";

const COMPLETE = {
    tengrids: "6.0.4-alpha26",
    react: "17.0.2",
    "react-dom": "17.0.2",
    lodash: "4.17.21",
    marked: "16.1.2",
    "react-responsive-carousel": "3.2.23",
};

describe("check_setup", () => {
    it("accepts supported React ranges and rejects ones that include no 16.12–19 release", () => {
        expect(isSupportedReact("17.0.2")).toBe(true);
        expect(isSupportedReact("^16.12.0")).toBe(true);
        expect(isSupportedReact("^16.8.0")).toBe(true);
        expect(isSupportedReact("19.2.8")).toBe(true);
        expect(isSupportedReact("^16.12.0 || 17.x || 18.x || 19.x")).toBe(true);
        expect(isSupportedReact(">=18 <20")).toBe(true);
        expect(isSupportedReact("18.2.0")).toBe(true);
        expect(isSupportedReact("16.13.1")).toBe(true);
        expect(isSupportedReact("19.1.0")).toBe(true);
        expect(isSupportedReact("~18.2.0")).toBe(true);
        expect(isSupportedReact("18.2.x")).toBe(true);
        expect(isSupportedReact("16.12.0 - 19.0.0")).toBe(true);
        expect(isSupportedReact("15.0.0")).toBe(false);
        expect(isSupportedReact("16.8.0")).toBe(false);
        expect(isSupportedReact("<16.12.0")).toBe(false);
        expect(isSupportedReact("17.0.2garbage")).toBe(false);
        expect(isSupportedReact("latest")).toBe(false);
        expect(isSupportedReact("workspace:*")).toBe(false);
    });

    it("rejects invalid JSON", () => {
        expect(checkSetup({ packageJson: "nope" })).toMatch(/not valid JSON/u);
    });

    it("passes a complete setup", () => {
        const report = checkSetup({
            packageJson: JSON.stringify({ dependencies: COMPLETE }),
            appSource: `import "tengrids/dist/index.css";\n<div id="portal" />`,
        });
        expect(report).toMatch(/All checks passed/u);
        expect(report).not.toMatch(/^✗ /mu);
    });

    it("flags missing core peers", () => {
        const report = checkSetup({
            packageJson: JSON.stringify({ dependencies: { tengrids: "1", react: "18.0.0" } }),
        });
        expect(report).toMatch(/react-dom is missing/u);
        expect(report).toMatch(/lodash is missing/u);
        expect(report).toMatch(/marked is missing/u);
        expect(report).toMatch(/react-responsive-carousel is missing/u);
    });

    it("notes tengrids-schema and tengrids-ai when present", () => {
        const report = checkSetup({
            packageJson: JSON.stringify({
                dependencies: { ...COMPLETE, "tengrids-schema": "6.0.4-alpha26", "tengrids-ai": "6.0.4-alpha26" },
            }),
        });
        expect(report).toMatch(/tengrids-schema is listed/u);
        expect(report).toMatch(/tengrids-ai is listed/u);
    });

    it("flags missing CSS and portal", () => {
        const report = checkSetup({
            packageJson: JSON.stringify({ dependencies: COMPLETE }),
            appSource: "export default function App() { return null; }",
        });
        expect(report).toMatch(/Missing `import/u);
        expect(report).toMatch(/Missing `#portal`/u);
    });

    it("ignores CSS and portal mentions in comments", () => {
        const report = checkSetup({
            packageJson: JSON.stringify({ dependencies: COMPLETE }),
            appSource: `// import "tengrids/dist/index.css"\n/* <div id="portal" /> */\nexport default function App() { return null; }`,
        });
        expect(report).toMatch(/Missing `import/u);
        expect(report).toMatch(/Missing `#portal`/u);
    });

    it("accepts portalElementRef and id={'portal'}", () => {
        const withRef = checkSetup({
            packageJson: JSON.stringify({ dependencies: COMPLETE }),
            appSource: `import "tengrids/index.css";\n<DataEditor portalElementRef={ref} />`,
        });
        expect(withRef).toMatch(/All checks passed/u);
        const withExpr = checkSetup({
            packageJson: JSON.stringify({ dependencies: COMPLETE }),
            appSource: `import "tengrids/dist/index.css";\n<div id={"portal"} />`,
        });
        expect(withExpr).toMatch(/All checks passed/u);
    });

    it("treats a bare getElementById lookup as uncertain", () => {
        const report = checkSetup({
            packageJson: JSON.stringify({ dependencies: COMPLETE }),
            appSource: `import "tengrids/dist/index.css";\ndocument.getElementById("portal");`,
        });
        expect(report).toMatch(/Uncertain/u);
        expect(report).not.toMatch(/All checks passed/u);
    });

    it("skips source checks when appSource is omitted", () => {
        const report = checkSetup({
            packageJson: JSON.stringify({ dependencies: COMPLETE }),
        });
        expect(report).toMatch(/appSource omitted/u);
        expect(report).toMatch(/All checks passed/u);
    });
});
