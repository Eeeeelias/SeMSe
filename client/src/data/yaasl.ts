import { reduxDevtools } from "@yaasl/devtools"
import { CONFIG } from "@yaasl/preact"

CONFIG.name = "semse"
CONFIG.globalEffects = [reduxDevtools({ disable: !import.meta.env.DEV })]

export * from "@yaasl/preact"
