/* eslint-disable import/no-extraneous-dependencies */
import typographyPlugin from "@tailwindcss/typography"
import { Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme"

import { bgLayerPlugin } from "./bgLayerPlugin"
import { colors } from "./colors"
import { shadowPlugin } from "./shadowPlugin"

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Quicksand", ...fontFamily.sans],
      body: ["Quicksand", ...fontFamily.sans],
    },
    colors,

    // Remove default box shadows
    boxShadow: {},
    boxShadowColor: {},

    extend: {
      transitionTimingFunction: {
        bounce: "cubic-bezier(.47,1.64,.41,.8)",
      },
    },
  },
  plugins: [typographyPlugin(), bgLayerPlugin(), shadowPlugin()],
} satisfies Config
