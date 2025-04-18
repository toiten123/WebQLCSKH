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
import { useToast } from "@/components/ui/use-toast";

export function AccountDialog({ open, onOpenChange, account, onSave }) {
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    idUser: 0,
    userName: "",
    passWord: "",
    role: "employee",
    email: "",
    phoneNumber: "",
    created: new Date().toISOString(),
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (account) {
      setFormData({
        ...account,
        passWord: "",
        created: new Date(account.created).toISOString(),
      })
    } else {
      setFormData({
        idUser: 0,
        userName: "",
        passWord: "",
        role: "employee",
        email: "",
        phoneNumber: "",
        created: new Date().toISOString(),
      })
    }
    setErrors({})
  }, [account])

  const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;

  const validate = () => {
    const newErrors = {}

    if (vietnameseRegex.test(formData.userName)) {
      newErrors.userName = "Không được dùng dấu tiếng Việt hoặc ký tự đặc biệt!"
    }

    if (!account || formData.passWord.trim()) {
      if (formData.passWord.length < 6 || formData.passWord.includes(" ")) {
        newErrors.passWord = "Mật khẩu phải có ít nhất 6 ký tự và không chứa khoảng trắng!"
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email không hợp lệ!"
    }
    

    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại phải đủ 10 chữ số!"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    // Không cho nhập chữ vào ô số điện thoại
    if (name === "phoneNumber") {
      const onlyNums = value.replace(/\D/g, "")
      setFormData((prev) => ({ ...prev, phoneNumber: onlyNums }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    const isEdit = !!account?.idUser
    const payload = { ...formData }

    if (isEdit && !formData.passWord.trim()) {
      delete payload.passWord
    }

    try {
      const response = await fetch(
        isEdit
          ? `http://localhost:5013/api/TaiKhoan/${account.idUser}`
          : `http://localhost:5013/api/TaiKhoan`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(errText || "Có lỗi xảy ra khi lưu")
      }

      const result = await response.json()

      toast({
        title: "Thành công",
        description: "Tài khoản đã được lưu thành công!",
        duration: 3000,
      })

      onSave(result)
      onOpenChange(false)
    } catch (err) {
      toast({
        title: "Lỗi",
        description: "Không thể lưu tài khoản!",
        duration: 3000,
        variant: "destructive",
      })
      console.error(err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{account ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}</DialogTitle>
            <DialogDescription>Vui lòng điền đầy đủ thông tin bên dưới</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Tên đăng nhập</Label>
              <Input
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                required
              />
              {errors.userName && <p className="text-sm text-red-500">{errors.userName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="passWord">{account ? "Mật khẩu mới (nếu đổi)" : "Mật khẩu"}</Label>
              <Input
                id="passWord"
                name="passWord"
                type="password"
                value={formData.passWord}
                onChange={handleChange}
                required={!account}
              />
              {errors.passWord && <p className="text-sm text-red-500">{errors.passWord}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Vai trò</Label>
              <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="employee">Nhân viên</SelectItem>
                </SelectContent>
              </Select>
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
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Số điện thoại</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
              {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
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
