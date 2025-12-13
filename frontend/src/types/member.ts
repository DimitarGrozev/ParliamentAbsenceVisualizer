// Type definitions for Parliament Member API
// Endpoint: https://www.parliament.bg/api/v1/coll-list-ns/bg

export interface Member {
  A_ns_C_id: number;          // Party ID
  A_ns_MSP_date_F: string;    // Start date (YYYY-MM-DD)
  A_ns_MSP_date_T: string;    // End date (YYYY-MM-DD)
  A_ns_MP_FM: number;         // Gender? (1 or other values)
  A_ns_MP_id: number;         // Member ID
  A_ns_CL_value: string;      // Party full name
  A_ns_CL_value_short: string; // Party short name
  A_ns_MPL_Name1: string;     // First name
  A_ns_MPL_Name2: string;     // Middle name
  A_ns_MPL_Name3: string;     // Last name
  A_ns_MP_Pos_id: number;     // Position ID
  A_ns_MP_PosL_value: string; // Position (e.g., "Председател на НС")
  A_ns_MP_PosL_value1: string; // Secondary position
  A_ns_Va_name: string;       // Electoral region
  A_ns_MP_img: string;        // Image filename (e.g., "4833.png")
}

export interface MembersResponse {
  A_ns_C_id: number;
  A_ns_CL_value: string;
  A_ns_CL_value_short: string;
  A_ns_C_active_count: number;
  colListMP: Member[];
}
