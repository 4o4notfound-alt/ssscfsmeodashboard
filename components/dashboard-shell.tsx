import type React from "react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({ children, className, ...props }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-lg font-semibold">Health Dashboard</h1>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex w-full flex-1 flex-col overflow-hidden">
        <div className="container grid items-start gap-8 py-8">
          <div className={cn("flex flex-col gap-6", className)} {...props}>
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
