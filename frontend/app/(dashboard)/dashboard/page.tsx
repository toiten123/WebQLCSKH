"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CustomerSatisfactionChart } from "@/components/dashboard/customer-satisfaction-chart"
import { CustomerTypeChart } from "@/components/dashboard/customer-type-chart"
import { ContactResultChart } from "@/components/dashboard/contact-result-chart"
import { CustomerGrowthChart } from "@/components/dashboard/customer-growth-chart"
import { ServiceStaffRatingChart } from "@/components/dashboard/service-staff-rating-chart"

export default function DashboardPage() {
  const [totalCustomers, setTotalCustomers] = useState<number | null>(null)
  const [totalServices, setTotalServices] = useState<number | null>(null)
  const [vipCustomers, setVipCustomers] = useState<number | null>(null)
  const [totalContacts, setTotalContacts] = useState<number | null>(null)
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [isLoadingYears, setIsLoadingYears] = useState(true)

  // Fetch available years from the API
  useEffect(() => {
    const fetchAvailableYears = async () => {
      setIsLoadingYears(true)
      try {
        const response = await fetch("http://localhost:5013/api/KhachHang/available-years")
        if (!response.ok) throw new Error("Failed to fetch years")

        const years = await response.json()
        setAvailableYears(years.map((year) => year.toString()))

        // Set default year to current year if available, otherwise use the most recent year
        const currentYear = new Date().getFullYear().toString()
        if (years.length > 0) {
          const defaultYear = years.includes(Number.parseInt(currentYear)) ? currentYear : years[0].toString()
          setSelectedYear(defaultYear)
        }
      } catch (error) {
        console.error("Error fetching available years:", error)
        // Fallback to current year
        const currentYear = new Date().getFullYear().toString()
        setAvailableYears([currentYear])
        setSelectedYear(currentYear)
      } finally {
        setIsLoadingYears(false)
      }
    }

    fetchAvailableYears()
  }, [])

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [kh, dv, vip, ll] = await Promise.all([
          fetch("http://localhost:5013/api/KhachHang/count"),
          fetch("http://localhost:5013/api/DichVu/count"),
          fetch("http://localhost:5013/api/KhachHang/count-vip"),
          fetch("http://localhost:5013/api/LichSuLienLac/count"),
        ])

        if (!kh.ok || !dv.ok || !vip.ok || !ll.ok) throw new Error("API error")

        const [khData, dvData, vipData, llData] = await Promise.all([kh.json(), dv.json(), vip.json(), ll.json()])

        setTotalCustomers(khData)
        setTotalServices(dvData)
        setVipCustomers(vipData)
        setTotalContacts(llData)
      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu dashboard:", error)
      }
    }

    fetchCounts()
  }, [])

  const format = (num: number | null) => (num !== null ? num.toLocaleString() : "Đang tải...")

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Tổng khách hàng */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng khách hàng</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{format(totalCustomers)}</div>
          </CardContent>
        </Card>

        {/* Tổng dịch vụ */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng dịch vụ</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{format(totalServices)}</div>
          </CardContent>
        </Card>

        {/* Khách hàng VIP */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách hàng VIP</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{format(vipCustomers)}</div>
          </CardContent>
        </Card>

        {/* Lịch sử liên lạc */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lịch sử liên lạc</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{format(totalContacts)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs giữ nguyên */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Khách hàng mới theo tháng</CardTitle>
                <Select
                  value={selectedYear}
                  onValueChange={setSelectedYear}
                  disabled={isLoadingYears || availableYears.length === 0}
                >
                  <SelectTrigger className="w-[120px] h-8">
                    <SelectValue placeholder={isLoadingYears ? "Đang tải..." : "Chọn năm"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        Năm {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="pl-2">
                {selectedYear && <CustomerGrowthChart selectedYear={selectedYear} />}
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Mức độ hài lòng</CardTitle>
                <CardDescription>Đánh giá của khách hàng về dịch vụ và nhân viên</CardDescription>
              </CardHeader>
              <CardContent>
                <CustomerSatisfactionChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Phân loại khách hàng</CardTitle>
                <CardDescription>Tỷ lệ khách hàng theo phân loại</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <CustomerTypeChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Kết quả liên lạc</CardTitle>
                <CardDescription>Thống kê kết quả cuộc gọi, chat, email</CardDescription>
              </CardHeader>
              <CardContent>
                <ContactResultChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Đánh giá dịch vụ & nhân viên</CardTitle>
                <CardDescription>So sánh đánh giá dịch vụ và nhân viên</CardDescription>
              </CardHeader>
              <CardContent>
                <ServiceStaffRatingChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
