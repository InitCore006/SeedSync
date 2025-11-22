import React from 'react'

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor?: string
    backgroundColor?: string | string[]
  }[]
}

interface ChartProps {
  data: ChartData
  height?: number
}

export const LineChart: React.FC<ChartProps> = ({ data, height = 300 }) => {
  // This is a placeholder component
  // In production, use a library like recharts, chart.js, or visx
  return (
    <div 
      className="w-full bg-neutral-50 rounded-lg flex items-center justify-center border border-neutral-200"
      style={{ height: `${height}px` }}
    >
      <div className="text-center">
        <p className="text-neutral-500 mb-2">Line Chart Component</p>
        <p className="text-sm text-neutral-400">
          Integration with charting library needed
        </p>
        <div className="mt-4 text-xs text-neutral-400">
          Labels: {data.labels.join(', ')}
        </div>
      </div>
    </div>
  )
}

export const BarChart: React.FC<ChartProps> = ({ data, height = 300 }) => {
  // This is a placeholder component
  // In production, use a library like recharts, chart.js, or visx
  return (
    <div 
      className="w-full bg-neutral-50 rounded-lg flex items-center justify-center border border-neutral-200"
      style={{ height: `${height}px` }}
    >
      <div className="text-center">
        <p className="text-neutral-500 mb-2">Bar Chart Component</p>
        <p className="text-sm text-neutral-400">
          Integration with charting library needed
        </p>
        <div className="mt-4 text-xs text-neutral-400">
          Labels: {data.labels.join(', ')}
        </div>
      </div>
    </div>
  )
}

export const PieChart: React.FC<ChartProps> = ({ data, height = 300 }) => {
  return (
    <div 
      className="w-full bg-neutral-50 rounded-lg flex items-center justify-center border border-neutral-200"
      style={{ height: `${height}px` }}
    >
      <div className="text-center">
        <p className="text-neutral-500 mb-2">Pie Chart Component</p>
        <p className="text-sm text-neutral-400">
          Integration with charting library needed
        </p>
      </div>
    </div>
  )
}