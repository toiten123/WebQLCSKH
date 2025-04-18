using System.ComponentModel.DataAnnotations;

public class DichVuDto
{
    [Required]
    public string TenDichVu { get; set; } = null!;

    [Required]
    public string MoTaDichVu { get; set; } = null!;
}
