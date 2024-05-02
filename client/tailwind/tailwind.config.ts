/* eslint-disable import/no-extraneous-dependencies */
import typographyPlugin from "@tailwindcss/typography"
import { Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme"

import { bgLayerPlugin } from "./bgLayerPlugin"
import { colors } from "./colors"

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Quicksand", ...fontFamily.sans],
      body: ["Quicksand", ...fontFamily.sans],
    },
    colors,
  },
  plugins: [typographyPlugin(), bgLayerPlugin()],
} satisfies Config
