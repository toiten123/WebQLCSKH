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

const API_URL = "http://localhost:5013/api/DichVu"

export function ServiceDialog({ open, onOpenChange, service, onSave }) {
  const [formData, setFormData] = useState({
    idDichVu: "",
    tenDichVu: "",
    moTaDichVu: "",
  })

  useEffect(() => {
    if (service) {
      setFormData(service)
    } else {
      setFormData({
        idDichVu: "",
        tenDichVu: "",
        moTaDichVu: "",
      })
    }
  }, [service])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (formData.idDichVu) {
        // Cập nhật dịch vụ (PUT)
        await fetch(`${API_URL}/${formData.idDichVu}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })
      } else {
        // Thêm mới dịch vụ (POST)
        await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })
      }
      onSave && onSave(formData) // gọi callback sau khi lưu thành công
      onOpenChange(false) // đóng dialog
    } catch (error) {
      console.error("Lỗi khi lưu dịch vụ:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{formData.idDichVu ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}</DialogTitle>
            <DialogDescription>Nhập thông tin dịch vụ vào form bên dưới</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tenDichVu">Tên dịch vụ</Label>
              <Input
                id="tenDichVu"
                name="tenDichVu"
                value={formData.tenDichVu}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="moTaDichVu">Mô tả dịch vụ</Label>
              <Textarea
                id="moTaDichVu"
                name="moTaDichVu"
                value={formData.moTaDichVu}
                onChange={handleChange}
                rows={4}
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
