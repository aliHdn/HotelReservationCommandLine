using HotelReservationChatBot.Models.Data_Models;

namespace HotelReservationChatBot.Servcies.Interfaces
{
    public interface IHotelRepository
    {
        public Task<List<Room>> GetAvailableRooms();
        public  Task<Room> ReserveRoomByName(string RoomName, string Email,DateTime CheckIn,DateTime ChechOut);
        public Task<Room> addRooms(string RoomName, int FloorNumber,double RoomPrice);
    }
}
