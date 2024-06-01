import { glob } from "goober/global"
import { useState } from "preact/hooks"

import { Loading } from "./components/Loading"
import { NoData } from "./components/NoData"
import { toast } from "./components/Toaster"
import { PostQueryData, QueryResult, postQuery } from "./generated-api"
import { FiltersState, SearchInputs } from "./page/SearchInputs"
import { SearchResult } from "./page/SearchResult"
import { SizeKpis } from "./page/SizeKpis"
import * as patterns from "./utils/patterns"

glob`
  :root {
    background-image: ${patterns.wiggle};
    background-position: center;
    background-size: 6rem;
  }
`

const getNoDataMessage = (
  state: "init" | "idle" | "pending",
  result: QueryResult | null
) => {
  switch (state) {
    case "init":
      return "Nothing to see here yet, use the filters to search for some media!"
    case "idle":
      if (!result || result.length === 0) {
        return "No results found."
      }
  }
  return null
}

export const App = () => {
  const [state, setState] = useState<"init" | "pending" | "idle">("init")
  const [results, setResults] = useState<QueryResult | null>(null)

  const sendQuery = (filters: FiltersState) => {
    const requestBody: PostQueryData["requestBody"] = {
      ...filters,
      type: (filters.type ?? "both") as "both",
    }

    setState("pending")
    setResults(null)
    postQuery({ requestBody })
      .then(setResults)
      .catch(error => {
        toast({
          kind: "error",
          title: "Error occured!",
          message: String(error),
        })
      })
      .finally(() => setState("idle"))
  }

  const noData = getNoDataMessage(state, results)

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
      <SearchInputs onSubmit={sendQuery} />

      {state === "pending" && (
        <div className="m-auto my-10 size-60">
          <Loading size="lg" />
        </div>
      )}

      {noData && (
        <div className="m-auto mb-10 mt-20 w-max">
          <NoData label={noData} />
        </div>
      )}

      {results && !noData && (
        <div className="m-auto my-10 max-w-6xl">
          <SearchResult results={results} />
        </div>
      )}
    </div>
  )
}
