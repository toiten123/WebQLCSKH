namespace CRM.DTOs
{
    public class KhachHangDto
    {
        public required string TenKhachHang { get; set; }
        public required string SoDienThoai { get; set; }
        public required string DiaChi { get; set; }
        public required string Email { get; set; }
        public DateTime NgayTao { get; set; }
    }
    public class ImportKhachHangRequest
    {
        public List<KhachHangDto> KhachHangDtos { get; set; }
    }
}
