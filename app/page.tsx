import { Suspense } from "react"
import { FileUpload } from "@/components/file-upload"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Health Dashboard" text="View and analyze your health data in one place." />
      <div className="grid gap-8">
        <Suspense fallback={<div className="h-24 rounded-md bg-muted animate-pulse" />}>
          <FileUpload />
        </Suspense>
      </div>
    </DashboardShell>
  )
}
