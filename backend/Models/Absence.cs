using System.Text.Json.Serialization;

namespace ParliamentAbsenceVisualizer.Api.Models;

public class Absence
{
    [JsonPropertyName("MP_Ab_id")]
    public int MP_Ab_id { get; set; }

    [JsonPropertyName("MP_Ab_date")]
    public string MP_Ab_date { get; set; } = string.Empty;

    [JsonPropertyName("A_ns_MP_id")]
    public int A_ns_MP_id { get; set; }

    [JsonPropertyName("MP_Ab_T_id")]
    public int MP_Ab_T_id { get; set; }

    [JsonPropertyName("A_ns_MPL_Name1")]
    public string A_ns_MPL_Name1 { get; set; } = string.Empty;

    [JsonPropertyName("A_ns_MPL_Name2")]
    public string A_ns_MPL_Name2 { get; set; } = string.Empty;

    [JsonPropertyName("A_ns_MPL_Name3")]
    public string A_ns_MPL_Name3 { get; set; } = string.Empty;

    [JsonPropertyName("A_ns_CL_value")]
    public string A_ns_CL_value { get; set; } = string.Empty;

    [JsonPropertyName("A_ns_C_id")]
    public int A_ns_C_id { get; set; }
}
