-- Tạo database CRM
CREATE DATABASE crm;
GO

USE crm;
GO

-- ============================
-- BẢNG KHÁCH HÀNG
-- ============================
CREATE TABLE KhachHang (
    IDKhachHang INT IDENTITY(1,1) PRIMARY KEY,         -- Khóa chính, tự tăng, định danh khách hàng
    MaKhachHang NVARCHAR(50) NOT NULL,                 -- Mã khách hàng do hệ thống định nghĩa là KH001,KH002,...
    TenKhachHang NVARCHAR(150) NOT NULL,               -- Tên đầy đủ của khách hàng
    SoDienThoai NVARCHAR(50) NOT NULL,                 -- Số điện thoại liên lạc của khách
    DiaChi NVARCHAR(255) NOT NULL,                         -- Địa chỉ nhà của khách
    Email NVARCHAR(100) NOT NULL,                          -- Email cá nhân của khách
    PhanLoai NVARCHAR(50) NULL,                        -- Phân loại khách (Vip, Tiềm năng, Mới, Cũ)
    NgayTao DATETIME NOT NULL DEFAULT GETDATE()        -- Thời điểm tạo khách hàng
);
GO

CREATE TABLE AutoNumber (
    TableName NVARCHAR(50) PRIMARY KEY,
    LastNumber INT NOT NULL
)
INSERT INTO AutoNumber (TableName, LastNumber)
VALUES ('KhachHang', 0)


-- ============================
-- BẢNG TÀI KHOẢN NGƯỜI DÙNG
-- ============================
CREATE TABLE TaiKhoan (
    IDUser INT IDENTITY(1,1) PRIMARY KEY,              -- Khóa chính, ID người dùng
    UserName NVARCHAR(50) NOT NULL UNIQUE,             -- Tên đăng nhập, không được trùng lặp
    PassWord NVARCHAR(255) NOT NULL,                   -- Mật khẩu (được hash trước khi lưu)
    Role NVARCHAR(20) NOT NULL,                        -- Vai trò của người dùng (admin, employee)
    Email NVARCHAR(100) NULL,                          -- Email cá nhân của người dùng
    PhoneNumber NVARCHAR(50) NULL,                     -- Số điện thoại liên hệ
    Created DATETIME NOT NULL DEFAULT GETDATE()        -- Ngày tạo tài khoản
);
GO
INSERT [dbo].[TaiKhoan] ([UserName], [PassWord], [Role], [Email], [PhoneNumber], [Created]) VALUES (N'1', N'$2a$11$0nHTq4U6oVM/h6zLyayTjembJYHuzX.blC1NwQ68nwYVj7wUWDd/K', N'admin', N'1@gmail.com', N'0141781278', CAST(N'2025-04-08T15:34:04.030' AS DateTime))

-- ============================
-- BẢNG ĐƠN HÀNG
-- ============================
CREATE TABLE DonHang (
    IDDonHang INT IDENTITY(1,1) PRIMARY KEY,           -- Mã đơn hàng tự tăng
    IDKhachHang INT NOT NULL,                          -- Khách hàng thực hiện đơn hàng
    NgayMua DATETIME NOT NULL,                         -- Ngày mua hàng
    TongTien DECIMAL(18, 2) NOT NULL DEFAULT 0,        -- Tổng số tiền của đơn, mặc định là 0 nếu không nhập
    TrangThai NVARCHAR(50) NOT NULL,                   -- Trạng thái (Đang xử lý, Thành công, ...)
    CONSTRAINT FK_DonHang_KhachHang FOREIGN KEY (IDKhachHang)
        REFERENCES KhachHang(IDKhachHang)
        ON DELETE CASCADE                              -- Xóa khách sẽ xóa đơn hàng theo
);
GO


