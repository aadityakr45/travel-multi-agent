import { useRef, useState } from "react"
import { Check, Loader2, MessageSquareWarning, UserCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export function ApprovalCard({
  approvalRequest,
  onApprove,
  onRevise,
  isSubmitting,
}: {
  approvalRequest: string
  onApprove: () => void
  onRevise: (feedback: string) => void
  isSubmitting: boolean
}) {
  const [feedback, setFeedback] = useState("")
  const [error, setError] = useState<string | null>(null)
  const feedbackRef = useRef<HTMLTextAreaElement>(null)

  const handleRevise = () => {
    const trimmed = feedback.trim()
    if (!trimmed) {
      setError("Please enter revision feedback before requesting changes.")
      feedbackRef.current?.focus()
      return
    }
    setError(null)
    onRevise(trimmed)
  }

  return (
    <Card className="glass-panel border-primary/30">
      <CardHeader className="flex flex-row items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserCheck className="size-4.5" />
        </span>
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Human-in-the-Loop
          </p>
          <CardTitle>Review the draft itinerary</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          {approvalRequest ||
            "Approve the draft or provide feedback before the final plan is generated."}
        </p>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="approval-feedback">Revision feedback (optional)</Label>
          <Textarea
            id="approval-feedback"
            ref={feedbackRef}
            value={feedback}
            onChange={(event) => {
              setFeedback(event.target.value)
              if (error) setError(null)
            }}
            placeholder="e.g. Swap the hotel for something closer to the old town, and add a day trip."
            disabled={isSubmitting}
          />
          {error && (
            <p className="flex items-center gap-1.5 text-sm text-destructive">
              <MessageSquareWarning className="size-3.5" />
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            className="flex-1 gap-2"
            disabled={isSubmitting}
            onClick={onApprove}
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            Approve plan
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
            onClick={handleRevise}
          >
            Request changes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
