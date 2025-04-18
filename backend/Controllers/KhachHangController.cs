using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Data;
using CRM.Models;
using CRM.DTOs;
using ClosedXML.Excel;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace CRM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class KhachHangController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public KhachHangController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<KhachHang>>> GetAll()
        {
            return await _context.KhachHangs.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<KhachHang>> GetById(int id)
        {
            var kh = await _context.KhachHangs.FindAsync(id);
            if (kh == null)
            {
                return NotFound();
            }
            return kh;
        }

        [HttpGet("dropdown")]
        public async Task<ActionResult<IEnumerable<object>>> GetForDropdown()
        {
            var khs = await _context.KhachHangs
                .Select(kh => new
                {
                    id = kh.IDKhachHang,
                    label = kh.MaKhachHang + "-" + kh.TenKhachHang
                })
                .ToListAsync();

            return Ok(khs);
        }

        [HttpPost]
        public async Task<ActionResult<KhachHang>> Create([FromBody] KhachHangDto dto)
        {
            var maKH = await GenerateNextMaKhachHang();

            var khachHang = new KhachHang
            {
                MaKhachHang = maKH,
                TenKhachHang = dto.TenKhachHang,
                SoDienThoai = dto.SoDienThoai,
                DiaChi = dto.DiaChi,
                Email = dto.Email,
                PhanLoai = "Mới",
                NgayTao = dto.NgayTao.Date
            };

            _context.KhachHangs.Add(khachHang);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = khachHang.IDKhachHang }, khachHang);
        }

        [HttpPost("import-preview")]
        public async Task<IActionResult> ImportPreview(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Không có file được gửi lên.");

            var previews = new List<KhachHangDto>();

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                using (var workbook = new XLWorkbook(stream))
                {
                    var worksheet = workbook.Worksheets.FirstOrDefault();
                    if (worksheet == null)
                        return BadRequest("Không tìm thấy sheet trong file Excel.");

                    var rows = worksheet.RowsUsed().Skip(1); // Bỏ dòng tiêu đề

                    foreach (var row in rows)
                    {
                        try
                        {
                            var dto = new KhachHangDto
                            {
                                TenKhachHang = row.Cell(1).GetValue<string>(),
                                SoDienThoai = row.Cell(2).GetValue<string>(),
                                DiaChi = row.Cell(3).GetValue<string>(),
                                Email = row.Cell(4).GetValue<string>(),
                                NgayTao = DateTime.TryParse(row.Cell(5).GetValue<string>(),
                                    System.Globalization.CultureInfo.GetCultureInfo("vi-VN"),
                                    System.Globalization.DateTimeStyles.None,
                                    out DateTime ngayTao)
                                    ? ngayTao.Date
                                    : DateTime.Now.Date
                            };
                            previews.Add(dto);
                        }
                        catch (Exception ex)
                        {
                            return BadRequest($"Lỗi dòng {row.RowNumber()}: {ex.Message}");
                        }
                    }
                }
            }

            return Ok(previews);
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportExcel([FromBody] ImportKhachHangRequest request)
        {
            if (request?.KhachHangDtos == null || !request.KhachHangDtos.Any())
                return BadRequest("Không có dữ liệu được gửi lên.");

            var listKhachHang = new List<KhachHang>();

            foreach (var dto in request.KhachHangDtos)
            {
                try
                {
                    var maKH = await GenerateNextMaKhachHang();

                    var khachHang = new KhachHang
                    {
                        MaKhachHang = maKH,
                        TenKhachHang = dto.TenKhachHang,
                        SoDienThoai = dto.SoDienThoai,
                        DiaChi = dto.DiaChi,
                        Email = dto.Email,
                        PhanLoai = "Mới",
                        NgayTao = dto.NgayTao.Date
                    };

                    listKhachHang.Add(khachHang);
                }
                catch (Exception ex)
                {
                    return BadRequest($"Lỗi khi xử lý dữ liệu: {ex.Message}");
                }
            }

            _context.KhachHangs.AddRange(listKhachHang);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Đã import thành công {listKhachHang.Count} khách hàng." });
        }

        [HttpGet("download-template")]
        public IActionResult DownloadTemplate()
        {
            var wb = new XLWorkbook();
            var ws = wb.Worksheets.Add("KhachHang");

            ws.Cell("A1").Value = "TenKhachHang";
            ws.Cell("B1").Value = "SoDienThoai";
            ws.Cell("C1").Value = "DiaChi";
            ws.Cell("D1").Value = "Email";
            ws.Cell("E1").Value = "NgayTao";

            using (var stream = new MemoryStream())
            {
                wb.SaveAs(stream);
                stream.Seek(0, SeekOrigin.Begin);
                return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "KhachHangTemplate.xlsx");
            }
        }

        [HttpGet("export-excel")]
        public IActionResult ExportToExcel([FromQuery] string[] columns, [FromQuery] string search = "")
        {
            try
            {
                var khachHangs = _context.KhachHangs.ToList();

                if (!string.IsNullOrEmpty(search))
                {
                    search = search.ToLower();
                    khachHangs = khachHangs.Where(kh =>
                        kh.MaKhachHang.ToLower().Contains(search) ||
                        kh.TenKhachHang.ToLower().Contains(search) ||
                        kh.SoDienThoai.Contains(search) ||
                        (kh.Email != null && kh.Email.ToLower().Contains(search))
                    ).ToList();
                }

                using (var workbook = new XLWorkbook())
                {
                    var worksheet = workbook.Worksheets.Add("Khách hàng");

                    int colIndex = 1;
                    Dictionary<string, int> columnIndexes = new Dictionary<string, int>();

                    foreach (var column in columns)
                    {
                        string headerText = "";
                        switch (column)
                        {
                            case "id": headerText = "ID"; break;
                            case "code": headerText = "MaKhachHang"; break;
                            case "name": headerText = "TenKhachHang"; break;
                            case "phone": headerText = "SoDienThoai"; break;
                            case "address": headerText = "DiaChi"; break;
                            case "email": headerText = "Email"; break;
                            case "type": headerText = "PhanLoai"; break;
                            case "createdAt": headerText = "NgayTao"; break;
                            default: continue;
                        }

                        worksheet.Cell(1, colIndex).Value = headerText;
                        columnIndexes.Add(column, colIndex);
                        colIndex++;
                    }

                    int rowIndex = 2;
                    foreach (var kh in khachHangs)
                    {
                        foreach (var column in columns)
                        {
                            if (columnIndexes.TryGetValue(column, out int columnIndex))
                            {
                                switch (column)
                                {
                                    case "id":
                                        worksheet.Cell(rowIndex, columnIndex).Value = kh.IDKhachHang;
                                        break;
                                    case "code":
                                        worksheet.Cell(rowIndex, columnIndex).Value = kh.MaKhachHang;
                                        break;
                                    case "name":
                                        worksheet.Cell(rowIndex, columnIndex).Value = kh.TenKhachHang;
                                        break;
                                    case "phone":
                                        worksheet.Cell(rowIndex, columnIndex).Value = kh.SoDienThoai;
                                        break;
                                    case "address":
                                        worksheet.Cell(rowIndex, columnIndex).Value = kh.DiaChi;
                                        break;
                                    case "email":
                                        worksheet.Cell(rowIndex, columnIndex).Value = kh.Email;
                                        break;
                                    case "type":
                                        worksheet.Cell(rowIndex, columnIndex).Value = kh.PhanLoai;
                                        break;
                                    case "createdAt":
                                        worksheet.Cell(rowIndex, columnIndex).Value = kh.NgayTao.ToString("dd/MM/yyyy");
                                        break;
                                }
                            }
                        }
                        rowIndex++;
                    }

                    worksheet.Columns().AdjustToContents();

                    using (var stream = new MemoryStream())
                    {
                        workbook.SaveAs(stream);
                        stream.Position = 0;
                        return File(
                            stream.ToArray(),
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                            "danh-sach-khach-hang.xlsx");
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi khi xuất Excel: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] KhachHangDto dto)
        {
            var khachHang = await _context.KhachHangs.FindAsync(id);
            if (khachHang == null)
            {
                return NotFound();
            }

            khachHang.TenKhachHang = dto.TenKhachHang;
            khachHang.SoDienThoai = dto.SoDienThoai;
            khachHang.DiaChi = dto.DiaChi;
            khachHang.Email = dto.Email;
            khachHang.NgayTao = dto.NgayTao.Date;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.KhachHangs.Any(k => k.IDKhachHang == id))
                    return NotFound();
                else
                    throw;
            }

            return Ok(khachHang);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var kh = await _context.KhachHangs.FindAsync(id);
            if (kh == null)
            {
                return NotFound();
            }

            _context.KhachHangs.Remove(kh);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<string> GenerateNextMaKhachHang()
        {
            var autoNumber = await _context.AutoNumbers.FirstOrDefaultAsync(a => a.TableName == "KhachHang");

            if (autoNumber == null)
            {
                autoNumber = new AutoNumber
                {
                    TableName = "KhachHang",
                    LastNumber = 0
                };
                _context.AutoNumbers.Add(autoNumber);
            }

            autoNumber.LastNumber++;
            await _context.SaveChangesAsync();

            return $"KH{autoNumber.LastNumber:D4}";
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetCustomerCount()
        {
            var count = await _context.KhachHangs.CountAsync();
            return Ok(count);
        }

        [HttpGet("count-vip")]
        public async Task<IActionResult> GetVipCustomerCount()
        {
            var count = await _context.KhachHangs.CountAsync(kh => kh.PhanLoai == "VIP");
            return Ok(count);
        }

        [HttpGet("available-years")]
        public async Task<IActionResult> GetAvailableYears()
        {
            var years = await _context.KhachHangs
                .Select(kh => kh.NgayTao.Year)
                .Distinct()
                .OrderByDescending(year => year)
                .ToListAsync();

            return Ok(years);
        }

        [HttpGet("monthly-growth/{year}")]
        public async Task<IActionResult> GetMonthlyGrowth(int year)
        {
            var monthlyData = new int[12];

            var customersInYear = await _context.KhachHangs
                .Where(kh => kh.NgayTao.Year == year)
                .ToListAsync();

            foreach (var customer in customersInYear)
            {
                int month = customer.NgayTao.Month;
                monthlyData[month - 1]++;
            }

            return Ok(monthlyData);
        }

        [HttpPost("check-duplicate")]
        public async Task<IActionResult> CheckDuplicate([FromBody] CheckDuplicateDto dto)
        {
            if (dto == null)
                return BadRequest("Dữ liệu không hợp lệ");

            var isPhoneDuplicate = await _context.KhachHangs
                .AnyAsync(kh => kh.SoDienThoai == dto.SoDienThoai && (dto.Id == null || kh.IDKhachHang != dto.Id));

            var isEmailDuplicate = !string.IsNullOrEmpty(dto.Email) &&
                await _context.KhachHangs
                .AnyAsync(kh => kh.Email == dto.Email && (dto.Id == null || kh.IDKhachHang != dto.Id));

            return Ok(new
            {
                isPhoneDuplicate,
                isEmailDuplicate
            });
        }

        /// <summary>
        /// Updates the customer classification based on the total order amount.
        /// Sets PhanLoai to "VIP" if total order amount >= 80,000,000, otherwise "Mới".
        /// </summary>
        /// <param name="idKhachHang">The ID of the customer to update.</param>
        public async Task UpdateCustomerClassification(int idKhachHang)
        {
            var totalAmount = await _context.DonHangs
                .Where(d => d.IDKhachHang == idKhachHang)
                .SumAsync(d => d.TongTien);

            var khachHang = await _context.KhachHangs.FindAsync(idKhachHang);
            if (khachHang == null) return;

            khachHang.PhanLoai = totalAmount >= 80_000_000 ? "VIP" : "Mới";
            await _context.SaveChangesAsync();
        }
    }
}