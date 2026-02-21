using System.Diagnostics;

namespace ParliamentAbsenceVisualizer.Api.Middleware;

/// <summary>
/// Middleware that logs all HTTP requests with method, path, status code, and duration.
/// Logs 4xx/5xx responses at Warning level to help identify error sources.
/// </summary>
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();

        await _next(context);

        stopwatch.Stop();

        var method = context.Request.Method;
        var path = context.Request.Path;
        var statusCode = context.Response.StatusCode;
        var duration = stopwatch.ElapsedMilliseconds;

        if (statusCode >= 400)
        {
            _logger.LogWarning("HTTP {StatusCode} {Method} {Path} - {Duration}ms",
                statusCode, method, path, duration);
        }
    }
}

public static class RequestLoggingMiddlewareExtensions
{
    public static IApplicationBuilder UseRequestLogging(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<RequestLoggingMiddleware>();
    }
}
