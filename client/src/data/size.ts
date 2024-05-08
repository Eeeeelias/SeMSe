import { fetchAtom } from "./utils/fetchAtom"
import { MediaService, Size } from "../generated-api"

const mockedSize: Size = {
  tv_shows: 176,
  animes: 283,
  movies: 792,
  descriptions: 14860,
  subtitles: 392329,
}

const loadSize = async () => MediaService.getSize().catch(() => mockedSize)

export const sizeAtom = fetchAtom<Size | null>({
  name: "size",
  dispatch: loadSize,
  persist: true,
})
