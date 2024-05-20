// eslint-disable-next-line import/no-deprecated -- there is currently no replacement
import { render } from "preact"

import { App } from "./app.tsx"
import "./index.css"
import { Toaster } from "./components/Toaster.tsx"

const root = document.getElementById("app")
if (!root) throw new Error("No root element found")

// eslint-disable-next-line import/no-deprecated -- there is currently no replacement
render(
  <>
    <App />
    <Toaster />
  </>,
  root
)
