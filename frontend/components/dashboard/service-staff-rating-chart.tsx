"use client"

import { useEffect, useRef, useState } from "react"
import { Chart, registerables } from "chart.js"
import { useTheme } from "next-themes"

Chart.register(...registerables)

export function ServiceStaffRatingChart() {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [chartData, setChartData] = useState<{
    dichVu: number[]
    nhanVien: number[]
  } | null>(null)

  // Fetch data từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:5013/api/ThongKeDanhGia/ThongKe-DanhGia-DichVu-NhanVien"
        )
        if (!response.ok) throw new Error("Failed to fetch data")
        const data = await response.json()
        setChartData(data)
      } catch (error) {
        console.error("Error fetching rating data:", error)
      }
    }

    fetchData()
  }, [])

  // Hàm lấy dữ liệu phần trăm từ API
  const getPercentages = () => {
    if (!chartData) return { servicePercentages: [], staffPercentages: [] }
    
    return {
      servicePercentages: chartData.dichVu,
      staffPercentages: chartData.nhanVien
    }
  }

  // Cập nhật biểu đồ khi dữ liệu hoặc theme thay đổi
  useEffect(() => {
    if (chartRef.current && chartData) {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      const { servicePercentages, staffPercentages } = getPercentages()

      const ctx = chartRef.current.getContext("2d")
      chartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["1 sao", "2 sao", "3 sao", "4 sao", "5 sao"],
          datasets: [
            {
              label: "Dịch vụ",
              data: servicePercentages,
              backgroundColor: "rgba(59, 130, 246, 0.7)",
              borderColor: "rgba(59, 130, 246, 1)",
              borderWidth: 1,
              borderRadius: 4,
            },
            {
              label: "Nhân viên",
              data: staffPercentages,
              backgroundColor: "rgba(16, 185, 129, 0.7)",
              borderColor: "rgba(16, 185, 129, 1)",
              borderWidth: 1,
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                usePointStyle: true,
                boxWidth: 6,
                color: isDark ? "#ffffff" : undefined,
                font: {
                  weight: "bold",
                },
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => `${context.dataset.label}: ${context.raw}%`,
              },
              backgroundColor: isDark ? "rgba(0, 0, 0, 0.8)" : undefined,
              titleColor: isDark ? "#ffffff" : undefined,
              bodyColor: isDark ? "#ffffff" : undefined,
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: isDark ? "#ffffff" : undefined,
              },
            },
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: (value) => value + "%",
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
  }, [isDark, theme, chartData]) // Thêm chartData vào dependencies

  if (!chartData) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        Đang tải dữ liệu...
      </div>
    )
  }

  return (
    <div className="w-full h-[300px] flex items-center justify-center">
      <canvas ref={chartRef}></canvas>
    </div>
  )
}