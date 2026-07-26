using HotelReservationChatBot.Models.RequestDTO;
using HotelReservationChatBot.Servcies.Interfaces;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HotelReservationChatBot.Servcies.Implementation
{
    public class TokenServices : ITokenServices
    {
        private readonly IConfiguration _config;
        public TokenServices(IConfiguration config)
        {
            _config = config;
        }
        public string GenerateToken(LoginRequestDTO request)
        {
            //creating claims
            var claims = new[]
            {
                new Claim(ClaimTypes.PrimarySid,request.Email),
                
            };
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
