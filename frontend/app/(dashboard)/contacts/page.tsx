"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Search, Pencil, Trash2, Star, Download, Upload, Loader2 } from "lucide-react"
import { ContactDialog } from "@/components/contacts/contact-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"


const BACKEND_URL = "http://localhost:5013"

export default function ContactsPage() {
  const [contacts, setContacts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Thêm state cho phân trang
  const [pageSize, setPageSize] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)

  // Thêm state cho dialog xác nhận xóa
  const [deleteContactId, setDeleteContactId] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    fetchContacts()
  }, [])

  // Cập nhật hàm fetchContacts để xử lý tên khách hàng đúng
  const fetchContacts = async () => {
    setIsLoading(true)
  
    try {
      // 1. Tải khách hàng trước
      const customersResponse = await fetch(`${BACKEND_URL}/api/KhachHang/dropdown`)
      let customerMap = {}
      if (customersResponse.ok) {
        const customersData = await customersResponse.json()
        customerMap = customersData.reduce((map, customer) => {
          const nameOnly = customer.label.split("-")[1]?.trim() || customer.label
          map[customer.id] = nameOnly
          return map
        }, {})
      }
  
      // 2. Sau đó mới gọi API lịch sử liên lạc
      const response = await fetch(`${BACKEND_URL}/api/LichSuLienLac`)
      if (!response.ok) throw new Error("Không thể tải dữ liệu liên lạc")
  
      const data = await response.json()
      console.log("Dữ liệu từ API:", data)
  
      // 3. Định dạng dữ liệu
      const formattedData = data.map((item) => {
        const customerName = item.khachHang || customerMap[item.idKhachHang] || `Khách hàng ${item.idKhachHang}`
        return {
          id: item.idLienLac,
          idLienLac: item.idLienLac,
          idKhachHang: item.idKhachHang,
          customerName,
          khachHang: customerName,
          type: item.loaiLienLac,
          loaiLienLac: item.loaiLienLac,
          date: new Date(item.ngayLienLac).toLocaleDateString("vi-VN"),
          ngayLienLac: item.ngayLienLac,
          staffRating: item.danhGiaNhanVien,
          danhGiaNhanVien: item.danhGiaNhanVien,
          result: item.ketQua,
          ketQua: item.ketQua,
          description: item.moTa,
          moTa: item.moTa,
        }
      })
  
      setContacts(formattedData)
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu liên lạc",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.description && contact.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleAddContact = () => {
    setSelectedContact(null)
    setIsDialogOpen(true)
  }

  const handleEditContact = (contact) => {
    setSelectedContact(contact)
    setIsDialogOpen(true)
  }

  // Cập nhật hàm handleSaveContact để cập nhật tên khách hàng đúng
  const handleSaveContact = async (contact) => {
    if (selectedContact) {
      let customerName = contact.khachHang;
  
      // Tách mã KH khỏi tên khách hàng (nếu có)
      const nameParts = customerName.split("-");
      if (nameParts.length > 1) {
        customerName = nameParts[1].trim();  // Lấy phần tên khách hàng sau dấu "-"
      }
  
      // Kiểm tra lại tên khách hàng
      console.log("Customer Name sau khi sửa:", customerName);
  
      setContacts((prevContacts) =>
        prevContacts.map((c) =>
          c.id === contact.idLienLac
            ? {
                ...c,
                idKhachHang: contact.idKhachHang,
                customerName,  // Cập nhật lại chỉ tên khách hàng
                khachHang: customerName,  // Cập nhật lại chỉ tên khách hàng
                loaiLienLac: contact.loaiLienLac,
                type: contact.loaiLienLac,
                ngayLienLac: contact.ngayLienLac,
                date: new Date(contact.ngayLienLac).toLocaleDateString("vi-VN"),
                danhGiaNhanVien: contact.danhGiaNhanVien,
                staffRating: contact.danhGiaNhanVien,
                ketQua: contact.ketQua,
                result: contact.ketQua,
                moTa: contact.moTa,
                description: contact.moTa,
              }
            : c,
        ),
      );
    } else {
      // Trường hợp thêm mới, có thể gọi lại fetchContacts hoặc xử lý theo cách khác
      await fetchContacts();
    }
    setIsDialogOpen(false);
  };
  
  

  // Thêm hàm xử lý xóa
  const handleDeleteClick = (id) => {
    setDeleteContactId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (deleteContactId) {
      setIsDeleting(true)
      try {
        const response = await fetch(`${BACKEND_URL}/api/LichSuLienLac/${deleteContactId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Không thể xóa liên lạc")
        }

        setContacts(contacts.filter((contact) => contact.id !== deleteContactId))
        toast({
          title: "Thành công",
          description: "Đã xóa liên lạc",
        })
      } catch (error) {
        console.error("Lỗi khi xóa:", error)
        toast({
          title: "Lỗi",
          description: "Không thể xóa liên lạc",
          variant: "destructive",
        })
      } finally {
        setIsDeleting(false)
        setIsDeleteDialogOpen(false)
        setDeleteContactId(null)
      }
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "Gọi điện":
        return "bg-blue-100 text-blue-800"
      case "Chat":
        return "bg-green-100 text-green-800"
      case "Email":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getResultColor = (result) => {
    switch (result) {
      case "Thành công":
        return "bg-green-100 text-green-800"
      case "Không thành công":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
      ))
  }

  // Thêm phân trang
  const paginatedContacts = filteredContacts.slice((currentPage - 1) * Number(pageSize), currentPage * Number(pageSize))
  const totalPages = Math.ceil(filteredContacts.length / Number(pageSize))

  const exportToExcel = () => {
    alert("Xuất dữ liệu ra Excel")
  }

  const importFromExcel = () => {
    alert("Nhập dữ liệu từ Excel")
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Lịch sử Liên lạc</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Xuất Excel
          </Button>
          <Button variant="outline" onClick={importFromExcel}>
            <Upload className="mr-2 h-4 w-4" />
            Nhập Excel
          </Button>
          <Button onClick={handleAddContact}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm liên lạc
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách liên lạc</CardTitle>
          <CardDescription>Quản lý lịch sử liên lạc với khách hàng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm liên lạc..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Hiển thị</span>
              <Select value={pageSize} onValueChange={setPageSize}>
                <SelectTrigger className="w-16">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">dòng</span>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Loại liên lạc</TableHead>
                  <TableHead>Ngày liên lạc</TableHead>
                  <TableHead>Kết quả</TableHead>
                  <TableHead>Đánh giá nhân viên</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2">Đang tải dữ liệu...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredContacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      Không tìm thấy liên lạc nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">{contact.id}</TableCell>
                      <TableCell>{contact.customerName}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(contact.type)}>{contact.type}</Badge>
                      </TableCell>
                      <TableCell>{contact.date}</TableCell>
                      <TableCell>
                        <Badge className={getResultColor(contact.result)}>{contact.result}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex">{renderStars(contact.staffRating || 0)}</div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{contact.description}</TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditContact(contact)}
                            className="h-8 w-8 text-blue-600"
                            title="Sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(contact.id)}
                            className="h-8 w-8 text-red-600"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Hiển thị {paginatedContacts.length} / {filteredContacts.length} liên lạc
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ContactDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        contact={selectedContact}
        onSave={handleSaveContact}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa liên lạc này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
