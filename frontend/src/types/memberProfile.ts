/**
 * Type definitions for member profile data from parliament.bg API
 */

/** Municipality where a member was elected */
export interface Municipality {
  A_ns_Va_M_id: number;
  A_ns_Va_M_name: string;
}

/** Political structure membership (assembly, commission, friendship group) */
export interface Membership {
  A_ns_CL_value: string;
  A_ns_MP_PosL_value: string;
  A_ns_CT_id: number;
  A_ns_MSP_id: number;
  A_ns_C_id: number;
  A_ns_MP_id: number;
  A_ns_MP_Pos_id: number;
  A_ns_MSP_date_F: string;
  A_ns_MSP_date_T: string;
  A_ns_MSP_note: string;
  sync_ID: number;
}

/** Law proposed by the member */
export interface ImportedAct {
  L_Act_id: number;
  synch_ID_new_id: number;
  L_Act_T_id: number;
  L_Act_sign: string;
  L_Ses_id: number;
  L_Act_new_id: number;
  L_Act_date: string;
  L_Act_date2: string;
  L_Act_date_dv: string | null;
  L_Act_dv_year: number | null;
  L_Act_dv_iss: string;
  L_Act_dv_ID: number;
  L_Act_author_text: string | null;
  L_act_proposal_date: string;
  L_act_proposal_date2: string;
  L_UT: number;
  L_Act_date_consult: string | null;
  L_Act_veto_date: string | null;
  L_Act_veto: string | null;
  sync_ID: number;
  C_St_id: number;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  L_ActL_title: string;
}

/** Question asked by the member to ministers */
export interface ControlQuestion {
  ID: number;
  ANOT: string;
  DAT_OTG: string;
  DAT_PISOTG: string | null;
  VID_OTG: number;
  DAT_VRACHVANE: string | null;
  STATUS: number;
  DATE_DOC: string;
  Type: number;
  A_ns_MPL_Name1: string;
  A_ns_MP_PosL_value: string;
  TypeQuestion: string;
  TypeAnswer: string;
  typeCl: string;
}

/** Legislative amendment made during second reading */
export interface LegislativeImport {
  ID: number;
  L_Act_id: number;
  RN_DOC: string;
  DAT_DOC: string;
  ANOT: string;
  C_St_id: number;
}

/** Complete member profile data */
export interface MemberProfile {
  A_ns_id: number;
  A_ns_MP_FM: number;
  A_ns_MP_BDate: string;
  A_ns_B_Country: string;
  A_ns_B_City: string;
  A_ns_MP_fbook: string;
  A_ns_MP_Email: string;
  A_ns_MP_phones: string;
  A_ns_MP_url: string;
  A_ns_MP_leg_count: number | null;
  A_ns_MP_com_count: number | null;
  A_ns_MP_del_count: number | null;
  A_ns_MP_frd_count: number | null;
  A_ns_MPL_id: number;
  A_ns_MP_id: number;
  C_Lang_id: number;
  A_ns_MPL_Name1: string;
  A_ns_MPL_Name2: string;
  A_ns_MPL_Name3: string;
  A_ns_MPL_CV: string;
  A_ns_MPL_Spec: string;
  A_ns_MPL_Prof: string;
  A_ns_MPL_wBranch: string;
  A_ns_MPL_City: string | null;
  A_ns_CoalL_value: string;
  A_ns_Coal_Prs: string;
  A_ns_MRL_value: string;
  A_ns_Va_name: string;
  A_ns_Va_id: number;
  A_ns_MP_img: string;

  // Arrays of detailed information
  munList: Municipality[];
  mshipList: Membership[];
  importActList: ImportedAct[];
  controlList: ControlQuestion[];
  legImportList: LegislativeImport[];

  // Empty arrays (included for completeness)
  expenseList: unknown[];
  meetingList: unknown[];
  penalty: unknown[];
  prsList: unknown[];
  lngList: unknown[];
  ScList: unknown[];
  penaltyColList: unknown[];
  penaltyNsList: unknown[];
  strList: unknown[];
}
