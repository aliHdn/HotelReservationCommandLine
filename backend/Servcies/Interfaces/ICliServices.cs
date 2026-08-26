using HotelReservationCli.Models.RequestDTO;

namespace HotelReservationCli.Servcies.Interfaces
{
    public interface ICliServices
    {
        public Task<string> UseCmd(SendRequestCmd message,string UserId);
    }
}
