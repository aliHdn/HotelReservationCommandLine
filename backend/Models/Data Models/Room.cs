using HotelReservationCli.Models.Enum_Models;

namespace HotelReservationChatBot.Models.Data_Models
{
    public class Room
    {
        public int RoomId { get; set; }
        public  required string RoomName { get; set; } = string.Empty;
        public required int FloorNumber { get; set; }
        public required RoomType RoomTypee { get; set; }
        public required int Capacity { get; set; }
        public required double RoomPricePerNight { get; set; }
        public required Boolean IsAvailable { get; set; } = true;
      
    }
}
