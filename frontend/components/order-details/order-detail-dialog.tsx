"use client"

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

export function OrderDetailDialog({ open, onOpenChange, orderDetail, onSave, orders }) {
  const [formData, setFormData] = useState({
    id: "",
    orderId: "",
    customerName: "",
    productName: "",
    quantity: 1,
    price: 0,
  })

  useEffect(() => {
    if (orderDetail) {
      setFormData(orderDetail)
    } else {
      setFormData({
        id: "",
        orderId: "",
        customerName: "",
        productName: "",
        quantity: 1,
        price: 0,
      })
    }
  }, [orderDetail])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: name === "quantity" || name === "price" ? Number(value) : value }))
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
            <DialogTitle>{orderDetail ? "Chỉnh sửa chi tiết đơn hàng" : "Thêm chi tiết đơn hàng mới"}</DialogTitle>
            <DialogDescription>Nhập thông tin chi tiết đơn hàng vào form bên dưới</DialogDescription>
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
              <Label htmlFor="productName">Tên sản phẩm</Label>
              <Input
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Số lượng</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Giá tiền</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
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

