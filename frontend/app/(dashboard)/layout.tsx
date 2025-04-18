"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

// Hàm kiểm tra token hợp lệ dựa vào thời gian hết hạn (chỉ kiểm tra payload của JWT)
function isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    const now = Math.floor(Date.now() / 1000)
    return payload.exp && payload.exp > now
  } catch {
    return false // Nếu có lỗi trong khi decode token thì token không hợp lệ
  }
}
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Kiểm tra token hết hạn thì out ra
  useEffect(() => {
    // Lấy token từ localStorage
    const token = localStorage.getItem("token")

    // Nếu không có token hoặc token không hợp lệ → chuyển hướng về trang login
    if (!token || !isTokenValid(token)) {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Thanh xuân như 1 chén trà... Đợi load cái trang hết luôn thanh xuân :Đ</div>
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">{children}</main>
      </div>
    </div>
  )
}

