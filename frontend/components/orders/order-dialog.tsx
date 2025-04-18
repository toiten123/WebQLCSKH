"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

// Định nghĩa kiểu dữ liệu cho props
interface OrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: {
    id?: number
    code?: string
    customerId: number | string
    customerName?: string
    date: string
    total: number
    status: string
  } | null
  onSuccess: () => void
  customers: { id: number; name: string }[]
}

const API_URL = "http://localhost:5013/api/donhang"

export function OrderDialog({ open, onOpenChange, order, onSuccess, customers }: OrderDialogProps) {
  const [formData, setFormData] = useState({
    id: "",
    customerId: "",
    customerName: "",
    date: new Date().toISOString().split("T")[0],
    total: 0,
    status: "Đang xử lý",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customerError, setCustomerError] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (order) {
      setFormData({
        id: order.id?.toString() || "",
        customerId: order.customerId?.toString() || "",
        customerName: order.customerName || "",
        date: order.date || new Date().toISOString().split("T")[0],
        total: order.total || 0,
        status: order.status || "Đang xử lý",
      })
    } else {
      setFormData({
        id: "",
        customerId: "",
        customerName: "",
        date: new Date().toISOString().split("T")[0],
        total: 0,
        status: "Đang xử lý",
      })
    }
    setCustomerError(false)
  }, [order])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "total" ? Number(value) : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "customerId") {
      const customer = customers.find((c) => c.id.toString() === value)
      setFormData((prev) => ({
        ...prev,
        customerId: value,
        customerName: customer ? customer.name.split("-")[1]?.trim() : "",
      }))
      setCustomerError(false)
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customerId) {
      setCustomerError(true)
      return
    }

    setIsSubmitting(true)

    try {
      const orderDto = {
        idDonHang: formData.id ? Number.parseInt(formData.id) : 0,
        idKhachHang: Number.parseInt(formData.customerId),
        ngayMua: formData.date,
        tongTien: formData.total,
        trangThai: formData.status,
      }

      let response

      if (formData.id) {
        response = await fetch(`${API_URL}/${formData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderDto),
        })
      } else {
        response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderDto),
        })
      }

      if (!response.ok) throw new Error("Lỗi khi lưu đơn hàng")

      onOpenChange(false)
      toast({
        title: "Thành công",
        description: formData.id ? "Đơn hàng đã được cập nhật thành công!" : "Đơn hàng đã được thêm thành công!",
        duration: 3000,
      })
      onSuccess()
    } catch (error) {
      console.error("Lỗi khi lưu đơn hàng:", error)
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi lưu đơn hàng.",
        duration: 3000,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{order ? "Chỉnh sửa đơn hàng" : "Thêm đơn hàng mới"}</DialogTitle>
            <DialogDescription>Nhập thông tin đơn hàng vào form bên dưới</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customerId">Khách hàng</Label>
              <Select
                value={formData.customerId || ""}
                onValueChange={(value) => handleSelectChange("customerId", value)}
              >
                <SelectTrigger className={customerError ? "border-red-500" : ""}>
                  <SelectValue placeholder="Chọn khách hàng" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {customerError && <p className="text-sm text-red-500">Vui lòng chọn khách hàng</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Ngày mua</Label>
              <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total">Tổng tiền</Label>
              <Input
                id="total"
                name="total"
                type="text"
                inputMode="numeric"
                value={formData.total.toLocaleString("vi-VN")}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\./g, "")
                  const num = Number(raw)
                  if (!isNaN(num)) {
                    setFormData((prev) => ({
                      ...prev,
                      total: num,
                    }))
                  }
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Đang xử lý">Đang xử lý</SelectItem>
                  <SelectItem value="Thành công">Thành công</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
