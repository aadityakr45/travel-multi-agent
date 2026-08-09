import { CheckCircle2, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AGENT_META } from "./agent-meta"
import type { AgentName } from "@/lib/types"

export function WorkflowStepperSkeleton() {
  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Supervisor Agent is analyzing your request...
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-28 rounded-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function WorkflowStepper({
  supervisorReasoning,
  selectedAgents,
}: {
  supervisorReasoning: string
  selectedAgents: AgentName[]
}) {
  return (
    <Card className="glass-panel">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Supervisor Agent
          </p>
          <CardTitle>Execution Plan</CardTitle>
        </div>
        <Badge className="gap-1.5 bg-success text-success-foreground">
          <ShieldCheck className="size-3.5" />
          Guardrail passed
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {supervisorReasoning && (
          <p className="text-sm text-muted-foreground">
            {supervisorReasoning}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {selectedAgents.map((agent) => {
            const meta = AGENT_META[agent]
            if (!meta) return null
            const Icon = meta.icon
            return (
              <Badge key={agent} variant="secondary" className="gap-1.5 py-1.5">
                <Icon className="size-3.5" />
                {meta.label}
                <CheckCircle2 className="size-3.5 text-success" />
              </Badge>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
