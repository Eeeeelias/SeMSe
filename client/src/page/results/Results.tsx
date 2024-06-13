import { useState } from "preact/hooks"

import { CombinedQueryResult } from "~/data/api/fetchQuery"
import { QueryResult } from "~/generated-api"

import { DetailsModal } from "./DetailsModal"
import { ResultList } from "./ResultList"

interface ResultsProps {
  results: CombinedQueryResult
}

export const Results = ({ results }: ResultsProps) => {
  const [selected, setSelected] = useState<QueryResult[number] | null>(null)
  return (
    <>
      {results.plain.length > 0 && (
        <>
          <h2 className="mb-4 mt-8 text-xl font-bold">Plain matches</h2>
          <ResultList matches={results.plain} onOpenDetails={setSelected} />
        </>
      )}
      {results.llm.length > 0 && (
        <>
          <h2 className="mb-4 mt-8 text-xl font-bold">LLM matches</h2>
          <ResultList matches={results.llm} onOpenDetails={setSelected} />
        </>
      )}
      {selected && (
        <DetailsModal selected={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
