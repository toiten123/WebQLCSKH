namespace CRM.Dtos
{
    public class LichSuLienLacDto
    {
        public int IDLienLac { get; set; } // id tự tăng – sẽ được set tự động khi lưu vào DB

        public int IDKhachHang { get; set; }

        public string LoaiLienLac { get; set; } = null!;

        public DateTime NgayLienLac { get; set; }

        public int? DanhGiaNhanVien { get; set; }

        public string KetQua { get; set; } = null!;

        public string? MoTa { get; set; }
    }
}
