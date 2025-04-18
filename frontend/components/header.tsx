"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Search, User, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSidebar } from "@/components/sidebar-provider"

export function Header() {
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const { expanded, toggleSidebar } = useSidebar()
  const [username, setUsername] = useState("")
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Get username from localStorage when component mounts
  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "User"
    setUsername(storedUsername)
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    // ✅ Xóa token ra khỏi localStorage
  localStorage.removeItem("token")
  localStorage.removeItem("username")

  // ✅ Thông báo cho người dùng
  toast({
    title: "Đăng xuất thành công",
    description: "Bạn đã đăng xuất khỏi hệ thống",
  })

  // ✅ Điều hướng về trang đăng nhập
  router.push("/login")
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      {/* Nút thu nhỏ sidebar mới */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleSidebar}
        className="rounded-md border border-gray-200 shadow-sm"
      >
        <div className="flex flex-col gap-1 items-center justify-center">
          <div className="w-4 h-0.5 bg-current"></div>
          <div className="w-4 h-0.5 bg-current"></div>
          <div className="w-4 h-0.5 bg-current"></div>
        </div>
        <span className="sr-only">Toggle Menu</span>
      </Button>

      <div className="relative hidden md:flex w-full max-w-sm items-center">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Tìm kiếm..."
          className="pl-8 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            3
          </span>
          <span className="sr-only">Thông báo</span>
        </Button>

        {/* Custom User Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          >
            <User className="h-5 w-5" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-md z-50">
              <div className="px-2 py-1.5 text-sm font-semibold">Xin chào,{username}</div>
              <div className="-mx-1 my-1 h-px bg-muted"></div>
              <button className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent">
                <User className="mr-2 h-4 w-4" />
                <span>Thông tin cá nhân</span>
              </button>
              <button className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent">
                <Settings className="mr-2 h-4 w-4" />
                <span>Cài đặt</span>
              </button>
              <div className="-mx-1 my-1 h-px bg-muted"></div>
              <button
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

