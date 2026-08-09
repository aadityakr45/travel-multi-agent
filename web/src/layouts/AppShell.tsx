import { useEffect, useState } from "react"
import { Link, NavLink, Outlet, useLocation } from "react-router-dom"
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plane,
  Plus,
  Sparkles,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { NAV_ITEMS } from "@/lib/nav"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { AppFooter } from "@/components/app-footer"
import {
  useWorkspaceStatus,
  WorkspaceStatusProvider,
  type WorkspaceStatus,
} from "@/lib/workspace-status"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function Brand({
  onNavigate,
  collapsed,
}: {
  onNavigate?: () => void
  collapsed?: boolean
}) {
  return (
    <Link
      to="/"
      onClick={onNavigate}
      className="flex items-center gap-2 font-semibold text-foreground"
    >
      <span className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <span
          aria-hidden
          className="absolute inset-0 -z-10 rounded-lg bg-primary opacity-60 blur-md"
        />
        <Plane className="size-4" />
      </span>
      {!collapsed && "Voyanta AI"}
    </Link>
  )
}

function NavList({
  onNavigate,
  collapsed,
}: {
  onNavigate?: () => void
  collapsed?: boolean
}) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          title={collapsed ? label : undefined}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 rounded-lg border-l-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
              collapsed && "justify-center px-0",
              isActive && "border-primary bg-accent text-accent-foreground"
            )
          }
        >
          <Icon className="size-4 shrink-0" />
          {!collapsed && label}
        </NavLink>
      ))}
    </nav>
  )
}

function UserMenuContent() {
  return (
    <DropdownMenuContent align="end" className="w-48">
      <DropdownMenuLabel>Guest traveler</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link to="/settings">Account settings</Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/login">Sign in</Link>
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}

function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open user menu">
          <Avatar size="sm">
            <AvatarFallback>
              <User className="size-3.5" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <UserMenuContent />
    </DropdownMenu>
  )
}

function SidebarUserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open user menu"
          className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-card/60 px-2.5 py-2 text-left transition-colors hover:bg-accent"
        >
          <Avatar size="sm">
            <AvatarFallback>
              <User className="size-3.5" />
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-foreground">
              Guest traveler
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              Not signed in
            </span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <UserMenuContent />
    </DropdownMenu>
  )
}

const SIDEBAR_COLLAPSED_KEY = "voyanta:sidebar-collapsed"

function PageContext() {
  const location = useLocation()
  const segment = location.pathname.split("/")[1] ?? ""
  const section = NAV_ITEMS.find((item) => item.to.split("/")[1] === segment)

  if (!section) return null

  const Icon = section.icon

  return (
    <div className="hidden min-w-0 items-center gap-2 text-sm font-medium text-foreground md:flex">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{section.label}</span>
    </div>
  )
}

function workspaceLabel(status: WorkspaceStatus): string {
  const progress =
    status.totalAgents != null
      ? `${status.resolvedAgents ?? 0}/${status.totalAgents} Agents Active`
      : null

  if (status.isLive) {
    return status.tripName
      ? `Planning ${status.tripName}${progress ? ` · ${progress}` : ""}`
      : (progress ?? "Planning your trip")
  }

  if (status.isComplete && status.tripName) {
    return `${status.tripName} · Journey Ready`
  }

  if (status.tripName) {
    return status.tripName
  }

  return "Multi-Agent Travel Workspace"
}

function WorkspaceCenter() {
  const status = useWorkspaceStatus()

  return (
    <div className="hidden min-w-0 max-w-[220px] items-center justify-center gap-2 lg:flex xl:max-w-[340px]">
      <Sparkles className="size-4 shrink-0 text-primary" />
      <span className="min-w-0 truncate text-sm">
        <span className="font-semibold text-foreground">Voyanta AI</span>
        <span className="mx-1.5 text-border">·</span>
        <span className="text-muted-foreground">{workspaceLabel(status)}</span>
      </span>
    </div>
  )
}

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true"
  )

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed))
  }, [sidebarCollapsed])

  return (
    <WorkspaceStatusProvider>
    <div className="min-h-svh bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <div className="mx-auto flex w-full max-w-[1400px]">
        <aside
          className={cn(
            "relative sticky top-0 hidden h-svh shrink-0 flex-col gap-6 overflow-hidden border-r border-border/60 bg-card/40 py-4 backdrop-blur-xl transition-[width] duration-200 md:flex",
            sidebarCollapsed ? "w-[68px] items-center px-2" : "w-64 px-4"
          )}
        >
          <div
            aria-hidden
            className="ambient-bg"
            style={{
              background:
                "radial-gradient(circle at 0% 0%, rgba(15, 118, 110, 0.3), transparent 40%), " +
                "radial-gradient(circle at 100% 100%, rgba(214, 162, 74, 0.2), transparent 38%)",
            }}
          />

          <div
            className={cn(
              "flex w-full items-center",
              sidebarCollapsed ? "flex-col gap-2" : "justify-between"
            )}
          >
            <Brand collapsed={sidebarCollapsed} />
            <Button
              variant="ghost"
              size="icon"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setSidebarCollapsed((prev) => !prev)}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </Button>
          </div>

          <NavList collapsed={sidebarCollapsed} />

          <div className="mt-auto flex w-full flex-col items-center gap-2">
            <Button
              asChild
              size={sidebarCollapsed ? "icon" : "default"}
              className={cn("gap-2", !sidebarCollapsed && "w-full justify-start")}
            >
              <Link
                to="/trips/new"
                title={sidebarCollapsed ? "New Trip" : undefined}
              >
                <Plus className="size-4" />
                {!sidebarCollapsed && "New Trip"}
              </Link>
            </Button>
            {sidebarCollapsed ? <UserMenu /> : <SidebarUserMenu />}
          </div>
        </aside>

        <div className="flex min-h-svh min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md md:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:justify-normal">
            <div className="flex min-w-0 items-center gap-3 justify-self-start">
              <div className="flex items-center gap-2 md:hidden">
                <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                  <SheetContent side="left" className="w-72 p-4">
                    <SheetHeader className="p-0">
                      <SheetTitle asChild>
                        <Brand onNavigate={() => setMobileNavOpen(false)} />
                      </SheetTitle>
                    </SheetHeader>
                    <NavList onNavigate={() => setMobileNavOpen(false)} />
                  </SheetContent>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open navigation menu"
                    onClick={() => setMobileNavOpen(true)}
                  >
                    <Menu className="size-5" />
                  </Button>
                </Sheet>
                <Brand />
              </div>

              <PageContext />
            </div>

            <WorkspaceCenter />

            <div className="flex items-center gap-1.5 justify-self-end">
              <ThemeToggle />
              <div className="md:hidden">
                <UserMenu />
              </div>
            </div>
          </header>

          <main id="main-content" className="flex-1 px-4 py-6 md:px-6 md:py-8">
            <div className="mx-auto w-full max-w-5xl">
              <Outlet />
            </div>
          </main>

          <AppFooter />
        </div>
      </div>
    </div>
    </WorkspaceStatusProvider>
  )
}
