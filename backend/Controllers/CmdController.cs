using HotelReservationCli.Models.RequestDTO;
using HotelReservationCli.Servcies.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HotelReservationCli.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CmdController : ControllerBase
    {
        private readonly ICliServices cliser;
        public CmdController(ICliServices _cliser)
        {
            cliser = _cliser;
        }
        [HttpPost("TypeCmd")]
        [Authorize(Roles = "Customer")]
        [AutoValidateAntiforgeryToken]
        public async Task<string> TypeCmd([FromBody]SendRequestCmd command)
        {
            string UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return await cliser.UseCmd(command,UserId);
        }
    }
}
