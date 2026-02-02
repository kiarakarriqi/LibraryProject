using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LibraryAPI.Models;
using LibraryAPI.Data;
using System.Security.Cryptography;
using System.Text;

namespace LibraryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly LibraryDbContext _context;

        public AuthController(LibraryDbContext context)
        {
            _context = context;
        }

        // Hash password function
        private string HashPassword(string password)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] bytes = Encoding.UTF8.GetBytes(password);
                byte[] hash = sha256.ComputeHash(bytes);
                return BitConverter.ToString(hash).Replace("-", "").ToLower();
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto registerDto)
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == registerDto.Email);
            if (existingUser != null)
                return BadRequest(new { message = "Email already exists!" });

            var user = new User
            {
                Email = registerDto.Email,
                Password = HashPassword(registerDto.Password),
                Name = registerDto.Name
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User registered successfully!", userId = user.Id, name = user.Name, email = user.Email });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            var hashedPassword = HashPassword(loginDto.Password);
            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.Email == loginDto.Email && u.Password == hashedPassword);

            if (user == null)
                return Unauthorized(new { message = "Invalid email or password!" });

            return Ok(new { userId = user.Id, name = user.Name, email = user.Email });
        }
    }

    public class RegisterDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
