import { colors } from "../../tailwind/colors"

const tokens = {
  "<": "%3C",
  ">": "%3E",
  "#": "%23",
}

const replaceMultiple = (text: string, search: string[], replace: string[]) => {
  return search.reduce((acc, s, i) => {
    return acc.replace(new RegExp(s, "g"), replace[i])
  }, text)
}

const escape = (text: string) =>
  replaceMultiple(text, Object.keys(tokens), Object.values(tokens)).replace(
    /\n/g,
    ""
  )

const pattern = (strings: TemplateStringsArray, ...args: string[]) => {
  const svg = strings.reduce((out, next, index) => {
    const tail = args[index] ?? ""
    return out + next + tail
  }, "")

  return `url("data:image/svg+xml,${escape(svg)}")`
}

const COLOR = colors.background.highlight
const OPACITY = "0.05"

export const wiggle = pattern`
  <svg width='104' height='52' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'>
    <g fill='none' fill-rule='evenodd'>
      <g fill='${COLOR}' fill-opacity='${OPACITY}'>
        <path d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' />
      </g>
    </g>
  </svg>
`

export const hideout = pattern`
  <svg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'>
    <g fill-rule='evenodd'>
      <g fill='${COLOR}' fill-opacity='${OPACITY}'>
        <path d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/>
      </g>
    </g>
  </svg>
`
