using Microsoft.AspNetCore.Mvc;
using ParliamentAbsenceVisualizer.Api.Models;
using ParliamentAbsenceVisualizer.Api.Services;

namespace ParliamentAbsenceVisualizer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MemberProfileController : ControllerBase
{
    private readonly IParliamentApiService _parliamentApiService;

    public MemberProfileController(IParliamentApiService parliamentApiService)
    {
        _parliamentApiService = parliamentApiService;
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
        var profile = await _parliamentApiService.GetMemberProfileAsync(memberId);
        return Ok(profile);
    }
}
