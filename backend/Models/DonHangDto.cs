public class DonHangDto
{
    public int IDDonHang { get; set; } // Tự tăng, backend xử lý

    public string? MaDonHang { get; set; } // Ví dụ: DH001, DH002, sinh tự động hoặc lấy theo quy tắc

    public int IDKhachHang { get; set; }

    public string? TenKhachHang { get; set; } // Từ bảng KhachHang

    public DateTime NgayMua { get; set; }

    public decimal TongTien { get; set; }

    public string TrangThai { get; set; } = string.Empty;
}
