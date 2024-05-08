import { reduxDevtools } from "@yaasl/devtools"
import { atom, localStorage, expiration, middleware } from "@yaasl/preact"

import { loadConfig } from "./loadConfig"

const DAY = 24 * 60 * 60 * 1000

const persistance = () => [localStorage(), expiration({ expiresIn: DAY })]

interface FetcherOptions {
  dispatch: () => Promise<unknown>
}
const loadValue = middleware<FetcherOptions>(({ atom, options }) => {
  const { dispatch } = options
  const reload = () =>
    atom.get() == null && dispatch().then(value => atom.set(value))

  return {
    didInit: () => void reload(),
    set: () => void reload(),
  }
})

interface FetchAtomProps<T> {
  name: string
  dispatch: () => Promise<T>
  persist?: boolean
}
export const fetchAtom = <T>({
  name,
  dispatch,
  persist,
}: FetchAtomProps<T>) => {
  loadConfig()

  return atom<T | null>({
    name,
    defaultValue: null,
    middleware: [
      ...(persist ? persistance() : []),
      loadValue({ dispatch }),
      reduxDevtools({ disable: !import.meta.env.DEV }),
    ],
  })
}
