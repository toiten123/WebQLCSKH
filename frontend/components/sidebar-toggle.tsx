"use client"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarToggleProps {
  className?: string
  expanded: boolean
  onToggle: () => void
}

export function SidebarToggle({ className, expanded, onToggle }: SidebarToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className={cn(
        "hidden absolute right-[-12px] top-6 z-20 h-6 w-6 rounded-full border bg-background shadow-md",
        className,
      )}
      aria-label={expanded ? "Thu gọn sidebar" : "Mở rộng sidebar"}
    >
      {expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
    </Button>
  )
}

