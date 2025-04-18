using System.ComponentModel.DataAnnotations;

namespace CRM.Models
{
    public class LoginModel
    {
        [Required]
        public string UserName { get; set; } = null!;

        [Required]
        public string Password { get; set; } = null!;
    }
}
