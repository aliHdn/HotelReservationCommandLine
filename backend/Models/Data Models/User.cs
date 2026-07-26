using Microsoft.AspNetCore.Identity;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace HotelReservationChatBot.Models.Data_Models
{
    public class User : IdentityUser
    {
        [PersonalData]
        [Required]
        public string FullName { get; set; } = string.Empty;
        [PersonalData]
        [EmailAddress]
        [Required]
        public string Email { get; set; } = string.Empty;
        [PersonalData]
        [PasswordPropertyText]
        [Required]
        public string PasswordHashed { get; set; } = string.Empty;
    }
}
