using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace HotelReservationChatBot.Models.RequestDTO
{
    public class LoginRequestDTO
    {
        [EmailAddress]
        [Required]
        public string Email { get; set; } = string.Empty;
        [Required]
        [PasswordPropertyText]
        public string Password { get; set; } = string.Empty;
    }
}
