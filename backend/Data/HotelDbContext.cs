using HotelReservationChatBot.Models.Data_Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace HotelReservationChatBot.Data
{
   
    public class HotelDbContext : IdentityDbContext<User>
    {
        public HotelDbContext(DbContextOptions<HotelDbContext> options)
                : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<Reservations> Reservations { get; set; }
    }
    
}
