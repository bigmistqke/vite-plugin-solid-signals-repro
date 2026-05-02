import { createContext, setContext } from "@solidjs/signals";

// A context holding a number; default is 0.
export const countContext = createContext(0);

// Imperatively sets context — pattern used by solid-three.
// This direct import of @solidjs/signals is the source of the bug: Vite's dep
// scanner never discovers @solidjs/signals as a direct app import, so esbuild
// inlines it into the pre-bundled solid-js chunk. At runtime this import is
// served as a separate module — two instances with independent owner state.
export function provideCount(value: number) {
  setContext(countContext, value);
}
