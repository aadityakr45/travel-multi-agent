import { useMemo } from "react"
import { Link } from "react-router-dom"
import { Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarkdownView } from "@/components/markdown-view"
import { AGENT_META } from "./agent-meta"
import type { AgentName, TravelResult } from "@/lib/types"

const SECTION_AGENT: Partial<Record<AgentName, keyof TravelResult>> = {
  flight_agent: "flight_results",
  hotel_agent: "hotel_results",
  weather_agent: "weather_results",
  budget_agent: "budget_results",
}

export function ResultTabs({
  result,
  title,
}: {
  result: TravelResult
  title: string
}) {
  const overview = result.requires_approval
    ? result.itinerary ?? result.answer
    : result.answer

  const sections = useMemo(() => {
    return (Object.keys(SECTION_AGENT) as AgentName[])
      .map((agent) => {
        const key = SECTION_AGENT[agent]!
        const content = result[key]
        return typeof content === "string" && content.trim()
          ? { agent, content }
          : null
      })
      .filter((s): s is { agent: AgentName; content: string } => s !== null)
  }, [result])

  return (
    <Card id="pdf-content" className="glass-panel">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          Fares and budget figures are AI-estimated guidance, not live prices.{" "}
          <Link to="/how-it-works" className="underline hover:text-foreground">
            How this works
          </Link>
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <div className="overflow-x-auto">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {sections.map(({ agent }) => (
                <TabsTrigger key={agent} value={agent}>
                  {AGENT_META[agent].label.replace(" Agent", "")}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <TabsContent value="overview">
            <MarkdownView markdown={overview} />
          </TabsContent>
          {sections.map(({ agent, content }) => (
            <TabsContent key={agent} value={agent}>
              <MarkdownView markdown={content} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
