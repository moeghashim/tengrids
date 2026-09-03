import "vitest-canvas-mock";
import { vi } from "vitest";

// this is needed to make the canvas mock work for some reason
global.jest = vi;

global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

Image.prototype.decode = () => new Promise(resolve => window.setTimeout(resolve, 10));

// Tell React this is a unit-test environment so act() works without warnings
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
