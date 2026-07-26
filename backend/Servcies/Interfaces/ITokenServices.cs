using HotelReservationChatBot.Models.RequestDTO;

namespace HotelReservationChatBot.Servcies.Interfaces
{
    public interface ITokenServices
    {
        public string GenerateToken(LoginRequestDTO request);
    }
}
