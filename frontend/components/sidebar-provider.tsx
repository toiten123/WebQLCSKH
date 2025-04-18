"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type SidebarContextType = {
  expanded: boolean
  toggleSidebar: () => void
  setExpanded: (expanded: boolean) => void
}

const SidebarContext = createContext<SidebarContextType>({
  expanded: true,
  toggleSidebar: () => {},
  setExpanded: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Lấy trạng thái từ localStorage nếu có, mặc định là true (mở rộng)
  const [expanded, setExpanded] = useState<boolean>(true)

  // Đảm bảo chỉ chạy ở client side
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-expanded")
    setExpanded(savedState !== null ? JSON.parse(savedState) : true)
  }, [])

  // Lưu trạng thái vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem("sidebar-expanded", JSON.stringify(expanded))
  }, [expanded])

  const toggleSidebar = () => {
    setExpanded(!expanded)
  }

  return <SidebarContext.Provider value={{ expanded, toggleSidebar, setExpanded }}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  return useContext(SidebarContext)
}

