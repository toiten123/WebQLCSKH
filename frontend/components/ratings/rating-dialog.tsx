"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const BACKEND_URL = "http://localhost:5013";

export function RatingDialog({ open, onOpenChange, rating, onSave }) {
  const [formData, setFormData] = useState({
    id: "",
    customerId: "",
    customerName: "",
    serviceId: "",
    serviceName: "",
    DanhGia: 5,
    description: "",
    date: new Date().toLocaleDateString("vi-VN"),
  });

  const [errors, setErrors] = useState({
    customerId: false,
    serviceId: false,
    DanhGia: false,
  });

  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);

  const { toast } = useToast();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/khachhang/dropdown`);
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu khách hàng:", error);
      }
    };

    const fetchServices = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/dichvu/dropdown`);
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu dịch vụ:", error);
      }
    };

    fetchCustomers();
    fetchServices();
  }, []);

  useEffect(() => {
    if (rating && customers.length > 0 && services.length > 0) {
      const selectedCustomer = customers.find((c) => String(c.id) === String(rating.customerId));
      const selectedService = services.find((s) => String(s.id) === String(rating.serviceId));

      setFormData({
        ...rating,
        customerId: String(rating.customerId),
        customerName: selectedCustomer ? selectedCustomer.label.split("-")[1]?.trim() : "",
        serviceId: String(rating.serviceId),
        serviceName: selectedService ? selectedService.label : "",
        DanhGia: rating?.serviceRating || 5,
      });
    }

    if (!rating) {
      setFormData({
        id: "",
        customerId: "",
        customerName: "",
        serviceId: "",
        serviceName: "",
        DanhGia: 5,
        description: "",
        date: new Date().toLocaleDateString("vi-VN"),
      });
    }

    setErrors({ customerId: false, serviceId: false, DanhGia: false });
  }, [rating, customers, services]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    if (name === "customerId") {
      const customer = customers.find((c) => c.id === parseInt(value));
      setFormData((prev) => ({
        ...prev,
        customerId: value,
        customerName: customer ? customer.label.split("-")[1]?.trim() : "",
      }));
    } else if (name === "serviceId") {
      const service = services.find((s) => s.id === parseInt(value));
      setFormData((prev) => ({
        ...prev,
        serviceId: value,
        serviceName: service ? service.label : "",
      }));
    }
  };

  const handleRatingChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: Number.parseInt(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      customerId: !formData.customerId,
      serviceId: !formData.serviceId,
      DanhGia: formData.DanhGia < 1 || formData.DanhGia > 5,
    };

    setErrors(newErrors);

    if (newErrors.customerId || newErrors.serviceId || newErrors.DanhGia) {
      return;
    }

    const payload = {
      IDKhachHang: parseInt(formData.customerId),
      IDDichVu: parseInt(formData.serviceId),
      DanhGia: formData.DanhGia,
      MoTaDanhGia: formData.description,
    };

    try {
      let response;

      if (formData.id) {
        response = await fetch(`${BACKEND_URL}/api/danhgiadichvu/${formData.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...payload,
            IDDanhGia: formData.id,
          }),
        });

        if (!response.ok) throw new Error("Lỗi khi cập nhật đánh giá.");

        toast({
          title: "Thành công",
          description: "Cập nhật đánh giá thành công!",
          duration: 3000,
        });

        const updatedRating = {
          ...formData,
          serviceRating: formData.DanhGia,
        };

        onSave(updatedRating);
      } else {
        response = await fetch(`${BACKEND_URL}/api/danhgiadichvu`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Lỗi khi tạo đánh giá mới.");
        const result = await response.json();

        toast({
          title: "Thành công",
          description: "Đánh giá mới đã được tạo!",
          duration: 3000,
        });

        onSave({
          id: result.idDanhGia,
          customerId: result.idKhachHang,
          serviceId: result.idDichVu,
          customerName: formData.customerName,
          serviceName: formData.serviceName,
          serviceRating: result.danhGia,
          description: result.moTaDanhGia,
          date: new Date(result.ngayTao).toLocaleDateString("vi-VN"),
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi lưu đánh giá.",
        variant: "destructive",
      });
    }
  };

  const renderStarRating = (name, value) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleRatingChange(name, star)}
          className={`focus:outline-none ${
            star <= formData[name]
              ? "text-yellow-400 hover:text-yellow-500"
              : "text-gray-300 hover:text-gray-400"
          }`}
        >
          <Star className={`h-6 w-6 ${star <= formData[name] ? "fill-yellow-400" : ""}`} />
        </button>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{rating ? "Chỉnh sửa đánh giá" : "Thêm đánh giá mới"}</DialogTitle>
            <DialogDescription>Nhập thông tin đánh giá vào form bên dưới</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Khách hàng */}
            <div className="space-y-2">
              <Label htmlFor="customerId">Khách hàng</Label>
              <Select value={formData.customerId} onValueChange={(value) => handleSelectChange("customerId", value)}>
                <SelectTrigger>
                  <SelectValue
                    placeholder="Chọn khách hàng"
                    children={
                      customers.find((c) => String(c.id) === String(formData.customerId))?.label || "Chọn khách hàng"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={String(customer.id)}>
                      {customer.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.customerId && <p className="text-sm text-red-500">Vui lòng chọn khách hàng.</p>}
            </div>

            {/* Dịch vụ */}
            <div className="space-y-2">
              <Label htmlFor="serviceId">Dịch vụ</Label>
              <Select value={formData.serviceId} onValueChange={(value) => handleSelectChange("serviceId", value)}>
                <SelectTrigger>
                  <SelectValue
                    placeholder="Chọn dịch vụ"
                    children={
                      services.find((s) => String(s.id) === String(formData.serviceId))?.label || "Chọn dịch vụ"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={String(service.id)}>
                      {service.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.serviceId && <p className="text-sm text-red-500">Vui lòng chọn dịch vụ.</p>}
            </div>

            {/* Đánh giá sao */}
            <div className="space-y-2">
              <Label htmlFor="serviceRating">Đánh giá dịch vụ</Label>
              {renderStarRating("DanhGia", formData.DanhGia)}
              {errors.DanhGia && <p className="text-sm text-red-500">Vui lòng chọn số sao từ 1 đến 5.</p>}
            </div>

            {/* Mô tả */}
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description ?? ""}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Lưu</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
