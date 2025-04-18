import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
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
import { Star, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

const BACKEND_URL = "http://localhost:5013"

export function ContactDialog({ open, onOpenChange, contact, onSave }) {
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)
  const [customerError, setCustomerError] = useState("")

  const [formData, setFormData] = useState({
    idLienLac: 0,
    idKhachHang: 0,
    loaiLienLac: "Gọi điện",
    ngayLienLac: new Date().toISOString(),
    danhGiaNhanVien: 5,
    ketQua: "Thành công",
    moTa: "",
    khachHang: null,
  })

  useEffect(() => {
    if (open) fetchCustomers()
  }, [open])

  useEffect(() => {
    if (contact) {
      setFormData({
        idLienLac: contact.idLienLac || 0,
        idKhachHang: contact.idKhachHang || 0,
        loaiLienLac: contact.loaiLienLac || "Gọi điện",
        ngayLienLac: contact.ngayLienLac || new Date().toISOString(),
        danhGiaNhanVien: contact.danhGiaNhanVien || 5,
        ketQua: contact.ketQua || "Thành công",
        moTa: contact.moTa || "",
        khachHang: contact.khachHang || null,
      })
    } else {
      setFormData({
        idLienLac: 0,
        idKhachHang: 0,
        loaiLienLac: "Gọi điện",
        ngayLienLac: new Date().toISOString(),
        danhGiaNhanVien: 5,
        ketQua: "Thành công",
        moTa: "",
        khachHang: null,
      })
    }
  }, [contact])

  const fetchCustomers = async () => {
    setIsLoadingCustomers(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/KhachHang/dropdown`)
      if (!res.ok) throw new Error("Không thể tải danh sách khách hàng")
      const data = await res.json()
      setCustomers(data)
    } catch (err) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách khách hàng",
        variant: "destructive",
      })
    } finally {
      setIsLoadingCustomers(false)
    }
  }

  const handleCustomerChange = (val) => {
    const customer = customers.find((c) => c.id.toString() === val)
    setFormData((prev) => ({
      ...prev,
      idKhachHang: Number.parseInt(val),
      khachHang: customer?.label || "",
    }))
    setCustomerError("") // Reset lỗi khi chọn
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRatingChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: Number.parseInt(value) }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.idKhachHang || formData.idKhachHang === 0) {
      setCustomerError("Vui lòng chọn khách hàng")
      toast({
        title: "Thiếu thông tin",
        description: "Bạn chưa chọn khách hàng!",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      let res
      if (contact && contact.idLienLac) {
        res = await fetch(`${BACKEND_URL}/api/LichSuLienLac/${contact.idLienLac}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })
      } else {
        res = await fetch(`${BACKEND_URL}/api/LichSuLienLac`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })
      }

      if (!res.ok) throw new Error("Gửi dữ liệu thất bại")

      const data = contact && contact.idLienLac ? null : await res.json()

      toast({
        title: "Thành công",
        description: contact ? "Đã cập nhật liên lạc" : "Đã thêm liên lạc mới",
        duration: 3000,
      })

      onSave(data || formData)
      onOpenChange(false)
    } catch (err) {
      console.error("Lỗi khi lưu:", err)
      toast({
        title: "Lỗi",
        description: "Không thể lưu dữ liệu liên lạc",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderStarRating = (name, value) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(name, star)}
            className={`focus:outline-none ${
              star <= formData[name] ? "text-yellow-400 hover:text-yellow-500" : "text-gray-300 hover:text-gray-400"
            }`}
          >
            <Star className={`h-6 w-6 ${star <= formData[name] ? "fill-yellow-400" : ""}`} />
          </button>
        ))}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{contact ? "Chỉnh sửa liên lạc" : "Thêm liên lạc mới"}</DialogTitle>
            <DialogDescription>Nhập thông tin liên lạc vào form bên dưới</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Khách hàng</Label>
              <Select
                value={formData.idKhachHang === 0 ? "" : formData.idKhachHang.toString()}
                onValueChange={(val) => {
                  handleCustomerChange(val)
                  setCustomerError("") // Reset lỗi khi chọn
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn khách hàng" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingCustomers ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Đang tải...</span>
                    </div>
                  ) : customers.length === 0 ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">Không có dữ liệu khách hàng</div>
                  ) : (
                    customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {customerError && <p className="text-red-500 text-sm">{customerError}</p>}
            </div>

            {/* Các trường khác giữ nguyên */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="loaiLienLac">Loại liên lạc</Label>
                <Select
                  value={formData.loaiLienLac}
                  onValueChange={(value) => handleSelectChange("loaiLienLac", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại liên lạc" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gọi điện">Gọi điện</SelectItem>
                    <SelectItem value="Chat">Chat</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ketQua">Kết quả</Label>
                <Select value={formData.ketQua} onValueChange={(value) => handleSelectChange("ketQua", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn kết quả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Thành công">Thành công</SelectItem>
                    <SelectItem value="Không thành công">Không thành công</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="danhGiaNhanVien">Đánh giá nhân viên</Label>
              {renderStarRating("danhGiaNhanVien", formData.danhGiaNhanVien)}
            </div>

            <div className="space-y-2">
              <Label htmlFor="moTa">Mô tả</Label>
              <Textarea id="moTa" name="moTa" value={formData.moTa || ""} onChange={handleChange} rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
