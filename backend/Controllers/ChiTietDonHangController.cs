using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Data;
using CRM.Models;

namespace CRM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChiTietDonHangController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ChiTietDonHangController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ChiTietDonHang>>> GetAll()
        {
            return await _context.ChiTietDonHangs
                .Include(c => c.DonHang)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ChiTietDonHang>> GetById(int id)
        {
            var ct = await _context.ChiTietDonHangs
                .Include(c => c.DonHang)
                .FirstOrDefaultAsync(c => c.IDChiTietDonHang == id);

            if (ct == null) return NotFound();
            return ct;
        }

        [HttpPost]
        public async Task<ActionResult<ChiTietDonHang>> Create(ChiTietDonHang chiTiet)
        {
            _context.ChiTietDonHangs.Add(chiTiet);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = chiTiet.IDChiTietDonHang }, chiTiet);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ChiTietDonHang chiTiet)
        {
            if (id != chiTiet.IDChiTietDonHang) return BadRequest();

            _context.Entry(chiTiet).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.ChiTietDonHangs.Any(c => c.IDChiTietDonHang == id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var chiTiet = await _context.ChiTietDonHangs.FindAsync(id);
            if (chiTiet == null) return NotFound();

            _context.ChiTietDonHangs.Remove(chiTiet);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
