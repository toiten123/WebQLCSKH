"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { useTheme } from "next-themes"

Chart.register(...registerables)

export function CustomerTypeChart() {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      const ctx = chartRef.current.getContext("2d")
      chartInstance.current = new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["VIP", "Tiềm năng", "Mới", "Cũ"],
          datasets: [
            {
              data: [15, 25, 40, 20],
              backgroundColor: ["#8b5cf6", "#3b82f6", "#10b981", "#6b7280"],
              borderWidth: 1,
              borderColor: isDark ? "#1e1e2f" : "#ffffff",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: isDark ? "#ffffff" : undefined,
                font: {
                  weight: "bold",
                },
                padding: 20,
              },
            },
            tooltip: {
              backgroundColor: isDark ? "rgba(0, 0, 0, 0.8)" : undefined,
              titleColor: isDark ? "#ffffff" : undefined,
              bodyColor: isDark ? "#ffffff" : undefined,
            },
          },
        },
      })
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [isDark, theme])

  return (
    <div className="w-full h-[250px] flex items-center justify-center">
      <canvas ref={chartRef}></canvas>
    </div>
  )
}

