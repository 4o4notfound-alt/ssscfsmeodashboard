import type React from "react"
import { cn } from "@/lib/utils"
import { Upload, FileText } from "lucide-react"

interface EmptyPlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function EmptyPlaceholder({ className, children, ...props }: EmptyPlaceholderProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50",
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">{children}</div>
    </div>
  )
}

interface IconProps extends Partial<React.SVGProps<SVGSVGElement>> {
  name: "file" | "upload"
}

EmptyPlaceholder.Icon = function EmptyPlaceHolderIcon({ name, className, ...props }: IconProps) {
  const Icon = name === "file" ? FileText : Upload

  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
      <Icon className={cn("h-10 w-10 text-muted-foreground", className)} {...props} />
    </div>
  )
}

interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

EmptyPlaceholder.Title = function EmptyPlaceholderTitle({ className, ...props }: TitleProps) {
  return <h2 className={cn("mt-6 text-xl font-semibold", className)} {...props} />
}

interface DescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

EmptyPlaceholder.Description = function EmptyPlaceholderDescription({ className, ...props }: DescriptionProps) {
  return (
    <p
      className={cn("mt-3 mb-8 text-center text-sm font-normal leading-6 text-muted-foreground", className)}
      {...props}
    />
  )
}
