// eslint-disable-next-line import/no-deprecated -- there is currently no replacement
import { render } from "preact"

import { App } from "./app.tsx"
import "./index.css"

const root = document.getElementById("app")
if (!root) throw new Error("No root element found")

// eslint-disable-next-line import/no-deprecated -- there is currently no replacement
render(<App />, root)
