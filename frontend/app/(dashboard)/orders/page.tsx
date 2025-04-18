"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Download, Upload, Plus, Pencil, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrderDialog } from "@/components/orders/order-dialog"
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
import { toast } from "sonner"

// Định nghĩa kiểu dữ liệu cho đơn hàng
interface Order {
  id: number
  code: string
  customerId: number
  customerName: string
  date: string
  total: number
  status: string
}

// Định nghĩa URL API chung
const API_URL = "http://localhost:5013/api/donhang"

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [pageSize, setPageSize] = useState<string>("10")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [deleteOrderId, setDeleteOrderId] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [customers, setCustomers] = useState<{ id: number; name: string }[]>([])

  // Hàm để tải danh sách đơn hàng
  const fetchOrders = async () => {
    try {
      const res = await fetch(API_URL)
      const data = await res.json()

      // Chuyển đổi dữ liệu từ API sang định dạng cần thiết
      const formatted: Order[] = data.map((item: any) => ({
        id: item.idDonHang,
        code: item.maDonHang,
        customerId: item.idKhachHang,
        customerName: item.tenKhachHang,
        date: new Date(item.ngayMua).toLocaleDateString("vi-VN"),
        total: item.tongTien,
        status: item.trangThai,
      }))

      setOrders(formatted)
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu đơn hàng:", error)
      toast.error("Không thể tải dữ liệu đơn hàng")
    }
  }

  useEffect(() => {
    fetchOrders()

    const fetchCustomers = async () => {
      try {
        const res = await fetch("http://localhost:5013/api/khachhang/dropdown")
        const data = await res.json()
        setCustomers(
          data.map((item: any) => ({
            id: item.id,
            name: item.label,
          })),
        )
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu khách hàng:", error)
      }
    }

    fetchCustomers()
  }, [])

  const filteredOrders = orders.filter(
    (order) =>
      order.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const paginatedOrders = filteredOrders.slice((currentPage - 1) * Number(pageSize), currentPage * Number(pageSize))

  const totalPages = Math.ceil(filteredOrders.length / Number(pageSize))

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Thành công":
        return "bg-green-100 text-green-800"
      case "Đang xử lý":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  const exportToExcel = () => {
    alert("Xuất dữ liệu ra Excel")
  }

  const importFromExcel = () => {
    alert("Nhập dữ liệu từ Excel")
  }

  const handleAddOrder = () => {
    setSelectedOrder(null)
    setIsDialogOpen(true)
  }

  const handleEditOrder = (order: Order) => {
    // Chuyển đổi định dạng ngày từ chuỗi ngày tháng Việt Nam sang định dạng ISO
    const dateParts = order.date.split("/")
    if (dateParts.length === 3) {
      const day = Number.parseInt(dateParts[0])
      const month = Number.parseInt(dateParts[1]) - 1 // Tháng trong JS bắt đầu từ 0
      const year = Number.parseInt(dateParts[2])

      // Tạo đối tượng Date mới với các thành phần đã phân tích
      const isoDate = new Date(year, month, day).toISOString().split("T")[0]

      setSelectedOrder({
        ...order,
        date: isoDate,
      })
    } else {
      // Nếu không phân tích được, giữ nguyên giá trị
      setSelectedOrder(order)
    }
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (id: number) => {
    setDeleteOrderId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (deleteOrderId) {
      try {
        const response = await fetch(`${API_URL}/${deleteOrderId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Không thể xóa đơn hàng")
        }

        setOrders(orders.filter((order) => order.id !== deleteOrderId))
        toast.success("Xóa đơn hàng thành công")
      } catch (error) {
        console.error("Lỗi khi xóa đơn hàng:", error)
        toast.error("Có lỗi xảy ra khi xóa đơn hàng")
      } finally {
        setIsDeleteDialogOpen(false)
        setDeleteOrderId(null)
      }
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Đơn hàng</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Xuất Excel
          </Button>
          <Button variant="outline" onClick={importFromExcel}>
            <Upload className="mr-2 h-4 w-4" />
            Nhập Excel
          </Button>
          <Button onClick={handleAddOrder}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm đơn hàng
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách đơn hàng</CardTitle>
          <CardDescription>Quản lý đơn hàng và theo dõi trạng thái</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm đơn hàng..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
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
                  <TableHead>ID đơn hàng</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Ngày mua</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Không tìm thấy đơn hàng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>{formatCurrency(order.total)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditOrder(order)}
                            className="h-8 w-8 text-blue-600"
                            title="Sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(order.id)}
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
              Hiển thị {paginatedOrders.length} / {filteredOrders.length} đơn hàng
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

      <OrderDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        order={selectedOrder}
        onSuccess={fetchOrders}
        customers={customers}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác.
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
    </div>
  )
}
