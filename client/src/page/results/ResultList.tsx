import { Dispatch } from "preact/hooks"

import { QueryResult } from "~/generated-api"

import { MatchCard } from "./MatchCard"

const getId = (result: QueryResult[number]) =>
  (result.title ?? "") + (result.episodeId ?? "") + (result.timestamp ?? "")

interface MatchListProps {
  highlight?: string
  matches: QueryResult
  onOpenDetails: Dispatch<QueryResult[number]>
}

export const ResultList = ({
  highlight,
  matches,
  onOpenDetails,
}: MatchListProps) => (
  <div className="grid grid-cols-[repeat(auto-fit,minmax(theme(width.60),1fr))] justify-center gap-4">
    {matches.map(result => (
      <MatchCard
        key={getId(result)}
        {...result}
        highlight={highlight}
        onOpenDetails={() => onOpenDetails(result)}
      />
    ))}
  </div>
)
