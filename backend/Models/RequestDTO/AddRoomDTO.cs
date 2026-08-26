using HotelReservationCli.Models.Enum_Models;

namespace HotelReservationCli.Models.RequestDTO
{
    public class AddRoomDTO
    {
        public required string roomName { get; set; }
        public required int floorId { get; set; }
        public required double roomPrice { get; set; }
        public required RoomType roomTypee { get; set; }
        public required int capacity { get; set; }
    }
}
