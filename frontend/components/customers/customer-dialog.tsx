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
import { useToast } from "@/components/ui/use-toast"

interface CustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: {
    id?: number
    name: string
    phone: string
    email: string
    address: string
    createdAt: string
  } | null
  onSave: (customerData: any) => void
}

const formatDateToInput = (date: string | Date) => {
  const d = new Date(date)
  if (isNaN(d.getTime())) return new Date().toISOString().split("T")[0]
  return d.toISOString().split("T")[0]
}

export function CustomerDialog({ open, onOpenChange, customer, onSave }: CustomerDialogProps) {
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    createdAt: formatDateToInput(new Date()),
  })

  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    email: "",
    createdAt: "",
  })

  useEffect(() => {
    if (customer) {
      setFormData({
        id: customer.id?.toString() || "",
        name: customer.name || "",
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer.address || "",
        createdAt: customer.createdAt
          ? formatDateToInput(customer.createdAt)
          : formatDateToInput(new Date()),
      })
    } else {
      setFormData({
        id: "",
        name: "",
        phone: "",
        email: "",
        address: "",
        createdAt: formatDateToInput(new Date()),
      })
    }
    setErrors({ name: "", phone: "", email: "", createdAt: "" })
  }, [customer])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    let valid = true
    const newErrors = { name: "", phone: "", email: "", createdAt: "" }

    if (/\d/.test(formData.name)) {
      newErrors.name = "Tên khách hàng không được chứa số"
      valid = false
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại phải gồm đúng 10 chữ số"
      valid = false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email không hợp lệ!"
      valid = false
    }

    const createdDate = new Date(formData.createdAt)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (createdDate > today) {
      newErrors.createdAt = "Ngày tạo không được lớn hơn ngày hiện tại!"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const checkDuplicate = async () => {
    const res = await fetch("http://localhost:5013/api/KhachHang/check-duplicate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        SoDienThoai: formData.phone,
        Email: formData.email,
        Id: formData.id ? Number(formData.id) : null,
      }),
    })

    if (!res.ok) {
      throw new Error("Không thể kiểm tra trùng lặp.")
    }

    return await res.json()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      const duplicateCheck = await checkDuplicate()

      if (duplicateCheck.isPhoneDuplicate || duplicateCheck.isEmailDuplicate) {
        const newErrors = { ...errors }

        if (duplicateCheck.isPhoneDuplicate) {
          newErrors.phone = "Số điện thoại đã tồn tại!"
        }

        if (duplicateCheck.isEmailDuplicate) {
          newErrors.email = "Email đã tồn tại!"
        }

        setErrors(newErrors)

        return
      }

      const customerDto = {
        tenKhachHang: formData.name,
        soDienThoai: formData.phone,
        email: formData.email,
        diaChi: formData.address,
        ngayTao: formData.createdAt,
      }

      let savedCustomer = null

      if (formData.id) {
        const response = await fetch(`http://localhost:5013/api/KhachHang/${formData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(customerDto),
        })

        if (!response.ok) throw new Error("Cập nhật thất bại")

        savedCustomer = response.status !== 204 ? await response.json() : { id: formData.id, ...customerDto }

        toast({
          title: "Thành công",
          description: "Khách hàng đã được cập nhật thành công!",
        })
      } else {
        const response = await fetch("http://localhost:5013/api/KhachHang", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(customerDto),
        })

        if (!response.ok) throw new Error("Thêm khách hàng thất bại")

        savedCustomer = await response.json()

        toast({
          title: "Thành công",
          description: "Khách hàng đã được thêm thành công!",
        })
      }

      onSave(savedCustomer)
      onOpenChange(false)
    } catch (error) {
      console.error("Lỗi:", error)
      toast({
        title: "Lỗi",
        description: "Đã có lỗi xảy ra khi lưu khách hàng!",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{customer ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}</DialogTitle>
            <DialogDescription>Nhập thông tin khách hàng vào form bên dưới</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên khách hàng</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (
                      !/[0-9]/.test(e.key) &&
                      !["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"].includes(e.key)
                    ) {
                      e.preventDefault()
                    }
                  }}
                  required
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="createdAt">Ngày tạo</Label>
              <Input
                id="createdAt"
                name="createdAt"
                type="date"
                value={formData.createdAt}
                onChange={handleChange}
                required
              />
              {errors.createdAt && <p className="text-red-500 text-sm">{errors.createdAt}</p>}
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