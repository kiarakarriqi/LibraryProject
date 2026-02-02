using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LibraryAPI.Models;
using LibraryAPI.Data;

namespace LibraryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly LibraryDbContext _context;

        public BooksController(LibraryDbContext context)
        {
            _context = context;
        }

        // GET te gjitha librat
        [HttpGet]
        public async Task<IActionResult> GetAllBooks()
        {
            var books = await _context.Books.ToListAsync();
            return Ok(books);
        }

        // GET librat per nje user specific
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetByUser(int userId)
        {
            var books = await _context.Books.Where(b => b.UserId == userId).ToListAsync();
            return Ok(books);
        }

        // POST - shto liber (duke perdorur DTO)
        [HttpPost]
        public async Task<IActionResult> Add(CreateBookDto dto)
        {
            var book = new Book
            {
                Title = dto.Title,
                Author = dto.Author,
                Status = dto.Status,
                UserId = dto.UserId
            };

            _context.Books.Add(book);
            await _context.SaveChangesAsync();
            return Ok(book);
        }

        // PUT - update liber (vetem nese je pronari)
        [HttpPut("{id}/{userId}")]
        public async Task<IActionResult> Update(int id, int userId, CreateBookDto dto)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return NotFound();
            if (book.UserId != userId) return Unauthorized("You can only update your own books");

            book.Title = dto.Title;
            book.Author = dto.Author;
            book.Status = dto.Status;

            await _context.SaveChangesAsync();
            return Ok(book);
        }

        // DELETE - fshin liber (vetem nese je pronari)
        [HttpDelete("{id}/{userId}")]
        public async Task<IActionResult> Delete(int id, int userId)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return NotFound();
            if (book.UserId != userId) return Unauthorized("You can only delete your own books");

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Book deleted successfully" });
        }
    }
}
