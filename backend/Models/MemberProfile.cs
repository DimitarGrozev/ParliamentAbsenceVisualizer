namespace ParliamentAbsenceVisualizer.Api.Models;

/// <summary>
/// Represents a municipality where a member was elected
/// </summary>
public class Municipality
{
    public int A_ns_Va_M_id { get; set; }
    public string A_ns_Va_M_name { get; set; } = string.Empty;
}

/// <summary>
/// Represents a political structure membership (assembly, commission, friendship group)
/// </summary>
public class Membership
{
    public string A_ns_CL_value { get; set; } = string.Empty;
    public string A_ns_MP_PosL_value { get; set; } = string.Empty;
    public int A_ns_CT_id { get; set; }
    public int A_ns_MSP_id { get; set; }
    public int A_ns_C_id { get; set; }
    public int A_ns_MP_id { get; set; }
    public int A_ns_MP_Pos_id { get; set; }
    public string A_ns_MSP_date_F { get; set; } = string.Empty;
    public string A_ns_MSP_date_T { get; set; } = string.Empty;
    public string A_ns_MSP_note { get; set; } = string.Empty;
    public int sync_ID { get; set; }
}

/// <summary>
/// Represents a law proposed by the member
/// </summary>
public class ImportedAct
{
    public int L_Act_id { get; set; }
    public int synch_ID_new_id { get; set; }
    public int L_Act_T_id { get; set; }
    public string L_Act_sign { get; set; } = string.Empty;
    public int L_Ses_id { get; set; }
    public string L_Act_date { get; set; } = string.Empty;
    public string L_Act_date2 { get; set; } = string.Empty;
    public string? L_Act_date_dv { get; set; }
    public int? L_Act_dv_year { get; set; }
    public string L_Act_dv_iss { get; set; } = string.Empty;
    public int L_Act_dv_ID { get; set; }
    public string? L_Act_author_text { get; set; }
    public string L_act_proposal_date { get; set; } = string.Empty;
    public string L_act_proposal_date2 { get; set; } = string.Empty;
    public int L_UT { get; set; }
    public string? L_Act_date_consult { get; set; }
    public string? L_Act_veto_date { get; set; }
    public string? L_Act_veto { get; set; }
    public int sync_ID { get; set; }
    public int C_St_id { get; set; }
    public string? created_at { get; set; }
    public string? updated_at { get; set; }
    public string? deleted_at { get; set; }
    public string L_ActL_title { get; set; } = string.Empty;
}

/// <summary>
/// Represents a question asked by the member to ministers
/// </summary>
public class ControlQuestion
{
    public int ID { get; set; }
    public string ANOT { get; set; } = string.Empty;
    public string DAT_OTG { get; set; } = string.Empty;
    public string? DAT_PISOTG { get; set; }
    public int VID_OTG { get; set; }
    public string? DAT_VRACHVANE { get; set; }
    public int STATUS { get; set; }
    public string DATE_DOC { get; set; } = string.Empty;
    public int Type { get; set; }
    public string A_ns_MPL_Name1 { get; set; } = string.Empty;
    public string A_ns_MP_PosL_value { get; set; } = string.Empty;
    public string TypeQuestion { get; set; } = string.Empty;
    public string TypeAnswer { get; set; } = string.Empty;
    public string typeCl { get; set; } = string.Empty;
}

/// <summary>
/// Represents a legislative amendment made during second reading
/// </summary>
public class LegislativeImport
{
    public int ID { get; set; }
    public int L_Act_id { get; set; }
    public string RN_DOC { get; set; } = string.Empty;
    public string DAT_DOC { get; set; } = string.Empty;
    public string ANOT { get; set; } = string.Empty;
    public int C_St_id { get; set; }
}

/// <summary>
/// Complete member profile data from parliament.bg API
/// </summary>
public class MemberProfile
{
    public int A_ns_id { get; set; }
    public int A_ns_MP_FM { get; set; }
    public string A_ns_MP_BDate { get; set; } = string.Empty;
    public string A_ns_B_Country { get; set; } = string.Empty;
    public string A_ns_B_City { get; set; } = string.Empty;
    public string A_ns_MP_fbook { get; set; } = string.Empty;
    public string A_ns_MP_Email { get; set; } = string.Empty;
    public string A_ns_MP_phones { get; set; } = string.Empty;
    public string A_ns_MP_url { get; set; } = string.Empty;
    public int? A_ns_MP_leg_count { get; set; }
    public int? A_ns_MP_com_count { get; set; }
    public int? A_ns_MP_del_count { get; set; }
    public int? A_ns_MP_frd_count { get; set; }
    public int A_ns_MPL_id { get; set; }
    public int A_ns_MP_id { get; set; }
    public int C_Lang_id { get; set; }
    public string A_ns_MPL_Name1 { get; set; } = string.Empty;
    public string A_ns_MPL_Name2 { get; set; } = string.Empty;
    public string A_ns_MPL_Name3 { get; set; } = string.Empty;
    public string A_ns_MPL_CV { get; set; } = string.Empty;
    public string A_ns_MPL_Spec { get; set; } = string.Empty;
    public string A_ns_MPL_Prof { get; set; } = string.Empty;
    public string A_ns_MPL_wBranch { get; set; } = string.Empty;
    public string? A_ns_MPL_City { get; set; }
    public string A_ns_CoalL_value { get; set; } = string.Empty;
    public string A_ns_Coal_Prs { get; set; } = string.Empty;
    public string A_ns_MRL_value { get; set; } = string.Empty;
    public string A_ns_Va_name { get; set; } = string.Empty;
    public int A_ns_Va_id { get; set; }
    public string A_ns_MP_img { get; set; } = string.Empty;

    // Lists
    public List<Municipality> munList { get; set; } = new();
    public List<Membership> mshipList { get; set; } = new();
    public List<ImportedAct> importActList { get; set; } = new();
    public List<ControlQuestion> controlList { get; set; } = new();
    public List<LegislativeImport> legImportList { get; set; } = new();

    // Empty lists from API (included for completeness)
    public List<object> expenseList { get; set; } = new();
    public List<object> meetingList { get; set; } = new();
    public List<object> penalty { get; set; } = new();
    public List<object> prsList { get; set; } = new();
    public List<object> lngList { get; set; } = new();
    public List<object> ScList { get; set; } = new();
    public List<object> penaltyColList { get; set; } = new();
    public List<object> penaltyNsList { get; set; } = new();
    public List<object> strList { get; set; } = new();
}
