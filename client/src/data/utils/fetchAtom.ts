import {
  createAtom,
  localStorage,
  expiration,
  createEffect,
} from "~/data/yaasl"

const DAY = 24 * 60 * 60 * 1000

const persistance = () => [localStorage(), expiration({ expiresIn: DAY })]

interface FetcherOptions {
  dispatch: () => Promise<unknown>
}
const loadValue = createEffect<FetcherOptions>({
  didInit: ({ value, atom, options }) => {
    if (value != null) return
    return options.dispatch().then(value => atom.set(value))
  },
})

interface FetchAtomProps<T> {
  name: string
  dispatch: () => Promise<T>
  persist?: boolean
}
export const fetchAtom = <T>({ name, dispatch, persist }: FetchAtomProps<T>) =>
  createAtom<T | null>({
    name,
    defaultValue: null,
    effects: [...(persist ? persistance() : []), loadValue({ dispatch })],
  })
