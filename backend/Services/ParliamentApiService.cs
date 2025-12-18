using ParliamentAbsenceVisualizer.Api.Models;
using System.Text.Json;

namespace ParliamentAbsenceVisualizer.Api.Services;

public interface IParliamentApiService
{
    Task<Assembly> GetCurrentAssemblyAsync();
    Task<List<Party>> GetPartiesAsync();
    Task<MembersResponse> GetMembersAsync();
    Task<List<Absence>> GetAbsencesAsync(AbsenceRequest request);
    Task<byte[]> GetMemberImageAsync(int memberId);
    Task<MemberProfile> GetMemberProfileAsync(int memberId);
}

public class ParliamentApiService : IParliamentApiService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ParliamentApiService> _logger;
    private const string BASE_URL = "https://www.parliament.bg/api/v1";
    private const string IMAGES_BASE_URL = "https://www.parliament.bg/images/Assembly";

    public ParliamentApiService(HttpClient httpClient, ILogger<ParliamentApiService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<Assembly> GetCurrentAssemblyAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync($"{BASE_URL}/fn-assembly/bg");
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            var assemblies = JsonSerializer.Deserialize<List<Assembly>>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (assemblies == null || assemblies.Count == 0)
            {
                throw new Exception("No assembly data available");
            }

            return assemblies[0];
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching assembly data");
            throw;
        }
    }

    public async Task<List<Party>> GetPartiesAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync($"{BASE_URL}/coll-list/bg/2");
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            var parties = JsonSerializer.Deserialize<List<Party>>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return parties ?? new List<Party>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching parties data");
            throw;
        }
    }

    public async Task<MembersResponse> GetMembersAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync($"{BASE_URL}/coll-list-ns/bg");
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            var membersResponse = JsonSerializer.Deserialize<MembersResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return membersResponse ?? new MembersResponse();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching members data");
            throw;
        }
    }

    public async Task<List<Absence>> GetAbsencesAsync(AbsenceRequest request)
    {
        try
        {
            var jsonContent = JsonSerializer.Serialize(request);
            var httpContent = new StringContent(jsonContent, System.Text.Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{BASE_URL}/mp-absense/bg", httpContent);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            var absences = JsonSerializer.Deserialize<List<Absence>>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return absences ?? new List<Absence>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching absences data");
            throw;
        }
    }

    public async Task<byte[]> GetMemberImageAsync(int memberId)
    {
        try
        {
            var imageUrl = $"{IMAGES_BASE_URL}/{memberId}.png";
            var response = await _httpClient.GetAsync(imageUrl);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadAsByteArrayAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching member image for ID {MemberId}", memberId);
            throw;
        }
    }

    public async Task<MemberProfile> GetMemberProfileAsync(int memberId)
    {
        try
        {
            var response = await _httpClient.GetAsync($"{BASE_URL}/mp-profile/bg/{memberId}");
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();

            var profile = JsonSerializer.Deserialize<MemberProfile>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = false // Parliament API uses exact case-sensitive property names
            });

            if (profile == null)
            {
                throw new Exception($"Failed to deserialize member profile for member ID {memberId}");
            }

            return profile;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching member profile for ID {MemberId}", memberId);
            throw;
        }
    }
}
