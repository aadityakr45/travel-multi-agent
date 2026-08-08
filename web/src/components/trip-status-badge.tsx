import { Badge } from "@/components/ui/badge"
import { TRIP_STATUS_META, type TripStatus } from "@/lib/trips"

export function TripStatusBadge({ status }: { status?: TripStatus }) {
  if (!status) return null
  const meta = TRIP_STATUS_META[status]

  return (
    <Badge variant={meta.variant} className="shrink-0">
      {meta.label}
    </Badge>
  )
}
