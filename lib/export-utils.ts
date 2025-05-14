/**
 * Utility functions for exporting data in different formats
 */

import type { jsPDF } from "jspdf"

// Type for the health data
type HealthData = {
  date: string
  sleep: {
    score: number
    duration: number
    deep: number
    rem: number
    light: number
    hrv: number
    restingHeartRate: number
  }
  activity: {
    score: number
    steps: number
    calories: number
    activeCalories: number
    distance: number
  }
  readiness: {
    score: number
    hrv: number
    restingHeartRate: number
    bodyTemperature: number
    recoveryIndex: number
  }
}

/**
 * Convert health data to CSV format
 */
export function convertToCSV(data: HealthData[]): string {
  // Define CSV headers
  const headers = [
    "Date",
    "Sleep Score",
    "Sleep Duration (min)",
    "Deep Sleep (min)",
    "REM Sleep (min)",
    "Light Sleep (min)",
    "Sleep HRV",
    "Sleep Resting HR",
    "Activity Score",
    "Steps",
    "Calories",
    "Active Calories",
    "Distance (m)",
    "Readiness Score",
    "Readiness HRV",
    "Readiness Resting HR",
    "Body Temperature",
    "Recovery Index",
  ]

  // Create CSV content
  const csvRows = []

  // Add headers
  csvRows.push(headers.join(","))

  // Add data rows
  for (const item of data) {
    const values = [
      item.date,
      item.sleep.score,
      item.sleep.duration,
      item.sleep.deep,
      item.sleep.rem,
      item.sleep.light,
      item.sleep.hrv,
      item.sleep.restingHeartRate,
      item.activity.score,
      item.activity.steps,
      item.activity.calories,
      item.activity.activeCalories,
      item.activity.distance,
      item.readiness.score,
      item.readiness.hrv,
      item.readiness.restingHeartRate,
      item.readiness.bodyTemperature,
      item.readiness.recoveryIndex,
    ]

    // Escape values that contain commas
    const escapedValues = values.map((value) => {
      if (typeof value === "string" && value.includes(",")) {
        return `"${value}"`
      }
      return value
    })

    csvRows.push(escapedValues.join(","))
  }

  return csvRows.join("\n")
}

/**
 * Download data as a CSV file
 */
export function downloadCSV(data: HealthData[], filename = "health-data.csv"): void {
  const csvContent = convertToCSV(data)
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Format date for display in reports
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Format time duration from minutes to hours and minutes
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

/**
 * Generate a PDF report of health data
 * This function is defined here but implemented in the ExportOptions component
 * to avoid loading the jspdf library on the server
 */
export type GeneratePDFFunction = (
  data: HealthData[],
  chartRefs: {
    scoresChart: HTMLDivElement | null
    sleepChart: HTMLDivElement | null
    activityChart: HTMLDivElement | null
    hrvChart: HTMLDivElement | null
  },
  filename?: string,
) => Promise<void>

/**
 * Add a section to the PDF with a title and content
 */
export function addSectionToPDF(doc: jsPDF, title: string, content: string, y: number, maxWidth: number): number {
  // Add section title
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text(title, 20, y)
  y += 10

  // Add section content
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")

  // Split text to fit within page width
  const splitText = doc.splitTextToSize(content, maxWidth)
  doc.text(splitText, 20, y)

  // Return the new Y position after adding content
  return y + splitText.length * 7 + 10
}
