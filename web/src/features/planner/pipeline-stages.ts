import {
  BedDouble,
  CloudSun,
  MapPinned,
  Plane,
  Radar,
  Shield,
  Sparkles,
  UserCheck,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import type { AgentName, TravelResult } from "@/lib/types"

export type PipelineStageId =
  | "supervisor"
  | "guardrails"
  | AgentName
  | "human_review"
  | "final_response"

export type PipelineStatus =
  | "idle"
  | "standby"
  | "active"
  | "done"
  | "skipped"
  | "blocked"
  | "waiting"
  | "pending"

export interface PipelineStage {
  id: PipelineStageId
  title: string
  subtitle: string
  defaultStatus: PipelineStatus
}

// Single source of truth for the pipeline UI - the real, fixed sequence the
// backend graph always follows (backend.py: supervisor -> [selected
// specialists] -> itinerary_agent -> human_approval -> final_agent).
export const PIPELINE_STAGES: PipelineStage[] = [
  { id: "supervisor", title: "Supervisor", subtitle: "Routing the request", defaultStatus: "idle" },
  { id: "guardrails", title: "Guardrails", subtitle: "Keeping the route on track", defaultStatus: "idle" },
  { id: "flight_agent", title: "Flight Agent", subtitle: "Air routes and fares", defaultStatus: "standby" },
  { id: "hotel_agent", title: "Hotel Agent", subtitle: "Stays and neighborhoods", defaultStatus: "standby" },
  { id: "weather_agent", title: "Weather Agent", subtitle: "Seasonal context", defaultStatus: "standby" },
  { id: "budget_agent", title: "Budget Agent", subtitle: "Feasibility and trade-offs", defaultStatus: "standby" },
  { id: "itinerary_agent", title: "Itinerary Agent", subtitle: "Shaping the route", defaultStatus: "standby" },
  { id: "human_review", title: "Human review", subtitle: "Your decision point", defaultStatus: "waiting" },
  { id: "final_response", title: "Final response", subtitle: "Delivering the route", defaultStatus: "pending" },
]

export const STAGE_ICON: Record<PipelineStageId, LucideIcon> = {
  supervisor: Radar,
  guardrails: Shield,
  flight_agent: Plane,
  hotel_agent: BedDouble,
  weather_agent: CloudSun,
  budget_agent: Wallet,
  itinerary_agent: MapPinned,
  human_review: UserCheck,
  final_response: Sparkles,
}

const STAGE_ORDER = PIPELINE_STAGES.map((s) => s.id)

const SPECIALIST_AGENTS: AgentName[] = [
  "flight_agent",
  "hotel_agent",
  "weather_agent",
  "budget_agent",
  "itinerary_agent",
]

// Maps a real backend graph node name (from the SSE "node" event) to the
// pipeline row(s) it resolves. "supervisor" resolves both Supervisor and
// Guardrails, since the guardrail check runs inside that one real node.
const NODE_TO_STAGE_IDS: Record<string, PipelineStageId[]> = {
  supervisor: ["supervisor", "guardrails"],
  guardrail_blocked: ["guardrails"],
  flight_agent: ["flight_agent"],
  hotel_agent: ["hotel_agent"],
  weather_agent: ["weather_agent"],
  budget_agent: ["budget_agent"],
  itinerary_agent: ["itinerary_agent"],
  human_approval: ["human_review"],
  final_agent: ["final_response"],
}

export const STATUS_LABEL: Record<PipelineStatus, string> = {
  idle: "Idle",
  standby: "Standby",
  active: "Active",
  done: "Done",
  skipped: "Skipped",
  blocked: "Blocked",
  waiting: "Waiting",
  pending: "Pending",
}

export type PipelineState = Record<PipelineStageId, PipelineStatus>

export function initialPipelineState(): PipelineState {
  return Object.fromEntries(
    PIPELINE_STAGES.map((s) => [s.id, s.defaultStatus])
  ) as PipelineState
}

export function resolvedStageCount(state: PipelineState): number {
  return PIPELINE_STAGES.filter((s) =>
    ["done", "skipped", "blocked"].includes(state[s.id])
  ).length
}

/**
 * Best-effort live update from an intermediate SSE "node" event: marks the
 * completed stage(s) done and optimistically flags the next stage in the
 * fixed sequence as "active" until the next event or the final reconcile.
 */
export function advanceOnNodeEvent(
  current: PipelineState,
  nodeName: string
): PipelineState {
  const targetIds = NODE_TO_STAGE_IDS[nodeName]
  if (!targetIds) return current

  const next = { ...current }
  for (const id of targetIds) {
    next[id] = "done"
  }

  const lastIndex = Math.max(...targetIds.map((id) => STAGE_ORDER.indexOf(id)))
  const upcoming = STAGE_ORDER[lastIndex + 1]
  const unresolvedStatuses: PipelineStatus[] = [
    "idle",
    "standby",
    "waiting",
    "pending",
  ]
  if (upcoming && unresolvedStatuses.includes(next[upcoming])) {
    next[upcoming] = "active"
  }

  return next
}

/**
 * Authoritative reconciliation from the real TravelResult payload carried by
 * the terminal "awaiting_approval" or "complete" SSE event - overrides any
 * best-effort guesses from advanceOnNodeEvent with ground truth.
 */
export function reconcileFromResult(
  result: TravelResult,
  phase: "awaiting_approval" | "complete"
): PipelineState {
  const next = initialPipelineState()
  next.supervisor = "done"

  if (result.guardrail_allowed === false) {
    next.guardrails = "blocked"
    for (const agent of SPECIALIST_AGENTS) next[agent] = "skipped"
    next.human_review = "skipped"
    next.final_response = "done"
    return next
  }

  next.guardrails = "done"

  const selected = new Set(result.selected_agents)
  for (const agent of SPECIALIST_AGENTS) {
    next[agent] = selected.has(agent) ? "done" : "skipped"
  }

  if (phase === "awaiting_approval") {
    next.human_review = "waiting"
    next.final_response = "pending"
  } else {
    next.human_review = "done"
    next.final_response = "done"
  }

  return next
}
