import { Link, Outlet } from "react-router-dom"
import { Plane } from "lucide-react"

export function AuthLayout() {
  return (
    <div className="relative isolate flex min-h-svh flex-col items-center justify-center gap-8 overflow-hidden bg-background p-4">
      <div
        aria-hidden
        className="ambient-bg"
        style={{
          background:
            "radial-gradient(circle at 15% 10%, rgba(15, 118, 110, 0.35), transparent 42%), " +
            "radial-gradient(circle at 85% 90%, rgba(214, 162, 74, 0.3), transparent 40%)",
        }}
      />

      <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
        <span className="relative flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <span
            aria-hidden
            className="absolute inset-0 -z-10 rounded-lg bg-primary opacity-60 blur-md"
          />
          <Plane className="size-4" />
        </span>
        Voyanta AI
      </Link>
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  )
}
