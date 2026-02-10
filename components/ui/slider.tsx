'use client';

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  showValue?: boolean
  valueLabel?: string
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, showValue = true, valueLabel, ...props }, ref) => {
    const [value, setValue] = React.useState(props.value || props.defaultValue || 0)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value)
      props.onChange?.(e)
    }

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          {valueLabel && (
            <span className="text-sm text-slate-400">{valueLabel}</span>
          )}
          {showValue && (
            <span className="text-sm font-mono text-cyan-400">{value}</span>
          )}
        </div>
        <input
          type="range"
          ref={ref}
          value={value}
          onChange={handleChange}
          className={cn(
            "w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-cyan-500/50 [&::-webkit-slider-thumb]:hover:bg-cyan-400",
            "[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:shadow-cyan-500/50 [&::-moz-range-thumb]:hover:bg-cyan-400",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
