import { showToast } from "~/components/Toaster"
import {
  PostQueryData,
  postQuery,
  postPlainQuery,
  QueryResult,
} from "~/generated-api"

export interface QueryRequestBody {
  query: string
  table: string
  show?: string
  language?: string
  type?: string
  season?: string
}

export interface CombinedQueryResult {
  query: string
  llm: QueryResult
  plain: QueryResult
}

export const fetchQuery = (
  filters: QueryRequestBody
): Promise<CombinedQueryResult | null> => {
  const requestBody: PostQueryData["requestBody"] = {
    ...filters,
    type: (filters.type ?? "both") as "both",
  }

  return Promise.all([
    postQuery({ requestBody }),
    postPlainQuery({ requestBody }),
  ])
    .then(([llm, plain]) => ({ llm, plain, query: filters.query }))
    .catch(error => {
      showToast({
        kind: "error",
        title: "Could not send query",
        message: String(error),
      })
      return null
    })
}
