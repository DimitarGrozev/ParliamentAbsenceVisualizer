using ParliamentAbsenceVisualizer.Api.Services;
using ParliamentAbsenceVisualizer.Api.Configuration;
using ParliamentAbsenceVisualizer.Api.Middleware;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.AspNetCore.RateLimiting;
using System.IO.Compression;
using System.Text.Json;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Preserve exact property name casing (don't convert to camelCase)
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure cache settings from appsettings.json
builder.Services.Configure<CacheSettings>(
    builder.Configuration.GetSection(CacheSettings.SectionName));

// Register IMemoryCache with size limits
builder.Services.AddMemoryCache(options =>
{
    var cacheSettings = builder.Configuration
        .GetSection(CacheSettings.SectionName)
        .Get<CacheSettings>() ?? new CacheSettings();

    // Set size limit (convert MB to bytes)
    options.SizeLimit = cacheSettings.MaxCacheSizeInMegabytes * 1024 * 1024;

    // Compact cache when 75% full
    options.CompactionPercentage = 0.25;
});

// Add response caching for images
builder.Services.AddResponseCaching();

// Configure response compression with Brotli
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
});

builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Optimal; // Best compression for static files
});

builder.Services.Configure<GzipCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Optimal; // Best compression for static files
});

// Configure CORS for development
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configure rate limiting with sliding window per IP
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 60,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 6,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 2
            }));

    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.Headers.RetryAfter = "60";
        await context.HttpContext.Response.WriteAsJsonAsync(
            new { error = "Rate limit exceeded. Please wait before retrying." }, token);
    };
});

// Register HttpClient and services with decorator pattern
builder.Services.AddHttpClient<ParliamentApiService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(30);
});
builder.Services.AddScoped<IParliamentApiService>(sp =>
{
    // Get HttpClientFactory and create real service
    var httpClientFactory = sp.GetRequiredService<IHttpClientFactory>();
    var httpClient = httpClientFactory.CreateClient(nameof(ParliamentApiService));
    var logger = sp.GetRequiredService<ILogger<ParliamentApiService>>();
    var realService = new ParliamentApiService(httpClient, logger);

    // Wrap it with caching decorator
    var cache = sp.GetRequiredService<IMemoryCache>();
    var cacheSettings = sp.GetRequiredService<IOptions<CacheSettings>>();
    var cacheLogger = sp.GetRequiredService<ILogger<CachedParliamentApiService>>();

    return new CachedParliamentApiService(realService, cache, cacheSettings, cacheLogger);
});

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseRequestLogging();
app.UseGlobalExceptionHandler();
app.UseRateLimiter();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors();
}
else
{
    // Enable response compression in production
    app.UseResponseCompression();
}

// Serve static files from wwwroot (where Vite builds the React app)
app.UseDefaultFiles();
app.UseStaticFiles();

// Enable response caching middleware
app.UseResponseCaching();

app.UseHttpsRedirection();
app.MapControllers();

// SPA fallback - serve index.html for any unmatched routes
app.MapFallbackToFile("index.html");

app.Run();
