namespace CRM.Models.Dtos
{
    public class DanhGiaDichVuDto
    {
        public int? IDDanhGia { get; set; } // nullable để tái sử dụng cho cả create/update
        public int IDKhachHang { get; set; }
        public int IDDichVu { get; set; }
        public int DanhGia { get; set; }
        public string? MoTaDanhGia { get; set; }
        public DateTime? NgayTao { get; set; } // optional cho hiển thị nếu cần

    }
}
