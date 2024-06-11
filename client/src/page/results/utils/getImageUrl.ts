import { OpenAPI } from "~/generated-api"

export const getImageUrl = (imageId?: string) =>
  imageId ? `${OpenAPI.BASE}/image/${imageId}` : ""
