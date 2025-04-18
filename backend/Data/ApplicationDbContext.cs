using Microsoft.EntityFrameworkCore;
using CRM.Models;

namespace CRM.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<KhachHang> KhachHangs { get; set; }
        public DbSet<TaiKhoan> TaiKhoans { get; set; }
        public DbSet<DonHang> DonHangs { get; set; }
        public DbSet<ChiTietDonHang> ChiTietDonHangs { get; set; }
        public DbSet<LichSuDonHang> LichSuDonHangs { get; set; }
        public DbSet<DichVu> DichVus { get; set; }
        public DbSet<DanhGiaDichVu> DanhGiaDichVus { get; set; }
        public DbSet<LichSuLienLac> LichSuLienLacs { get; set; }
        public DbSet<AutoNumber> AutoNumbers { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Map đúng tên bảng trong SQL Server (không có 's')
            modelBuilder.Entity<TaiKhoan>().ToTable("TaiKhoan");
            modelBuilder.Entity<KhachHang>().ToTable("KhachHang");
            modelBuilder.Entity<DonHang>().ToTable("DonHang");
            modelBuilder.Entity<ChiTietDonHang>().ToTable("ChiTietDonHang");
            modelBuilder.Entity<LichSuDonHang>().ToTable("LichSuDonHang");
            modelBuilder.Entity<DichVu>().ToTable("DichVu");
            modelBuilder.Entity<DanhGiaDichVu>().ToTable("DanhGiaDichVu");
            modelBuilder.Entity<LichSuLienLac>().ToTable("LichSuLienLac");
            modelBuilder.Entity<AutoNumber>().ToTable("AutoNumber");

            // Các constraint vẫn giữ nguyên
            modelBuilder.Entity<DanhGiaDichVu>(entity =>
            {
                entity.ToTable(table =>
                {
                    table.HasCheckConstraint("CK_DanhGia", "DanhGia BETWEEN 1 AND 5");
                });
            });

            modelBuilder.Entity<LichSuLienLac>(entity =>
            {
                entity.ToTable(table =>
                {
                    table.HasCheckConstraint("CK_DanhGiaNhanVien", "DanhGiaNhanVien BETWEEN 1 AND 5");
                });
            });
            modelBuilder.Entity<AutoNumber>()
      .HasKey(a => a.TableName);
        }
    }
}