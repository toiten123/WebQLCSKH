"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Star, Download, Upload, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RatingDialog } from "@/components/ratings/rating-dialog"
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

const BACKEND_URL = "http://localhost:5013"

export default function RatingsPage() {
  const [ratings, setRatings] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [pageSize, setPageSize] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRating, setSelectedRating] = useState(null)
  const [deleteRatingId, setDeleteRatingId] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resRatings = await fetch(`${BACKEND_URL}/api/danhgiadichvu`)
        const rawRatings = await resRatings.json()

        const resCustomers = await fetch(`${BACKEND_URL}/api/khachhang/dropdown`)
        const customers = await resCustomers.json()

        const resServices = await fetch(`${BACKEND_URL}/api/dichvu/dropdown`)
        const services = await resServices.json()

        const enrichedRatings = rawRatings.map((r) => {
          const customer = customers.find((c) => c.id === r.idKhachHang)
          const service = services.find((s) => s.id === r.idDichVu)
          return {
            id: r.idDanhGia,
            customerId: r.idKhachHang,
            customerName: customer ? customer.label.split("-")[1]?.trim() : "Không rõ",
            serviceId: r.idDichVu,
            serviceName: service ? service.label : "Không rõ",
            serviceRating: r.danhGia,
            description: r.moTaDanhGia,
            date: new Date(r.ngayTao).toLocaleDateString("vi-VN"),
          }
        })

        setRatings(enrichedRatings)
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error)
      }
    }

    fetchData()
  }, [])

  const filteredRatings = ratings.filter(
    (rating) =>
      rating.id.toString().includes(searchTerm.toLowerCase()) ||
      rating.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rating.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rating.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const paginatedRatings = filteredRatings.slice((currentPage - 1) * Number(pageSize), currentPage * Number(pageSize))
  const totalPages = Math.ceil(filteredRatings.length / Number(pageSize))

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
      ))
  }

  const exportToExcel = () => {
    alert("Xuất dữ liệu ra Excel")
  }

  const importFromExcel = () => {
    alert("Nhập dữ liệu từ Excel")
  }

  const handleAddRating = () => {
    setSelectedRating(null)
    setIsDialogOpen(true)
  }

  const handleEditRating = (rating) => {
    setSelectedRating(rating)
    setIsDialogOpen(true)
  }

  const handleSaveRating = (rating) => {
    const updated = {
      ...rating,
      id: rating.id ?? `DG${Date.now().toString().slice(-3)}`,
      date: new Date().toLocaleDateString("vi-VN"),
    }

    if (selectedRating) {
      setRatings(ratings.map((r) => (r.id === rating.id ? updated : r)))
    } else {
      setRatings([...ratings, updated])
    }

    setIsDialogOpen(false)
  }

  const handleDeleteClick = (id) => {
    setDeleteRatingId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/danhgiadichvu/${deleteRatingId}`, {
        method: "DELETE",
      })
      setRatings(ratings.filter((rating) => rating.id !== deleteRatingId))
    } catch (error) {
      console.error("Lỗi khi xóa:", error)
    }

    setIsDeleteDialogOpen(false)
    setDeleteRatingId(null)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Đánh giá Dịch vụ</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Xuất Excel
          </Button>
          <Button variant="outline" onClick={importFromExcel}>
            <Upload className="mr-2 h-4 w-4" />
            Nhập Excel
          </Button>
          <Button onClick={handleAddRating}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm đánh giá
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách đánh giá</CardTitle>
          <CardDescription>Xem đánh giá của khách hàng về dịch vụ và nhân viên</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm đánh giá..."
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
                  <TableHead>Dịch vụ</TableHead>
                  <TableHead>Đánh giá dịch vụ</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRatings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      Không tìm thấy đánh giá nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRatings.map((rating) => (
                    <TableRow key={rating.id}>
                      <TableCell className="font-medium">{rating.id}</TableCell>
                      <TableCell>{rating.customerName}</TableCell>
                      <TableCell>{rating.serviceName}</TableCell>
                      <TableCell>
                        <div className="flex">{renderStars(rating.serviceRating)}</div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{rating.description}</TableCell>
                      <TableCell>{rating.date}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditRating(rating)}
                            className="h-8 w-8 text-blue-600"
                            title="Sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(rating.id)}
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
              Hiển thị {paginatedRatings.length} / {filteredRatings.length} đánh giá
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

      <RatingDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        rating={selectedRating}
        onSave={handleSaveRating}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.
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