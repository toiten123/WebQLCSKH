using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Data;
using CRM.Models;

namespace CRM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DonHangController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DonHangController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/DonHang
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DonHangDto>>> GetAll()
        {
            var donHangs = await _context.DonHangs
                .Include(d => d.KhachHang)
                .ToListAsync();

            var result = donHangs.Select(d => new DonHangDto
            {
                IDDonHang = d.IDDonHang,
                MaDonHang = "DH" + d.IDDonHang.ToString("D3"),
                IDKhachHang = d.IDKhachHang,
                TenKhachHang = d.KhachHang != null ? d.KhachHang.TenKhachHang : "",
                NgayMua = d.NgayMua,
                TongTien = d.TongTien,
                TrangThai = d.TrangThai
            });

            return Ok(result);
        }

        // GET: api/DonHang/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DonHangDto>> GetById(int id)
        {
            var d = await _context.DonHangs
                .Include(x => x.KhachHang)
                .FirstOrDefaultAsync(x => x.IDDonHang == id);

            if (d == null) return NotFound();

            var dto = new DonHangDto
            {
                IDDonHang = d.IDDonHang,
                MaDonHang = "DH" + d.IDDonHang.ToString("D3"),
                IDKhachHang = d.IDKhachHang,
                TenKhachHang = d.KhachHang?.TenKhachHang ?? "",
                NgayMua = d.NgayMua,
                TongTien = d.TongTien,
                TrangThai = d.TrangThai
            };

            return Ok(dto);
        }

        // POST: api/DonHang
        [HttpPost]
        public async Task<ActionResult<DonHangDto>> Create(DonHangDto dto)
        {
            var entity = new DonHang
            {
                IDKhachHang = dto.IDKhachHang,
                NgayMua = dto.NgayMua,
                TongTien = dto.TongTien,
                TrangThai = dto.TrangThai
            };

            _context.DonHangs.Add(entity);
            await _context.SaveChangesAsync();

            // Cập nhật phân loại khách hàng
            await UpdateCustomerClassification(entity.IDKhachHang);

            var khachHang = await _context.KhachHangs.FindAsync(entity.IDKhachHang);

            var result = new DonHangDto
            {
                IDDonHang = entity.IDDonHang,
                MaDonHang = "DH" + entity.IDDonHang.ToString("D3"),
                IDKhachHang = entity.IDKhachHang,
                TenKhachHang = khachHang?.TenKhachHang ?? "",
                NgayMua = entity.NgayMua,
                TongTien = entity.TongTien,
                TrangThai = entity.TrangThai
            };

            return CreatedAtAction(nameof(GetById), new { id = entity.IDDonHang }, result);
        }

        // PUT: api/DonHang/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, DonHangDto dto)
        {
            if (id != dto.IDDonHang)
                return BadRequest();

            var entity = await _context.DonHangs.FindAsync(id);
            if (entity == null)
                return NotFound();

            entity.IDKhachHang = dto.IDKhachHang;
            entity.NgayMua = dto.NgayMua;
            entity.TongTien = dto.TongTien;
            entity.TrangThai = dto.TrangThai;

            await _context.SaveChangesAsync();

            // Cập nhật phân loại khách hàng
            await UpdateCustomerClassification(entity.IDKhachHang);

            return NoContent();
        }

        // DELETE: api/DonHang/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var donHang = await _context.DonHangs.FindAsync(id);
            if (donHang == null) return NotFound();

            var idKhachHang = donHang.IDKhachHang; // Lưu ID khách hàng trước khi xóa
            _context.DonHangs.Remove(donHang);
            await _context.SaveChangesAsync();

            // Cập nhật phân loại khách hàng
            await UpdateCustomerClassification(idKhachHang);

            return NoContent();
        }

        private async Task UpdateCustomerClassification(int idKhachHang)
        {
            // Tính tổng tiền đơn hàng của khách hàng
            var totalAmount = await _context.DonHangs
                .Where(d => d.IDKhachHang == idKhachHang)
                .SumAsync(d => d.TongTien);

            // Tìm khách hàng
            var khachHang = await _context.KhachHangs.FindAsync(idKhachHang);
            if (khachHang == null) return;

            // Cập nhật phân loại dựa trên tổng tiền
            khachHang.PhanLoai = totalAmount >= 80_000_000 ? "VIP" : "Mới";

            await _context.SaveChangesAsync();
        }
    }
}