-- ============================
-- BẢNG CHI TIẾT ĐƠN HÀNG
-- ============================
CREATE TABLE ChiTietDonHang (
    IDChiTietDonHang INT IDENTITY(1,1) PRIMARY KEY,    -- ID chi tiết đơn hàng
    IDDonHang INT NOT NULL,                            -- Liên kết với đơn hàng
    TenSanPham NVARCHAR(150) NOT NULL,                 -- Tên sản phẩm trong đơn
    SoLuong INT NOT NULL,                              -- Số lượng sản phẩm
    GiaTien DECIMAL(18, 2) NOT NULL,                   -- Giá tiền cho 1 đơn vị sản phẩm
    CONSTRAINT FK_ChiTietDonHang_DonHang FOREIGN KEY (IDDonHang)
        REFERENCES DonHang(IDDonHang)
        ON DELETE CASCADE                              -- Xóa đơn hàng sẽ xóa chi tiết đi theo
);
GO

-- ============================
-- BẢNG LỊCH SỬ ĐƠN HÀNG
-- ============================
CREATE TABLE LichSuDonHang (
    IDLichSuDonHang INT IDENTITY(1,1) PRIMARY KEY,     -- Mã lịch sử đơn hàng
    IDDonHang INT NOT NULL,                            -- Liên kết với đơn hàng
    TrangThai NVARCHAR(50) NOT NULL,                   -- Trạng thái tại thời điểm (VD: Thành công)
    Note NVARCHAR(255) NULL,                           -- Ghi chú thêm cho đơn hàng
    NgayThayDoi DATETIME NOT NULL,                     -- Ngày cập nhật trạng thái
    CONSTRAINT FK_LichSuDonHang_DonHang FOREIGN KEY (IDDonHang)
        REFERENCES DonHang(IDDonHang)
        ON DELETE CASCADE
);
GO

-- ============================
-- BẢNG DỊCH VỤ
-- ============================
CREATE TABLE DichVu (
    IDDichVu INT IDENTITY(1,1) PRIMARY KEY,            -- ID dịch vụ
    TenDichVu NVARCHAR(150) NOT NULL,                  -- Tên dịch vụ cung cấp
    MoTaDichVu NVARCHAR(255) NOT NULL                      -- Mô tả nội dung dịch vụ
);
GO

-- ============================
-- BẢNG ĐÁNH GIÁ DỊCH VỤ
-- ============================
CREATE TABLE DanhGiaDichVu (
    IDDanhGia INT IDENTITY(1,1) PRIMARY KEY,           -- Mã đánh giá
    IDKhachHang INT NOT NULL,                          -- Ai đánh giá
    IDDichVu INT NOT NULL,                             -- Dịch vụ nào được đánh giá
    DanhGia INT NOT NULL CHECK (DanhGia BETWEEN 1 AND 5), -- Đánh giá từ 1 - 5 sao
    MoTaDanhGia NVARCHAR(255) NULL,                    -- Ghi chú thêm
    NgayTao DATETIME NOT NULL DEFAULT GETDATE(),       -- Thời gian đánh giá
    CONSTRAINT FK_DanhGiaDichVu_KhachHang FOREIGN KEY (IDKhachHang)
        REFERENCES KhachHang(IDKhachHang)
        ON DELETE CASCADE,
    CONSTRAINT FK_DanhGiaDichVu_DichVu FOREIGN KEY (IDDichVu)
        REFERENCES DichVu(IDDichVu)
        ON DELETE CASCADE
);
GO

-- ============================
-- BẢNG LỊCH SỬ LIÊN LẠC
-- ============================
CREATE TABLE LichSuLienLac (
    IDLienLac INT IDENTITY(1,1) PRIMARY KEY,           -- Mã lịch sử liên lạc
    IDKhachHang INT NOT NULL,                          -- Khách hàng liên lạc
    LoaiLienLac NVARCHAR(50) NOT NULL,                 -- Gọi / Chat / Email
    NgayLienLac DATETIME NOT NULL,                     -- Ngày thực hiện liên lạc
    DanhGiaNhanVien INT NULL CHECK (DanhGiaNhanVien BETWEEN 1 AND 5), -- 1-5 sao
    KetQua NVARCHAR(50) NOT NULL,                      -- Thành công / Không thành công
    MoTa NVARCHAR(255) NULL,                           -- Lý do thành công / không thành công (mô tả chi tiết)
    CONSTRAINT FK_LichSuLienLac_KhachHang FOREIGN KEY (IDKhachHang)
        REFERENCES KhachHang(IDKhachHang)
        ON DELETE CASCADE
);
GO

