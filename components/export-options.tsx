"use client"

import { useState } from "react"
import { Download, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { downloadCSV, formatDate, formatDuration } from "@/lib/export-utils"

interface ExportOptionsProps {
  data: any[]
  chartRefs: {
    scoresChart: HTMLDivElement | null
    sleepChart: HTMLDivElement | null
    activityChart: HTMLDivElement | null
    hrvChart: HTMLDivElement | null
  }
}

export function ExportOptions({ data, chartRefs }: ExportOptionsProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleCSVExport = () => {
    try {
      downloadCSV(data, `health-data-${new Date().toISOString().split("T")[0]}.csv`)
      toast({
        title: "Export successful",
        description: "Your data has been exported as CSV",
      })
    } catch (error) {
      console.error("Error exporting CSV:", error)
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "There was an error exporting your data",
      })
    }
  }

  const handlePDFExport = async () => {
    setIsExporting(true)

    try {
      // Dynamically import jspdf and html2canvas to reduce bundle size
      const [jspdfModule, html2canvasModule] = await Promise.all([import("jspdf"), import("html2canvas")])

      const jsPDF = jspdfModule.default
      const html2canvas = html2canvasModule.default

      // Create a new PDF document
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Add title
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text("Health Data Report", 105, 20, { align: "center" })

      // Add date range
      const startDate = formatDate(data[0].date)
      const endDate = formatDate(data[data.length - 1].date)
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Date Range: ${startDate} - ${endDate}`, 105, 30, { align: "center" })

      // Add summary section
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Summary", 20, 45)

      // Calculate averages
      const avgSleepScore = Math.round(data.reduce((sum, item) => sum + item.sleep.score, 0) / data.length)
      const avgActivityScore = Math.round(data.reduce((sum, item) => sum + item.activity.score, 0) / data.length)
      const avgReadinessScore = Math.round(data.reduce((sum, item) => sum + item.readiness.score, 0) / data.length)
      const avgSleepDuration = Math.round(data.reduce((sum, item) => sum + item.sleep.duration, 0) / data.length)
      const avgSteps = Math.round(data.reduce((sum, item) => sum + item.activity.steps, 0) / data.length)

      // Add summary data
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Average Sleep Score: ${avgSleepScore}`, 30, 55)
      doc.text(`Average Activity Score: ${avgActivityScore}`, 30, 62)
      doc.text(`Average Readiness Score: ${avgReadinessScore}`, 30, 69)
      doc.text(`Average Sleep Duration: ${formatDuration(avgSleepDuration)}`, 30, 76)
      doc.text(`Average Daily Steps: ${avgSteps.toLocaleString()}`, 30, 83)

      // Add charts
      let yPosition = 95

      // Function to add a chart to the PDF
      const addChartToPDF = async (chartRef: HTMLDivElement | null, title: string) => {
        if (!chartRef) return yPosition

        // Check if we need a new page
        if (yPosition > 230) {
          doc.addPage()
          yPosition = 20
        }

        // Add chart title
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text(title, 20, yPosition)
        yPosition += 10

        // Capture chart as canvas
        const canvas = await html2canvas(chartRef, {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
        })

        // Calculate dimensions to fit on page
        const imgWidth = 170
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        // Add chart image to PDF
        const imgData = canvas.toDataURL("image/png")
        doc.addImage(imgData, "PNG", 20, yPosition, imgWidth, imgHeight)

        // Update position for next element
        yPosition += imgHeight + 15

        return yPosition
      }

      // Add each chart to the PDF
      if (chartRefs.scoresChart) {
        yPosition = await addChartToPDF(chartRefs.scoresChart, "Health Scores")
      }

      if (chartRefs.sleepChart) {
        yPosition = await addChartToPDF(chartRefs.sleepChart, "Sleep Phases")
      }

      if (chartRefs.activityChart) {
        yPosition = await addChartToPDF(chartRefs.activityChart, "Activity")
      }

      if (chartRefs.hrvChart) {
        yPosition = await addChartToPDF(chartRefs.hrvChart, "Heart Rate Variability")
      }

      // Save the PDF
      const filename = `health-report-${new Date().toISOString().split("T")[0]}.pdf`
      doc.save(filename)

      toast({
        title: "Export successful",
        description: "Your health report has been exported as PDF",
      })
    } catch (error) {
      console.error("Error exporting PDF:", error)
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "There was an error generating your PDF report",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCSVExport} disabled={isExporting}>
          <FileText className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePDFExport} disabled={isExporting}>
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
