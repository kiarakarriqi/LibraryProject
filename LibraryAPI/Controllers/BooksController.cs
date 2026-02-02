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

        // GET te gjitha librat nga te gjitha usera
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

        [HttpPost]
        public async Task<IActionResult> Add(Book book)
        {
            _context.Books.Add(book);
            await _context.SaveChangesAsync();
            return Ok(book);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Book updatedBook)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return NotFound();
            if (book.UserId != updatedBook.UserId) return Unauthorized();

            book.Title = updatedBook.Title;
            book.Author = updatedBook.Author;
            book.Status = updatedBook.Status;

            await _context.SaveChangesAsync();
            return Ok(book);
        }

        [HttpDelete("{id}/{userId}")]
        public async Task<IActionResult> Delete(int id, int userId)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return NotFound();
            if (book.UserId != userId) return Unauthorized();

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Book deleted successfully" });
        }
    }
}
