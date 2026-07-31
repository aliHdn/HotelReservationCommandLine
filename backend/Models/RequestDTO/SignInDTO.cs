using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace HotelReservationChatBot.Models.RequestDTO
{
    public class SignInDTO
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        [Required]
        [PasswordPropertyText]
        public string Password { get; set; } = string.Empty;
    }
}
