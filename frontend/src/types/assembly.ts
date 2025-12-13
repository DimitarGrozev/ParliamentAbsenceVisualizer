// Type definitions for National Assembly API
// Endpoint: https://www.parliament.bg/api/v1/fn-assembly/bg

export interface Assembly {
  A_ns_C_id: number;
  A_ns_CL_value: string;
  A_ns_CL_value_short: string;
  A_ns_C_active_count: number;
  A_ns_C_date_F: string; // Format: YYYY-MM-DD
  A_ns_C_date_T: string; // Format: YYYY-MM-DD (usually 9999-12-31)
}

export interface AssemblyResponse {
  A_ns_C_id: number;
  A_ns_CL_value: string;
  A_ns_CL_value_short: string;
  A_ns_C_active_count: number;
  colListMP?: unknown[]; // Not used in current implementation
}
