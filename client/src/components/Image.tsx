import { useState } from "preact/hooks"

import { cn } from "~/utils/cn"

import { ClassNameProp } from "./base/BaseProps"

interface ImageProps extends ClassNameProp {
  src?: string
  alt?: string
  fallback?: string
}
export const Image = ({ src, alt = "", className, fallback }: ImageProps) => {
  const [error, setError] = useState(!src)
  return (
    <img
      src={error ? fallback : src}
      onError={() => setError(true)}
      alt={alt}
      className={cn("object-cover", className)}
    />
  )
}
