using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace HotelReservationChatBot.Models.Data_Models
{
    public class User : IdentityUser
    {
        [PersonalData]
        [Required]
        public required string FullName { get; set; } = string.Empty;
        [PersonalData]
        [Required]
        public required string RoleType { get; set; } = string.Empty;
        public required double Balance { get; set; } = 0;

        public List<Reservations> MyReservations { get; set; } = new List<Reservations>();
    }
}
