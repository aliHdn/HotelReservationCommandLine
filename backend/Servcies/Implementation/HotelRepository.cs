using HotelReservationChatBot.Data;
using HotelReservationChatBot.Models.Data_Models;
using HotelReservationChatBot.Servcies.Interfaces;
using HotelReservationCli.Models.Enum_Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;


namespace HotelReservationChatBot.Servcies.Implementation
{
    public class HotelRepository : IHotelRepository
    {
        private readonly UserManager<User> UserManager;
        private readonly HotelDbContext db;
        public HotelRepository(HotelDbContext _db, UserManager<User> _UserManager)
        {
            db = _db;
            UserManager = _UserManager;
        }


        public async Task<string> GetAvailableRooms()
        {
         
            var list= await db.Rooms.Where(t => t.IsAvailable == true).ToListAsync();
            string result = "Available Rooms are :\n";
            foreach (var obj in list)
            {
                result +="Room Name: "+obj.RoomName+" floor Number: "+obj.FloorNumber+" Price per night: "+obj.RoomPricePerNight +" RoomType: "+obj.RoomTypee+"Room Capacity:"+obj.Capacity+ "\n";
            }
            return result;

        }


        public  async Task<string> ReserveRoomByName(string[] flags,string UserId)
        {
            int startIndex = 2;
            var user = await UserManager.FindByIdAsync(UserId);
            var admin = await UserManager.FindByEmailAsync("admin@gmail.com");
            Room r = await db.Rooms.Where(t => t.RoomName == flags[startIndex]).FirstOrDefaultAsync();

            if(r is null)
            {
                return "No Room Named " + flags[startIndex] + " Exists!";
            }
            if(r.IsAvailable is false)
            {
                return "The room is reserved by someone!";
            }
            r.IsAvailable = false;
            var reserv = new Reservations()
            {
                Capacity=0,
                NumberOfNights=0,
                TotalPrice=0,
                ReservationStatus=ReservationStatus.pending.ToString(),
                RoomName="",
                RoomTypee=RoomType.Superior,
                FullName="",
                ReservedByEmail=""
            };

            if (DateOnly.TryParseExact(flags[startIndex+2], "dd-MM-yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateOnly validDate))
            {
                reserv.StartDate = validDate;
            }
            else
            {
                // Execution lands here if invalid (returns false)
                return "Invalid date.";
            }
            if (int.TryParse(flags[startIndex+1],out int result)){
                double TotalPrice= r.RoomPricePerNight * result;
                reserv.TotalPrice = r.RoomPricePerNight * result;
                reserv.NumberOfNights = result;
                if(user.Balance < TotalPrice)
                {
                    return "Insuffient Balance !";
                }
                user.Balance -= TotalPrice;
                admin.Balance += TotalPrice;
            }
            else
            {
                return "Invalid Value For Number of Nights";
            }
            reserv.ReservationStatus = ReservationStatus.pending.ToString();
            reserv.RoomName = flags[startIndex];
            reserv.ReservedByEmail = user.NormalizedEmail;
            reserv.FullName = user.FullName;
            reserv.Capacity = r.Capacity;
            reserv.RoomTypee= r.RoomTypee;
            db.Reservations.Add(reserv);
    
            user.MyReservations.Add(reserv);
            await db.SaveChangesAsync();
            return "You reserved the room Successfully!";
        }

        public async Task<Room> addRooms(string RoomName,int FloorNumber,
            double RoomPricePerNight,RoomType roomType,int Capacity)
        {
            if (string.IsNullOrEmpty(RoomName))
            {
                return null;
            }
            var room = new Room()
            {
                RoomName=RoomName,
                FloorNumber = FloorNumber,
                RoomPricePerNight= RoomPricePerNight,
                Capacity=Capacity,
                RoomTypee=roomType,
                IsAvailable=true
            };
            var check = await db.Rooms.Where(t => t.FloorNumber == FloorNumber && t.RoomName == RoomName).FirstOrDefaultAsync();
            if (check is not null)
            {
                return null;
            }
            db.Rooms.Add(room);
            await db.SaveChangesAsync();
            return room;
            
        }
        public async Task<List<Reservations>> GetAllReservations()
        {
            return await db.Reservations.ToListAsync();
        }

        public async Task<List<Room>> GetAllRooms()
        {
            return await db.Rooms.ToListAsync();
        }
        public async Task<Room> GetRoomByName(string Name)
        {
            var room= await db.Rooms.Where(t => t.RoomName == Name).FirstOrDefaultAsync();
            if(room is null)
            {
                return null;
            }
            return room;
        }
        public async Task<Boolean> DeleteRoomByName(string RoomName)
        {
            var room = await db.Rooms.FirstOrDefaultAsync(t=>t.RoomName==RoomName);
            if (room is null) return false;
            db.Rooms.Remove(room);
            await db.SaveChangesAsync();
            return true;
        }
    }
}
