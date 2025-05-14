"use client"

import { useState } from "react"
import { DashboardSummary } from "@/components/dashboard-summary"
import { DataCharts } from "@/components/data-charts"
import { DataImport } from "@/components/data-import"
import { EmptyPlaceholder } from "@/components/empty-placeholder"

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

export function FileUpload() {
  const [data, setData] = useState<HealthData[] | null>(null)

  const handleDataImported = (importedData: HealthData[]) => {
    setData(importedData)
  }

  return (
    <div className="w-full">
      <DataImport onDataImported={handleDataImported} />

      {!data && (
        <div id="dashboard-content">
          <EmptyPlaceholder>
            <EmptyPlaceholder.Icon name="file" />
            <EmptyPlaceholder.Title>No data uploaded yet</EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              Upload your health data file to see your dashboard.
            </EmptyPlaceholder.Description>
          </EmptyPlaceholder>
        </div>
      )}

      {data && (
        <>
          <DashboardSummary data={data} />
          <DataCharts data={data} />
        </>
      )}
    </div>
  )
}
