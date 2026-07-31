using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace HotelReservationChatBot.Models.Data_Models
{
    public class User : IdentityUser
    {
        [PersonalData]
        [Required]
        public string FullName { get; set; } = string.Empty;
        [PersonalData]
        [Required]
        public string RoleType { get; set; } = string.Empty;
    }
}
