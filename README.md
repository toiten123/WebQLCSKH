# Hệ thống CRM - Quản lý Khách hàng

Hệ thống quản lý dịch vụ chăm sóc khách hàng cho cửa hàng điện thoại.

## Tính năng

- Quản lý khách hàng (thêm, sửa, xóa, tìm kiếm)
- Phân loại khách hàng (VIP, Tiềm năng, Mới, Cũ)
- Quản lý đơn hàng
- Quản lý dịch vụ
- Theo dõi lịch sử liên lạc
- Đánh giá dịch vụ và nhân viên
- Dashboard với biểu đồ thống kê

## Cài đặt

```bash
# Clone repository
https://github.com/toiten123/WebQLCSKH.git

#Chạy sql
khởi chạy sql trong file tên SQL-CRM.sql

#Chọn vào thư mục backend
cd backend

#run backend
dotnet watch run

# Di chuyển vào thư mục dự án
cd frontend

# Cài đặt dependencies
npm install

# Chạy ứng dụng ở môi trường development
npm run dev

