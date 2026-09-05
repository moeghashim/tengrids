import "vitest-canvas-mock";
import { vi } from "vitest";

// this is needed to make the canvas mock work for some reason
global.jest = vi;

// Vitest 4 only lets `new` be used on a mock whose implementation is a `function` or a class.
global.ResizeObserver = vi.fn(function ResizeObserverMock() {
    return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
}) as any;

Image.prototype.decode = () => new Promise(resolve => window.setTimeout(resolve, 10));

// Tell React this is a unit-test environment so act() works without warnings
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
