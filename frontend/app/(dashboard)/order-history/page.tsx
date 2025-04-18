"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Download, Upload, Plus, Pencil, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrderHistoryDialog } from "@/components/order-history/order-history-dialog"
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

// Dữ liệu mẫu cho lịch sử đơn hàng
const mockOrderHistory = [
  {
    id: "LS001",
    orderId: "DH001",
    customerName: "Nguyễn Văn A",
    status: "Thành công",
    note: "Đã giao hàng đúng hẹn",
    changeDate: "15/05/2023",
  },
  {
    id: "LS002",
    orderId: "DH002",
    customerName: "Trần Thị B",
    status: "Thành công",
    note: "Khách hàng hài lòng với sản phẩm",
    changeDate: "16/05/2023",
  },
  {
    id: "LS003",
    orderId: "DH003",
    customerName: "Lê Văn C",
    status: "Thất bại",
    note: "Khách hàng hủy đơn",
    changeDate: "17/05/2023",
  },
  {
    id: "LS004",
    orderId: "DH004",
    customerName: "Phạm Thị D",
    status: "Thành công",
    note: "Đã giao hàng và thu tiền",
    changeDate: "18/05/2023",
  },
  {
    id: "LS005",
    orderId: "DH005",
    customerName: "Hoàng Văn E",
    status: "Thất bại",
    note: "Sản phẩm hết hàng",
    changeDate: "19/05/2023",
  },
  {
    id: "LS006",
    orderId: "DH006",
    customerName: "Ngô Thị F",
    status: "Thành công",
    note: "Đã giao hàng thành công",
    changeDate: "20/05/2023",
  },
]

// Thay đổi trong hàm OrderHistoryPage
export default function OrderHistoryPage() {
  const [orderHistory, setOrderHistory] = useState(mockOrderHistory)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedHistory, setSelectedHistory] = useState(null)
  const [pageSize, setPageSize] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)

  // Thêm state cho dialog xác nhận xóa
  const [deleteHistoryId, setDeleteHistoryId] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const filteredHistory = orderHistory.filter(
    (history) =>
      history.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      history.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      history.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      history.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
      history.note.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const paginatedHistory = filteredHistory.slice((currentPage - 1) * Number(pageSize), currentPage * Number(pageSize))

  const totalPages = Math.ceil(filteredHistory.length / Number(pageSize))

  const handleAddHistory = () => {
    setSelectedHistory(null)
    setIsDialogOpen(true)
  }

  const handleEditHistory = (history) => {
    setSelectedHistory(history)
    setIsDialogOpen(true)
  }

  const handleSaveHistory = (history) => {
    if (selectedHistory) {
      // Cập nhật lịch sử đơn hàng
      setOrderHistory(orderHistory.map((h) => (h.id === history.id ? history : h)))
    } else {
      // Thêm lịch sử đơn hàng mới
      setOrderHistory([...orderHistory, { ...history, id: `LS${Date.now().toString().slice(-3)}` }])
    }
    setIsDialogOpen(false)
  }

  // Thêm hàm xử lý xóa
  const handleDeleteClick = (id) => {
    setDeleteHistoryId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (deleteHistoryId) {
      setOrderHistory(orderHistory.filter((history) => history.id !== deleteHistoryId))
      setIsDeleteDialogOpen(false)
      setDeleteHistoryId(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Thành công":
        return "bg-green-100 text-green-800"
      case "Thất bại":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
        <h1 className="text-3xl font-bold tracking-tight">Lịch sử Đơn hàng</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Xuất Excel
          </Button>
          <Button variant="outline" onClick={importFromExcel}>
            <Upload className="mr-2 h-4 w-4" />
            Nhập Excel
          </Button>
          <Button onClick={handleAddHistory}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm lịch sử
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách lịch sử đơn hàng</CardTitle>
          <CardDescription>Quản lý lịch sử trạng thái các đơn hàng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm lịch sử đơn hàng..."
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
                  <TableHead>ID Lịch sử</TableHead>
                  <TableHead>Tên khách hàng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead>Ngày thay đổi</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Không tìm thấy lịch sử đơn hàng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedHistory.map((history) => (
                    <TableRow key={history.id}>
                      <TableCell className="font-medium">{history.id}</TableCell>
                      <TableCell>{history.customerName}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(history.status)}>{history.status}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">{history.note}</TableCell>
                      <TableCell>{history.changeDate}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditHistory(history)}
                            className="h-8 w-8 text-blue-600"
                            title="Sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(history.id)}
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
              Hiển thị {paginatedHistory.length} / {filteredHistory.length} lịch sử đơn hàng
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

      <OrderHistoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        orderHistory={selectedHistory}
        onSave={handleSaveHistory}
        orders={mockOrderHistory
          .map((h) => ({ id: h.orderId, customerName: h.customerName }))
          .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa lịch sử đơn hàng này? Hành động này không thể hoàn tác.
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

