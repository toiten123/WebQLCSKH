"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // ✅ Hàm kiểm tra token hết hạn
  function isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      const now = Math.floor(Date.now() / 1000)
      return payload.exp && payload.exp > now
    } catch {
      return false // Nếu có lỗi khi decode thì xem như không hợp lệ
    }
  }

  // ✅ Kiểm tra token mỗi khi mở trang login
  useEffect(() => {
    const token = localStorage.getItem("token")

    if (token && isTokenValid(token)) {
      // Nếu token còn hạn → vào dashboard
      router.push("/dashboard")
    } else {
      // Nếu token hết hạn → xóa token
      localStorage.removeItem("token")
    }
  }, [router])

  // ✅ Xử lý khi người dùng submit form đăng nhập
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:5013/api/TaiKhoan/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: username, password }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Đăng nhập thất bại")
      }

      const data = await response.json()

      // ✅ Lưu token vào localStorage
      localStorage.setItem("token", data.token)
      localStorage.setItem("username", username)

      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn quay trở lại!",
      })

      router.push("/dashboard")
    } catch (err: any) {
      toast({
        title: "Đăng nhập thất bại",
        description: err.message || "Tên đăng nhập hoặc mật khẩu không đúng",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Đăng nhập</CardTitle>
          <CardDescription className="text-center">
            Nhập thông tin đăng nhập của bạn để truy cập hệ thống
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="remember" className="rounded border-gray-300" />
                <Label htmlFor="remember" className="text-sm font-medium leading-none cursor-pointer">
                  Ghi nhớ đăng nhập
                </Label>
              </div>
              <a href="#" className="text-sm text-primary hover:underline">
                Quên mật khẩu?
              </a>
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
