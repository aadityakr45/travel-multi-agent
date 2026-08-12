import { useState } from "react"
import { Loader2, Send } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { TRIP_CATEGORIES } from "./agent-meta"

export function PromptForm({
  onSubmit,
  isSubmitting,
  disabled,
  showQuickStart = true,
}: {
  onSubmit: (message: string) => void
  isSubmitting: boolean
  disabled?: boolean
  showQuickStart?: boolean
}) {
  const [message, setMessage] = useState("")

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = message.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <Card className="glass-panel">
      <CardHeader>
        <div>
          <CardTitle>Where do you want to go?</CardTitle>
          <CardDescription>
            Example: Plan a complete 7 days Switzerland trip from India under
            2 lakhs.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="trip-request" className="sr-only">
              Describe your trip
            </Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Textarea
                id="trip-request"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Plan a complete 7 days Japan trip including flights, hotels and sightseeing under 2 lakhs..."
                disabled={disabled}
                className="min-h-24 sm:min-h-16"
                onKeyDown={(event) => {
                  if (event.ctrlKey && event.key === "Enter") {
                    handleSubmit(event)
                  }
                }}
              />
              <Button
                type="submit"
                disabled={disabled || isSubmitting || !message.trim()}
                className="gap-2 sm:h-auto"
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Generate Draft
              </Button>
            </div>
          </div>

          {showQuickStart && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {TRIP_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setMessage(category.prompt)}
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card/60 px-3 py-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent hover:shadow-sm disabled:pointer-events-none disabled:opacity-50"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-primary transition-colors group-hover:bg-primary/10">
                    <category.icon className="size-5" />
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    {category.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
