import { ChildrenProp, ClassNameProp } from "~/components/base/BaseProps"
import { cn } from "~/utils/cn"
import { surface } from "~/utils/styles"

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
    className="text-text-priority relative h-32 w-full bg-cover"
    style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : undefined }}
  >
    <h2 className="grid size-full place-content-center bg-black/60 p-2 text-center">
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
const Quote = ({ children }: ChildrenProp) => (
  <blockquote className="text-text text-md border-text-gentle m-2 line-clamp-4 border-l pl-2 italic">
    {children}
  </blockquote>
)
const Text = ({ children }: ChildrenProp) => (
  <blockquote className="text-text text-md m-2 line-clamp-4">
    {children}
  </blockquote>
)

export const Card = { Root, Hero, Note, Text, Quote }
