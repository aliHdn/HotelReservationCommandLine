using HotelReservationChatBot.Models.Data_Models;
using HotelReservationChatBot.Servcies.Interfaces;
using HotelReservationCli.Models.Enum_Models;
using HotelReservationCli.Models.RequestDTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HotelReservationChatBot.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        IHotelRepository repo;
        UserManager<User> UserManager;
        public AdminController( IHotelRepository _repo,UserManager<User> _UserManager)
        {
            repo = _repo;
            UserManager = _UserManager;
        }

        [HttpPost("AddRoom")]
        [Authorize(Roles = "Admin")]
        [AutoValidateAntiforgeryToken]
        public async Task<IActionResult> AddRoom([FromBody]AddRoomDTO request)
        {
            var obj = await repo.addRooms(request.roomName,
                request.floorId, request.roomPrice, request.roomTypee, request.capacity);
            if (obj is null)
            {
                return Unauthorized("Already room exists | The Room Name is empty");
            }
            return Ok("Room created");
        }

        [HttpGet("GetAllReservations")]
        [Authorize(Roles = "Admin")]
        public async Task<List<Reservations>> GetAllReservations()
        {
            return await repo.GetAllReservations();
        }

        [HttpGet("GetAllRooms")]
        [Authorize(Roles = "Admin")]
        public async Task<List<Room>> GetAllRooms()
        {
            return await repo.GetAllRooms();
        }

        [HttpPost("DeleteRoom")]
        [Authorize(Roles = "Admin")]
        [AutoValidateAntiforgeryToken]
        public async Task<IActionResult> DeleteRoom([FromBody] DeletRoomDTO request)
        {
            if (string.IsNullOrEmpty(request.RoomName))
            {
                return BadRequest("Need Some Value");
            }
            if (await repo.DeleteRoomByName(request.RoomName) is true)
            {
                return Ok("Room: "+request.RoomName +" deleted successfully!");
            }
            return BadRequest("Something went wrong");
        }

        [HttpGet("GetBalance")]
        [Authorize(Roles = "Admin")]
        public async Task<double> GetUserBalance()
        {
            User user= await UserManager.FindByEmailAsync("Admin@gmail.com");
            return user.Balance;

        }

    }
}
