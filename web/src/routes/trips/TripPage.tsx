import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { MapPinOff } from "lucide-react"
import {
  fetchTravelThread,
  streamApprovalDecision,
  streamTravelRequest,
  TravelNotFoundError,
  type StreamEvent,
} from "@/lib/api"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { buildTripSummary, derivePhase, getTrips, saveTrip, titleFromMessage } from "@/lib/trips"
import type { TravelResult } from "@/lib/types"
import {
  advanceOnNodeEvent,
  initialPipelineState,
  PIPELINE_STAGES,
  reconcileFromResult,
  resolvedStageCount,
  type PipelineState,
} from "@/features/planner/pipeline-stages"
import { usePublishWorkspaceStatus } from "@/lib/workspace-status"
import { AgentPipelinePanel } from "@/features/planner/AgentPipelinePanel"
import { AgentPipelinePreview } from "@/features/planner/AgentPipelinePreview"
import { TripHero } from "@/features/planner/TripHero"
import { PromptForm } from "@/features/planner/PromptForm"
import {
  WorkflowStepper,
  WorkflowStepperSkeleton,
} from "@/features/planner/WorkflowStepper"
import { BlockedState } from "@/features/planner/BlockedState"
import { TripRouteSnapshot } from "@/features/planner/TripRouteSnapshot"
import { ResultTabs } from "@/features/planner/ResultTabs"
import { ApprovalCard } from "@/features/planner/ApprovalCard"
import { ExportBar } from "@/features/planner/ExportBar"

function upsertTrip(result: TravelResult, fallbackTitle: string) {
  const existing = getTrips().find((t) => t.threadId === result.thread_id)
  saveTrip(buildTripSummary(result.thread_id, fallbackTitle, result, existing))
}

export function TripPage() {
  const { threadId } = useParams<{ threadId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [pipelineState, setPipelineState] = useState<PipelineState>(
    initialPipelineState
  )

  const tripQuery = useQuery({
    queryKey: ["trip", threadId],
    queryFn: () => fetchTravelThread(threadId!),
    enabled: Boolean(threadId),
    retry: false,
  })

  const notFound = tripQuery.error instanceof TravelNotFoundError

  useEffect(() => {
    if (tripQuery.error && !notFound) {
      toast.error(tripQuery.error.message)
    }
  }, [tripQuery.error, notFound])

  const result = tripQuery.data ?? null

  // Reflect a rehydrated/just-completed thread's real outcome in the panel,
  // rather than leaving it blank when landing on an existing trip URL.
  useEffect(() => {
    if (result) {
      setPipelineState(
        reconcileFromResult(
          result,
          result.requires_approval ? "awaiting_approval" : "complete"
        )
      )
    }
  }, [result])

  const handleStreamEvent = (event: StreamEvent) => {
    if (event.event === "node" && event.node) {
      setPipelineState((prev) => advanceOnNodeEvent(prev, event.node!))
    } else if (
      (event.event === "awaiting_approval" || event.event === "complete") &&
      event.data
    ) {
      setPipelineState(reconcileFromResult(event.data, event.event))
    }
  }

  const submitMutation = useMutation({
    mutationFn: (message: string) =>
      streamTravelRequest(message, threadId ?? null, handleStreamEvent),
    onMutate: () => setPipelineState(initialPipelineState()),
    onSuccess: (data, message) => {
      queryClient.setQueryData(["trip", data.thread_id], data)
      upsertTrip(data, titleFromMessage(message))
      if (threadId !== data.thread_id) {
        navigate(`/trips/${data.thread_id}`, { replace: true })
      }
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const approveMutation = useMutation({
    mutationFn: ({
      approved,
      feedback,
    }: {
      approved: boolean
      feedback?: string
    }) =>
      streamApprovalDecision(
        threadId!,
        approved,
        feedback ?? "",
        handleStreamEvent
      ),
    onSuccess: (data) => {
      queryClient.setQueryData(["trip", threadId], data)
      upsertTrip(data, "Untitled trip")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const phase = derivePhase(result)
  const isLoadingExisting = Boolean(threadId) && tripQuery.isLoading
  const isBusy = submitMutation.isPending || isLoadingExisting

  const handleNewTrip = () => navigate("/trips/new")
  const isNewTrip = !threadId

  usePublishWorkspaceStatus({
    tripName: result?.trip_constraints?.destination || undefined,
    isLive: submitMutation.isPending || approveMutation.isPending,
    isComplete: phase === "approved",
    resolvedAgents: resolvedStageCount(pipelineState),
    totalAgents: PIPELINE_STAGES.length,
  })

  if (notFound) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <EmptyState
          icon={MapPinOff}
          title="Trip not found"
          description="This trip may have been removed, or the link is incorrect."
          action={
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link to="/trips/new">Plan a new trip</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/history">View trip history</Link>
              </Button>
            </div>
          }
        />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex min-w-0 flex-col gap-6">
        {isNewTrip && <TripHero />}

        <PromptForm
          onSubmit={(message) => submitMutation.mutate(message)}
          isSubmitting={submitMutation.isPending}
          disabled={phase === "awaiting_approval"}
          showQuickStart={isNewTrip}
        />

        {isNewTrip && <AgentPipelinePreview />}

        <div aria-live="polite" className="flex flex-col gap-6">
          {isBusy && <WorkflowStepperSkeleton />}

          {!isBusy && result && phase === "blocked" && (
            <BlockedState reason={result.guardrail_reason} />
          )}

          {!isBusy && result && phase !== "blocked" && (
            <>
              <WorkflowStepper
                supervisorReasoning={result.supervisor_reasoning}
                selectedAgents={result.selected_agents}
              />

              <TripRouteSnapshot constraints={result.trip_constraints} />

              <ResultTabs
                result={result}
                title={
                  phase === "awaiting_approval"
                    ? "Voyanta AI Draft Travel Plan"
                    : "Your Final Voyanta AI Travel Plan"
                }
              />

              {phase === "awaiting_approval" ? (
                <ApprovalCard
                  approvalRequest={result.approval_request}
                  isSubmitting={approveMutation.isPending}
                  onApprove={() => approveMutation.mutate({ approved: true })}
                  onRevise={(feedback) =>
                    approveMutation.mutate({ approved: false, feedback })
                  }
                />
              ) : (
                <ExportBar content={result.answer} onNewTrip={handleNewTrip} />
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-20">
        <AgentPipelinePanel state={pipelineState} />
      </div>
    </div>
  )
}
