const colorValues = {
  neutral: {
    1: "#121629",
    2: "#232946",
    3: "#b8c1ec",
    4: "#d4d8f0",
    5: "#fffffe",
  },
  primary: "#eebbc3",
} as const

const colorTokens = {
  background: {
    DEFAULT: colorValues.neutral["2"],
    page: colorValues.neutral["1"],
    surface: colorValues.neutral["3"],
    highlight: colorValues.primary,
  },
  text: {
    DEFAULT: colorValues.neutral["4"],
    priority: colorValues.neutral["5"],
    gentle: colorValues.neutral["3"],
    surface: colorValues.neutral["1"],
    highlight: colorValues.primary,
  },
  stroke: {
    DEFAULT: colorValues.neutral["1"],
    gentle: colorValues.neutral["3"],
    highlight: colorValues.primary,
  },
}

const utilityColors = {
  black: { DEFAULT: "black" },
  white: { DEFAULT: "white" },
  transparent: { DEFAULT: "transparent" },
  current: { DEFAULT: "currentColor" },
  inherit: { DEFAULT: "inherit" },
} as const

export const colors = {
  ...utilityColors,
  ...colorTokens,
}
