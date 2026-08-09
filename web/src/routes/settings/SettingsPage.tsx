import { Link } from "react-router-dom"
import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
  { value: "dark", label: "Dark", icon: Moon },
] as const

function AppearanceCard() {
  const { theme, setTheme } = useTheme()

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Choose how Voyanta looks on this device.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex w-fit gap-1 rounded-lg border border-border bg-muted/40 p-1">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                theme === value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function DataPrivacyCard() {
  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle>Data & Privacy</CardTitle>
        <CardDescription>
          There's no account system yet, so this is what's true today.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Your trips are stored only in this browser's local storage and
          aren't synced anywhere — clearing your browser data removes them.
          Trip requests are sent to third-party AI and search services to
          generate plans.{" "}
          <Link to="/privacy" className="text-primary underline-offset-2 hover:underline">
            Read the full privacy note
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  )
}

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and plan.
        </p>
      </div>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Sign in to sync your trips across devices. This is a preview of
            account settings — sign-in isn't wired up yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="display-name">Display name</Label>
            <Input id="display-name" placeholder="Guest traveler" disabled />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" disabled />
          </div>
          <Button disabled className="w-fit">
            Save changes
          </Button>
        </CardContent>
      </Card>

      <AppearanceCard />

      <DataPrivacyCard />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Plan</CardTitle>
            <CardDescription>You're on the free plan.</CardDescription>
          </div>
          <Badge variant="secondary">Free</Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Separator />
          <p className="text-sm text-muted-foreground">
            Billing isn't available yet. Upgrade options will appear here
            once subscriptions are supported.
          </p>
          <Button variant="outline" disabled className="w-fit">
            Upgrade plan
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
