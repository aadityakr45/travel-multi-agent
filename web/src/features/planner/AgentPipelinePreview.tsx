import { ChevronRight } from "lucide-react"
import { AGENT_META } from "./agent-meta"
import type { AgentName } from "@/lib/types"

const SEQUENCE: AgentName[] = [
  "flight_agent",
  "hotel_agent",
  "weather_agent",
  "budget_agent",
  "itinerary_agent",
]

export function AgentPipelinePreview() {
  return (
    <div className="overflow-x-auto">
      <div className="mx-auto flex w-max items-start gap-0 px-2 py-2">
        {SEQUENCE.map((agent, index) => {
          const meta = AGENT_META[agent]
          const Icon = meta.icon
          const isLast = index === SEQUENCE.length - 1

          return (
            <div key={agent} className="flex items-start">
              <div className="flex w-20 flex-col items-center gap-2 text-center sm:w-24">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-card text-primary shadow-sm sm:size-16">
                  <Icon className="size-6" />
                </span>
                <span className="text-xs font-medium text-foreground sm:text-sm">
                  {meta.label}
                </span>
              </div>

              {!isLast && (
                <div className="mt-7 flex w-6 items-center gap-1 sm:mt-8 sm:w-10">
                  <span className="h-0.5 w-full rounded-full bg-gradient-to-r from-primary/60 to-primary/10" />
                  <ChevronRight className="size-3.5 shrink-0 text-primary/60" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
