namespace ParliamentAbsenceVisualizer.Api.Configuration;

public class CacheSettings
{
    public const string SectionName = "CacheSettings";

    /// <summary>
    /// Master switch to enable/disable all caching (useful for debugging)
    /// </summary>
    public bool EnableCaching { get; set; } = true;

    /// <summary>
    /// Cache duration for assembly data (default: 24 hours = 1440 minutes)
    /// Assembly info changes very rarely (only when new parliament is elected)
    /// </summary>
    public int AssemblyCacheDurationMinutes { get; set; } = 1440;

    /// <summary>
    /// Cache duration for parties list (default: 12 hours = 720 minutes)
    /// Parties change occasionally during parliament term
    /// </summary>
    public int PartiesCacheDurationMinutes { get; set; } = 720;

    /// <summary>
    /// Cache duration for members list (default: 3 hours = 180 minutes)
    /// Members can change due to resignations, replacements, etc.
    /// </summary>
    public int MembersCacheDurationMinutes { get; set; } = 180;

    /// <summary>
    /// Cache duration for absences data (default: 30 minutes)
    /// Absences are updated daily, but 30min ensures fresh data without excessive calls
    /// </summary>
    public int AbsencesCacheDurationMinutes { get; set; } = 30;

    /// <summary>
    /// Use absolute expiration (true) vs sliding expiration (false)
    /// Absolute = expires at exact time regardless of access
    /// Sliding = resets expiration timer on each access
    /// </summary>
    public bool UseAbsoluteExpiration { get; set; } = true;

    /// <summary>
    /// Maximum cache size in megabytes (default: 100 MB)
    /// Prevents memory issues on limited hosting plans
    /// </summary>
    public int MaxCacheSizeInMegabytes { get; set; } = 100;

    /// <summary>
    /// Enable detailed cache hit/miss logging (useful for monitoring)
    /// </summary>
    public bool EnableCacheLogging { get; set; } = true;
}
