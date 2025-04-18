"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet, Upload, X, AlertCircle, Edit2, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ImportExcelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (previewData: any[]) => void
  entityName: string
}

interface ValidationError {
  field: string
  message: string
}

interface DataRow {
  tenKhachHang: string
  soDienThoai: string
  diaChi: string
  email: string
  ngayTao: string
  errors?: ValidationError[]
  isEditing?: boolean
  isDuplicate?: {
    phone?: boolean
    email?: boolean
  }
}

export function ImportExcelDialog({ open, onOpenChange, onImport, entityName }: ImportExcelDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [previewData, setPreviewData] = useState<DataRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("upload")
  const [editingRow, setEditingRow] = useState<number | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>("")
  const [hasValidationErrors, setHasValidationErrors] = useState(false)
  const [hasDuplicates, setHasDuplicates] = useState(false)
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Tự động xem trước khi có file mới
  useEffect(() => {
    if (file) {
      handlePreview()
    }
  }, [file])

  // Xử lý khi người dùng chọn file bằng input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setPreviewData([])
      setPreviewError(null)
      setHasDuplicates(false)
    }
  }

  // Xử lý kéo thả file
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      setPreviewData([])
      setPreviewError(null)
      setHasDuplicates(false)
    }
  }

  // Kiểm tra trùng lặp số điện thoại và email
  const checkDuplicate = async (soDienThoai: string, email: string, id: number | null = null) => {
    try {
      // Chỉ gọi API nếu có số điện thoại hoặc email
      if (!soDienThoai && !email) {
        return { isPhoneDuplicate: false, isEmailDuplicate: false }
      }

      const res = await fetch("http://localhost:5013/api/KhachHang/check-duplicate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          SoDienThoai: soDienThoai,
          Email: email,
          Id: id,
        }),
      })

      if (!res.ok) {
        throw new Error("Không thể kiểm tra trùng lặp.")
      }

      return await res.json()
    } catch (error) {
      console.error("Lỗi kiểm tra trùng lặp:", error)
      return { isPhoneDuplicate: false, isEmailDuplicate: false }
    }
  }

  // Kiểm tra trùng lặp cho tất cả dữ liệu
  const checkAllDuplicates = async (data: DataRow[]) => {
    setIsCheckingDuplicates(true)
    let hasAnyDuplicates = false
    const updatedData = [...data]

    // Kiểm tra trùng lặp trong dữ liệu đang nhập
    const phoneMap = new Map<string, number[]>()
    const emailMap = new Map<string, number[]>()

    // Bước 1: Xây dựng map để theo dõi số điện thoại và email trùng lặp trong dữ liệu đang nhập
    data.forEach((row, index) => {
      if (row.soDienThoai) {
        if (phoneMap.has(row.soDienThoai)) {
          phoneMap.get(row.soDienThoai)?.push(index)
        } else {
          phoneMap.set(row.soDienThoai, [index])
        }
      }

      if (row.email) {
        if (emailMap.has(row.email)) {
          emailMap.get(row.email)?.push(index)
        } else {
          emailMap.set(row.email, [index])
        }
      }
    })

    // Bước 2: Đánh dấu các dòng có số điện thoại hoặc email trùng lặp trong dữ liệu đang nhập
    for (const [phone, indices] of phoneMap.entries()) {
      if (indices.length > 1) {
        indices.forEach((index) => {
          updatedData[index].isDuplicate = {
            ...updatedData[index].isDuplicate,
            phone: true,
          }

          // Thêm lỗi vào mảng errors
          const errors = updatedData[index].errors || []
          if (!errors.some((e) => e.field === "soDienThoai" && e.message.includes("trùng lặp trong file"))) {
            errors.push({
              field: "soDienThoai",
              message: "Số điện thoại trùng lặp trong file",
            })
          }
          updatedData[index].errors = errors
          hasAnyDuplicates = true
        })
      }
    }

    for (const [email, indices] of emailMap.entries()) {
      if (indices.length > 1) {
        indices.forEach((index) => {
          updatedData[index].isDuplicate = {
            ...updatedData[index].isDuplicate,
            email: true,
          }

          // Thêm lỗi vào mảng errors
          const errors = updatedData[index].errors || []
          if (!errors.some((e) => e.field === "email" && e.message.includes("trùng lặp trong file"))) {
            errors.push({
              field: "email",
              message: "Email trùng lặp trong file",
            })
          }
          updatedData[index].errors = errors
          hasAnyDuplicates = true
        })
      }
    }

    // Bước 3: Kiểm tra trùng lặp với dữ liệu trong cơ sở dữ liệu
    // Tối ưu: Gom nhóm các yêu cầu kiểm tra trùng lặp thành một yêu cầu duy nhất
    const uniquePhones = new Set<string>()
    const uniqueEmails = new Set<string>()

    // Chỉ thu thập các số điện thoại và email duy nhất
    data.forEach((row) => {
      if (row.soDienThoai) uniquePhones.add(row.soDienThoai)
      if (row.email) uniqueEmails.add(row.email)
    })

    // Tạo mảng các promise để kiểm tra trùng lặp
    const checkPromises = []

    // Kiểm tra từng số điện thoại duy nhất
    for (const phone of uniquePhones) {
      checkPromises.push(checkDuplicate(phone, "").then((result) => ({ phone, result })))
    }

    // Kiểm tra từng email duy nhất
    for (const email of uniqueEmails) {
      checkPromises.push(checkDuplicate("", email).then((result) => ({ email, result })))
    }

    // Chờ tất cả các kiểm tra hoàn thành
    const results = await Promise.all(checkPromises)

    // Xử lý kết quả
    results.forEach((item) => {
      if ("phone" in item && item.result.isPhoneDuplicate) {
        // Tìm tất cả các dòng có số điện thoại này
        data.forEach((row, index) => {
          if (row.soDienThoai === item.phone) {
            updatedData[index].isDuplicate = {
              ...updatedData[index].isDuplicate,
              phone: true,
            }

            // Thêm lỗi vào mảng errors
            const errors = updatedData[index].errors || []
            if (!errors.some((e) => e.field === "soDienThoai" && e.message.includes("đã tồn tại"))) {
              errors.push({
                field: "soDienThoai",
                message: "Số điện thoại đã tồn tại trong hệ thống",
              })
            }
            updatedData[index].errors = errors
            hasAnyDuplicates = true
          }
        })
      }

      if ("email" in item && item.result.isEmailDuplicate) {
        // Tìm tất cả các dòng có email này
        data.forEach((row, index) => {
          if (row.email === item.email) {
            updatedData[index].isDuplicate = {
              ...updatedData[index].isDuplicate,
              email: true,
            }

            // Thêm lỗi vào mảng errors
            const errors = updatedData[index].errors || []
            if (!errors.some((e) => e.field === "email" && e.message.includes("đã tồn tại"))) {
              errors.push({
                field: "email",
                message: "Email đã tồn tại trong hệ thống",
              })
            }
            updatedData[index].errors = errors
            hasAnyDuplicates = true
          }
        })
      }
    })

    setPreviewData(updatedData)
    setHasDuplicates(hasAnyDuplicates)
    setIsCheckingDuplicates(false)

    // Cập nhật trạng thái lỗi tổng thể
    const hasErrors = updatedData.some((row) => row.errors && row.errors.length > 0)
    setHasValidationErrors(hasErrors)

    return hasAnyDuplicates
  }

  // Validate a single field
  const validateField = (field: string, value: string): ValidationError | null => {
    if (!value || value.trim() === "") {
      return { field, message: "Không được để trống" }
    }

    switch (field) {
      case "tenKhachHang":
        if (/\d/.test(value)) {
          return { field, message: "Tên không được chứa số" }
        }
        break
      case "email":
        if (!value.includes("@")) {
          return { field, message: "Email phải chứa @" }
        }
        break
      case "soDienThoai":
        if (!/^\d{10}$/.test(value)) {
          return { field, message: "Số điện thoại phải đủ 10 số" }
        }
        break
      case "ngayTao":
        if (!/^(\d{2})\/(\d{2})\/(\d{4})$/.test(value)) {
          return { field, message: "Ngày phải có định dạng dd/mm/yyyy" }
        } else {
          // Kiểm tra ngày tạo không được lớn hơn ngày hiện tại
          const [day, month, year] = value.split("/").map(Number)
          const inputDate = new Date(year, month - 1, day)
          const today = new Date()
          today.setHours(0, 0, 0, 0) // Đặt giờ về 00:00:00 để so sánh chỉ ngày

          if (inputDate > today) {
            return { field, message: "Ngày tạo không được lớn hơn ngày hiện tại" }
          }
        }
        break
    }
    return null
  }

  // Validate all data
  const validateData = (data: DataRow[]): DataRow[] => {
    let hasErrors = false

    const validatedData = data.map((row) => {
      const errors: ValidationError[] = []

      // Validate each field
      const fields: (keyof DataRow)[] = ["tenKhachHang", "soDienThoai", "email", "diaChi", "ngayTao"]

      fields.forEach((field) => {
        if (field !== "errors" && field !== "isEditing" && field !== "isDuplicate") {
          const error = validateField(field, row[field] as string)
          if (error) {
            errors.push(error)
            hasErrors = true
          }
        }
      })

      return { ...row, errors }
    })

    setHasValidationErrors(hasErrors)
    return validatedData
  }

  // Gửi file lên server để lấy dữ liệu xem trước
  const handlePreview = async () => {
    if (!file) return

    setIsLoading(true)
    setPreviewError(null)
    setHasDuplicates(false)

    try {
      if (entityName.toLowerCase() === "khachhang") {
        const formData = new FormData()
        formData.append("file", file)

        const previewResponse = await fetch("http://localhost:5013/api/KhachHang/import-preview", {
          method: "POST",
          body: formData,
        })

        if (!previewResponse.ok) {
          throw new Error("Lỗi xem trước file Excel.")
        }

        const data = await previewResponse.json()

        // Format dates to dd/mm/yyyy if they're not already
        const formattedData = data.map((row: any) => {
          let ngayTao = row.ngayTao

          // Nếu ngayTao là chuỗi ISO (từ API trả về)
          if (ngayTao && typeof ngayTao === "string") {
            if (ngayTao.includes("T") || ngayTao.includes("-")) {
              // Nếu là chuỗi ISO, chuyển sang dd/mm/yyyy
              const date = new Date(ngayTao)
              ngayTao = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`
            }
            // Nếu đã có dấu "/", đảm bảo giữ nguyên định dạng dd/mm/yyyy
            else if (ngayTao.includes("/")) {
              // Giữ nguyên định dạng, không chuyển đổi
              // Đây là trường hợp đọc trực tiếp từ Excel, đã đúng định dạng dd/mm/yyyy
            }
          }

          return { ...row, ngayTao }
        })

        // Validate the data
        const validatedData = validateData(formattedData)
        setPreviewData(validatedData)
        setActiveTab("preview")

        // Kiểm tra trùng lặp sau khi validate
        await checkAllDuplicates(validatedData)
      }
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : "Lỗi không xác định khi xem trước file")
      setActiveTab("upload")
    } finally {
      setIsLoading(false)
    }
  }

  // Xác nhận import dữ liệu
  const handleConfirmImport = async () => {
    if (previewData.length > 0) {
      if (hasValidationErrors) {
        alert("Vui lòng sửa các lỗi dữ liệu trước khi nhập")
        return
      }

      if (hasDuplicates) {
        const confirm = window.confirm("Có dữ liệu trùng lặp. Bạn có chắc chắn muốn tiếp tục nhập?")
        if (!confirm) return
      }

      try {
        setIsLoading(true)

        // Chuyển đổi định dạng ngày tháng từ dd/mm/yyyy sang ISO format
        const formattedData = previewData.map((row) => {
          // Convert dd/mm/yyyy to a proper ISO date string that C# can parse
          let ngayTao = row.ngayTao
          if (ngayTao && ngayTao.includes("/")) {
            const [day, month, year] = ngayTao.split("/")
            ngayTao = `${year}-${month}-${day}T00:00:00`
          }
          return {
            ...row,
            ngayTao,
          }
        })

        // Bọc dữ liệu trong đối tượng có trường khachHangDtos
        const response = await fetch("http://localhost:5013/api/KhachHang/import", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ khachHangDtos: formattedData }),
        })

        if (!response.ok) {
          throw new Error("Lỗi khi nhập dữ liệu.")
        }

        const result = await response.json()
        alert(result.message)
        onImport(previewData)

        setPreviewData([])
        setFile(null)
        setActiveTab("upload")
        onOpenChange(false)
      } catch (error) {
        alert(error instanceof Error ? error.message : "Có lỗi xảy ra.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Mở input để chọn file thủ công
  const handleSelectFile = () => {
    fileInputRef.current?.click()
  }

  // Hủy file hiện tại
  const handleCancelFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFile(null)
    setPreviewData([])
    setPreviewError(null)
    setHasDuplicates(false)
    setActiveTab("upload")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Giả lập tải file mẫu
  const handleDownloadTemplate = () => {
    const entityName = "KhachHang" // Đây là giá trị cần kiểm tra, có thể thay thế bằng giá trị thực tế

    // Kiểm tra điều kiện nếu entityName không phải là "KhachHang"
    if (`${entityName}` !== "KhachHang") {
      return // Dừng hàm nếu entityName không phải là "KhachHang"
    }

    // Gửi yêu cầu GET tới API để tải file mẫu
    fetch("http://localhost:5013/api/KhachHang/download-template")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Không thể tải file mẫu.")
        }
        return response.blob() // Chuyển phản hồi thành Blob
      })
      .then((blob) => {
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = "KhachHangTemplate.xlsx" // Đặt tên file cho tải xuống
        link.click() // Kích hoạt việc tải file
      })
      .catch((error) => {
        console.error("Lỗi khi tải file mẫu:", error)
      })
  }

  // Reset dialog khi đóng
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // Reset state khi đóng dialog
      setTimeout(() => {
        setFile(null)
        setPreviewData([])
        setPreviewError(null)
        setHasDuplicates(false)
        setActiveTab("upload")
      }, 300)
    }
    onOpenChange(open)
  }

  // Bắt đầu chỉnh sửa một ô
  const startEditing = (rowIndex: number, field: string, value: string) => {
    setEditingRow(rowIndex)
    setEditingField(field)
    setEditValue(value)
  }

  // Lưu giá trị đã chỉnh sửa
  const saveEdit = async () => {
    if (editingRow !== null && editingField !== null) {
      const updatedData = [...previewData]
      const oldValue = updatedData[editingRow][editingField as keyof DataRow] as string
      updatedData[editingRow] = {
        ...updatedData[editingRow],
        [editingField]: editValue,
      }

      // Validate the updated field
      const error = validateField(editingField, editValue)

      // Update the errors array for this row
      const currentErrors = updatedData[editingRow].errors || []
      const newErrors = currentErrors.filter((e) => e.field !== editingField)

      if (error) {
        newErrors.push(error)
      }

      // Nếu chỉnh sửa số điện thoại hoặc email, kiểm tra trùng lặp
      if (editingField === "soDienThoai" || editingField === "email") {
        // Xóa lỗi trùng lặp cũ nếu có
        const fieldErrorsToRemove = [
          `${editingField} trùng lặp trong file`,
          `${editingField} đã tồn tại trong hệ thống`,
        ]

        updatedData[editingRow].errors = newErrors.filter(
          (e) =>
            e.field !== editingField ||
            (!fieldErrorsToRemove.includes(e.message) &&
              !e.message.includes("trùng lặp") &&
              !e.message.includes("đã tồn tại")),
        )

        // Kiểm tra trùng lặp trong file
        const field = editingField === "soDienThoai" ? "soDienThoai" : "email"
        const duplicatesInFile = updatedData.filter(
          (row, idx) => idx !== editingRow && row[field as keyof DataRow] === editValue,
        )

        if (duplicatesInFile.length > 0) {
          updatedData[editingRow].isDuplicate = {
            ...updatedData[editingRow].isDuplicate,
            [editingField === "soDienThoai" ? "phone" : "email"]: true,
          }

          updatedData[editingRow].errors = [
            ...(updatedData[editingRow].errors || []),
            {
              field: editingField,
              message: `${editingField === "soDienThoai" ? "Số điện thoại" : "Email"} trùng lặp trong file`,
            },
          ]
        } else {
          // Xóa trạng thái trùng lặp nếu không còn trùng
          if (updatedData[editingRow].isDuplicate) {
            const newDuplicateState = { ...updatedData[editingRow].isDuplicate }
            if (editingField === "soDienThoai") {
              delete newDuplicateState.phone
            } else {
              delete newDuplicateState.email
            }
            updatedData[editingRow].isDuplicate =
              Object.keys(newDuplicateState).length > 0 ? newDuplicateState : undefined
          }
        }

        // Kiểm tra trùng lặp với cơ sở dữ liệu
        if (editValue !== oldValue) {
          try {
            const checkResult = await checkDuplicate(
              editingField === "soDienThoai" ? editValue : updatedData[editingRow].soDienThoai,
              editingField === "email" ? editValue : updatedData[editingRow].email,
            )

            if (
              (editingField === "soDienThoai" && checkResult.isPhoneDuplicate) ||
              (editingField === "email" && checkResult.isEmailDuplicate)
            ) {
              updatedData[editingRow].isDuplicate = {
                ...updatedData[editingRow].isDuplicate,
                [editingField === "soDienThoai" ? "phone" : "email"]: true,
              }

              updatedData[editingRow].errors = [
                ...(updatedData[editingRow].errors || []),
                {
                  field: editingField,
                  message: `${editingField === "soDienThoai" ? "Số điện thoại" : "Email"} đã tồn tại trong hệ thống`,
                },
              ]
            }
          } catch (error) {
            console.error("Lỗi kiểm tra trùng lặp:", error)
          }
        }
      }

      setPreviewData(updatedData)

      // Kiểm tra lại trạng thái lỗi và trùng lặp tổng thể
      const hasErrors = updatedData.some((row) => row.errors && row.errors.length > 0)
      setHasValidationErrors(hasErrors)

      const hasDuplicateData = updatedData.some((row) => row.isDuplicate)
      setHasDuplicates(hasDuplicateData)

      setEditingRow(null)
      setEditingField(null)
    }
  }

  // Kiểm tra xem một ô có lỗi không
  const hasFieldError = (rowIndex: number, field: string) => {
    const row = previewData[rowIndex]
    return row.errors?.some((error) => error.field === field) || false
  }

  // Lấy thông báo lỗi cho một ô
  const getFieldErrorMessage = (rowIndex: number, field: string) => {
    const row = previewData[rowIndex]
    const error = row.errors?.find((error) => error.field === field)
    return error ? error.message : ""
  }

  // Render cell content with validation and editing
  const renderCell = (rowIndex: number, field: string, value: string) => {
    const isEditing = editingRow === rowIndex && editingField === field
    const hasError = hasFieldError(rowIndex, field)
    const isDuplicate =
      field === "soDienThoai"
        ? previewData[rowIndex].isDuplicate?.phone
        : field === "email"
          ? previewData[rowIndex].isDuplicate?.email
          : false

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={`h-8 ${hasError ? "border-red-500" : ""}`}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit()
              if (e.key === "Escape") {
                setEditingRow(null)
                setEditingField(null)
              }
            }}
            onBlur={saveEdit}
          />
        </div>
      )
    }

    return (
      <div className="group flex items-center gap-2">
        <span className={`${hasError ? "text-red-500" : ""} ${isDuplicate ? "text-red-500 font-medium" : ""}`}>
          {value}
        </span>
        {hasError ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{getFieldErrorMessage(rowIndex, field)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : isDuplicate ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{field === "soDienThoai" ? "Số điện thoại đã tồn tại" : "Email đã tồn tại"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => startEditing(rowIndex, field, value)}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Tải lên file Excel chứa dữ liệu {entityName}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Tải lên file
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={previewData.length === 0} className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Dữ liệu xem trước
              {previewData.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {previewData.length}
                </Badge>
              )}
              {hasValidationErrors && (
                <Badge variant="destructive" className="ml-1">
                  Có lỗi
                </Badge>
              )}
              {hasDuplicates && !hasValidationErrors && (
                <Badge variant="outline" className="ml-1 border-red-500 text-red-500">
                  Trùng lặp
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="pt-4">
            <Button
              variant="outline"
              className="flex items-center gap-2 text-teal-600 border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950 w-fit mb-4"
              onClick={handleDownloadTemplate}
            >
              <Download className="h-4 w-4" /> Tải file mẫu
            </Button>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors ${
                isDragging
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-950/30"
                  : "border-gray-300 hover:border-teal-500 hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleSelectFile}
            >
              <FileSpreadsheet className="h-12 w-12 text-teal-600" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-teal-600">Kéo và thả file Excel tại đây</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Hoặc nhấp để chọn tệp từ máy tính</p>
              </div>
              <Button
                variant="outline"
                className="mt-2"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSelectFile()
                }}
              >
                Chọn tệp từ máy
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
              />
            </div>

            {/* Hiển thị tên file đã chọn */}
            {file && (
              <div className="flex items-center gap-2 p-3 mt-4 bg-teal-50 dark:bg-teal-950/30 rounded border border-teal-200 dark:border-teal-900">
                <FileSpreadsheet className="h-5 w-5 text-teal-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                  onClick={handleCancelFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center p-4 mt-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                <span className="ml-2 text-sm text-muted-foreground">Đang xử lý dữ liệu...</span>
              </div>
            )}

            {previewError && (
              <div className="p-3 mt-4 bg-red-50 text-red-600 border border-red-200 rounded-md flex items-start gap-2">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Lỗi xem trước</p>
                  <p className="text-sm">{previewError}</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="pt-4">
            {previewData.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">Dữ liệu xem trước</h3>
                    <span className="text-sm text-muted-foreground">
                      Hiển thị {previewData.length} bản ghi từ file {file?.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                    onClick={handleCancelFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {isCheckingDuplicates && (
                  <div className="flex items-center gap-2 p-2 mb-4 bg-blue-50 text-blue-700 rounded">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                    <span className="text-sm">Đang kiểm tra dữ liệu trùng lặp...</span>
                  </div>
                )}

                <div className="border rounded-md max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead className="w-[80px]">STT</TableHead>
                        <TableHead>TenKhachHang</TableHead>
                        <TableHead>SoDienThoai</TableHead>
                        <TableHead>DiaChi</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Ngày tạo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((row, idx) => (
                        <TableRow key={idx} className={row.errors && row.errors.length > 0 ? "bg-red-50/50" : ""}>
                          <TableCell className="font-medium">{idx + 1}</TableCell>
                          <TableCell>{renderCell(idx, "tenKhachHang", row.tenKhachHang)}</TableCell>
                          <TableCell>{renderCell(idx, "soDienThoai", row.soDienThoai)}</TableCell>
                          <TableCell className="max-w-[200px]">{renderCell(idx, "diaChi", row.diaChi)}</TableCell>
                          <TableCell>{renderCell(idx, "email", row.email)}</TableCell>
                          <TableCell>{renderCell(idx, "ngayTao", row.ngayTao)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Không có dữ liệu xem trước</h3>
                <p className="text-sm text-muted-foreground mt-2">Vui lòng tải lên file Excel để xem dữ liệu</p>
                <Button variant="outline" className="mt-4" onClick={() => setActiveTab("upload")}>
                  Quay lại tải lên
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between sm:justify-between mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirmImport}
            disabled={previewData.length === 0 || isLoading || hasValidationErrors}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Upload className="mr-2 h-4 w-4" /> Nhập dữ liệu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
