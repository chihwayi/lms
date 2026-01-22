import * as React from "react"

interface SliderProps {
  value: number[]
  max: number
  min?: number
  step?: number
  onValueChange: (value: number[]) => void
  className?: string
}

function Slider({ value, max, min = 0, step = 1, onValueChange, className = '' }: SliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange([parseFloat(e.target.value)])
  }
  
  const percentage = ((value[0] - min) / (max - min)) * 100;

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0] || min}
      onChange={handleChange}
      className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider ${className}`}
      style={{
        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
      }}
    />
  )
}

export { Slider }