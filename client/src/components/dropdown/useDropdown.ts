import {
  offset,
  arrow,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  Side,
  useListNavigation,
} from "@floating-ui/react"
import { useMemo, useRef, useState } from "preact/hooks"

import { FloatingOptions, getSide, useFloating } from "~/hooks/useFloating"

const getArrowOffset = (side: Side, arrowRef: Element) => {
  const { clientHeight, clientWidth } = arrowRef
  return side === "top" || side === "bottom" ? clientHeight : clientWidth
}

interface MiddlewareOptions {
  arrowRef: Element
}
const getArrowMiddleware = ({ arrowRef }: MiddlewareOptions) => [
  offset(state => {
    const side = getSide(state.placement)
    return getArrowOffset(side, arrowRef)
  }),
  arrow({ element: arrowRef }),
]

interface Interactions {
  click?: boolean
  navigation?:
    | { loop: boolean; openOnArrowKeyDown: boolean; enabled: boolean }
    | boolean
  dismiss?: boolean
  role?: "menu" | "listbox"
}
export interface DropdownOptions extends Omit<FloatingOptions, "middleware"> {
  interactions?: Interactions
}

const getInteractions = ({ navigation, ...props }: Interactions) =>
  ({
    click: true,
    dismiss: true,
    role: "menu",
    navigation: {
      enabled: navigation !== false,
      loop: true,
      openOnArrowKeyDown: true,
      ...(navigation === true ? {} : navigation),
    },
    ...props,
  } satisfies Required<Interactions>)

export const useDropdown = ({
  interactions = {},
  ...props
}: DropdownOptions) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0)
  const [arrowRef, setArrowRef] = useState<Element | null>(null)
  const elementsRef = useRef<HTMLElement[]>([])

  const features = getInteractions(interactions)

  const floating = useFloating({
    ...props,
    middleware: !arrowRef ? undefined : getArrowMiddleware({ arrowRef }),
  })

  const click = useClick(floating.context, {
    enabled: features.click,
  })
  const navigation = useListNavigation(floating.context, {
    activeIndex,
    onNavigate: setActiveIndex,
    listRef: elementsRef,
    ...features.navigation,
  })
  const dismiss = useDismiss(floating.context, {
    enabled: features.dismiss,
  })
  const role = useRole(floating.context, {
    role: features.role,
  })

  const interactionProps = useInteractions([click, navigation, dismiss, role])
  const itemRole: "menuitem" | "option" =
    features.role === "menu" ? "menuitem" : "option"

  return useMemo(
    () => ({
      activeIndex,
      setActiveIndex,
      setArrowRef,
      elementsRef,
      itemRole,
      ...floating,
      ...interactionProps,
    }),
    [floating, interactionProps, activeIndex, itemRole]
  )
}
