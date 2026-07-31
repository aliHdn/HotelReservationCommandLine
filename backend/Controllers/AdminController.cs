using HotelReservationChatBot.Models.Data_Models;
using HotelReservationChatBot.Servcies.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.AI;

namespace HotelReservationChatBot.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        IHotelRepository repo;
        public AdminController(IChatClient _chatClient, IHotelRepository _repo,UserManager<User> _UserManager)
        {
            repo = _repo;
        }

        [HttpPost("AddRoom")]
        [Authorize(Roles = "Admin")]
        [AutoValidateAntiforgeryToken]
        public async Task<IActionResult> AddRoom([FromForm] string RoomName, [FromForm] int FloorId, [FromForm] double RoomPrice)
        {
            var obj = await repo.addRooms(RoomName, FloorId, RoomPrice);
            if (obj is null)
            {
                return Unauthorized("Already room exists");
            }
            return Ok("Room created");
        }
    }
}
