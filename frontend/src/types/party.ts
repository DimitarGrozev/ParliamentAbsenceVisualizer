// Type definitions for Party API
// Endpoint: https://www.parliament.bg/api/v1/coll-list/bg/2

export interface Party {
  A_ns_C_id: number;           // Party ID
  A_ns_CT_id: number;          // Always 2 (unknown purpose)
  A_ns_CL_value: string;       // Party name
  A_ns_C_active_count: number; // Number of members in parliament
  A_ns_C_date_F: string;       // Start date (YYYY-MM-DD)
  A_ns_C_date_T: string;       // End date (YYYY-MM-DD, usually 9999-12-31)
}

// Enriched party data with absence statistics
export interface PartyWithAbsences extends Party {
  absenceCount: number;
}
