
using HotelReservationChatBot.Models.Data_Models;
using HotelReservationChatBot.Models.RequestDTO;
using HotelReservationChatBot.Servcies.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace HotelReservationChatBot.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController (UserManager<User> UserManager,
        IAuthServices Authser,
        Microsoft.AspNetCore.Identity.IPasswordHasher<User> PasswordServices,
        ITokenServices TokenServices) : ControllerBase
    {          
        [HttpPost("/Login")]
        public async Task<IActionResult> Login([FromForm] LoginRequestDTO request )
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest("Email,name and password are required");
            }
            var user = await UserManager.FindByEmailAsync(request.Email);
            
            if (user is null)
            {
                return Unauthorized("Invalid credentials.");
            }

            if (await UserManager.IsLockedOutAsync(user))
                return Unauthorized("Account locked. Try again later.");

          
            var passwordValid = await UserManager.CheckPasswordAsync(user, request.Password);
            if (passwordValid is true )
            {
                await UserManager.ResetAccessFailedCountAsync(user);
                var token = TokenServices.GenerateToken(request);
                Response.Cookies.Append("jwt-token", token, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = DateTime.UtcNow.AddHours(1)
                });

                return Ok(user);
            }
            else
            { 
                await UserManager.AccessFailedAsync(user);
                return Unauthorized("credential wrong");
            }
        }


        [HttpPost("/SignIn")]
        public async Task<IActionResult> SignIn([FromForm] SignInDTO request)
        {
            if(string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password)|| string.IsNullOrEmpty(request.Name))
            {
                return BadRequest("Email,name and password are required");
            }
 
            var obj = await UserManager.FindByEmailAsync(request.Email);
            if(obj is not null)
            {
               
                return BadRequest("Email is already taken ");
            }
            var user = new User
            {
                Email = request.Email.Trim(),
                UserName = request.Email.Trim(),
                FullName = request.Name.Trim(),
                NormalizedEmail = request.Email.Trim().ToUpperInvariant(),
                NormalizedUserName = request.Name.Trim().ToUpperInvariant()
            };

            var result = await UserManager.CreateAsync(user, request.Password);
            if (result.Succeeded) 
            {

                return Ok(user);
            }
            else
            {
                foreach (var error in result.Errors)
                {
                    Console.WriteLine(error.Code + "fffffffffffff      ");
                    Console.WriteLine(error.Description + "fffffffffffff      ");
                    Console.WriteLine(request.Name + "fffffffffffff      ");

                }

                return Unauthorized("failed");
            }
        }

        [Authorize]
        [HttpPost("/Logout")]
        public  IActionResult Logout()
        {
            Response.Cookies.Delete("jwt-token");
            return Ok();
        }
    }
}
