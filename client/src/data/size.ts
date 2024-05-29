import { getSize, Size } from "~/generated-api"

import { fetchAtom } from "./utils/fetchAtom"

const mockedSize: Size = {
  tv_shows: 0,
  animes: 0,
  movies: 0,
  descriptions: 0,
  subtitles: 0,
}

const loadSize = async () => getSize().catch(() => mockedSize)

export const sizeAtom = fetchAtom<Size | null>({
  name: "size",
  dispatch: loadSize,
  persist: true,
})
