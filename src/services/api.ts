import type { Assembly } from '../types/assembly';
import type { Party } from '../types/party';
import type { MembersResponse } from '../types/member';
import type { Absence, AbsenceRequest } from '../types/absence';

// Use relative URL for Vite proxy in development
// In production, you'll need to configure your server to proxy these requests
const BASE_URL = '/api/v1';

// Generic fetch wrapper with error handling
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
    throw new Error('Failed to fetch data: Unknown error');
  }
}

/**
 * Fetch current assembly information
 * Returns the first assembly (index 0) which represents the current assembly
 */
export async function fetchAssembly(): Promise<Assembly> {
  const assemblies = await apiFetch<Assembly[]>(`${BASE_URL}/fn-assembly/bg`);

  if (!assemblies || assemblies.length === 0) {
    throw new Error('No assembly data available');
  }

  return assemblies[0];
}

/**
 * Fetch all current parties in parliament
 */
export async function fetchParties(): Promise<Party[]> {
  return apiFetch<Party[]>(`${BASE_URL}/coll-list/bg/2`);
}

/**
 * Fetch all current parliament members
 * This should be cached as members don't change often
 */
export async function fetchMembers(): Promise<MembersResponse> {
  return apiFetch<MembersResponse>(`${BASE_URL}/coll-list-ns/bg`);
}

/**
 * Fetch absences for a given date range and assembly
 */
export async function fetchAbsences(request: AbsenceRequest): Promise<Absence[]> {
  return apiFetch<Absence[]>(`${BASE_URL}/mp-absense/bg`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Generate member image URL from member ID
 * Uses relative URL for Vite proxy in development
 */
export function getMemberImageUrl(memberId: number): string {
  return `/images/Assembly/${memberId}.png`;
}
