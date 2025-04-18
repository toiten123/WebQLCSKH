using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;


namespace CRM.Models
{
    public class KhachHang
    {
        [Key]
        public int IDKhachHang { get; set; }

        [Required]
        public string MaKhachHang { get; set; } = null!;

        [Required]
        public string TenKhachHang { get; set; } = null!;

        [Required]
        public string SoDienThoai { get; set; } = null!;

        [Required]
        public string DiaChi { get; set; } = null!;

        [Required]
        public string Email { get; set; } = null!;

        public string? PhanLoai { get; set; }

        public DateTime NgayTao { get; set; } = DateTime.Now;

        public ICollection<DonHang>? DonHangs { get; set; }
        public ICollection<LichSuLienLac>? LichSuLienLacs { get; set; }
        public ICollection<DanhGiaDichVu>? DanhGiaDichVus { get; set; }
    }

    public class TaiKhoan
    {
        [Key]
        public int IDUser { get; set; }

        [Required]
        public string UserName { get; set; } = null!;

        [Required]
        public string? PassWord { get; set; } = null!;

        [Required]
        public string Role { get; set; } = null!;

        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }

        public DateTime Created { get; set; } = DateTime.Now;
    }

    public class DonHang
    {
        [Key]
        public int IDDonHang { get; set; }

        [Required]
        public int IDKhachHang { get; set; }

        [Required]
        public DateTime NgayMua { get; set; }

        [Required]
        public decimal TongTien { get; set; } = 0;

        [Required]
        public string TrangThai { get; set; } = null!;

        [ForeignKey("IDKhachHang")]
        public KhachHang? KhachHang { get; set; }

        public ICollection<ChiTietDonHang>? ChiTietDonHangs { get; set; }
        public ICollection<LichSuDonHang>? LichSuDonHangs { get; set; }
    }

    public class ChiTietDonHang
    {
        [Key]
        public int IDChiTietDonHang { get; set; }

        [Required]
        public int IDDonHang { get; set; }

        [Required]
        public string TenSanPham { get; set; } = null!;

        [Required]
        public int SoLuong { get; set; }

        [Required]
        public decimal GiaTien { get; set; }

        [ForeignKey("IDDonHang")]
        public DonHang? DonHang { get; set; }
    }

    public class LichSuDonHang
    {
        [Key]
        public int IDLichSuDonHang { get; set; }

        [Required]
        public int IDDonHang { get; set; }

        [Required]
        public string TrangThai { get; set; } = null!;

        public string? Note { get; set; }

        [Required]
        public DateTime NgayThayDoi { get; set; }

        [ForeignKey("IDDonHang")]
        public DonHang? DonHang { get; set; }
    }

    public class DichVu
    {
        [Key]
        public int IDDichVu { get; set; }

        [Required]
        public string TenDichVu { get; set; } = null!;

        [Required]
        public string MoTaDichVu { get; set; } = null!;

        [JsonIgnore]
        public ICollection<DanhGiaDichVu>? DanhGiaDichVus { get; set; }
    }

    public class DanhGiaDichVu
    {
        [Key]
        public int IDDanhGia { get; set; }

        [Required]
        public int IDKhachHang { get; set; }

        [Required]
        public int IDDichVu { get; set; }

        [Required]
        [Range(1, 5)]
        public int DanhGia { get; set; }

        public string? MoTaDanhGia { get; set; }

        public DateTime NgayTao { get; set; } = DateTime.Now;

        [ForeignKey("IDKhachHang")]
        public KhachHang? KhachHang { get; set; }

        [ForeignKey("IDDichVu")]
        public DichVu? DichVu { get; set; }
    }

    public class LichSuLienLac
    {
        [Key]
        public int IDLienLac { get; set; }

        [Required]
        public int IDKhachHang { get; set; }

        [Required]
        public string LoaiLienLac { get; set; } = null!;

        [Required]
        public DateTime NgayLienLac { get; set; }

        [Range(1, 5)]
        public int? DanhGiaNhanVien { get; set; }

        [Required]
        public string KetQua { get; set; } = null!;

        public string? MoTa { get; set; }

        [ForeignKey("IDKhachHang")]
        public KhachHang? KhachHang { get; set; }
    }
}
