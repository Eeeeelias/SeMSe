import { Button } from "./components/Button"

export const App = () => {
  return (
    <div className="m-auto w-max text-center">
      <div className="py-20 text-center">
        <h1 className="text-text-gentle text-8xl font-bold">SeMSe</h1>
        <b className="text-text-gentle/50">Se[mantic]M[edia]Se[arch]</b>
      </div>
      <Button>Click!</Button>
    </div>
  )
}
