import { useState } from "react"
import { toast } from "sonner"
import { Copy, Download, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { renderMarkdown } from "@/lib/markdown"

function buildPrintableHtml(content: string) {
  return `
    <div style="width:780px;background:#ffffff;color:#1f2937;padding:32px;font-family:Arial,Helvetica,sans-serif;line-height:1.5;">
      <h1 style="font-size:24px;font-weight:600;margin:0 0 16px;">Voyanta AI Travel Plan</h1>
      ${renderMarkdown(content)}
    </div>
  `
}

export function ExportBar({
  content,
  onNewTrip,
}: {
  content: string
  onNewTrip: () => void
}) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleCopy = async () => {
    const container = document.createElement("div")
    container.innerHTML = renderMarkdown(content)
    const text = container.textContent?.trim() || content

    try {
      await navigator.clipboard.writeText(text)
      toast.success("Copied to clipboard")
    } catch (error) {
      console.error("Copy failed:", error)
      toast.error("Could not copy result.")
    }
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const html2pdfModule: any = await import("html2pdf.js")
      const html2pdf = html2pdfModule.default ?? html2pdfModule
      await html2pdf()
        .set({
          margin: 0.5,
          filename: "voyanta-ai-travel-plan.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        })
        .from(buildPrintableHtml(content), "string")
        .save()
    } catch (error) {
      console.error("PDF export failed:", error)
      toast.error("Could not download PDF.")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopy}>
        <Copy className="size-3.5" />
        Copy
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        disabled={isDownloading}
        onClick={handleDownload}
      >
        {isDownloading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Download className="size-3.5" />
        )}
        {isDownloading ? "Preparing PDF..." : "Download PDF"}
      </Button>
      <Button size="sm" className="gap-1.5" onClick={onNewTrip}>
        <Plus className="size-3.5" />
        Start New Trip
      </Button>
    </div>
  )
}
