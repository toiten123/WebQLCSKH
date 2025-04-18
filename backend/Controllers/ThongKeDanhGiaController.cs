using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Data;
using CRM.Models;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace CRM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ThongKeDanhGiaController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ThongKeDanhGiaController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("phan-tram")]
        public async Task<IActionResult> GetDanhGiaPhanTram()
        {
            var danhGiaDichVu = await _context.DanhGiaDichVus
                .GroupBy(d => d.DanhGia)
                .Select(g => new { DanhGia = g.Key, SoLuong = g.Count() })
                .ToListAsync();

            var lichSuLienLac = await _context.LichSuLienLacs
                .GroupBy(l => l.DanhGiaNhanVien)
                .Select(g => new { DanhGia = g.Key, SoLuong = g.Count() })
                .ToListAsync();

            var tongHop = new Dictionary<int, int>();

            void AddToTongHop(IEnumerable<dynamic> data)
            {
                foreach (var item in data)
                {
                    int key = item.DanhGia;
                    int value = item.SoLuong;

                    if (tongHop.ContainsKey(key))
                        tongHop[key] += value;
                    else
                        tongHop[key] = value;
                }
            }

            AddToTongHop(danhGiaDichVu);
            AddToTongHop(lichSuLienLac);

            int tongSoDanhGia = tongHop.Values.Sum();
            if (tongSoDanhGia == 0)
                return Ok(new Dictionary<string, double>()); // Tránh chia 0

            var result = new Dictionary<string, double>
            {
                ["Rất hài lòng"] = Math.Round((tongHop.GetValueOrDefault(5, 0) * 100.0) / tongSoDanhGia, 2),
                ["Hài lòng"] = Math.Round((tongHop.GetValueOrDefault(4, 0) * 100.0) / tongSoDanhGia, 2),
                ["Bình thường"] = Math.Round((tongHop.GetValueOrDefault(3, 0) * 100.0) / tongSoDanhGia, 2),
                ["Không hài lòng"] = Math.Round((tongHop.GetValueOrDefault(2, 0) * 100.0) / tongSoDanhGia, 2),
                ["Rất không hài lòng"] = Math.Round((tongHop.GetValueOrDefault(1, 0) * 100.0) / tongSoDanhGia, 2)
            };

            return Ok(result);
        }

        [HttpGet("thongke-danhgia-dichvu-nhanvien")]
        public async Task<IActionResult> GetThongKeDanhGiaDichVuNhanVien()
        {
            var danhGiaDichVu = await _context.DanhGiaDichVus
                .GroupBy(d => d.DanhGia)
                .Select(g => new { DanhGia = g.Key, SoLuong = g.Count() })
                .ToListAsync();

            var danhGiaNhanVien = await _context.LichSuLienLacs
                .GroupBy(l => l.DanhGiaNhanVien)
                .Select(g => new { DanhGia = g.Key, SoLuong = g.Count() })
                .ToListAsync();

            int[] GetPhanTram(IEnumerable<dynamic> data)
            {
                var tongSo = data.Sum(d => (int)d.SoLuong);
                if (tongSo == 0) return new int[5];

                var ketQua = new int[5];
                foreach (var item in data)
                {
                    int danhGia = item.DanhGia;
                    if (danhGia >= 1 && danhGia <= 5)
                    {
                        ketQua[danhGia - 1] = (int)Math.Round((item.SoLuong * 100.0) / tongSo);
                    }
                }
                return ketQua;
            }

            var phanTramDichVu = GetPhanTram(danhGiaDichVu);
            var phanTramNhanVien = GetPhanTram(danhGiaNhanVien);

            return Ok(new
            {
                DichVu = phanTramDichVu,
                NhanVien = phanTramNhanVien
            });
        }

    }
}