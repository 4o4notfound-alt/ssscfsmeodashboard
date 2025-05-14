"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Moon, Heart } from "lucide-react"

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

interface DashboardSummaryProps {
  data: HealthData[]
}

export function DashboardSummary({ data }: DashboardSummaryProps) {
  // Get the most recent data point
  const latestData = data[data.length - 1]

  // Calculate averages for the last 7 days
  const last7Days = data.slice(-7)
  const avgSleepScore = Math.round(last7Days.reduce((sum, day) => sum + day.sleep.score, 0) / last7Days.length)
  const avgActivityScore = Math.round(last7Days.reduce((sum, day) => sum + day.activity.score, 0) / last7Days.length)
  const avgReadinessScore = Math.round(last7Days.reduce((sum, day) => sum + day.readiness.score, 0) / last7Days.length)

  // Format minutes to hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Summary</h2>
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Average</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="mt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sleep</CardTitle>
                <Moon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{latestData.sleep.score}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatDuration(latestData.sleep.duration)} total
                </div>
                <div className="grid grid-cols-3 gap-1 mt-3 text-xs">
                  <div>
                    <div className="font-medium">Deep</div>
                    <div>{formatDuration(latestData.sleep.deep)}</div>
                  </div>
                  <div>
                    <div className="font-medium">REM</div>
                    <div>{formatDuration(latestData.sleep.rem)}</div>
                  </div>
                  <div>
                    <div className="font-medium">Light</div>
                    <div>{formatDuration(latestData.sleep.light)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activity</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{latestData.activity.score}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {latestData.activity.steps.toLocaleString()} steps
                </div>
                <div className="grid grid-cols-3 gap-1 mt-3 text-xs">
                  <div>
                    <div className="font-medium">Calories</div>
                    <div>{latestData.activity.calories}</div>
                  </div>
                  <div>
                    <div className="font-medium">Active</div>
                    <div>{latestData.activity.activeCalories}</div>
                  </div>
                  <div>
                    <div className="font-medium">Distance</div>
                    <div>{(latestData.activity.distance / 1000).toFixed(1)} km</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Readiness</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{latestData.readiness.score}</div>
                <div className="text-xs text-muted-foreground mt-1">HRV: {latestData.readiness.hrv} ms</div>
                <div className="grid grid-cols-3 gap-1 mt-3 text-xs">
                  <div>
                    <div className="font-medium">RHR</div>
                    <div>{latestData.readiness.restingHeartRate} bpm</div>
                  </div>
                  <div>
                    <div className="font-medium">Temp</div>
                    <div>
                      {latestData.readiness.bodyTemperature > 0 ? "+" : ""}
                      {latestData.readiness.bodyTemperature}°
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Recovery</div>
                    <div>{latestData.readiness.recoveryIndex}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="weekly" className="mt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sleep Average</CardTitle>
                <Moon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgSleepScore}</div>
                <div className="text-xs text-muted-foreground mt-1">Last 7 days</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activity Average</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgActivityScore}</div>
                <div className="text-xs text-muted-foreground mt-1">Last 7 days</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Readiness Average</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgReadinessScore}</div>
                <div className="text-xs text-muted-foreground mt-1">Last 7 days</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="trends" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Health Trends</CardTitle>
              <CardDescription>Your health metrics are trending positively over the last period.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Sleep consistency</div>
                    <div className="text-xs text-muted-foreground">Your sleep schedule has been consistent</div>
                  </div>
                  <div className="text-sm font-medium text-green-500">+12%</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Activity level</div>
                    <div className="text-xs text-muted-foreground">Your activity has increased</div>
                  </div>
                  <div className="text-sm font-medium text-green-500">+8%</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Recovery rate</div>
                    <div className="text-xs text-muted-foreground">Your body is recovering well</div>
                  </div>
                  <div className="text-sm font-medium text-green-500">+5%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
