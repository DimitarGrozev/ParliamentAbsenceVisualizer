using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using ParliamentAbsenceVisualizer.Api.Configuration;
using ParliamentAbsenceVisualizer.Api.Models;

namespace ParliamentAbsenceVisualizer.Api.Services;

/// <summary>
/// Decorator that adds caching capabilities to IParliamentApiService
/// Implements the same interface to maintain transparency
/// </summary>
public class CachedParliamentApiService : IParliamentApiService
{
    private readonly IParliamentApiService _innerService;
    private readonly IMemoryCache _cache;
    private readonly CacheSettings _cacheSettings;
    private readonly ILogger<CachedParliamentApiService> _logger;

    // Cache key constants
    private const string ASSEMBLY_CACHE_KEY = "parliament:assembly:current";
    private const string PARTIES_CACHE_KEY = "parliament:parties:all";
    private const string MEMBERS_CACHE_KEY = "parliament:members:all";
    private const string ABSENCES_CACHE_KEY_PREFIX = "parliament:absences";
    private const string MEMBER_PROFILE_CACHE_KEY_PREFIX = "parliament:member-profile";

    public CachedParliamentApiService(
        IParliamentApiService innerService,
        IMemoryCache cache,
        IOptions<CacheSettings> cacheSettings,
        ILogger<CachedParliamentApiService> logger)
    {
        _innerService = innerService;
        _cache = cache;
        _cacheSettings = cacheSettings.Value;
        _logger = logger;
    }

    public async Task<Assembly> GetCurrentAssemblyAsync()
    {
        return await GetOrCreateAsync(
            ASSEMBLY_CACHE_KEY,
            () => _innerService.GetCurrentAssemblyAsync(),
            TimeSpan.FromMinutes(_cacheSettings.AssemblyCacheDurationMinutes),
            "Assembly"
        );
    }

    public async Task<List<Party>> GetPartiesAsync()
    {
        return await GetOrCreateAsync(
            PARTIES_CACHE_KEY,
            () => _innerService.GetPartiesAsync(),
            TimeSpan.FromMinutes(_cacheSettings.PartiesCacheDurationMinutes),
            "Parties"
        );
    }

    public async Task<MembersResponse> GetMembersAsync()
    {
        return await GetOrCreateAsync(
            MEMBERS_CACHE_KEY,
            () => _innerService.GetMembersAsync(),
            TimeSpan.FromMinutes(_cacheSettings.MembersCacheDurationMinutes),
            "Members"
        );
    }

    public async Task<List<Absence>> GetAbsencesAsync(AbsenceRequest request)
    {
        var cacheKey = GenerateAbsenceCacheKey(request);

        return await GetOrCreateAsync(
            cacheKey,
            () => _innerService.GetAbsencesAsync(request),
            TimeSpan.FromMinutes(_cacheSettings.AbsencesCacheDurationMinutes),
            $"Absences ({request.Date1} to {request.Date2})"
        );
    }

    public async Task<byte[]> GetMemberImageAsync(int memberId)
    {
        // Images are already served directly from parliament.bg via client
        // Controller sets direct image URLs, so this method likely isn't heavily used
        // Can add caching here if needed, but images rarely change
        return await _innerService.GetMemberImageAsync(memberId);
    }

    public async Task<MemberProfile> GetMemberProfileAsync(int memberId)
    {
        var cacheKey = $"{MEMBER_PROFILE_CACHE_KEY_PREFIX}:{memberId}";
        return await GetOrCreateAsync(
            cacheKey,
            () => _innerService.GetMemberProfileAsync(memberId),
            TimeSpan.FromMinutes(_cacheSettings.MembersCacheDurationMinutes), // Use same duration as members
            $"Member Profile (ID: {memberId})"
        );
    }

