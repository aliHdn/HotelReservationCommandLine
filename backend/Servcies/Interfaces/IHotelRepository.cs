using HotelReservationChatBot.Models.Data_Models;
using HotelReservationCli.Models.Enum_Models;

namespace HotelReservationChatBot.Servcies.Interfaces
{
    public interface IHotelRepository
    {
        public Task<string> GetAvailableRooms();
        public  Task<string> ReserveRoomByName(string[] flags,string UserId);
        public Task<Room> addRooms(string RoomName, int FloorNumber, double RoomPricePerNight, RoomType roomType, int Capacity);
        public Task<List<Reservations>> GetAllReservations();
        public Task<List<Room>> GetAllRooms();
        public Task<Room> GetRoomByName(string Name);
        public Task<Boolean> DeleteRoomByName(string RoomName);
    }
}
