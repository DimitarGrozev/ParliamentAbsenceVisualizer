using System.Text.Json.Serialization;

namespace ParliamentAbsenceVisualizer.Api.Models;

public class MembersResponse
{
    [JsonPropertyName("A_ns_C_id")]
    public int A_ns_C_id { get; set; }

    [JsonPropertyName("A_ns_CL_value")]
    public string A_ns_CL_value { get; set; } = string.Empty;

    [JsonPropertyName("A_ns_CL_value_short")]
    public string A_ns_CL_value_short { get; set; } = string.Empty;

    [JsonPropertyName("A_ns_C_active_count")]
    public int A_ns_C_active_count { get; set; }

    [JsonPropertyName("colListMP")]
    public List<Member> ColListMP { get; set; } = new();
}
