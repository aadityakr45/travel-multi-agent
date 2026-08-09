export function PrivacyPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
          Privacy
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          This is a plain-language explanation of what happens to your data
          today, not a formal legal policy — there's no account system yet,
          so there's a limited amount to disclose. This page will be
          replaced with a full policy before any public account launch.
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-foreground">
          What's sent to third parties
        </h2>
        <p className="text-sm text-muted-foreground">
          The trip request text you submit is sent to a hosted large language
          model provider (Groq) to generate reasoning and travel content.
          Hotel searches are sent to a web-search API (Tavily). Destination
          weather lookups are sent to a weather data provider (OpenWeather).
          No payment or contact information is collected, because none is
          asked for.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-foreground">
          What's stored, and where
        </h2>
        <p className="text-sm text-muted-foreground">
          Each planning session is kept server-side under an anonymous
          thread identifier so you can resume it and so the human-approval
          step works — this is not tied to a name, email, or account. The
          list of trips shown in Trip History lives entirely in your
          browser's local storage; it isn't sent to or stored on any server,
          and clearing your browser data removes it.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-foreground">
          No accounts, no billing, nothing to sell
        </h2>
        <p className="text-sm text-muted-foreground">
          There's no login yet, so there's no personal profile or payment
          data to protect beyond what's described above. When accounts and
          billing are introduced, this page will be updated first.
        </p>
      </section>
    </div>
  )
}
