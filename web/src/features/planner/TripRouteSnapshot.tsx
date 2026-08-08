import { CalendarDays, MapPin, MapPinned, Plane, Wallet } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TripConstraints } from "@/lib/types"

function RoutePoint({
  label,
  align = "left",
}: {
  label: string
  align?: "left" | "right"
}) {
  return (
    <div
      className={
        align === "right"
          ? "flex flex-col items-end text-right"
          : "flex flex-col items-start text-left"
      }
    >
      <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        {align === "left" && <MapPin className="size-3.5 text-primary" />}
        <span className="max-w-32 truncate sm:max-w-48">{label}</span>
        {align === "right" && <MapPin className="size-3.5 text-primary" />}
      </span>
    </div>
  )
}

// Decorative dot-grid texture standing in for a real map background. Kept as
// a generic texture rather than a stylized continent outline so it never
// implies geographic precision the backend doesn't actually have.
function DotGridBackdrop() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full text-muted-foreground/25"
      xmlns="http://www.w3.org/2000/svg"
    >
      <pattern
        id="trip-snapshot-dots"
        x="0"
        y="0"
        width="14"
        height="14"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#trip-snapshot-dots)" />
    </svg>
  )
}

export function TripRouteSnapshot({
  constraints,
}: {
  constraints: TripConstraints | undefined
}) {
  if (!constraints?.destination) return null

  return (
    <Card className="glass-panel">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-sm">Trip Snapshot</CardTitle>
        <Badge variant="secondary" className="gap-1.5">
          <MapPinned className="size-3.5" />
          Map view — coming soon
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted/40 px-5 py-8">
          <DotGridBackdrop />
          <div className="relative flex items-center justify-between gap-3">
            <RoutePoint label={constraints.origin || "Origin"} />
            <div className="relative flex h-8 flex-1 items-center">
              <span className="h-px w-full border-t border-dashed border-border" />
              <span className="absolute top-1/2 left-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                <Plane className="size-4" />
              </span>
            </div>
            <RoutePoint label={constraints.destination} align="right" />
          </div>
        </div>

        {(constraints.duration || constraints.budget) && (
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {constraints.duration && (
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                {constraints.duration}
              </span>
            )}
            {constraints.budget && (
              <span className="flex items-center gap-1.5">
                <Wallet className="size-3.5" />
                {constraints.budget}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
