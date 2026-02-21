using Microsoft.AspNetCore.Mvc;
using ParliamentAbsenceVisualizer.Api.Models;
using ParliamentAbsenceVisualizer.Api.Services;

namespace ParliamentAbsenceVisualizer.Api.Controllers;

[ApiController]
[Route("api/v1")]
public class ParliamentController : ControllerBase
{
    private readonly IParliamentApiService _parliamentApiService;

    public ParliamentController(IParliamentApiService parliamentApiService)
    {
        _parliamentApiService = parliamentApiService;
    }

    /// <summary>
    /// Get current assembly information
    /// </summary>
    [HttpGet("fn-assembly/bg")]
    [ProducesResponseType(typeof(Assembly), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAssembly()
    {
        var assembly = await _parliamentApiService.GetCurrentAssemblyAsync();
        return Ok(new[] { assembly });
    }

    /// <summary>
    /// Get all current parties in parliament
    /// </summary>
    [HttpGet("coll-list/bg/2")]
    [ProducesResponseType(typeof(List<Party>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetParties()
    {
        var parties = await _parliamentApiService.GetPartiesAsync();
        return Ok(parties);
    }

    /// <summary>
    /// Get all current parliament members
    /// </summary>
    [HttpGet("coll-list-ns/bg")]
    [ProducesResponseType(typeof(MembersResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetMembers()
    {
        var members = await _parliamentApiService.GetMembersAsync();
        return Ok(members);
    }

    /// <summary>
    /// Get absences for a given date range and assembly
    /// </summary>
    [HttpPost("mp-absense/bg")]
    [ProducesResponseType(typeof(List<Absence>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAbsences([FromBody] AbsenceRequest request)
    {
        if (request == null)
        {
            return BadRequest("Request body is required");
        }

        var absences = await _parliamentApiService.GetAbsencesAsync(request);

        // Add direct image URLs for each absence
        foreach (var absence in absences)
        {
            absence.MemberImageUrl = $"https://www.parliament.bg/images/Assembly/{absence.A_ns_MP_id}.png";
        }

        return Ok(absences);
    }
}
