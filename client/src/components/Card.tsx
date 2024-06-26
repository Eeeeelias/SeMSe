import { ChildrenProp, ClassNameProp } from "~/components/base/BaseProps"
import { Image } from "~/components/Image"
import { cn } from "~/utils/cn"
import { surface } from "~/utils/styles"

import { Quote } from "./Quote"

const Root = ({ className, children }: ChildrenProp & ClassNameProp) => (
  <article
    className={cn(
      surface({ shade: "medium" }),
      "flex flex-col overflow-hidden",
      className
    )}
  >
    {children}
  </article>
)
interface HeroProps extends ChildrenProp {
  title: string
  subtitle?: string
  imageUrl?: string
}
const Hero = ({ title, subtitle, imageUrl, children }: HeroProps) => (
  <div
    className="text-text-priority relative isolate h-32 w-full bg-cover"
    style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : undefined }}
  >
    <Image
      src={imageUrl}
      fallback="./fallback.svg"
      className="absolute inset-0 size-full"
    />
    <h2 className="relative z-10 grid size-full place-content-center bg-black/60 p-2 text-center">
      <span className="truncate text-lg font-bold">{title}</span>
      {subtitle && (
        <span className="text-text-highlight line-clamp-2 text-sm font-bold">
          {subtitle}
        </span>
      )}
      {children}
    </h2>
  </div>
)
const Note = ({ children }: ChildrenProp) => (
  <div className="text-text-gentle mx-2 mt-1 text-sm">{children}</div>
)
const CardQuote = ({ children }: ChildrenProp) => (
  <Quote className="m-2 line-clamp-4">{children}</Quote>
)
const Text = ({ children }: ChildrenProp) => (
  <blockquote className="text-text text-md m-2 line-clamp-4">
    {children}
  </blockquote>
)

export const Card = { Root, Hero, Note, Text, Quote: CardQuote }
