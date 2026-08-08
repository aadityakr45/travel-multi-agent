import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

export function AboutPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
          About Voyanta AI
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Voyanta is a travel-planning assistant built around a simple bet:
          one AI generating a full itinerary in a single reply is hard to
          trust. A supervised pipeline of specialist agents, with a human
          checkpoint before anything is finalized, isn't.
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-foreground">
          What it actually is
        </h2>
        <p className="text-sm text-muted-foreground">
          A Supervisor agent reads your request and routes it to only the
          specialists it needs — flights, hotels, weather, budget, itinerary.
          Each does one job. Nothing is finalized until you review the draft
          and approve it or send back feedback. The full breakdown is on the{" "}
          <Link
            to="/how-it-works"
            className="text-primary underline-offset-2 hover:underline"
          >
            How It Works
          </Link>{" "}
          page.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-foreground">
          Where it's honest about its limits
        </h2>
        <p className="text-sm text-muted-foreground">
          This is a single-session tool today. There's no account system yet,
          so trip history lives only in your browser's local storage and
          won't follow you to another device. Weather and hotel data come
          from live services; flight fares and budget numbers are the model's
          estimates, not confirmed prices — always worth a second check
          before you book anything.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-foreground">
          Under the hood
        </h2>
        <p className="text-sm text-muted-foreground">
          Built on LangGraph for agent orchestration, an input guardrail
          before any planning starts, and a human-in-the-loop approval step.
          The project is open source — issues and contributions are welcome.
        </p>
      </section>

      <Link
        to="/how-it-works"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        See how the pipeline works
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  )
}
