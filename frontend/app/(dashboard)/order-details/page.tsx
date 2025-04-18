"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Download, Upload, Plus, Pencil, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrderDetailDialog } from "@/components/order-details/order-detail-dialog"
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

// Dữ liệu mẫu cho chi tiết đơn hàng
const mockOrderDetails = [
  {
    id: "CTDH001",
    orderId: "DH001",
    customerName: "Nguyễn Văn A",
    productName: "iPhone 15 Pro Max",
    quantity: 1,
    price: 35000000,
  },
  {
    id: "CTDH002",
    orderId: "DH001",
    customerName: "Nguyễn Văn A",
    productName: "Ốp lưng iPhone 15 Pro Max",
    quantity: 2,
    price: 500000,
  },
  {
    id: "CTDH003",
    orderId: "DH002",
    customerName: "Trần Thị B",
    productName: "Samsung Galaxy S23",
    quantity: 1,
    price: 25000000,
  },
  {
    id: "CTDH004",
    orderId: "DH003",
    customerName: "Lê Văn C",
    productName: "Xiaomi 14 Pro",
    quantity: 1,
    price: 22000000,
  },
  {
    id: "CTDH005",
    orderId: "DH004",
    customerName: "Phạm Thị D",
    productName: "Tai nghe Bluetooth",
    quantity: 3,
    price: 1500000,
  },
  {
    id: "CTDH006",
    orderId: "DH005",
    customerName: "Hoàng Văn E",
    productName: "iPad Pro 12.9",
    quantity: 1,
    price: 32000000,
  },
  {
    id: "CTDH007",
    orderId: "DH005",
    customerName: "Hoàng Văn E",
    productName: "Apple Pencil",
    quantity: 1,
    price: 3500000,
  },
]

// Thay đổi trong hàm OrderDetailsPage
export default function OrderDetailsPage() {
  const [orderDetails, setOrderDetails] = useState(mockOrderDetails)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null)
  const [pageSize, setPageSize] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)

  // Thêm state cho dialog xác nhận xóa
  const [deleteDetailId, setDeleteDetailId] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const filteredOrderDetails = orderDetails.filter(
    (detail) =>
      detail.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detail.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detail.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detail.productName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const paginatedOrderDetails = filteredOrderDetails.slice(
    (currentPage - 1) * Number(pageSize),
    currentPage * Number(pageSize),
  )

  const totalPages = Math.ceil(filteredOrderDetails.length / Number(pageSize))

  const handleAddOrderDetail = () => {
    setSelectedOrderDetail(null)
    setIsDialogOpen(true)
  }

  const handleEditOrderDetail = (orderDetail) => {
    setSelectedOrderDetail(orderDetail)
    setIsDialogOpen(true)
  }

  const handleSaveOrderDetail = (orderDetail) => {
    if (selectedOrderDetail) {
      // Cập nhật chi tiết đơn hàng
      setOrderDetails(orderDetails.map((d) => (d.id === orderDetail.id ? orderDetail : d)))
    } else {
      // Thêm chi tiết đơn hàng mới
      setOrderDetails([...orderDetails, { ...orderDetail, id: `CTDH${Date.now().toString().slice(-3)}` }])
    }
    setIsDialogOpen(false)
  }

  // Thêm hàm xử lý xóa
  const handleDeleteClick = (id) => {
    setDeleteDetailId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (deleteDetailId) {
      setOrderDetails(orderDetails.filter((detail) => detail.id !== deleteDetailId))
      setIsDeleteDialogOpen(false)
      setDeleteDetailId(null)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  const exportToExcel = () => {
    alert("Xuất dữ liệu ra Excel")
  }

  const importFromExcel = () => {
    alert("Nhập dữ liệu từ Excel")
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Chi tiết Đơn hàng</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Xuất Excel
          </Button>
          <Button variant="outline" onClick={importFromExcel}>
            <Upload className="mr-2 h-4 w-4" />
            Nhập Excel
          </Button>
          <Button onClick={handleAddOrderDetail}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm chi tiết
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách chi tiết đơn hàng</CardTitle>
          <CardDescription>Quản lý chi tiết các đơn hàng và sản phẩm</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Thay đổi phần tìm kiếm và bỏ nút lọc */}
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm chi tiết đơn hàng..."
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
                  <TableHead>ID Chi tiết</TableHead>
                  <TableHead>ID Đơn hàng</TableHead>
                  <TableHead>Tên khách hàng</TableHead>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Giá tiền</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrderDetails.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Không tìm thấy chi tiết đơn hàng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrderDetails.map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell className="font-medium">{detail.id}</TableCell>
                      <TableCell>{detail.orderId}</TableCell>
                      <TableCell>{detail.customerName}</TableCell>
                      <TableCell>{detail.productName}</TableCell>
                      <TableCell>{detail.quantity}</TableCell>
                      <TableCell>{formatCurrency(detail.price)}</TableCell>
                      {/* Thay đổi phần thao tác */}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditOrderDetail(detail)}
                            className="h-8 w-8 text-blue-600"
                            title="Sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(detail.id)}
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
              Hiển thị {paginatedOrderDetails.length} / {filteredOrderDetails.length} chi tiết đơn hàng
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

      <OrderDetailDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        orderDetail={selectedOrderDetail}
        onSave={handleSaveOrderDetail}
        orders={mockOrderDetails
          .map((d) => ({ id: d.orderId, customerName: d.customerName }))
          .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)}
      />

      {/* Thêm dialog xác nhận xóa */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa chi tiết đơn hàng này? Hành động này không thể hoàn tác.
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

