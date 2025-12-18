using Microsoft.AspNetCore.Mvc;
using ParliamentAbsenceVisualizer.Api.Models;
using ParliamentAbsenceVisualizer.Api.Services;

namespace ParliamentAbsenceVisualizer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MemberProfileController : ControllerBase
{
    private readonly IParliamentApiService _parliamentApiService;
    private readonly ILogger<MemberProfileController> _logger;

    public MemberProfileController(
        IParliamentApiService parliamentApiService,
        ILogger<MemberProfileController> logger)
    {
        _parliamentApiService = parliamentApiService;
        _logger = logger;
    }

    /// <summary>
    /// Get detailed member profile data from parliament.bg API
    /// </summary>
    /// <param name="memberId">The member ID</param>
    /// <returns>Complete member profile including municipalities, memberships, proposed laws, questions, and amendments</returns>
    [HttpGet("{memberId}")]
    [ProducesResponseType(typeof(MemberProfile), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetMemberProfile(int memberId)
    {
        try
        {
            var profile = await _parliamentApiService.GetMemberProfileAsync(memberId);
            return Ok(profile);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error while fetching member profile for member ID: {MemberId}", memberId);

            if (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return NotFound($"Member profile not found for member ID: {memberId}");
            }

            return StatusCode(500, "Error communicating with parliament.bg API");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting member profile for ID {MemberId}", memberId);
            return StatusCode(500, "Error retrieving member profile data");
        }
    }
}
