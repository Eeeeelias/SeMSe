import { glob } from "goober/global"

import { SearchInputs } from "./page/SearchInputs"
import { SizeKpis } from "./page/SizeKpis"
import * as patterns from "./utils/patterns"

glob`
  :root {
    background-image: ${patterns.wiggle};
    background-position: center;
    background-size: 6rem;
  }
`

export const App = () => {
  return (
    <div className="m-auto max-w-[100vw] px-4">
      <div className="py-20 text-center">
        <h1 className="text-text-gentle text-8xl font-bold">SeMSe</h1>
        <b className="text-text-gentle/50">Se[mantic]M[edia]Se[arch]</b>
      </div>

      <p className="mx-auto mb-10 w-full max-w-prose text-center">
        SeMSe is an application to find an episode among multiple TV shows. Run
        a query against the descriptions and conversations of episodes to find
        the best match.
      </p>

      <SizeKpis />
      <SearchInputs />
    </div>
  )
}
