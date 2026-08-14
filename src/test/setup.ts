import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(cleanup);

// jsdom doesn't implement scroll methods; Chat.tsx calls this to autoscroll.
Element.prototype.scrollTo = vi.fn();
