import type { Absence, EnrichedAbsence, AggregatedMemberAbsence } from '../types/absence';
import type { Party, PartyWithAbsences } from '../types/party';
import type { Member } from '../types/member';
import { getMemberImageUrl } from '../services/api';

/**
 * Enrich absence data with party information
 */
export function enrichAbsenceWithPartyInfo(
  absence: Absence,
  parties: Party[]
): EnrichedAbsence {
  const party = parties.find(p => p.A_ns_C_id === absence.A_ns_C_id);

  return {
    ...absence,
    partyName: party?.A_ns_CL_value,
    partyShortName: party?.A_ns_CL_value,
    memberImageUrl: getMemberImageUrl(absence.A_ns_MP_id),
    fullName: `${absence.A_ns_MPL_Name1} ${absence.A_ns_MPL_Name2} ${absence.A_ns_MPL_Name3}`.trim(),
  };
}

/**
 * Enrich absence data with member information
 */
export function enrichAbsenceWithMemberInfo(
  absence: Absence,
  members: Member[]
): EnrichedAbsence {
  const member = members.find(m => m.A_ns_MP_id === absence.A_ns_MP_id);

  return {
    ...absence,
    partyName: member?.A_ns_CL_value,
    partyShortName: member?.A_ns_CL_value_short,
    memberImageUrl: getMemberImageUrl(absence.A_ns_MP_id),
    fullName: `${absence.A_ns_MPL_Name1} ${absence.A_ns_MPL_Name2} ${absence.A_ns_MPL_Name3}`.trim(),
  };
}

/**
 * Enrich all absences with party and member information
 */
export function enrichAbsences(
  absences: Absence[],
  parties: Party[],
  members: Member[]
): EnrichedAbsence[] {
  return absences.map(absence => {
    const party = parties.find(p => p.A_ns_C_id === absence.A_ns_C_id);
    const member = members.find(m => m.A_ns_MP_id === absence.A_ns_MP_id);

    return {
      ...absence,
      partyName: party?.A_ns_CL_value || member?.A_ns_CL_value,
      partyShortName: party?.A_ns_CL_value || member?.A_ns_CL_value_short,
      memberImageUrl: getMemberImageUrl(absence.A_ns_MP_id),
      fullName: `${absence.A_ns_MPL_Name1} ${absence.A_ns_MPL_Name2} ${absence.A_ns_MPL_Name3}`.trim(),
    };
  });
}

/**
 * Aggregate absences by party
 * Counts total absence records per party (not unique members)
 */
export function aggregateAbsencesByParty(absences: Absence[]): Record<number, number> {
  const partyAbsenceCounts: Record<number, number> = {};

  absences.forEach(absence => {
    const partyId = absence.A_ns_C_id;
    partyAbsenceCounts[partyId] = (partyAbsenceCounts[partyId] || 0) + 1;
  });

  return partyAbsenceCounts;
}

/**
 * Get top N parties by total absence count
 * @param absences - List of absences
 * @param parties - List of all parties
 * @param limit - Number of top parties to return (default: 3)
 */
export function getTopAbsentParties(
  absences: Absence[],
  parties: Party[],
  limit = 3
): PartyWithAbsences[] {
  const partyAbsenceCounts = aggregateAbsencesByParty(absences);

  // Create array of parties with their absence counts
  const partiesWithAbsences: PartyWithAbsences[] = parties
    .map(party => ({
      ...party,
      absenceCount: partyAbsenceCounts[party.A_ns_C_id] || 0,
    }))
    .filter(party => party.absenceCount > 0); // Only include parties with absences

  // Sort by absence count (descending) and take top N
  return partiesWithAbsences
    .sort((a, b) => b.absenceCount - a.absenceCount)
    .slice(0, limit);
}

/**
 * Get initials from member name for fallback avatar
 */
export function getMemberInitials(absence: Absence | EnrichedAbsence | AggregatedMemberAbsence): string {
  const firstInitial = absence.A_ns_MPL_Name1?.charAt(0) || '';
  const lastInitial = absence.A_ns_MPL_Name3?.charAt(0) || '';
  return `${firstInitial}${lastInitial}`.toUpperCase();
}

/**
 * Aggregate absences by member
 * Groups all absences for each member and counts them
 * @param absences - List of enriched absences
 * @returns Array of aggregated member absences sorted by count (descending)
 */
export function aggregateAbsencesByMember(absences: EnrichedAbsence[]): AggregatedMemberAbsence[] {
  const memberAbsencesMap: Record<number, AggregatedMemberAbsence> = {};

  absences.forEach(absence => {
    const memberId = absence.A_ns_MP_id;

    if (!memberAbsencesMap[memberId]) {
      // Create new aggregated entry for this member
      memberAbsencesMap[memberId] = {
        A_ns_MP_id: memberId,
        fullName: absence.fullName,
        partyName: absence.partyName,
        partyShortName: absence.partyShortName,
        memberImageUrl: absence.memberImageUrl,
        absenceCount: 0,
        absences: [],
        A_ns_MPL_Name1: absence.A_ns_MPL_Name1,
        A_ns_MPL_Name2: absence.A_ns_MPL_Name2,
        A_ns_MPL_Name3: absence.A_ns_MPL_Name3,
        A_ns_CL_value: absence.A_ns_CL_value,
        A_ns_C_id: absence.A_ns_C_id,
      };
    }

    // Add this absence to the member's collection
    memberAbsencesMap[memberId].absences.push(absence);
    memberAbsencesMap[memberId].absenceCount++;
    // Update location to the most recent one
    memberAbsencesMap[memberId].A_ns_CL_value = absence.A_ns_CL_value;
  });

  // Convert to array and sort by absence count (descending)
  return Object.values(memberAbsencesMap)
    .sort((a, b) => b.absenceCount - a.absenceCount);
}
