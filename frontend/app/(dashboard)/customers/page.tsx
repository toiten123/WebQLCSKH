"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Download, Upload, Plus, Pencil, Trash2 } from 'lucide-react'
import { CustomerDialog } from "@/components/customers/customer-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { ImportExcelDialog } from "@/components/import-excel-dialog"
import { toast } from "sonner"
import { ExportExcelDialog } from "@/components/export-excel-dialog"

// Định nghĩa kiểu dữ liệu cho khách hàng
interface Customer {
  id: number
  code: string
  name: string
  phone: string
  address: string
  email: string
  type: string
  createdAt: string
}

// Định nghĩa URL API chung
const API_URL = "http://localhost:5013/api/khachhang"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [pageSize, setPageSize] = useState<string>("10")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [deleteCustomerId, setDeleteCustomerId] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState<boolean>(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState<boolean>(false)
  const [isExporting, setIsExporting] = useState<boolean>(false)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch(API_URL)
        const data = await res.json()
        // Cần chú thích kiểu của parameter "item" để tránh lỗi implicit any
        const formatted: Customer[] = data.map((item: any) => ({
          id: item.idKhachHang,
          code: item.maKhachHang,
          name: item.tenKhachHang,
          phone: item.soDienThoai,
          address: item.diaChi,
          email: item.email,
          type: item.phanLoai,
          createdAt: new Date(item.ngayTao).toLocaleDateString("vi-VN"),
        }))
        setCustomers(formatted)
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error)
      }
    }

    fetchCustomers()
  }, [])

  const filteredCustomers = customers.filter(
    (customer: Customer) =>
      customer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * Number(pageSize),
    currentPage * Number(pageSize),
  )

  const totalPages = Math.ceil(filteredCustomers.length / Number(pageSize))

  const handleAddCustomer = () => {
    setSelectedCustomer(null)
    setIsDialogOpen(true)
  }

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDialogOpen(true)
  }

  const handleSaveCustomer = async (savedCustomer: Customer) => {
    try {
      // Fetch lại danh sách khách hàng từ server
      const res = await fetch(API_URL)
      const data = await res.json()

      const formatted: Customer[] = data.map((item: any) => ({
        id: item.idKhachHang,
        code: item.maKhachHang,
        name: item.tenKhachHang,
        phone: item.soDienThoai,
        address: item.diaChi,
        email: item.email,
        type: item.phanLoai,
        createdAt: new Date(item.ngayTao).toLocaleDateString("vi-VN"),
      }))

      setCustomers(formatted)
      setIsDialogOpen(false)
      toast.success("Lưu khách hàng thành công")
    } catch (error) {
      console.error("Lỗi khi tải lại dữ liệu:", error)
      toast.error("Có lỗi xảy ra khi cập nhật danh sách")
    }
  }

  const handleDeleteClick = (id: number) => {
    setDeleteCustomerId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`${API_URL}/${deleteCustomerId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Không thể xóa khách hàng.")
      }

      setCustomers(customers.filter((customer) => customer.id !== deleteCustomerId))
      toast.success("Xóa khách hàng thành công")
    } catch (error) {
      console.error("Lỗi khi xóa:", error)
      toast.error("Xóa khách hàng thất bại")
    } finally {
      setIsDeleteDialogOpen(false)
      setDeleteCustomerId(null)
    }
  }

  const exportToExcel = () => {
    setIsExportDialogOpen(true)
  }

  const handleExportExcel = async (selectedColumns: string[]) => {
    try {
      setIsExporting(true)
      
      // Tạo URL để tải xuống file Excel
      const queryParams = new URLSearchParams();
      
      // Thêm các cột đã chọn vào query params
      selectedColumns.forEach(column => {
        queryParams.append('columns', column);
      });
      
      // Thêm filter nếu có
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      // Tạo URL API để xuất Excel
      const exportUrl = `${API_URL}/export-excel?${queryParams.toString()}`;
      
      // Tạo một thẻ a ẩn để tải file
      const link = document.createElement('a');
      link.href = exportUrl;
      link.setAttribute('download', 'danh-sach-khach-hang.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Xuất Excel thành công");
    } catch (error) {
      console.error("Lỗi khi xuất Excel:", error);
      toast.error("Có lỗi xảy ra khi xuất Excel");
    } finally {
      setIsExporting(false);
    }
  }

  const exportColumns = [
    { id: "id", label: "ID" },
    { id: "code", label: "MaKhachHang" },
    { id: "name", label: "TenKhachHang" },
    { id: "phone", label: "SoDienThoai" },
    { id: "address", label: "DiaChi" },
    { id: "email", label: "Email" },
    { id: "type", label: "PhanLoai" },
    { id: "createdAt", label: "NgayTao" },
  ]

  const importFromExcel = () => {
    setIsImportDialogOpen(true)
  }

  // Sửa lỗi onImport: ImportExcelDialog mong đợi callback nhận vào một mảng (previewData: any[])
  const handleImportExcel = async (previewData: any[]) => {
    toast({
      title: "Nhập dữ liệu thành công",
      description: `Đã nhập dữ liệu từ file, số lượng dòng: ${previewData.length}`,
    })

    // Gọi lại API để tải danh sách khách hàng mới
    try {
      const res = await fetch(API_URL)
      const data = await res.json()

      const formatted: Customer[] = data.map((item: any) => ({
        id: item.idKhachHang,
        code: item.maKhachHang,
        name: item.tenKhachHang,
        phone: item.soDienThoai,
        address: item.diaChi,
        email: item.email,
        type: item.phanLoai,
        createdAt: new Date(item.ngayTao).toLocaleDateString("vi-VN"),
      }))

      setCustomers(formatted) // Cập nhật danh sách khách hàng mới

      // Nếu bạn cần hiển thị lại trang đầu sau khi nhập
      setCurrentPage(1) // Đặt lại trang hiện tại về 1
    } catch (error) {
      console.error("Lỗi khi tải lại dữ liệu:", error)
      toast.error("Có lỗi xảy ra khi tải lại danh sách khách hàng.")
    }
  }

  const getTypeColor = (type: string): string => {
    switch (type) {
      case "VIP":
        return "bg-purple-100 text-purple-800"
      case "Tiềm năng":
        return "bg-blue-100 text-blue-800"
      case "Mới":
        return "bg-green-100 text-green-800"
      case "Cũ":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Khách hàng</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel} disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Đang xuất..." : "Xuất Excel"}
          </Button>
          <Button variant="outline" onClick={importFromExcel}>
            <Upload className="mr-2 h-4 w-4" />
            Nhập Excel
          </Button>
          <Button onClick={handleAddCustomer}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm khách hàng
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách khách hàng</CardTitle>
          <CardDescription>Quản lý thông tin và phân loại khách hàng của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm khách hàng..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value
                  setSearchTerm(value)
                  setCurrentPage(1) // Reset về trang 1 khi tìm kiếm
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Hiển thị</span>
              <Select
                value={pageSize}
                onValueChange={(value) => {
                  setPageSize(value)
                  setCurrentPage(1) // Reset về trang 1 khi thay đổi số dòng hiển thị
                }}
              >
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
                  <TableHead>Mã Khách Hàng</TableHead>
                  <TableHead>Tên Khách Hàng</TableHead>
                  <TableHead>Số Điện Thoại</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phân loại</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCustomers.length === 0 ? (
                  <TableRow key="no-customers">
                    <TableCell colSpan={9} className="text-center py-4">
                      Không tìm thấy khách hàng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCustomers.map((customer: Customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>{customer.id}</TableCell>
                      <TableCell>{customer.code}</TableCell>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{customer.address}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(customer.type)}>{customer.type}</Badge>
                      </TableCell>
                      <TableCell>{customer.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditCustomer(customer)}
                            className="h-8 w-8 text-blue-600"
                            title="Sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(customer.id)}
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
              Hiển thị {paginatedCustomers.length} / {filteredCustomers.length} khách hàng
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

      <CustomerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        customer={selectedCustomer}
        onSave={handleSaveCustomer}
      />
      <ImportExcelDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleImportExcel}
        entityName="khachhang"
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khách hàng này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ExportExcelDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        onExport={handleExportExcel}
        columns={exportColumns}
      />
    </div>
  )
}
