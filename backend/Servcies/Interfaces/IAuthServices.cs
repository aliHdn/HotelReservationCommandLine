using HotelReservationChatBot.Models.Data_Models;
using HotelReservationChatBot.Models.RequestDTO;
using Microsoft.AspNetCore.Mvc;

namespace HotelReservationChatBot.Servcies.Interfaces
{
    public interface IAuthServices
    {
        public Task<User?> CheckIfUserExist(String Email);


        public Task<User> AddUser([FromForm] SignInDTO request);
       
    }
}
