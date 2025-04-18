using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Data;
using CRM.Models;

namespace CRM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LichSuDonHangController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LichSuDonHangController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LichSuDonHang>>> GetAll()
        {
            return await _context.LichSuDonHangs.Include(l => l.DonHang).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LichSuDonHang>> GetById(int id)
        {
            var item = await _context.LichSuDonHangs.Include(l => l.DonHang).FirstOrDefaultAsync(l => l.IDLichSuDonHang == id);
            if (item == null) return NotFound();
            return item;
        }

        [HttpPost]
        public async Task<ActionResult<LichSuDonHang>> Create(LichSuDonHang item)
        {
            _context.LichSuDonHangs.Add(item);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = item.IDLichSuDonHang }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, LichSuDonHang item)
        {
            if (id != item.IDLichSuDonHang) return BadRequest();
            _context.Entry(item).State = EntityState.Modified;

            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.LichSuDonHangs.Any(l => l.IDLichSuDonHang == id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.LichSuDonHangs.FindAsync(id);
            if (item == null) return NotFound();

            _context.LichSuDonHangs.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
