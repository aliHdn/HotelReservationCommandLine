using HotelReservationChatBot.Data;
using HotelReservationChatBot.Models.Data_Models;
using HotelReservationChatBot.Servcies.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Runtime.InteropServices;

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
        public async Task<List<Room>> GetAvailableRooms()
        {
            return await db.Rooms.Where(t => t.IsAvailable == true).ToListAsync();
        }
        public async Task<Room> ReserveRoomByName(string RoomName, string Email, DateTime CheckIn, DateTime CheckOut)
        {
            Room r = await db.Rooms.Where(t => t.RoomName == RoomName).FirstOrDefaultAsync();
            r.IsAvailable = false;
            r.CheckIn = CheckIn;
            r.CheckOut = CheckOut;
            r.ReservedByEmail = Email;
            await db.SaveChangesAsync();
            return r;
        }

        public async Task<Room> addRooms(string RoomName, int FloorNumber,double RoomPrice)
        {
            var room = new Room()
            {
                RoomName=RoomName,
                FloorNumber = FloorNumber,
                RoomPrice=RoomPrice
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
    }
}
