using HotelReservationChatBot.Models.RequestDTO;

namespace HotelReservationChatBot.Servcies.Interfaces
{
    public interface ITokenServices
    {
        public Task<string> GenerateToken(LoginRequestDTO request);
    }
}
