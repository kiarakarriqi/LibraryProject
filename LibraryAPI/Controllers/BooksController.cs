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

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var books = await _context.Books.ToListAsync();
            return Ok(books);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return NotFound();
            return Ok(book);
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

            book.Title = updatedBook.Title;
            book.Author = updatedBook.Author;
            book.Status = updatedBook.Status;

            await _context.SaveChangesAsync();
            return Ok(book);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return NotFound();

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Book deleted successfully" });
        }
    }
}
