using Google;
using HotelReservationChatBot.Data;
using HotelReservationChatBot.Models.Data_Models;
using HotelReservationChatBot.Servcies.Implementation;
using HotelReservationChatBot.Servcies.Interfaces;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.AI;
using Microsoft.IdentityModel.Tokens;
using OllamaSharp;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddIdentity<User, IdentityRole>()
    .AddEntityFrameworkStores<HotelDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddSingleton<IChatClient>(sp =>
{
    // Point OllamaApiClient to your local Ollama server and target model
    var ollamaClient = new OllamaApiClient(
        uri: new Uri("http://localhost:11434"),
        defaultModel: "llama3.2:3b"
    );

    // Build the execution pipeline with tool/function invocation enabled
    return new ChatClientBuilder(ollamaClient)
        .UseFunctionInvocation()
        .Build();
});

builder.Services.AddControllersWithViews();
builder.Services.AddIdentityCore<User>(options =>
{
    // you can put lockout settings directly here instead of a separate Configure<> call
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 2;
    options.Lockout.AllowedForNewUsers = true;
})
.AddRoles<IdentityRole>()
.AddEntityFrameworkStores<HotelDbContext>()
.AddDefaultTokenProviders();

builder.Services.Configure<IdentityOptions>(options =>
{
    // Default SignIn settings.
    options.SignIn.RequireConfirmedEmail = false;
    options.SignIn.RequireConfirmedPhoneNumber = false;
});


builder.Services.Configure<IdentityOptions>(options =>
{
    // Default Password settings.
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequiredLength = 6;
    options.Password.RequiredUniqueChars = 0;
    options.User.RequireUniqueEmail = true;
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<ITokenServices, TokenServices>();
builder.Services.AddScoped<IHotelRepository, HotelRepository>();
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
//builder.Services.AddOpenApi();

builder.Services.AddAntiforgery(options =>
{
    // Set Cookie properties using CookieBuilder properties†.
   
    options.HeaderName = "X-CSRF-TOKEN";
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
});
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
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
        RoleClaimType=ClaimTypes.Role
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            context.Token = context.Request.Cookies["jwt-token"];
            return Task.CompletedTask;
        }
    };
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("allowedFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .WithHeaders("Content-Type", "X-CSRF-TOKEN")
              .AllowCredentials();
    });
});
builder.Services.AddAuthorization();
var app = builder.Build();
app.UseRouting();
app.UseCors("allowedFrontend");
// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    builder.Services.AddAntiforgery(o =>
    {
        o.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    });

    //app.MapOpenApi();
}
app.UseSwagger();
app.UseSwaggerUI();
app.UseAuthentication();
app.UseHttpsRedirection();

app.UseAuthorization();

var antiforgery = app.Services.GetRequiredService<IAntiforgery>();
app.MapGet("/xsrf-token", (HttpContext context) =>
{
    var tokenSet = antiforgery.GetAndStoreTokens(context);

    return Results.Ok(new
    {

        token = tokenSet.RequestToken!
    });

});
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var UserManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

    string[] roles = { "Admin", "Customer" };
    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole(role));
        }
    }
    var usersToCreate = new List<(string Email, string Password, string Role)>
    {
        ("admin@gmail.com", "admin123", "Admin"),
    };

    foreach (var u in usersToCreate)
    {
        var existingUser = await UserManager.FindByEmailAsync(u.Email);
        if (existingUser == null)
        {
            var newUser = new User
            {
                UserName = u.Email,
                Email = u.Email,
                RoleType="Admin"
            };

            var result = await UserManager.CreateAsync(newUser, u.Password);
            if (result.Succeeded)
            {
                await UserManager.AddToRoleAsync(newUser, u.Role);
            }
        }
    }
}
app.UseAntiforgery();
 
app.MapControllers();

app.Run();
