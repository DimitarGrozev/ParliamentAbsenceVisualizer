// Type definitions for Absence API
// Endpoint: https://www.parliament.bg/api/v1/mp-absense/bg

export interface Absence {
  MP_Ab_id: number;          // Absence ID
  MP_Ab_date: string;        // Absence date (YYYY-MM-DD)
  A_ns_MP_id: number;        // Member ID
  MP_Ab_T_id: number;        // Absence type (1 or 2, purpose unknown)
  A_ns_MPL_Name1: string;    // First name
  A_ns_MPL_Name2: string;    // Middle name
  A_ns_MPL_Name3: string;    // Last name
  A_ns_CL_value: string;     // Assembly or commission name
  A_ns_C_id: number;         // Party ID
  memberImageUrl: string;    // Direct URL to member image from parliament.bg
}

// Enriched absence data with member and party information
export interface EnrichedAbsence extends Absence {
  partyName?: string;
  partyShortName?: string;
  memberImageUrl: string;
  fullName: string;
}

// Aggregated absence data for a member (multiple absences combined)
export interface AggregatedMemberAbsence {
  A_ns_MP_id: number;        // Member ID
  fullName: string;          // Full name
  partyName?: string;        // Party name
  partyShortName?: string;   // Party short name
  memberImageUrl: string;    // Member image URL
  absenceCount: number;      // Total number of absences
  absences: EnrichedAbsence[]; // All individual absences for this member
  A_ns_MPL_Name1: string;    // First name (for initials)
  A_ns_MPL_Name2: string;    // Middle name
  A_ns_MPL_Name3: string;    // Last name (for initials)
  A_ns_CL_value: string;     // Most recent location
  A_ns_C_id: number;         // Party ID
}

// API request payload for fetching absences
export interface AbsenceRequest {
  search: 1;        // Always 1
  date1: string;    // Start date (YYYY-MM-DD)
  date2: string;    // End date (YYYY-MM-DD)
  A_ns_MP_Name: string; // Member name filter (empty string for all)
}
