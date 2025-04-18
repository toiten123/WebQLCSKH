"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { useTheme } from "next-themes"

Chart.register(...registerables)

export function Overview() {
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
        type: "line",
        data: {
          labels: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6"],
          datasets: [
            {
              label: "Doanh thu",
              data: [100, 120, 115, 134, 168, 182],
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
              labels: {
                color: isDark ? "#ffffff" : undefined,
                font: {
                  weight: "bold",
                },
              },
            },
            tooltip: {
              backgroundColor: isDark ? "rgba(0, 0, 0, 0.8)" : undefined,
              titleColor: isDark ? "#ffffff" : undefined,
              bodyColor: isDark ? "#ffffff" : undefined,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => value + " tr",
                color: isDark ? "#ffffff" : undefined,
              },
              grid: {
                color: isDark ? "rgba(255, 255, 255, 0.1)" : undefined,
              },
            },
            x: {
              ticks: {
                color: isDark ? "#ffffff" : undefined,
              },
              grid: {
                color: isDark ? "rgba(255, 255, 255, 0.1)" : undefined,
              },
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
    <div className="w-full h-[350px] flex items-center justify-center">
      <canvas ref={chartRef}></canvas>
    </div>
  )
}

