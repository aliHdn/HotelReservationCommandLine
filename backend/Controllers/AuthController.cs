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
    public class AuthController (UserManager<User> UserManager,ITokenServices TokenServices) : ControllerBase
    {          
        [HttpPost("Login")]
        public async Task<IActionResult> Login(LoginRequestDTO request )
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
                var token = await TokenServices.GenerateToken(request);
                Response.Cookies.Append("jwt-token", token, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false,
                    SameSite = SameSiteMode.Lax,
                    IsEssential=true,
                    Expires = DateTime.UtcNow.AddHours(1)
                });

                return Ok(new
                {   
                    Message = "You Logged in Successfully!",
                    StatusCode = 200,
                    Email=user.NormalizedEmail,
                    Name=user.FullName,
                    Role=user.RoleType
                });
            }
            else
            { 
                await UserManager.AccessFailedAsync(user);
                return Unauthorized(new
                {

                    Message = "Invalid credentials.",
                    StatusCode = 400,
                });
            }
        }


        [HttpPost("SignIn")]
        public async Task<IActionResult> SignIn(SignInDTO request)
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
                NormalizedUserName = request.Name.Trim().ToUpperInvariant(),
                RoleType = "Customer"
            };

            var result = await UserManager.CreateAsync(user, request.Password);
            if (result.Succeeded) 
            {
                await UserManager.AddToRoleAsync(user, "Customer");
                return Ok(new
                {
                    Message = "You Signed in Successfully!",
                    StatusCode = 201,
                    Email = user.NormalizedEmail,
                    Name = user.FullName
                });
            }
            else
            {
                return Unauthorized(new
                {

                    Message = "Invalid credentials.",
                    StatusCode = 400,
                });
            }
        }

        [Authorize]
        [ValidateAntiForgeryToken]
        [HttpPost("Logout")]
        public  IActionResult Logout()
        {
            Response.Cookies.Delete("jwt-token");
            return Ok(new
            {
               Message="You Logged out Successfully!",
               StatusCode=200
            });
        }
    }
}
