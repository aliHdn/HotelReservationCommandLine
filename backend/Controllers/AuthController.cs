
using HotelReservationChatBot.Models.Data_Models;
using HotelReservationChatBot.Models.RequestDTO;
using HotelReservationChatBot.Servcies.Interfaces;
using HotelReservationChatBot.Servcies.Interfaces.Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace HotelReservationChatBot.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController (UserManager<User> UserManager,
        IAuthServices Authser,
        Microsoft.AspNetCore.Identity.IPasswordHasher<User> PasswordServices,
        ITokenServices TokenServices) : ControllerBase
    {
        //private readonly IAuthServices Authser;
        //private readonly Microsoft.AspNet.Identity.IPasswordHasher PasswordServices;
        //private readonly ITokenServices TokenServices;
        

       
        [HttpPost("/Login")]
        public async Task<IActionResult> Login([FromForm] LoginRequestDTO request )
        {
            
  
            var user = await UserManager.FindByEmailAsync(request.Email);
            //var user = await Authser.CheckIfUserExist(request.Email);
            
            if (user is null)
            {
                return Unauthorized("Invalid credentials.");
            }

            if (await UserManager.IsLockedOutAsync(user))
                return Unauthorized("Account locked. Try again later.");
            var check = PasswordServices.VerifyHashedPassword(user, user.PasswordHashed, request.Password);
            var passwordValid = await UserManager.CheckPasswordAsync(user, request.Password);
            if (passwordValid is true || check.Equals(PasswordVerificationResult.Success) )
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
            //IAuthServices Authser = new AuthServices();
            //var user = await Authser.CheckIfUserExist(request.Email);
            var user = new User
            {
                Email = request.Email,
                PasswordHashed = request.Password,
                FullName = request.Name
            };
            UserManager.CreateAsync(user, request.Password);
         
            //if (user is not null)
            //{
            //    return Unauthorized("Email is already taken");
            //}
            await Authser.AddUser(request);
            return Ok(user);

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
