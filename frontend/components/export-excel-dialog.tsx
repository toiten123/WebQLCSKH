"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface ExportExcelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: (columns: string[]) => void
  columns: { id: string; label: string }[]
}

export function ExportExcelDialog({ open, onOpenChange, onExport, columns }: ExportExcelDialogProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(columns.map((col) => col.id))

  const handleColumnToggle = (columnId: string) => {
    setSelectedColumns((prev) => (prev.includes(columnId) ? prev.filter((id) => id !== columnId) : [...prev, columnId]))
  }

  const handleSelectAll = () => {
    setSelectedColumns(columns.map((col) => col.id))
  }

  const handleDeselectAll = () => {
    setSelectedColumns([])
  }

  const handleExport = () => {
    if (selectedColumns.length === 0) {
      toast.error("Vui lòng chọn ít nhất một cột để xuất")
      return
    }
    onExport(selectedColumns)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xuất dữ liệu ra Excel</DialogTitle>
          <DialogDescription>Chọn các cột bạn muốn xuất ra file Excel</DialogDescription>
        </DialogHeader>
        <div className="flex justify-between mb-4">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            Chọn tất cả
          </Button>
          <Button variant="outline" size="sm" onClick={handleDeselectAll}>
            Bỏ chọn tất cả
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {columns.map((column) => (
            <div key={column.id} className="flex items-center space-x-2">
              <Checkbox
                id={column.id}
                checked={selectedColumns.includes(column.id)}
                onCheckedChange={() => handleColumnToggle(column.id)}
              />
              <Label htmlFor={column.id}>{column.label}</Label>
            </div>
          ))}
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleExport}>Xuất Excel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
