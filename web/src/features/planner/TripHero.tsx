import { Sparkles } from "lucide-react"

export function TripHero() {
  return (
    <div className="relative isolate overflow-hidden rounded-3xl px-4 py-10 text-center motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 sm:py-14">
      <div
        aria-hidden
        className="ambient-bg"
        style={{
          background:
            "radial-gradient(circle at 15% 10%, rgba(15, 118, 110, 0.45), transparent 45%), " +
            "radial-gradient(circle at 85% 15%, rgba(214, 162, 74, 0.4), transparent 42%), " +
            "radial-gradient(circle at 45% 95%, rgba(31, 143, 159, 0.35), transparent 45%)",
        }}
      />

      <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-2 text-xs font-semibold text-primary backdrop-blur-md">
        <Sparkles className="size-3.5" />
        AI-Powered Travel Planning
      </span>

      <h1 className="mx-auto max-w-2xl text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl">
        <span
          className="bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(135deg, var(--foreground), #9ae6dc, #f2d08c)",
          }}
        >
          Your Curated Journey Starts Here.
        </span>
      </h1>

      <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
        Describe your trip in plain language, or pick a starting point below —
        our agents handle flights, hotels, weather, and budget together.
      </p>
    </div>
  )
}
