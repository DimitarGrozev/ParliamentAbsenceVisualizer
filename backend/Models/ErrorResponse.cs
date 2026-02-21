namespace ParliamentAbsenceVisualizer.Api.Models;

/// <summary>
/// Standardized error response for API errors
/// </summary>
public class ErrorResponse
{
    public int StatusCode { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? TraceId { get; set; }
}
