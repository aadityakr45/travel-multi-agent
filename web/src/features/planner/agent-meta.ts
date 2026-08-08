import {
  BedDouble,
  CloudSun,
  Landmark,
  MapPinned,
  Mountain,
  Palmtree,
  Plane,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import type { AgentName } from "@/lib/types"

export const AGENT_META: Record<AgentName, { label: string; icon: LucideIcon }> = {
  flight_agent: { label: "Flight Agent", icon: Plane },
  hotel_agent: { label: "Hotel Agent", icon: BedDouble },
  weather_agent: { label: "Weather Agent", icon: CloudSun },
  budget_agent: { label: "Budget Agent", icon: Wallet },
  itinerary_agent: { label: "Itinerary Agent", icon: MapPinned },
}

export const TRIP_CATEGORIES: {
  id: string
  label: string
  icon: LucideIcon
  prompt: string
}[] = [
  {
    id: "beach",
    label: "Beach Holiday",
    icon: Palmtree,
    prompt: "Plan a relaxing beach holiday with a good resort and water activities.",
  },
  {
    id: "cultural",
    label: "Cultural Tour",
    icon: Landmark,
    prompt: "Plan a cultural tour focused on historic sites, museums, and local traditions.",
  },
  {
    id: "adventure",
    label: "Adventure Trip",
    icon: Mountain,
    prompt: "Plan an adventure trip with trekking, outdoor activities, and scenic spots.",
  },
  {
    id: "family",
    label: "Family Travel",
    icon: Users,
    prompt: "Plan a family-friendly trip with kid-friendly activities and comfortable stays.",
  },
]
