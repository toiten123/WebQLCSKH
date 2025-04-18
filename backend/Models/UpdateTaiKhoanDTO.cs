using System;
using System.ComponentModel.DataAnnotations;
public class UpdateTaiKhoanDTO
{
    public int IDUser { get; set; }

    [Required]
    public string UserName { get; set; } = null!;

    public string? PassWord { get; set; } // Không bắt buộc

    [Required]
    public string Role { get; set; } = null!;

    public string? Email { get; set; }

    public string? PhoneNumber { get; set; }

    public DateTime Created { get; set; }
}
