"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  HeartHandshake,
  Phone,
  Star,
  FileText,
  History,
  UserCog,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useSidebar } from "./sidebar-provider"
import { SidebarToggle } from "./sidebar-toggle"

export function Sidebar() {
  const pathname = usePathname()
  const { toast } = useToast()
  const router = useRouter()
  const { expanded, toggleSidebar } = useSidebar()

  const handleLogout = () => {
    // Clear login state
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("username")

    toast({
      title: "Đăng xuất thành công",
      description: "Bạn đã đăng xuất khỏi hệ thống",
    })
    router.push("/login")
  }

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Khách hàng",
      icon: Users,
      href: "/customers",
      active: pathname === "/customers",
    },
    {
      label: "Đơn hàng",
      icon: ShoppingCart,
      href: "/orders",
      active: pathname === "/orders",
    },
    {
      label: "Chi tiết đơn hàng",
      icon: FileText,
      href: "/order-details",
      active: pathname === "/order-details",
    },
    {
      label: "Lịch sử đơn hàng",
      icon: History,
      href: "/order-history",
      active: pathname === "/order-history",
    },
    {
      label: "Dịch vụ",
      icon: HeartHandshake,
      href: "/services",
      active: pathname === "/services",
    },
    {
      label: "Đánh giá dịch vụ",
      icon: Star,
      href: "/ratings",
      active: pathname === "/ratings",
    },
    {
      label: "Lịch sử liên lạc",
      icon: Phone,
      href: "/contacts",
      active: pathname === "/contacts",
    },
    {
      label: "Tài khoản",
      icon: UserCog,
      href: "/accounts",
      active: pathname === "/accounts",
    },
  ]

  return (
    <div
      className={cn(
        "relative hidden md:flex h-screen flex-col border-r bg-background transition-all duration-300",
        expanded ? "w-64" : "w-16",
      )}
    >
      <SidebarToggle expanded={expanded} onToggle={toggleSidebar} />

      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <HeartHandshake className="h-6 w-6" />
          {expanded && <span className="text-xl font-bold">PCS CRM</span>}
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm">
          {routes.map((route, index) => (
            <Link
              key={index}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                route.active ? "bg-accent text-foreground" : "",
                !expanded && "justify-center px-0",
              )}
              title={!expanded ? route.label : undefined}
            >
              <route.icon className="h-4 w-4" />
              {expanded && <span>{route.label}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

