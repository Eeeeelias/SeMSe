import { useState } from "preact/hooks"

import { QueryResult } from "~/generated-api"

import { DetailsModal } from "./DetailsModal"
import { ResultList } from "./ResultList"

interface ResultsProps {
  results: QueryResult
}

export const Results = ({ results }: ResultsProps) => {
  const [selected, setSelected] = useState<QueryResult[number] | null>(null)
  return (
    <>
      <ResultList results={results} onOpenDetails={setSelected} />
      {selected && (
        <DetailsModal selected={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
