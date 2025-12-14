using Microsoft.AspNetCore.Mvc;
using ParliamentAbsenceVisualizer.Api.Services;

namespace ParliamentAbsenceVisualizer.Api.Controllers;

[ApiController]
[Route("images")]
public class ImagesController : ControllerBase
{
    private readonly IParliamentApiService _parliamentApiService;
    private readonly ILogger<ImagesController> _logger;

    public ImagesController(
        IParliamentApiService parliamentApiService,
        ILogger<ImagesController> logger)
    {
        _parliamentApiService = parliamentApiService;
        _logger = logger;
    }

    /// <summary>
    /// Proxy member image from parliament.bg with aggressive caching
    /// </summary>
    [HttpGet("Assembly/{memberId}.png")]
    [ResponseCache(Duration = 86400, Location = ResponseCacheLocation.Any)] // Cache for 24 hours
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetMemberImage(int memberId)
    {
        try
        {
            var imageBytes = await _parliamentApiService.GetMemberImageAsync(memberId);

            // Add cache control headers for browser caching
            Response.Headers.CacheControl = "public, max-age=86400"; // 24 hours
            Response.Headers.Expires = DateTime.UtcNow.AddDays(1).ToString("R");

            return File(imageBytes, "image/png");
        }
        catch (HttpRequestException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            _logger.LogWarning("Image not found for member ID {MemberId}", memberId);
            return NotFound();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting member image for ID {MemberId}", memberId);
            return StatusCode(500, "Error retrieving member image");
        }
    }
}
