"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Search, Download, Upload, Plus, Pencil, Trash2 } from "lucide-react"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { ServiceDialog } from "@/components/services/service-dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const API_URL = "http://localhost:5013/api/DichVu"

export default function ServicesPage() {
  const [services, setServices] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [pageSize, setPageSize] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteServiceId, setDeleteServiceId] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const res = await fetch(API_URL)
      const data = await res.json()
      setServices(data)
    } catch (error) {
      console.error("Lỗi khi tải dịch vụ:", error)
    }
  }

  const handleAddService = () => {
    setSelectedService(null)
    setIsDialogOpen(true)
  }

  const handleEditService = (service) => {
    setSelectedService(service)
    setIsDialogOpen(true)
  }

  const handleSaveService = async (service) => {
    try {
      await fetchServices() // Sau khi lưu thành công, tải lại danh sách dịch vụ
    } catch (error) {
      console.error("Lỗi khi lưu dịch vụ:", error)
    }
    setIsDialogOpen(false)
  }

  const handleDeleteClick = (id) => {
    setDeleteServiceId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await fetch(`${API_URL}/${deleteServiceId}`, { method: "DELETE" })
      await fetchServices()
    } catch (error) {
      console.error("Lỗi khi xóa dịch vụ:", error)
    }
    setIsDeleteDialogOpen(false)
    setDeleteServiceId(null)
  }

  const filteredServices = services.filter(
    (service) =>
      service.tenDichVu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.moTaDichVu.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * Number(pageSize),
    currentPage * Number(pageSize)
  )

  const totalPages = Math.ceil(filteredServices.length / Number(pageSize))

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Dịch vụ</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => alert("Xuất dữ liệu ra Excel")}>
            <Download className="mr-2 h-4 w-4" /> Xuất Excel
          </Button>
          <Button variant="outline" onClick={() => alert("Nhập dữ liệu từ Excel")}>
            <Upload className="mr-2 h-4 w-4" /> Nhập Excel
          </Button>
          <Button onClick={handleAddService}>
            <Plus className="mr-2 h-4 w-4" /> Thêm dịch vụ
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách dịch vụ</CardTitle>
          <CardDescription>Quản lý các dịch vụ chăm sóc khách hàng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm dịch vụ..."
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
                  <TableHead>Tên dịch vụ</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      Không tìm thấy dịch vụ nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedServices.map((service) => (
                    <TableRow key={service.idDichVu}>
                      <TableCell>{service.idDichVu}</TableCell>
                      <TableCell>{service.tenDichVu}</TableCell>
                      <TableCell className="max-w-[400px] truncate">{service.moTaDichVu}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditService(service)}
                            className="h-8 w-8 text-blue-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(service.idDichVu)}
                            className="h-8 w-8 text-red-600"
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
              Hiển thị {paginatedServices.length} / {filteredServices.length} dịch vụ
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

      <ServiceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        service={selectedService}
        onSave={handleSaveService}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa dịch vụ này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
