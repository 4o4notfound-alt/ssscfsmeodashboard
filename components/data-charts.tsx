"use client"

import type React from "react"

import { useState, useMemo, useRef, type TouchEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"
import { ExportOptions } from "@/components/export-options"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/chart"

interface HealthData {
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

interface DataChartsProps {
  data: HealthData[]
}

type ViewType = "week" | "month" | "year"
type MetricType = "scores" | "sleep" | "activity" | "hrv"

export function DataCharts({ data }: DataChartsProps) {
  const [viewType, setViewType] = useState<ViewType>("week")
  const [metricType, setMetricType] = useState<MetricType>("scores")
  const [currentPeriodIndex, setCurrentPeriodIndex] = useState(0)

  // Refs for chart elements (used for PDF export)
  const scoresChartRef = useRef<HTMLDivElement>(null)
  const sleepChartRef = useRef<HTMLDivElement>(null)
  const activityChartRef = useRef<HTMLDivElement>(null)
  const hrvChartRef = useRef<HTMLDivElement>(null)

  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const minSwipeDistance = 50 // Minimum distance required for a swipe

  // Sort data by date
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [data])

  // Calculate periods based on view type
  const periods = useMemo(() => {
    if (!sortedData.length) return []

    const result = []
    const startDate = new Date(sortedData[0].date)
    const endDate = new Date(sortedData[sortedData.length - 1].date)

    if (viewType === "week") {
      // Create weekly periods
      let currentStart = new Date(startDate)
      while (currentStart <= endDate) {
        const currentEnd = new Date(currentStart)
        currentEnd.setDate(currentEnd.getDate() + 6)

        result.push({
          start: new Date(currentStart),
          end: currentEnd > endDate ? endDate : currentEnd,
        })

        currentStart = new Date(currentEnd)
        currentStart.setDate(currentStart.getDate() + 1)
      }
    } else if (viewType === "month") {
      // Create monthly periods
      let currentStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
      while (currentStart <= endDate) {
        const currentEnd = new Date(currentStart.getFullYear(), currentStart.getMonth() + 1, 0)

        result.push({
          start: new Date(currentStart),
          end: currentEnd > endDate ? endDate : currentEnd,
        })

        currentStart = new Date(currentStart.getFullYear(), currentStart.getMonth() + 1, 1)
      }
    } else if (viewType === "year") {
      // Create yearly periods
      let currentStart = new Date(startDate.getFullYear(), 0, 1)
      while (currentStart <= endDate) {
        const currentEnd = new Date(currentStart.getFullYear(), 11, 31)

        result.push({
          start: new Date(currentStart),
          end: currentEnd > endDate ? endDate : currentEnd,
        })

        currentStart = new Date(currentStart.getFullYear() + 1, 0, 1)
      }
    }

    return result
  }, [sortedData, viewType])

  // Get current period data
  const currentPeriodData = useMemo(() => {
    if (!periods.length || currentPeriodIndex >= periods.length) return []

    const { start, end } = periods[currentPeriodIndex]

    return sortedData.filter((item) => {
      const itemDate = new Date(item.date)
      return itemDate >= start && itemDate <= end
    })
  }, [sortedData, periods, currentPeriodIndex])

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (viewType === "week") {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    } else if (viewType === "month") {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    } else {
      return date.toLocaleDateString("en-US", { month: "short" })
    }
  }

  // Format period for display
  const formatPeriod = () => {
    if (!periods.length || currentPeriodIndex >= periods.length) return ""

    const { start, end } = periods[currentPeriodIndex]

    if (viewType === "week") {
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    } else if (viewType === "month") {
      return start.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    } else {
      return start.getFullYear().toString()
    }
  }

  // Navigate to previous period
  const goToPreviousPeriod = () => {
    if (currentPeriodIndex > 0) {
      setCurrentPeriodIndex(currentPeriodIndex - 1)
    }
  }

  // Navigate to next period
  const goToNextPeriod = () => {
    if (currentPeriodIndex < periods.length - 1) {
      setCurrentPeriodIndex(currentPeriodIndex + 1)
    }
  }

  // Zoom in (week -> day, month -> week, year -> month)
  const zoomIn = () => {
    if (viewType === "year") {
      setViewType("month")
    } else if (viewType === "month") {
      setViewType("week")
    }
    setCurrentPeriodIndex(0)
  }

  // Zoom out (day -> week, week -> month, month -> year)
  const zoomOut = () => {
    if (viewType === "week") {
      setViewType("month")
    } else if (viewType === "month") {
      setViewType("year")
    }
    setCurrentPeriodIndex(0)
  }

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX
    touchEndX.current = null
  }

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return

    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      // Swipe left means go to next period
      goToNextPeriod()
    } else if (isRightSwipe) {
      // Swipe right means go to previous period
      goToPreviousPeriod()
    }

    // Reset values
    touchStartX.current = null
    touchEndX.current = null
  }

  // Get the appropriate chart ref based on the metric type
  const getChartRef = (type: MetricType) => {
    switch (type) {
      case "scores":
        return scoresChartRef
      case "sleep":
        return sleepChartRef
      case "activity":
        return activityChartRef
      case "hrv":
        return hrvChartRef
      default:
        return null
    }
  }

  const renderChart = () => {
    if (!currentPeriodData.length) return null

    // Create a wrapper with touch handlers for all chart types
    const ChartWrapper = (props: { children: React.ReactNode; metricType: MetricType }) => (
      <div
        className="touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        ref={getChartRef(props.metricType)}
      >
        {props.children}
      </div>
    )

    if (metricType === "scores") {
      return (
        <ChartWrapper metricType="scores">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={currentPeriodData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => [`${value}`, ""]}
                labelFormatter={(label) => formatDate(label as string)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sleep.score"
                name="Sleep"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="activity.score"
                name="Activity"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="readiness.score"
                name="Readiness"
                stroke="#ffc658"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>
      )
    } else if (metricType === "sleep") {
      return (
        <ChartWrapper metricType="sleep">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={currentPeriodData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => [`${Math.round(value / 60)}h ${value % 60}m`, ""]}
                labelFormatter={(label) => formatDate(label as string)}
              />
              <Legend />
              <Bar dataKey="sleep.deep" name="Deep Sleep" stackId="a" fill="#8884d8" />
              <Bar dataKey="sleep.rem" name="REM Sleep" stackId="a" fill="#82ca9d" />
              <Bar dataKey="sleep.light" name="Light Sleep" stackId="a" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      )
    } else if (metricType === "activity") {
      return (
        <ChartWrapper metricType="activity">
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={currentPeriodData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => [`${value.toLocaleString()}`, ""]}
                labelFormatter={(label) => formatDate(label as string)}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="activity.steps"
                name="Steps"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>
      )
    } else if (metricType === "hrv") {
      return (
        <ChartWrapper metricType="hrv">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={currentPeriodData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => [`${value} ms`, ""]}
                labelFormatter={(label) => formatDate(label as string)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sleep.hrv"
                name="HRV"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>
      )
    }

    return null
  }

  // Collect all chart refs for export
  const chartRefs = {
    scoresChart: scoresChartRef.current,
    sleepChart: sleepChartRef.current,
    activityChart: activityChartRef.current,
    hrvChart: hrvChartRef.current,
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Charts</h2>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Health Metrics</CardTitle>
              <CardDescription>Visualize your health data over time</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={metricType} onValueChange={(value) => setMetricType(value as MetricType)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scores">Health Scores</SelectItem>
                  <SelectItem value="sleep">Sleep Phases</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                  <SelectItem value="hrv">Heart Rate Variability</SelectItem>
                </SelectContent>
              </Select>
              <Tabs value={viewType} onValueChange={(value) => setViewType(value as ViewType)}>
                <TabsList>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="year">Year</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="icon" onClick={goToPreviousPeriod} disabled={currentPeriodIndex === 0}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous period</span>
            </Button>
            <div className="text-sm font-medium">{formatPeriod()}</div>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextPeriod}
              disabled={currentPeriodIndex === periods.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next period</span>
            </Button>
          </div>

          <div className="flex justify-center mb-4">
            <div className="text-xs text-muted-foreground hidden md:block">
              Use the navigation buttons to change periods
            </div>
            <div className="text-xs text-muted-foreground md:hidden">
              Swipe left or right to navigate between periods
            </div>
          </div>

          {renderChart()}

          <div className="flex justify-between mt-4 gap-2">
            <ExportOptions data={data} chartRefs={chartRefs} />

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={zoomIn} disabled={viewType === "week"}>
                <ZoomIn className="h-4 w-4 mr-1" />
                Zoom In
              </Button>
              <Button variant="outline" size="sm" onClick={zoomOut} disabled={viewType === "year"}>
                <ZoomOut className="h-4 w-4 mr-1" />
                Zoom Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
