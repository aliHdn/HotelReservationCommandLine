
using HotelReservationChatBot.Data;
using HotelReservationChatBot.Models.Data_Models;
using HotelReservationChatBot.Models.RequestDTO;
using HotelReservationChatBot.Servcies.Interfaces;
using Microsoft.AspNet.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelReservationChatBot.Servcies.Implementation
{
    public class AuthServices : IAuthServices
    {
        private readonly HotelDbContext db;
        private readonly IPasswordHasher passwordservices;
        public AuthServices(HotelDbContext _db, IPasswordHasher _passwordservices)
        {
            db = _db;
            passwordservices = _passwordservices;
        }

        public async Task<User?> CheckIfUserExist([FromForm] string Email)
        {
            var user = await db.Users.SingleOrDefaultAsync(i => i.Email == Email);
            if(user is null)
            {
                return null;
            }
            return user;
        }


        public async Task<User> AddUser([FromForm]SignInDTO request)
        {
            var user = new User
            {
                Email=request.Email,
                PasswordHashed= passwordservices.HashPassword(request.Password),
                FullName=request.Name
            };
            db.Users.Add(user);
            await db.SaveChangesAsync();
            return user;
        }
    }
}
