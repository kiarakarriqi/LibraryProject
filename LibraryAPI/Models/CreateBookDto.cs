namespace LibraryAPI.Models
{
    public class CreateBookDto
    {
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int UserId { get; set; }
    }
}
