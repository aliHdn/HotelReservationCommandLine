using HotelReservationCli.Models.Enum_Models;

namespace HotelReservationChatBot.Models.Data_Models
{
    public class Reservations
    {
        public int ReservationsId { get; set; }
        public DateOnly StartDate { get; set; }
        public required int NumberOfNights { get; set; }
        public required int Capacity { get; set; }
        public required double TotalPrice { get; set; }
        public required string FullName { get; set; }
        public required RoomType RoomTypee { get; set; }
        public required string RoomName { get; set; }
        public required string ReservationStatus { get; set; }
        public required string ReservedByEmail { get; set; } = string.Empty;

    }
}
