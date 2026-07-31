using HotelReservationChatBot.Servcies.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.AI;

namespace HotelReservationChatBot.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
   
    public class AIController : ControllerBase
    {
        IChatClient chatClient;
        IHotelRepository repo;
        public AIController(IChatClient _chatClient, IHotelRepository _repo)
        {
            chatClient = _chatClient;
            repo = _repo;
        }
       // [AutoValidateAntiforgeryToken]
        //[Authorize(Roles = "Customer,Admin")]
        [HttpPost("Talk")]
        public async Task<IActionResult> AiOllama(string request)
        {
            var tools = new List<AITool>
            {
                AIFunctionFactory.Create(repo.GetAvailableRooms),
                AIFunctionFactory.Create(repo.ReserveRoomByName)
            };

            var chatOptions = new ChatOptions
            {
                Tools = tools
            };

            var messages = new List<Microsoft.Extensions.AI.ChatMessage>
            {
                new(ChatRole.System, "You are a hotel front-desk assistant. Use the provided tools to fetch room details before answering."),
                new(ChatRole.User, request)
            };

            // 2. Call Ollama
            var response = await chatClient.GetResponseAsync(request, chatOptions);

            return Ok(new { Response = response.Text });
        }
    }
}