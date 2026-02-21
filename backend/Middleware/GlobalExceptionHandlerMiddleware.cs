using System.Net;
using System.Text.Json;
using ParliamentAbsenceVisualizer.Api.Models;

namespace ParliamentAbsenceVisualizer.Api.Middleware;

/// <summary>
/// Global exception handler middleware that catches unhandled exceptions
/// and returns standardized JSON error responses
/// </summary>
public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

    public GlobalExceptionHandlerMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var traceId = context.TraceIdentifier;
        var path = context.Request.Path;
        var method = context.Request.Method;

        var (statusCode, message) = exception switch
        {
            HttpRequestException httpEx when httpEx.StatusCode == HttpStatusCode.NotFound
                => (StatusCodes.Status404NotFound, "The requested resource was not found"),

            HttpRequestException httpEx
                => (StatusCodes.Status502BadGateway, "External service unavailable"),

            TaskCanceledException or OperationCanceledException
                => (StatusCodes.Status504GatewayTimeout, "Request timed out"),

            JsonException
                => (StatusCodes.Status500InternalServerError, "Error processing response data"),

            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred")
        };

        _logger.LogError(exception,
            "Unhandled exception: {Method} {Path} - {StatusCode} - TraceId: {TraceId}",
            method, path, statusCode, traceId);

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        var response = new ErrorResponse
        {
            StatusCode = statusCode,
            Message = message,
            TraceId = traceId
        };

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}

public static class GlobalExceptionHandlerMiddlewareExtensions
{
    public static IApplicationBuilder UseGlobalExceptionHandler(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<GlobalExceptionHandlerMiddleware>();
    }
}
