using HotelReservationChatBot.Data;
using HotelReservationChatBot.Servcies.Implementation;
using HotelReservationChatBot.Servcies.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using HotelReservationChatBot.Models.Data_Models;
using Microsoft.AspNet.Identity;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    // you can put lockout settings directly here instead of a separate Configure<> call
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
})
.AddEntityFrameworkStores<HotelDbContext>()
.AddDefaultTokenProviders();
// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<IPasswordHasher,PasswordHasher>();
builder.Services.AddScoped<IAuthServices, AuthServices>();
builder.Services.AddScoped<ITokenServices, TokenServices>();
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
//builder.Services.AddOpenApi();
builder.Services.AddDbContext<HotelDbContext>(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddAuthentication();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true, // <-- this is the tamper check
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };

    // Since your token lives in a cookie, not the Authorization header:
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            context.Token = context.Request.Cookies["jwt-token"];
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    //app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();

}
app.UseAuthentication();
app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
