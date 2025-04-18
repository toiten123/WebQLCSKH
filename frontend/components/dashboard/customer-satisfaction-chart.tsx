"use client"

import { useEffect, useRef, useState } from "react"
import { Chart, registerables } from "chart.js"
import { useTheme } from "next-themes"

Chart.register(...registerables)

export function CustomerSatisfactionChart() {
  const chartRef = useRef<HTMLCanvasElement | null>(null)
  const chartInstance = useRef<Chart | null>(null)
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [data, setData] = useState<number[]>([])

  useEffect(() => {
    fetch("http://localhost:5013/api/thongkedanhgia/phan-tram")
      .then(res => res.json())
      .then((result) => {
        const ordered = [
          result["Rất hài lòng"] || 0,
          result["Hài lòng"] || 0,
          result["Bình thường"] || 0,
          result["Không hài lòng"] || 0,
          result["Rất không hài lòng"] || 0,
        ]
        setData(ordered)
      })
  }, [])

  useEffect(() => {
    if (chartRef.current && data.length) {
      if (chartInstance.current) chartInstance.current.destroy()

      const ctx = chartRef.current.getContext("2d")
      chartInstance.current = new Chart(ctx!, {
        type: "doughnut",
        data: {
          labels: ["Rất hài lòng", "Hài lòng", "Bình thường", "Không hài lòng", "Rất không hài lòng"],
          datasets: [
            {
              data: data,
              backgroundColor: ["#10b981", "#34d399", "#fbbf24", "#f97316", "#ef4444"],
              borderWidth: 1,
              borderColor: isDark ? "#1e1e2f" : "#ffffff",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: isDark ? "#ffffff" : "#111827",
                font: {
                  weight: "bold",
                },
                padding: 16,
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => `${context.label}: ${context.parsed}%`
              },
              backgroundColor: isDark ? "rgba(0, 0, 0, 0.8)" : "#f9fafb",
              titleColor: isDark ? "#ffffff" : "#111827",
              bodyColor: isDark ? "#ffffff" : "#111827",
            },
          },
        },
      })
    }
  }, [isDark, theme, data])

  return (
    <div className="w-full h-[300px] flex items-center justify-center px-4">
      <div className="relative w-full max-w-md h-full">
        <canvas ref={chartRef} className="w-full h-full" />
      </div>
    </div>
  )
}
