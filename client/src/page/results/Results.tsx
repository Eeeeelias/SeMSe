import { useState } from "preact/hooks"

import { CombinedQueryResult } from "~/data/api/fetchQuery"
import { QueryResult } from "~/generated-api"

import { DetailsModal } from "./DetailsModal"
import { ResultGrid, ResultList } from "./ResultList"

interface ResultsProps {
  results: CombinedQueryResult
}

export const Results = ({ results }: ResultsProps) => {
  const [selected, setSelected] = useState<{
    highlight: string
    data: QueryResult[number]
  } | null>(null)
  return (
    <ResultGrid>
      {results.plain.length > 0 && (
        <ResultList
          title="Text search"
          highlight={results.query}
          matches={results.plain}
          onOpenDetails={data =>
            setSelected({ highlight: results.query, data })
          }
        />
      )}
      <div className="col-span-full" />
      {results.llm.length > 0 && (
        <ResultList
          title="Semantic search"
          matches={results.llm}
          onOpenDetails={data =>
            setSelected({ highlight: data.exactMatch ?? "", data })
          }
        />
      )}
      {selected && (
        <DetailsModal
          highlight={selected.highlight}
          selected={selected.data}
          onClose={() => setSelected(null)}
        />
      )}
    </ResultGrid>
  )
}
