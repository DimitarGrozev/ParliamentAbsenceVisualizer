using Microsoft.AspNetCore.Mvc;
using ParliamentAbsenceVisualizer.Api.Models;
using ParliamentAbsenceVisualizer.Api.Services;

namespace ParliamentAbsenceVisualizer.Api.Controllers;

[ApiController]
[Route("api/v1")]
public class ParliamentController : ControllerBase
{
    private readonly IParliamentApiService _parliamentApiService;
    private readonly ILogger<ParliamentController> _logger;

    public ParliamentController(
        IParliamentApiService parliamentApiService,
        ILogger<ParliamentController> logger)
    {
        _parliamentApiService = parliamentApiService;
        _logger = logger;
    }

    /// <summary>
    /// Get current assembly information
    /// </summary>
    [HttpGet("fn-assembly/bg")]
    [ProducesResponseType(typeof(Assembly), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAssembly()
    {
        try
        {
            var assembly = await _parliamentApiService.GetCurrentAssemblyAsync();
            return Ok(new[] { assembly });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting assembly");
            return StatusCode(500, "Error retrieving assembly data");
        }
    }

    /// <summary>
    /// Get all current parties in parliament
    /// </summary>
    [HttpGet("coll-list/bg/2")]
    [ProducesResponseType(typeof(List<Party>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetParties()
    {
        try
        {
            var parties = await _parliamentApiService.GetPartiesAsync();
            return Ok(parties);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting parties");
            return StatusCode(500, "Error retrieving parties data");
        }
    }

    /// <summary>
    /// Get all current parliament members
    /// </summary>
    [HttpGet("coll-list-ns/bg")]
    [ProducesResponseType(typeof(MembersResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetMembers()
    {
        try
        {
            var members = await _parliamentApiService.GetMembersAsync();
            return Ok(members);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting members");
            return StatusCode(500, "Error retrieving members data");
        }
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
        try
        {
            if (request == null)
            {
                return BadRequest("Request body is required");
            }

            var absences = await _parliamentApiService.GetAbsencesAsync(request);
            return Ok(absences);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting absences");
            return StatusCode(500, "Error retrieving absences data");
        }
    }
}
