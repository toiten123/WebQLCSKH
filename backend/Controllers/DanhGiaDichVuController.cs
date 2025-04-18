using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Data;
using CRM.Models;
using CRM.Models.Dtos;

namespace CRM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DanhGiaDichVuController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DanhGiaDichVuController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DanhGiaDichVuDto>>> GetAll()
        {
            var list = await _context.DanhGiaDichVus
                .Include(d => d.KhachHang)
                .Include(d => d.DichVu)
                .ToListAsync();

            var dtoList = list.Select(d => new DanhGiaDichVuDto
            {
                IDDanhGia = d.IDDanhGia,
                IDKhachHang = d.IDKhachHang,
                IDDichVu = d.IDDichVu,
                DanhGia = d.DanhGia,
                MoTaDanhGia = d.MoTaDanhGia,
                NgayTao = d.NgayTao
            }).ToList();

            return dtoList;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DanhGiaDichVuDto>> GetById(int id)
        {
            var d = await _context.DanhGiaDichVus
                .Include(x => x.KhachHang)
                .Include(x => x.DichVu)
                .FirstOrDefaultAsync(x => x.IDDanhGia == id);

            if (d == null) return NotFound();

            var dto = new DanhGiaDichVuDto
            {
                IDDanhGia = d.IDDanhGia,
                IDKhachHang = d.IDKhachHang,
                IDDichVu = d.IDDichVu,
                DanhGia = d.DanhGia,
                MoTaDanhGia = d.MoTaDanhGia,
                NgayTao = d.NgayTao
            };

            return dto;
        }

        [HttpPost]
        public async Task<ActionResult<DanhGiaDichVuDto>> Create(DanhGiaDichVuDto dto)
        {
            var entity = new DanhGiaDichVu
            {
                IDKhachHang = dto.IDKhachHang,
                IDDichVu = dto.IDDichVu,
                DanhGia = dto.DanhGia,
                MoTaDanhGia = dto.MoTaDanhGia,
                NgayTao = DateTime.Now
            };

            _context.DanhGiaDichVus.Add(entity);
            await _context.SaveChangesAsync();

            dto.IDDanhGia = entity.IDDanhGia;
            dto.NgayTao = entity.NgayTao;

            return CreatedAtAction(nameof(GetById), new { id = entity.IDDanhGia }, dto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, DanhGiaDichVuDto dto)
        {
            if (id != dto.IDDanhGia) return BadRequest();

            var entity = await _context.DanhGiaDichVus.FindAsync(id);
            if (entity == null) return NotFound();

            entity.IDKhachHang = dto.IDKhachHang;
            entity.IDDichVu = dto.IDDichVu;
            entity.DanhGia = dto.DanhGia;
            entity.MoTaDanhGia = dto.MoTaDanhGia;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.DanhGiaDichVus.FindAsync(id);
            if (entity == null) return NotFound();

            _context.DanhGiaDichVus.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
