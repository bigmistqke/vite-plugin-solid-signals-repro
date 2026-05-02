# `@solidjs/signals` duplicate instance in Vite dev mode

Reproduction for a bug in `vite-plugin-solid` where `@solidjs/signals` ends up as two separate module instances in Vite dev mode, breaking context propagation.

## Reproduce

```bash
pnpm install
pnpm dev   # bug: context value is 0 (wrong), or throws
pnpm build # works: Rollup deduplicates, context value is 42
```

Open http://localhost:5173 in dev mode and check the context value shown on screen.

## The bug

`packages/lib` is a minimal library that calls `setContext` from `@solidjs/signals` directly — the same pattern used by [solid-three](https://github.com/solidjs-community/solid-three) and any other library that reaches into `@solidjs/signals` for low-level owner APIs.

In **dev mode**, Vite ends up loading two separate instances of `@solidjs/signals`:

1. **Inlined into the `solid-js` pre-bundle chunk.** `solid-js` imports `@solidjs/signals` internally. During dep pre-bundling, Vite's esbuild scanner never encounters `@solidjs/signals` as a direct import in app source, so it never becomes a named dep entry. When esbuild bundles `solid-js`, it has no separate entry to reference and **inlines the entire `@solidjs/signals` implementation** into the shared chunk.

2. **Served as a raw ESM module for the library.** `my-lib` is an installed package in `node_modules`. When its dist file is served at runtime, the bare `import { setContext } from '@solidjs/signals'` is intercepted by Vite and served as a **separate module** — a completely different JS instance from the one inlined in step 1.

Two instances means two separate owner-tracking states. `setContext` writes into instance A's owner map; `useContext` reads from instance B's — context is never found.

In **build mode** Rollup bundles everything in one pass and deduplicates by resolved file path, so there is only ever one instance.

## The fix

Adding `@solidjs/signals` to `optimizeDeps.include` forces Vite to pre-bundle it as its own named entry. esbuild then treats it as an external reference when bundling `solid-js` instead of inlining it, and the library's import at runtime is rewritten to the same pre-bundled file.

```ts
// vite.config.ts
optimizeDeps: {
  include: ['@solidjs/signals'],
}
```

This is commented out in `packages/app/vite.config.ts` — uncomment it to see the fix in action.

The correct fix is for `vite-plugin-solid` to add `@solidjs/signals` to its `nestedDeps` list alongside `solid-js` and `@solidjs/web`:

```js
// vite-plugin-solid/src/index.ts
const nestedDeps = replaceDev ? ['solid-js', '@solidjs/web', '@solidjs/signals'] : [];
```
