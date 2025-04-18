import { useEffect, useRef, useState } from "react"
import { Chart, registerables } from "chart.js"
import { useTheme } from "next-themes"

Chart.register(...registerables)

export function ContactResultChart() {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [chartData, setChartData] = useState({
    thanhCong: [0, 0, 0],
    khongThanhCong: [0, 0, 0],
  })

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("http://localhost:5013/api/LichSuLienLac/thongke-ketqua")
      const data = await res.json()

      const loaiIndex: Record<string, number> = {
        "Gọi điện": 0,
        "Chat": 1,
        "Email": 2,
      }

      const thanhCong = [0, 0, 0]
      const khongThanhCong = [0, 0, 0]

      data.forEach((item: any) => {
        const index = loaiIndex[item.loaiLienLac]
        if (index !== undefined) {
          if (item.ketQua === "Thành công") {
            thanhCong[index] = item.soLuong
          } else {
            khongThanhCong[index] = item.soLuong
          }
        }
      })

      setChartData({ thanhCong, khongThanhCong })
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      const ctx = chartRef.current.getContext("2d")
      chartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Gọi điện", "Chat", "Email"],
          datasets: [
            {
              label: "Thành công",
              data: chartData.thanhCong,
              backgroundColor: "#10b981",
            },
            {
              label: "Không thành công",
              data: chartData.khongThanhCong,
              backgroundColor: "#ef4444",
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
                font: { weight: "bold" },
                padding: 20,
              },
            },
            tooltip: {
              backgroundColor: isDark ? "rgba(0, 0, 0, 0.8)" : undefined,
              titleColor: isDark ? "#ffffff" : undefined,
              bodyColor: isDark ? "#ffffff" : undefined,
            },
          },
          scales: {
            x: {
              stacked: true,
              ticks: {
                color: isDark ? "#ffffff" : undefined,
              },
              grid: {
                color: isDark ? "rgba(255, 255, 255, 0.1)" : undefined,
              },
            },
            y: {
              stacked: true,
              beginAtZero: true,
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
  }, [chartData, isDark, theme])

  return (
    <div className="w-full h-[250px] flex items-center justify-center">
      <canvas ref={chartRef}></canvas>
    </div>
  )
}
