import { Link } from "react-router-dom"
import { Compass } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <div className="flex flex-1 items-center justify-center py-12">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="The page you're looking for doesn't exist or may have moved."
        action={
          <Button asChild size="sm">
            <Link to="/trips/new">Back to Planner</Link>
          </Button>
        }
      />
    </div>
  )
}
