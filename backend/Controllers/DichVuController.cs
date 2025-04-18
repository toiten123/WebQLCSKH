using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Data;
using CRM.Models;
using CRM.DTOs;

namespace CRM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DichVuController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DichVuController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DichVu>>> GetAll()
        {
            return await _context.DichVus
                                 .Include(d => d.DanhGiaDichVus)
                                 .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DichVu>> GetById(int id)
        {
            var item = await _context.DichVus
                                     .Include(d => d.DanhGiaDichVus)
                                     .FirstOrDefaultAsync(d => d.IDDichVu == id);
            if (item == null) return NotFound();
            return item;
        }
        [HttpGet("dropdown")]
        public async Task<ActionResult<IEnumerable<object>>> GetForDropdown()
        {
            var dvs = await _context.DichVus
                .Select(dv => new
                {
                    id = dv.IDDichVu,
                    label = dv.TenDichVu
                })
                .ToListAsync();

            return Ok(dvs);
        }

        [HttpPost]
        public async Task<ActionResult<DichVu>> Create(DichVuDto dto)
        {
            var item = new DichVu
            {
                TenDichVu = dto.TenDichVu,
                MoTaDichVu = dto.MoTaDichVu
            };

            _context.DichVus.Add(item);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = item.IDDichVu }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, DichVuDto dto)
        {
            var existing = await _context.DichVus.FindAsync(id);
            if (existing == null) return NotFound();

            existing.TenDichVu = dto.TenDichVu;
            existing.MoTaDichVu = dto.MoTaDichVu;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.DichVus.Any(d => d.IDDichVu == id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.DichVus.FindAsync(id);
            if (item == null) return NotFound();

            _context.DichVus.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        [HttpGet("count")]
        public async Task<IActionResult> GetServiceCount()
        {
            var count = await _context.DichVus.CountAsync();
            return Ok(count);
        }
    }
}
