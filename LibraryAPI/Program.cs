using LibraryAPI.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.StaticFiles;

var builder = WebApplication.CreateBuilder(args);

// Databaza do jetë në root folder të projektit
var dbPath = Path.Combine(Directory.GetCurrentDirectory(), "library.db");
Console.WriteLine($"Database path: {dbPath}");
Console.WriteLine($"Database exists: {File.Exists(dbPath)}");

builder.Services.AddDbContext<LibraryDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.WriteIndented = true;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

// Frontend path relative
var frontendPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "FrontEnd");
if (Directory.Exists(frontendPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(Path.GetFullPath(frontendPath)),
        RequestPath = ""
    });
}

app.UseAuthorization();
app.MapControllers();

app.MapGet("/", async (context) =>
{
    context.Response.Redirect("/login.html");
});

app.Run();