import { ShieldAlert } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function BlockedState({ reason }: { reason: string }) {
  return (
    <Card className="glass-panel border-destructive/30">
      <CardHeader className="flex flex-row items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="size-4.5" />
        </span>
        <div className="flex flex-1 items-center justify-between gap-3">
          <CardTitle>Request blocked</CardTitle>
          <Badge variant="destructive">Guardrail blocked</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {reason ||
            "Voyanta AI can only help with travel-planning requests. Please ask about a destination, flight, hotel, weather, budget, or itinerary."}
        </p>
      </CardContent>
    </Card>
  )
}
