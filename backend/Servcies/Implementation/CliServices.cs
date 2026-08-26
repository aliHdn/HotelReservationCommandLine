using HotelReservationChatBot.Models.Data_Models;
using HotelReservationChatBot.Servcies.Interfaces;
using HotelReservationCli.Models.RequestDTO;
using HotelReservationCli.Servcies.Interfaces;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;

namespace HotelReservationCli.Servcies.Implementation
{
    public class CliServices : ICliServices
    {
        private readonly IHotelRepository hotelSer;
        private static readonly Dictionary<string, PendingReservation> _userSessions = new ();

        public CliServices(IHotelRepository _hotelSer)
        {
            hotelSer = _hotelSer;
        }
        public async Task<string> UseCmd(SendRequestCmd message, string UserId)
        {
            if (string.IsNullOrWhiteSpace(message.Request))
                return ShowHelp();

            string cleanInput = message.Request.Trim();

            if (_userSessions.ContainsKey(UserId))
            {
                if (cleanInput.Equals("Y", StringComparison.OrdinalIgnoreCase))
                {
                    string result = await hotelSer.ReserveRoomByName(_userSessions[UserId].Flags, UserId);
                    _userSessions.Remove(UserId);
                    return result ;         
                }

                if (cleanInput.Equals("N", StringComparison.OrdinalIgnoreCase))
                {
                    _userSessions.Remove(UserId);
                    return "Reservation Cancelled.No charges were made.";
                }

                return $"Invalid response.\n\nDo you want to confirm Room \nReply Y to proceed or N to cancel.";
            }


            string[] args = cleanInput.Split(" ");
            if (args.Length == 0)
            {
                return ShowHelp();
            }
            string[] Flags = new string[args.Length];

            string Command = args[0];
            if (Command != "hotel")
            {
                return Command + " is not recognized!";
            }
            string SubCommand = args[1];

            if (SubCommand.Equals("reserve", StringComparison.OrdinalIgnoreCase))
            {
                if (args.Length <=4)
                    return ShowHelp();

                var flags = ParseFlags(args, startIndex: 2);

                var r = await hotelSer.GetRoomByName(flags[2]);
                if(r is null)
                {
                    return "Room dont exists!";
                }
                double TotalPrice = 0;
                if (int.TryParse(flags[3], out int result))
                {
                    TotalPrice =  r.RoomPricePerNight * result;    
                }
                else
                {
                    return "Invalid Value For Number of Nights";
                }
                _userSessions[UserId] = new PendingReservation
                {
                    UserId = UserId,
                    Flags = flags
                };
                return "So you will pay"+TotalPrice+"\n"+
                    "Do you want to procceed(Y/N)";
            }
            else if (SubCommand.Equals("available", StringComparison.OrdinalIgnoreCase))
            {
                if(args.Length > 2)
                {
                    return ShowHelp();
                }
                return await hotelSer.GetAvailableRooms();
            }
            else
            {
                return ShowHelp();  
            }
        }
        static string[] ParseFlags(string[] args, int startIndex)
        {

            string[] flags = new string[args.Length];

            for (int i = startIndex; i < args.Length; i++)
            {

                string arg = args[i];

                if (arg.StartsWith("-"))
                {
                    string key = arg.TrimStart('-');
                    if (!key.StartsWith("-"))
                    {
                        flags[i] = key;


                    }
                }
            }
            for (int i = 2; i < args.Length; i++)
            {
                Console.WriteLine("start" + flags[i] + "_");
            }
            return flags;
        }
        static string ShowHelp()
        {
            return "Fish 2awda7 min hekk!!";
        }
    }
    //                 //0      1        2             3           4
    //                //Hotel reserve -RoomName -NumberOfNights  -Date
    public class PendingReservation
    {
        public string UserId { get; set; }
        public string[] Flags { get; set; }
    }

}









































//     string[] args = message.Request.Split(" ");

//                
//string Command = args[0].ToLower();


//string SubCommand = args[1].ToLower();

//switch (SubCommand)
//{
//    case "available":
//        return await hotelSer.GetAvailableRooms();
//    case "reserve":
//        return await hotelSer.ReserveRoomByName(flags, UserId);
//    case "help":
//        return ShowHelp();
//    default:
//        return ShowHelp();
//}
//            }



