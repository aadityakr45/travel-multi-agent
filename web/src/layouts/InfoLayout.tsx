import { Link, Outlet } from "react-router-dom"
import { Plane } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function InfoLayout() {
  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md md:px-6">
        <Link
          to="/trips/new"
          className="flex items-center gap-2 font-semibold text-foreground"
        >
          <span className="relative flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span
              aria-hidden
              className="absolute inset-0 -z-10 rounded-lg bg-primary opacity-60 blur-md"
            />
            <Plane className="size-4" />
          </span>
          Voyanta AI
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm" variant="outline">
            <Link to="/trips/new">Open Planner</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-12 md:px-6">
        <Outlet />
      </main>
    </div>
  )
}