-- Hàm xóa id tự tăng :
-- DBCC CHECKIDENT ('KhachHang', RESEED, 0);
-- Chèn dữ liệu vào bảng DonHang
INSERT INTO DonHang (IDKhachHang, NgayMua, TongTien, TrangThai) VALUES
(5, '2024-03-10', 42000000.00, N'Thành công'),
(18, '2024-08-22', 98000000.00, N'Thành công'),
(37, '2024-02-15', 135000000.00, N'Đang xử lý'),
(2, '2024-01-28', 31000000.00, N'Thành công'),
(50, '2024-05-05', 76000000.00, N'Thành công'),
(29, '2024-07-25', 88000000.00, N'Thành công'),
(41, '2024-06-30', 145000000.00, N'Đang xử lý'),
(14, '2024-09-15', 39000000.00, N'Thành công'),
(55, '2024-04-08', 105000000.00, N'Thành công'),
(3, '2024-02-20', 48000000.00, N'Thành công'),
(22, '2024-03-05', 72000000.00, N'Đang xử lý'),
(36, '2024-03-05', 115000000.00, N'Thành công'),
(48, '2024-01-31', 33000000.00, N'Thành công'),
(19, '2024-05-18', 95000000.00, N'Thành công'),
(7, '2024-03-03', 55000000.00, N'Thành công'),
(25, '2024-07-20', 68000000.00, N'Đang xử lý'),
(42, '2024-09-09', 89000000.00, N'Thành công'),
(11, '2024-02-12', 124000000.00, N'Thành công'),
(33, '2024-05-25', 37000000.00, N'Thành công'),
(45, '2024-01-01', 140000000.00, N'Thành công');
-- Chèn dữ liệu vào bảng DichVu
INSERT INTO DichVu (TenDichVu, MoTaDichVu) VALUES
(N'Tư vấn sản phẩm', N'Giúp khách hàng chọn điện thoại phù hợp với nhu cầu và ngân sách. Cung cấp thông tin chi tiết về sản phẩm, tính năng và so sánh các mẫu.'),
(N'Hỗ trợ kỹ thuật qua điện thoại', N'Cung cấp hỗ trợ từ xa cho khách hàng gặp vấn đề với điện thoại, từ lỗi phần mềm đến sự cố phần cứng nhẹ.'),
(N'Bảo hành và sửa chữa', N'Đảm bảo khách hàng được sửa chữa hoặc thay thế điện thoại trong thời gian bảo hành nếu xảy ra sự cố.'),
(N'Đổi trả sản phẩm', N'Cho phép khách hàng đổi hoặc trả lại điện thoại trong thời gian quy định nếu sản phẩm không đáp ứng mong đợi.'),
(N'Hỗ trợ khách hàng VIP', N'Dành riêng cho khách hàng thân thiết, mang đến các đặc quyền như hỗ trợ ưu tiên, tư vấn cá nhân hóa, bảo hành mở rộng.'),
(N'Chương trình khuyến mãi và ưu đãi', N'Quản lý và thông báo các chương trình giảm giá, quà tặng kèm hoặc ưu đãi đặc biệt cho khách hàng.'),
(N'Hỗ trợ sau bán hàng', N'Hỗ trợ khách hàng sau khi mua hàng bằng cách theo dõi đơn hàng, giải đáp thắc mắc và hướng dẫn sử dụng sản phẩm.'),
(N'Đào tạo sử dụng sản phẩm', N'Cung cấp hướng dẫn sử dụng điện thoại qua các lớp học trực tuyến, video hoặc tài liệu chi tiết.'),
(N'Phản hồi và đánh giá', N'Thu thập ý kiến khách hàng thông qua khảo sát, đánh giá sao hoặc nhận xét để cải thiện chất lượng dịch vụ.'),
(N'Hỗ trợ tài chính và trả góp', N'Hỗ trợ khách hàng mua điện thoại qua hình thức trả góp hoặc vay tài chính với lãi suất ưu đãi.');
GO
INSERT INTO DanhGiaDichVu (IDKhachHang, IDDichVu, DanhGia, MoTaDanhGia, NgayTao) VALUES
(1, 5, 4, N'Dịch vụ tốt', '2025-03-01'),
(2, 8, 5, N'Rất hài lòng', '2025-03-02'),
(3, 2, 3, NULL, '2025-03-03'),
(4, 7, 4, N'Khá tốt', '2025-03-04'),
(5, 1, 2, N'Chưa hài lòng', '2025-03-05'),
(6, 10, 5, N'Tuyệt vời', '2025-03-06'),
(7, 3, 4, NULL, '2025-03-07'),
(8, 6, 3, N'Bình thường', '2025-03-08'),
(9, 4, 5, N'Xuất sắc', '2025-03-09'),
(10, 9, 1, N'Rất tệ', '2025-03-10'),
(11, 2, 4, N'Hài lòng', '2025-03-11'),
(12, 5, 5, NULL, '2025-03-12'),
(13, 7, 3, N'Cần cải thiện', '2025-03-13'),
(14, 1, 4, N'Tốt', '2025-03-14'),
(15, 8, 5, N'Hoàn hảo', '2025-03-15'),
(16, 3, 2, N'Không tốt', '2025-03-16'),
(17, 6, 4, NULL, '2025-03-17'),
(18, 9, 5, N'Rất tốt', '2025-03-18'),
(19, 4, 3, N'Chấp nhận được', '2025-03-19'),
(20, 10, 4, N'Khá hài lòng', '2025-03-20'),
(21, 2, 5, N'Đáng khen', '2025-03-21'),
(22, 5, 1, N'Không hài lòng', '2025-03-22'),
(23, 7, 4, NULL, '2025-03-23'),
(24, 1, 3, N'Bình thường', '2025-03-24'),
(25, 8, 5, N'Tuyệt vời', '2025-03-25'),
(26, 3, 2, N'Cần cải thiện', '2025-03-26'),
(27, 6, 4, N'Hài lòng', '2025-03-27'),
(28, 9, 5, NULL, '2025-03-28'),
(29, 4, 3, N'Chưa tốt', '2025-03-29'),
(30, 10, 4, N'Tốt', '2025-03-30'),
(31, 2, 5, N'Xuất sắc', '2025-03-31'),
(32, 5, 1, N'Rất tệ', '2025-04-01'),
(33, 7, 4, NULL, '2025-04-02'),
(34, 1, 3, N'Bình thường', '2025-04-03'),
(35, 8, 5, N'Rất hài lòng', '2025-04-04'),
(36, 3, 2, N'Không tốt', '2025-04-05'),
(37, 6, 4, N'Khá tốt', '2025-04-06'),
(38, 9, 5, N'Tuyệt vời', '2025-04-07'),
(39, 4, 3, NULL, '2025-04-08'),
(40, 10, 4, N'Hài lòng', '2025-04-09'),
(41, 2, 5, N'Hoàn hảo', '2025-04-10'),
(42, 5, 1, N'Chưa hài lòng', '2025-04-11'),
(43, 7, 4, N'Tốt', '2025-04-12'),
(44, 1, 3, N'Cần cải thiện', '2025-04-13'),
(45, 8, 5, NULL, '2025-04-14'),
(46, 3, 2, N'Không hài lòng', '2025-04-15'),
(47, 6, 4, N'Khá hài lòng', '2025-04-16'),
(48, 9, 5, N'Đáng khen', '2025-04-17'),
(49, 4, 3, N'Bình thường', '2025-04-18'),
(50, 10, 4, NULL, '2025-04-18'),
(51, 2, 5, N'Tuyệt vời', '2025-04-18'),
(52, 5, 1, N'Rất tệ', '2025-04-18'),
(53, 7, 4, N'Hài lòng', '2025-04-18'),
(54, 1, 3, N'Chấp nhận được', '2025-04-18'),
(55, 8, 5, N'Xuất sắc', '2025-04-18');
-- Chèn 55 bản ghi với NgayLienLac trong khoảng 01/03/2025 - 17/04/2025
INSERT INTO LichSuLienLac (IDKhachHang, LoaiLienLac, NgayLienLac, DanhGiaNhanVien, KetQua, MoTa)
VALUES
(1, N'Gọi điện', '2025-03-01 09:30:00', 4, N'Thành công', N'Khách hàng hài lòng với tư vấn về điện thoại mới'),
(2, N'Chat', '2025-03-02 14:15:00', 3, N'Thành công', N'Giải quyết thắc mắc về bảo hành sản phẩm'),
(3, N'Email', '2025-03-03 10:00:00', 3, N'Không thành công', N'Khách hàng không phản hồi email'),
(4, N'Gọi điện', '2025-03-04 16:45:00', 5, N'Thành công', N'Khách hàng đồng ý mua điện thoại mới'),
(5, N'Chat', '2025-03-05 11:20:00', 2, N'Không thành công', N'Khách hàng không quan tâm đến ưu đãi'),
(6, N'Email', '2025-03-06 13:10:00', 4, N'Thành công', N'Khách hàng phản hồi tích cực về dịch vụ'),
(7, N'Gọi điện', '2025-03-07 15:00:00', 3, N'Không thành công', N'Khách hàng không nghe máy'),
(8, N'Chat', '2025-03-08 09:45:00', 3, N'Thành công', N'Hỗ trợ khách hàng cài đặt ứng dụng PCS CRM'),
(9, N'Email', '2025-03-09 17:30:00', 1, N'Không thành công', N'Khách hàng từ chối nhận thông tin'),
(10, N'Gọi điện', '2025-03-10 10:15:00', 5, N'Thành công', N'Khách hàng đánh giá cao thái độ nhân viên'),
(11, N'Chat', '2025-03-11 12:00:00', 4, N'Thành công', N'Giải quyết vấn đề màn hình điện thoại'),
(12, N'Email', '2025-03-12 14:20:00', 3, N'Không thành công', N'Email bị trả lại do địa chỉ không hợp lệ'),
(13, N'Gọi điện', '2025-03-13 08:50:00', 3, N'Thành công', N'Khách hàng hài lòng với thông tin khuyến mãi'),
(14, N'Chat', '2025-03-14 16:10:00', 2, N'Không thành công', N'Khách hàng không đồng ý với chính sách đổi trả'),
(15, N'Email', '2025-03-15 11:35:00', 5, N'Thành công', N'Khách hàng cảm ơn vì hỗ trợ nhanh chóng'),
(16, N'Gọi điện', '2025-03-16 13:25:00', 3, N'Không thành công', N'Khách hàng từ chối nhận cuộc gọi'),
(17, N'Chat', '2025-03-17 15:40:00', 4, N'Thành công', N'Hỗ trợ khách hàng chọn phụ kiện điện thoại'),
(18, N'Email', '2025-03-18 09:10:00', 3, N'Thành công', N'Khách hàng phản hồi tích cực về hướng dẫn sử dụng'),
(19, N'Gọi điện', '2025-03-19 17:00:00', 1, N'Không thành công', N'Khách hàng không hài lòng với thời gian chờ'),
(20, N'Chat', '2025-03-20 10:45:00', 5, N'Thành công', N'Khách hàng khen ngợi sự nhiệt tình của nhân viên'),
(21, N'Email', '2025-03-21 12:30:00', 3, N'Không thành công', N'Khách hàng không đọc email phản hồi'),
(22, N'Gọi điện', '2025-03-22 14:50:00', 4, N'Thành công', N'Khách hàng đồng ý gia hạn bảo hành'),
(23, N'Chat', '2025-03-23 16:15:00', 2, N'Không thành công', N'Khách hàng không quan tâm đến sản phẩm mới'),
(24, N'Email', '2025-03-24 08:30:00', 3, N'Thành công', N'Khách hàng hài lòng với thông tin giá cả'),
(25, N'Gọi điện', '2025-03-25 11:10:00', 5, N'Thành công', N'Khách hàng đánh giá cao dịch vụ sau bán hàng'),
(26, N'Chat', '2025-03-26 13:40:00', 3, N'Không thành công', N'Khách hàng thoát chat giữa chừng'),
(27, N'Email', '2025-03-27 15:20:00', 4, N'Thành công', N'Khách hàng đồng ý tham gia khảo sát PCS CRM'),
(28, N'Gọi điện', '2025-03-28 09:00:00', 3, N'Thành công', N'Hỗ trợ khách hàng khắc phục lỗi phần mềm'),
(29, N'Chat', '2025-03-29 17:25:00', 1, N'Không thành công', N'Khách hàng phàn nàn về tốc độ phản hồi'),
(30, N'Email', '2025-03-30 10:55:00', 5, N'Thành công', N'Khách hàng cảm ơn vì giải thích chi tiết'),
(31, N'Gọi điện', '2025-03-31 12:15:00', 3, N'Không thành công', N'Khách hàng không nghe máy'),
(32, N'Chat', '2025-04-01 14:35:00', 4, N'Thành công', N'Khách hàng hài lòng với tư vấn kỹ thuật'),
(33, N'Email', '2025-04-02 16:00:00', 2, N'Không thành công', N'Khách hàng không đồng ý với giá sửa chữa'),
(34, N'Gọi điện', '2025-04-03 08:20:00', 3, N'Thành công', N'Khách hàng đồng ý nâng cấp điện thoại'),
(35, N'Chat', '2025-04-04 11:50:00', 5, N'Thành công', N'Hỗ trợ khách hàng kích hoạt bảo hành online'),
(36, N'Email', '2025-04-05 13:10:00', 3, N'Không thành công', N'Khách hàng không phản hồi email'),
(37, N'Gọi điện', '2025-04-06 15:30:00', 4, N'Thành công', N'Khách hàng khen ngợi sự chuyên nghiệp'),
(38, N'Chat', '2025-04-07 09:45:00', 3, N'Thành công', N'Giải đáp thắc mắc về phụ kiện điện thoại'),
(39, N'Email', '2025-04-08 17:15:00', 1, N'Không thành công', N'Khách hàng từ chối nhận thông báo'),
(40, N'Gọi điện', '2025-04-09 10:25:00', 5, N'Thành công', N'Khách hàng hài lòng với dịch vụ giao hàng'),
(41, N'Chat', '2025-04-10 12:40:00', 3, N'Không thành công', N'Khách hàng không phản hồi trong chat'),
(42, N'Email', '2025-04-11 14:00:00', 4, N'Thành công', N'Khách hàng đồng ý tham gia chương trình ưu đãi'),
(43, N'Gọi điện', '2025-04-12 16:20:00', 2, N'Không thành công', N'Khách hàng không hài lòng với thời gian giao'),
(44, N'Chat', '2025-04-13 08:55:00', 3, N'Thành công', N'Hỗ trợ khách hàng kiểm tra tình trạng đơn hàng'),
(45, N'Email', '2025-04-14 11:30:00', 5, N'Thành công', N'Khách hàng cảm ơn vì hỗ trợ kịp thời'),
(46, N'Gọi điện', '2025-04-15 13:50:00', 3, N'Không thành công', N'Khách hàng không nghe máy'),
(47, N'Chat', '2025-04-16 15:10:00', 4, N'Thành công', N'Giải quyết vấn đề kết nối điện thoại'),
(48, N'Email', '2025-04-17 09:35:00', 3, N'Thành công', N'Khách hàng hài lòng với hướng dẫn bảo trì'),
(49, N'Gọi điện', '2025-04-01 17:00:00', 1, N'Không thành công', N'Khách hàng từ chối nghe tư vấn'),
(50, N'Chat', '2025-04-02 10:15:00', 5, N'Thành công', N'Khách hàng khen ngợi sự nhanh nhẹn của nhân viên'),
(51, N'Email', '2025-04-03 12:25:00', 3, N'Không thành công', N'Khách hàng không phản hồi email'),
(52, N'Gọi điện', '2025-04-04 14:45:00', 4, N'Thành công', N'Khách hàng đồng ý mua thêm phụ kiện'),
(53, N'Chat', '2025-04-05 16:05:00', 2, N'Không thành công', N'Khách hàng không quan tâm đến khuyến mãi'),
(54, N'Email', '2025-04-06 08:40:00', 3, N'Thành công', N'Khách hàng hài lòng với thông tin sản phẩm'),
(55, N'Gọi điện', '2025-04-07 11:00:00', 5, N'Thành công', N'Khách hàng đánh giá cao chất lượng hỗ trợ');
