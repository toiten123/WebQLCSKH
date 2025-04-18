using System.ComponentModel.DataAnnotations;
public class AutoNumber
{
    [Key]
    public string TableName { get; set; } = string.Empty;
    public int LastNumber { get; set; }
}
