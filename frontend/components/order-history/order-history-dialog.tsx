"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function OrderHistoryDialog({ open, onOpenChange, orderHistory, onSave, orders }) {
  const [formData, setFormData] = useState({
    id: "",
    orderId: "",
    customerName: "",
    status: "Thành công",
    note: "",
    changeDate: new Date().toLocaleDateString("vi-VN"),
  })

  useEffect(() => {
    if (orderHistory) {
      setFormData(orderHistory)
    } else {
      setFormData({
        id: "",
        orderId: "",
        customerName: "",
        status: "Thành công",
        note: "",
        changeDate: new Date().toLocaleDateString("vi-VN"),
      })
    }
  }, [orderHistory])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleOrderChange = (orderId) => {
    const order = orders.find((o) => o.id === orderId)
    setFormData((prev) => ({
      ...prev,
      orderId,
      customerName: order ? order.customerName : "",
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{orderHistory ? "Chỉnh sửa lịch sử đơn hàng" : "Thêm lịch sử đơn hàng mới"}</DialogTitle>
            <DialogDescription>Nhập thông tin lịch sử đơn hàng vào form bên dưới</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="orderId">ID Đơn hàng</Label>
              <Select value={formData.orderId} onValueChange={handleOrderChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đơn hàng" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.id} - {order.customerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Thành công">Thành công</SelectItem>
                  <SelectItem value="Thất bại">Thất bại</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Ghi chú</Label>
              <Textarea id="note" name="note" value={formData.note} onChange={handleChange} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="changeDate">Ngày thay đổi</Label>
              <Input
                id="changeDate"
                name="changeDate"
                type="text"
                value={formData.changeDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Lưu</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

