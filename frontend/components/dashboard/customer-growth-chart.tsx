"use client"

import { useEffect, useRef, useState } from "react"
import { Chart, registerables } from "chart.js"
import { useTheme } from "next-themes"

Chart.register(...registerables)

interface CustomerGrowthChartProps {
  selectedYear: string
}

export function CustomerGrowthChart({ selectedYear }: CustomerGrowthChartProps) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [chartData, setChartData] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchMonthlyData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`http://localhost:5013/api/KhachHang/monthly-growth/${selectedYear}`)
        if (!response.ok) throw new Error("Failed to fetch data")
        const data = await response.json()
        setChartData(data)
      } catch (error) {
        console.error("Error fetching monthly growth data:", error)
        // Fallback to empty data
        setChartData(Array(12).fill(0))
      } finally {
        setIsLoading(false)
      }
    }

    fetchMonthlyData()
  }, [selectedYear])

  useEffect(() => {
    if (chartRef.current && chartData.length > 0) {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      const ctx = chartRef.current.getContext("2d")

      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: [
            "Tháng 1",
            "Tháng 2",
            "Tháng 3",
            "Tháng 4",
            "Tháng 5",
            "Tháng 6",
            "Tháng 7",
            "Tháng 8",
            "Tháng 9",
            "Tháng 10",
            "Tháng 11",
            "Tháng 12",
          ],
          datasets: [
            {
              label: `Khách hàng mới`,
              data: chartData,
              borderColor: "#3C50E0",
              backgroundColor: "rgba(60, 80, 224, 0.1)",
              tension: 0.4,
              fill: true,
              pointBackgroundColor: "#3C50E0",
              pointBorderColor: "#ffffff",
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: false,
            },
            tooltip: {
              backgroundColor: isDark ? "rgba(0, 0, 0, 0.8)" : "#ffffff",
              titleColor: isDark ? "#ffffff" : "#1e293b",
              bodyColor: isDark ? "#ffffff" : "#1e293b",
              padding: 12,
              boxWidth: 8,
              boxHeight: 8,
              usePointStyle: true,
              boxPadding: 4,
              borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
              borderWidth: 1,
              enabled: true,
              mode: "index",
              intersect: false,
              position: "nearest",
              callbacks: {
                label: (context) => context.dataset.label + ": " + context.parsed.y,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              suggestedMax: chartData.length > 0 ? Math.max(...chartData) + 10 : 10,
              grid: {
                color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                drawBorder: false,
              },
              ticks: {
                color: isDark ? "#ffffff" : "#64748b",
                font: {
                  size: 12,
                },
                padding: 10,
                
              },
              border: {
                dash: [5, 5],
              },
            },
            x: {
              grid: {
                display: false,
                drawBorder: false,
              },
              ticks: {
                color: isDark ? "#ffffff" : "#64748b",
                font: {
                  size: 12,
                },
                padding: 10,
              },
            },
          },          
          elements: {
            line: {
              borderWidth: 3,
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
  }, [isDark, theme, chartData, selectedYear])

  return (
    <div className="w-full h-[350px]">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <canvas ref={chartRef}></canvas>
      )}
    </div>
  )
}
