using HotelReservationChatBot.Data;
using HotelReservationChatBot.Models.Data_Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HotelReservationCli.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerController : ControllerBase
    {
        private readonly HotelDbContext db;
        public CustomerController(HotelDbContext _db)
        {
            db = _db;
        }

        [HttpGet("GetBalance")]
        [Authorize(Roles = "Customer")]
        public async Task<double> GetUserBalance()
        {
            string UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user= await db.Users.Where(t => t.Id == UserId).FirstOrDefaultAsync();
            return user.Balance;
                              
        }


        [HttpGet("GetMyReservations")]
        [Authorize(Roles = "Customer")]
        public async Task<List<Reservations>> GetMyReservations()
        {
            string UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await db.Users.Where(t => t.Id == UserId)
                .Include(t=>t.MyReservations)
                .FirstOrDefaultAsync();
            return user.MyReservations;
        }
    }
}
