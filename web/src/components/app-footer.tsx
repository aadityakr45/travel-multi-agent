import { Link } from "react-router-dom"

const APP_VERSION = "0.1.0"

export function AppFooter() {
  return (
    <footer className="shrink-0 border-t border-border/60 px-4 md:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-4 pb-6 text-xs text-muted-foreground">
        <span>Voyanta AI · v{APP_VERSION}</span>
        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          <Link to="/about" className="hover:text-foreground">
            About
          </Link>
          <Link to="/how-it-works" className="hover:text-foreground">
            How It Works
          </Link>
          <Link to="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <a
            href="https://github.com/aadityakr45/travel-multi-agent/issues"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            Report an issue
          </a>
        </nav>
      </div>
    </footer>
  )
}
