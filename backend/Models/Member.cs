using System.Text.Json.Serialization;

namespace ParliamentAbsenceVisualizer.Api.Models;

public class Member
{
    [JsonPropertyName("A_ns_C_id")]
    public int A_ns_C_id { get; set; }

    [JsonPropertyName("A_ns_MSP_date_F")]
    public string A_ns_MSP_date_F { get; set; } = string.Empty;

    [JsonPropertyName("A_ns_MSP_date_T")]
    public string A_ns_MSP_date_T { get; set; } = string.Empty;

    [JsonPropertyName("A_ns_MP_FM")]
    public int A_ns_MP_FM { get; set; }

    [JsonPropertyName("A_ns_MP_id")]
    public int A_ns_MP_id { get; set; }

    [JsonPropertyName("A_ns_CL_value")]
    public string A_ns_CL_value { get; set; } = string.Empty;

    [JsonPropertyName("A_ns_CL_value_short")]
    public string A_ns_CL_value_short { get; set; } = string.Empty;

    [JsonPropertyName("A_ns_MPL_Name1")]
    public string A_ns_MPL_Name1 { get; set; } = string.Empty;

    [JsonPropertyName("A_ns_MPL_Name2")]
    public string A_ns_MPL_Name2 { get; set; } = string.Empty;

    [JsonPropertyName("A_ns_MPL_Name3")]
    public string A_ns_MPL_Name3 { get; set; } = string.Empty;

    [JsonPropertyName("A_ns_MP_Pos_id")]
    public int A_ns_MP_Pos_id { get; set; }

    [JsonPropertyName("A_ns_MP_PosL_value")]
    public string A_ns_MP_PosL_value { get; set; } = string.Empty;

    [JsonPropertyName("A_ns_MP_PosL_value1")]
    public string A_ns_MP_PosL_value1 { get; set; } = string.Empty;

    [JsonPropertyName("A_ns_Va_name")]
    public string A_ns_Va_name { get; set; } = string.Empty;

    [JsonPropertyName("A_ns_MP_img")]
    public string A_ns_MP_img { get; set; } = string.Empty;
}
