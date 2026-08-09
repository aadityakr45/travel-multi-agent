import { Link, useNavigate } from "react-router-dom"
import { History, Trash2 } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TripStatusBadge } from "@/components/trip-status-badge"
import { formatRelativeDate, removeTrip, useTrips } from "@/lib/trips"

export function HistoryPage() {
  const navigate = useNavigate()
  const trips = useTrips()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Trip History</h1>
        <p className="text-sm text-muted-foreground">
          Resume a past planning session on this device.
        </p>
      </div>

      {trips.length === 0 ? (
        <EmptyState
          icon={History}
          title="No trips yet"
          description="Trips you plan are saved to this browser. Start a new trip to see it appear here."
          action={
            <Button asChild size="sm">
              <Link to="/trips/new">Start a trip</Link>
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {trips.map((trip) => (
            <Card
              key={trip.threadId}
              className="transition-shadow hover:shadow-md"
            >
              <CardContent className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-base">
                    {trip.emoji ?? "🧳"}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {trip.title || "Untitled trip"}
                      </p>
                      <TripStatusBadge status={trip.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeDate(trip.updatedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    size="sm"
                    onClick={() =>
                      navigate(`/trips/${encodeURIComponent(trip.threadId)}`)
                    }
                  >
                    Resume
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove trip"
                    onClick={() => removeTrip(trip.threadId)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
