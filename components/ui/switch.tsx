'use client';

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          ref={ref}
          className="sr-only peer"
          {...props}
        />
        <div className={cn(
          "relative w-11 h-6 bg-slate-800 rounded-full peer-checked:bg-cyan-500 peer-focus:ring-2 peer-focus:ring-cyan-500 peer-focus:ring-offset-2 peer-focus:ring-offset-slate-950 transition-colors",
          className
        )}>
          <div className="absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform peer-checked:translate-x-5"></div>
        </div>
        {label && (
          <span className="ml-3 text-sm text-slate-300">{label}</span>
        )}
      </label>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
