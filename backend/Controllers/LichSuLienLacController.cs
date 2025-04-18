using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Data;
using CRM.Models;
using CRM.Dtos;

namespace CRM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LichSuLienLacController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LichSuLienLacController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LichSuLienLacDto>>> GetAll()
        {
            var data = await _context.LichSuLienLacs.ToListAsync();

            var result = data.Select(l => new LichSuLienLacDto
            {
                IDLienLac = l.IDLienLac,
                IDKhachHang = l.IDKhachHang,
                LoaiLienLac = l.LoaiLienLac,
                NgayLienLac = l.NgayLienLac,
                DanhGiaNhanVien = l.DanhGiaNhanVien,
                KetQua = l.KetQua,
                MoTa = l.MoTa
            });

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LichSuLienLacDto>> GetById(int id)
        {
            var item = await _context.LichSuLienLacs.FindAsync(id);
            if (item == null) return NotFound();

            var dto = new LichSuLienLacDto
            {
                IDLienLac = item.IDLienLac,
                IDKhachHang = item.IDKhachHang,
                LoaiLienLac = item.LoaiLienLac,
                NgayLienLac = item.NgayLienLac,
                DanhGiaNhanVien = item.DanhGiaNhanVien,
                KetQua = item.KetQua,
                MoTa = item.MoTa
            };

            return Ok(dto);
        }

        [HttpPost]
        public async Task<ActionResult<LichSuLienLacDto>> Create(LichSuLienLacDto dto)
        {
            var entity = new LichSuLienLac
            {
                IDKhachHang = dto.IDKhachHang,
                LoaiLienLac = dto.LoaiLienLac,
                NgayLienLac = DateTime.Now, // 👈 Server tự set
                DanhGiaNhanVien = dto.DanhGiaNhanVien,
                KetQua = dto.KetQua,
                MoTa = dto.MoTa
            };

            _context.LichSuLienLacs.Add(entity);
            await _context.SaveChangesAsync();

            dto.IDLienLac = entity.IDLienLac; // cập nhật ID sau khi insert

            return CreatedAtAction(nameof(GetById), new { id = dto.IDLienLac }, dto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, LichSuLienLacDto dto)
        {
            if (id != dto.IDLienLac) return BadRequest();

            var entity = await _context.LichSuLienLacs.FindAsync(id);
            if (entity == null) return NotFound();

            entity.IDKhachHang = dto.IDKhachHang;
            entity.LoaiLienLac = dto.LoaiLienLac;
            entity.NgayLienLac = DateTime.Now; // fix lại luôn cho đồng bộ
            entity.DanhGiaNhanVien = dto.DanhGiaNhanVien;
            entity.KetQua = dto.KetQua;
            entity.MoTa = dto.MoTa;

            _context.Entry(entity).State = EntityState.Modified;

            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.LichSuLienLacs.Any(l => l.IDLienLac == id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.LichSuLienLacs.FindAsync(id);
            if (item == null) return NotFound();

            _context.LichSuLienLacs.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        [HttpGet("count")]
        public async Task<IActionResult> GetContactCount()
        {
            var count = await _context.LichSuLienLacs.CountAsync();
            return Ok(count);
        }
        [HttpGet("thongke-ketqua")]
        public async Task<IActionResult> GetThongKeKetQua()
        {
            var result = await _context.LichSuLienLacs
                .GroupBy(l => new { l.LoaiLienLac, l.KetQua })
                .Select(g => new
                {
                    LoaiLienLac = g.Key.LoaiLienLac,
                    KetQua = g.Key.KetQua,
                    SoLuong = g.Count()
                })
                .ToListAsync();

            return Ok(result);
        }

    }
}
