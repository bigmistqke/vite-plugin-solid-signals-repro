import { useContext } from "solid-js"
import { countContext, provideCount } from "my-lib"

function Child() {
  return <p>count: {useContext(countContext)}</p>
}

export default function App() {
  provideCount(42)
  return <Child />
}
