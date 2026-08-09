import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  PIPELINE_STAGES,
  resolvedStageCount,
  STAGE_ICON,
  STATUS_LABEL,
  type PipelineStatus,
  type PipelineState,
} from "./pipeline-stages"

const STATUS_TEXT_CLASS: Record<PipelineStatus, string> = {
  idle: "text-muted-foreground",
  standby: "text-muted-foreground",
  active: "text-primary",
  done: "text-success",
  skipped: "text-muted-foreground/70",
  blocked: "text-destructive",
  waiting: "text-warning",
  pending: "text-muted-foreground",
}

const STATUS_RING_CLASS: Record<PipelineStatus, string> = {
  idle: "border-border text-muted-foreground",
  standby: "border-border text-muted-foreground",
  active: "border-primary text-primary ring-4 ring-primary/20 motion-safe:animate-pulse",
  done: "border-success/50 bg-success/10 text-success",
  skipped: "border-border text-muted-foreground/50",
  blocked: "border-destructive/50 bg-destructive/10 text-destructive",
  waiting: "border-warning/50 bg-warning/10 text-warning",
  pending: "border-border text-muted-foreground",
}

const RESOLVED_LINE_STATUSES: PipelineStatus[] = ["done", "blocked"]

export function AgentPipelinePanel({ state }: { state: PipelineState }) {
  const resolved = resolvedStageCount(state)

  return (
    <Card className="glass-panel">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Agent Network
        </p>
        <span className="text-xs font-medium text-muted-foreground">
          {resolved} / {PIPELINE_STAGES.length}
        </span>
      </CardHeader>
      <CardContent>
        <div className="relative flex flex-col">
          {PIPELINE_STAGES.map((stage, index) => {
            const status = state[stage.id]
            const Icon = STAGE_ICON[stage.id]
            const isLast = index === PIPELINE_STAGES.length - 1

            return (
              <div key={stage.id} className="relative flex gap-3 pb-6 last:pb-0">
                {!isLast && (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-8 bottom-0 left-[15px] w-px transition-colors",
                      RESOLVED_LINE_STATUSES.includes(status)
                        ? "bg-success/40"
                        : "bg-border"
                    )}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border bg-card transition-colors",
                    STATUS_RING_CLASS[status]
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
                <div className="flex flex-1 items-start justify-between gap-2 pt-0.5">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {stage.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stage.subtitle}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-xs font-medium",
                      STATUS_TEXT_CLASS[status]
                    )}
                  >
                    {STATUS_LABEL[status]}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