    /// <summary>
    /// Generic cache wrapper with logging and cache bypass support
    /// </summary>
    private async Task<T> GetOrCreateAsync<T>(
        string cacheKey,
        Func<Task<T>> factory,
        TimeSpan cacheDuration,
        string dataDescription)
    {
        // Check if caching is enabled
        if (!_cacheSettings.EnableCaching)
        {
            if (_cacheSettings.EnableCacheLogging)
            {
                _logger.LogDebug("Cache disabled, fetching {DataDescription} from source", dataDescription);
            }
            return await factory();
        }

        // Try to get from cache
        if (_cache.TryGetValue(cacheKey, out T? cachedValue) && cachedValue != null)
        {
            if (_cacheSettings.EnableCacheLogging)
            {
                _logger.LogInformation("Cache HIT for {DataDescription} (key: {CacheKey})", dataDescription, cacheKey);
            }
            return cachedValue;
        }

        // Cache miss - fetch from source
        if (_cacheSettings.EnableCacheLogging)
        {
            _logger.LogInformation("Cache MISS for {DataDescription} (key: {CacheKey}), fetching from parliament.bg", dataDescription, cacheKey);
        }

        var data = await factory();

        // Store in cache
        var cacheEntryOptions = new MemoryCacheEntryOptions();

        if (_cacheSettings.UseAbsoluteExpiration)
        {
            cacheEntryOptions.SetAbsoluteExpiration(cacheDuration);
        }
        else
        {
            cacheEntryOptions.SetSlidingExpiration(cacheDuration);
        }

        // Set cache priority (prevent eviction of critical data)
        cacheEntryOptions.SetPriority(GetCachePriority(cacheKey));

        // Add size limit awareness (rough estimate)
        if (data != null)
        {
            cacheEntryOptions.SetSize(EstimateSizeInBytes(data));
        }

        _cache.Set(cacheKey, data, cacheEntryOptions);

        if (_cacheSettings.EnableCacheLogging)
        {
            _logger.LogInformation("Cached {DataDescription} for {Duration} minutes (key: {CacheKey})",
                dataDescription,
                cacheDuration.TotalMinutes,
                cacheKey);
        }

        return data;
    }

    /// <summary>
    /// Generate cache key for absence requests
    /// Format: "parliament:absences:{search}:{date1}:{date2}:{nameFilter}"
    /// </summary>
    private string GenerateAbsenceCacheKey(AbsenceRequest request)
    {
        var nameFilter = string.IsNullOrWhiteSpace(request.A_ns_MP_Name)
            ? "all"
            : Uri.EscapeDataString(request.A_ns_MP_Name);

        return $"{ABSENCES_CACHE_KEY_PREFIX}:{request.Search}:{request.Date1}:{request.Date2}:{nameFilter}";
    }

    /// <summary>
    /// Assign cache priority based on data importance
    /// </summary>
    private CacheItemPriority GetCachePriority(string cacheKey)
    {
        // Assembly and parties are most critical (rarely change, frequently accessed)
        if (cacheKey == ASSEMBLY_CACHE_KEY || cacheKey == PARTIES_CACHE_KEY)
        {
            return CacheItemPriority.High;
        }

        // Members are important but change more often
        if (cacheKey == MEMBERS_CACHE_KEY)
        {
            return CacheItemPriority.Normal;
        }

        // Absences are less critical (change frequently, many variations)
        return CacheItemPriority.Low;
    }

    /// <summary>
    /// Estimate memory size for cache size tracking
    /// This is a rough estimate - adjust based on actual data sizes
    /// </summary>
    private long EstimateSizeInBytes(object data)
    {
        return data switch
        {
            Assembly => 1 * 1024,           // ~1 KB
            List<Party> => 10 * 1024,       // ~10 KB
            MembersResponse => 50 * 1024,   // ~50 KB
            List<Absence> => 100 * 1024,    // ~100 KB (can vary significantly)
            byte[] bytes => bytes.Length,
            _ => 10 * 1024                  // Default 10 KB
        };
    }
}
