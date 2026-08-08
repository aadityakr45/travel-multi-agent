import { Link } from "react-router-dom"
import { ArrowRight, Info } from "lucide-react"
import { PIPELINE_STAGES, STAGE_ICON } from "@/features/planner/pipeline-stages"

const STAGE_DETAIL: Partial<Record<string, string>> = {
  supervisor:
    "Reads your request and decides which specialist agents are actually relevant — a quick point-to-point trip doesn't need the same agents as a 7-day vacation.",
  guardrails:
    "Checks the request is a legitimate travel-planning ask before any agent starts working, so the pipeline doesn't run on off-topic or unsafe input.",
  flight_agent:
    "Looks up real airport and airline reference data, then has the model write route and booking guidance from it. Fares shown are AI estimates, not live ticket prices.",
  hotel_agent:
    "Runs a real web search for hotels in the destination and summarizes the results — genuine search snippets, not a live booking feed.",
  weather_agent:
    "Pulls real current and forecast conditions for the destination from a live weather service.",
  budget_agent:
    "Reviews every other agent's output and reasons about overall cost feasibility and trade-offs. This is model analysis, not a pricing database.",
  itinerary_agent:
    "Drafts a day-by-day plan from everything gathered so far, and prepares the draft you're asked to approve.",
  human_review:
    "The pipeline pauses here. Nothing is finalized until you approve the draft or send back feedback for a specific agent to revise.",
  final_response:
    "Incorporates your feedback (or your approval) and produces the plan you can export.",
}

export function HowItWorksPage() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
          How Voyanta Works
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
          Voyanta isn't a single chatbot answer — it's a supervised pipeline of
          specialist agents that hand work to each other, with a human
          checkpoint before anything is final. Here's what actually happens
          when you submit a request.
        </p>
      </div>

      <ol className="flex flex-col gap-6">
        {PIPELINE_STAGES.map((stage, index) => {
          const Icon = STAGE_ICON[stage.id]
          const isLast = index === PIPELINE_STAGES.length - 1

          return (
            <li key={stage.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-primary">
                  <Icon className="size-4.5" />
                </span>
                {!isLast && (
                  <span
                    aria-hidden
                    className="mt-1 w-px flex-1 bg-border"
                  />
                )}
              </div>
              <div className="flex flex-col gap-1 pb-2">
                <p className="text-sm font-semibold text-foreground">
                  {stage.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {STAGE_DETAIL[stage.id]}
                </p>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="flex gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-4 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          Weather and hotel information come from live external services.
          Flight fares and budget figures are written by the model based on
          reference data and reasoning — treat them as planning guidance, not
          confirmed prices, and double-check anything you're about to book.
        </p>
      </div>

      <Link
        to="/trips/new"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        Try it yourself
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  )
}
