import { useContext } from "solid-js"
import { countContext, provideCount } from "my-lib"

function Child() {
  const count = useContext(countContext)
  return (
    <p>
      Context value: <strong>{count}</strong>
      {count === 42
        ? " ✓ correct"
        : ` ✗ bug: expected 42, got ${count} (default)`}
    </p>
  )
}

export default function App() {
  // provideCount calls setContext from @solidjs/signals directly.
  // In dev mode this uses a different @solidjs/signals instance than solid-js,
  // so the context is never written into the owner tree that useContext reads.
  provideCount(42)
  return (
    <div>
      <h1>@solidjs/signals duplicate instance repro</h1>
      <p>
        <code>vite dev</code>: context value should be 42, but is 0 (or
        throws). Vite's dep scan never discovers <code>@solidjs/signals</code>{" "}
        as a direct import, so esbuild inlines it into the pre-bundled solid-js
        chunk. my-lib's bare <code>import from '@solidjs/signals'</code> is
        then served as a separate module at runtime — two instances with
        independent owner state.
      </p>
      <p>
        <code>vite build</code>: works correctly — Rollup deduplicates by
        resolved file path, producing one instance.
      </p>
      <Child />
    </div>
  )
}
