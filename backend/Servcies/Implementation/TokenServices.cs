using HotelReservationChatBot.Data;
using HotelReservationChatBot.Models.Data_Models;
using HotelReservationChatBot.Models.RequestDTO;
using HotelReservationChatBot.Servcies.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HotelReservationChatBot.Servcies.Implementation
{
    public class TokenServices : ITokenServices
    {
        private readonly IConfiguration _config;
        private readonly UserManager<User> um;
        private readonly HotelDbContext db;
        public TokenServices(IConfiguration config, UserManager<User> _um, HotelDbContext _db)
        {
            _config = config;
            um = _um;
            db = _db;
        }
        public async Task<string> GenerateToken(LoginRequestDTO request)
        {
            User user = await db.Users.Where(t=>t.Email == request.Email).FirstOrDefaultAsync();
            var userRole = await um.GetRolesAsync(user);
            //creating claims
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier,user.Id),
                new Claim(JwtRegisteredClaimNames.Sub,user.Id),
                new Claim(ClaimTypes.PrimarySid,user.Id),
            };

            foreach (var role in userRole)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            //retrieving the secret key
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"])
                );

            //sign creation 
            var cred = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            //creation of the token 
            var token = new JwtSecurityToken(
                issuer: _config["Jwt:issuer"],
                audience: _config["Jwt:audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: cred
                );


            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
