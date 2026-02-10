import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  variant?: "default" | "success" | "warning" | "danger"
  showLabel?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, variant = "default", showLabel = false, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const variantClasses = {
      default: "bg-gradient-to-r from-cyan-500 to-cyan-400",
      success: "bg-gradient-to-r from-emerald-500 to-emerald-400",
      warning: "bg-gradient-to-r from-amber-500 to-amber-400",
      danger: "bg-gradient-to-r from-red-500 to-red-400",
    }

    return (
      <div ref={ref} className="relative">
        <div
          className={cn(
            "relative h-2 w-full overflow-hidden rounded-full bg-slate-800",
            className
          )}
          {...props}
        >
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out rounded-full",
              variantClasses[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <div className="mt-1 text-xs text-slate-400 text-right">
            {Math.round(percentage)}%
          </div>
        )}
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
