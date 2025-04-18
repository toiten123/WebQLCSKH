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
    public class TaiKhoanController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public TaiKhoanController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaiKhoan>>> GetAll()
        {
            return await _context.TaiKhoans.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TaiKhoan>> GetById(int id)
        {
            var tk = await _context.TaiKhoans.FindAsync(id);
            if (tk == null)
            {
                return NotFound();
            }
            return tk;
        }

        // POST: api/TaiKhoan
        [HttpPost]
        public async Task<IActionResult> PostTaiKhoan(TaiKhoan taiKhoan)
        {
            if (string.IsNullOrWhiteSpace(taiKhoan.PassWord))
            {
                return BadRequest("Mật khẩu là bắt buộc khi tạo tài khoản mới.");
            }
            // ✅ Mã hóa mật khẩu bằng BCrypt trước khi lưu
            taiKhoan.PassWord = BCrypt.Net.BCrypt.HashPassword(taiKhoan.PassWord);
            _context.TaiKhoans.Add(taiKhoan);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTaiKhoan", new { id = taiKhoan.IDUser }, taiKhoan);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTaiKhoan(int id, [FromBody] UpdateTaiKhoanDTO dto)
        {
            if (id != dto.IDUser)
                return BadRequest("ID không khớp.");

            var existing = await _context.TaiKhoans.FindAsync(id);
            if (existing == null)
                return NotFound("Không tìm thấy tài khoản.");

            // Nếu có mật khẩu mới, thì mã hóa lại
            if (!string.IsNullOrWhiteSpace(dto.PassWord))
            {
                existing.PassWord = BCrypt.Net.BCrypt.HashPassword(dto.PassWord);
            }

            // Cập nhật các thông tin khác
            existing.UserName = dto.UserName;
            existing.Role = dto.Role;
            existing.Email = dto.Email;
            existing.PhoneNumber = dto.PhoneNumber;

            await _context.SaveChangesAsync();

            return Ok(existing);
        }



        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var tk = await _context.TaiKhoans.FindAsync(id);
            if (tk == null)
            {
                return NotFound();
            }

            _context.TaiKhoans.Remove(tk);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            // Tìm tài khoản theo tên đăng nhập
            var user = await _context.TaiKhoans.FirstOrDefaultAsync(u => u.UserName == model.UserName);
            if (user == null || !BCrypt.Net.BCrypt.Verify(model.Password, user.PassWord))
            {
                return Unauthorized("Thông tin đăng nhập không hợp lệ");
            }

            // Sinh JWT token với thời gian sống 15 phút
            var tokenHandler = new JwtSecurityTokenHandler();
            // Lấy secret key từ cấu hình (các bạn nên lưu ở appsettings.json hoặc Secret Manager)
            var secretKey = _configuration["Jwt:SecretKey"];
            if (string.IsNullOrEmpty(secretKey))
            {
                return StatusCode(500, "Lỗi server: Thiếu Jwt:SecretKey trong cấu hình");
            }
            var key = Encoding.ASCII.GetBytes(secretKey);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.IDUser.ToString()),
                    new Claim(ClaimTypes.Name, user.UserName),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddDays(1),
                // cái này để test 5s token có xóa ko?
                // Expires = DateTime.UtcNow.AddSeconds(5),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new { Token = tokenString, Expiration = tokenDescriptor.Expires });
        }
    }
}
