namespace HotelReservationChatBot.Models.Data_Models
{
    public class Room
    {
        public int RoomId { get; set; }
        public string RoomName { get; set; } = string.Empty;
        public int FloorNumber { get; set; }
        public double RoomPrice { get; set; }
        public Boolean IsAvailable { get; set; } = true;
        public string ReservedByEmail { get; set; } = string.Empty;
        public DateTime CheckIn { get; set; } 
        public DateTime CheckOut { get; set; }
    }
}
