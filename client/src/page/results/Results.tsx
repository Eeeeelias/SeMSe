import { useState } from "preact/hooks"

import { CombinedQueryResult } from "~/data/api/fetchQuery"
import { QueryResult } from "~/generated-api"

import { DetailsModal } from "./DetailsModal"
import { ResultList } from "./ResultList"

interface ResultsProps {
  results: CombinedQueryResult
}

export const Results = ({ results }: ResultsProps) => {
  const [selected, setSelected] = useState<{
    highlight: string
    data: QueryResult[number]
  } | null>(null)
  return (
    <>
      {results.plain.length > 0 && (
        <>
          <h2 className="mb-4 mt-8 text-xl font-bold">Plain matches</h2>
          <ResultList
            highlight={results.query}
            matches={results.plain}
            onOpenDetails={data =>
              setSelected({ highlight: results.query, data })
            }
          />
        </>
      )}
      {results.llm.length > 0 && (
        <>
          <h2 className="mb-4 mt-8 text-xl font-bold">LLM matches</h2>
          <ResultList
            matches={results.llm}
            onOpenDetails={data =>
              setSelected({ highlight: data.exactMatch ?? "", data })
            }
          />
        </>
      )}
      {selected && (
        <DetailsModal
          highlight={selected.highlight}
          selected={selected.data}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
