import { Media, getMedia } from "~/generated-api"

import { fetchAtom } from "./utils/fetchAtom"

const mockedMedia: Media = {
  Animes: [],
  Movies: [],
  TVShows: [],
}

const loadMedia = async () => getMedia().catch(() => mockedMedia)

export const mediaAtom = fetchAtom<Media | null>({
  name: "media",
  dispatch: loadMedia,
  persist: true,
})
