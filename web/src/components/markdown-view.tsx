import { useMemo } from "react"
import { renderMarkdown } from "@/lib/markdown"
import { cn } from "@/lib/utils"

export function MarkdownView({
  markdown,
  className,
}: {
  markdown: string
  className?: string
}) {
  const html = useMemo(() => renderMarkdown(markdown), [markdown])

  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-table:text-sm",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
