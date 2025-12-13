using System.Text.Json.Serialization;

namespace ParliamentAbsenceVisualizer.Api.Models;

public class AbsenceRequest
{
    [JsonPropertyName("search")]
    public int Search { get; set; } = 1;

    [JsonPropertyName("date1")]
    public string Date1 { get; set; } = string.Empty;

    [JsonPropertyName("date2")]
    public string Date2 { get; set; } = string.Empty;

    [JsonPropertyName("A_ns_MP_Name")]
    public string A_ns_MP_Name { get; set; } = string.Empty;
}
