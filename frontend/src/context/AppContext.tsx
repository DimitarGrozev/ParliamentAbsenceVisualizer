import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Assembly } from '../types/assembly';
import type { Party } from '../types/party';
import type { Member } from '../types/member';
import type { Absence, EnrichedAbsence } from '../types/absence';
import { fetchAssembly, fetchMembers, fetchAbsences } from '../services/api';
import { enrichAbsences } from '../utils/aggregations';
import { preloadImages } from '../utils/imagePreloader';

interface AppContextType {
  assembly: Assembly | null;
  parties: Party[];
  members: Member[];
  allAbsences: EnrichedAbsence[];
  loading: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

/**
 * App Context Provider
 * Fetches and caches assembly, parties, and members data on mount
 * This data is shared across all components to avoid duplicate API calls
 */
export function AppProvider({ children }: AppProviderProps) {
  const [assembly, setAssembly] = useState<Assembly | null>(null);
  const [parties, setParties] = useState<Party[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [allAbsences, setAllAbsences] = useState<EnrichedAbsence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch assembly and members data
        const [assemblyData, membersData] = await Promise.all([
          fetchAssembly(),
          fetchMembers(),
        ]);

        // Extract unique parties from members (more accurate than /coll-list/bg/2)
        // This ensures party IDs match those in absence records
        const uniquePartiesMap = new Map<number, Party>();
        membersData.colListMP.forEach(member => {
          if (!uniquePartiesMap.has(member.A_ns_C_id)) {
            uniquePartiesMap.set(member.A_ns_C_id, {
              A_ns_C_id: member.A_ns_C_id,
              A_ns_CT_id: 2, // Parliamentary group type
              A_ns_CL_value: member.A_ns_CL_value,
              A_ns_C_active_count: 0, // Will be calculated
              A_ns_C_date_F: member.A_ns_MSP_date_F,
              A_ns_C_date_T: member.A_ns_MSP_date_T,
            });
          }
          // Count active members per party
          const party = uniquePartiesMap.get(member.A_ns_C_id)!;
          party.A_ns_C_active_count++;
        });

        const partiesFromMembers = Array.from(uniquePartiesMap.values());

        // Fetch ALL absences (no date constraints) for client-side filtering
        const rawAbsences: Absence[] = await fetchAbsences({
          search: 1,
          date1: '', // Empty = no start date constraint
          date2: '', // Empty = no end date constraint (get everything)
          A_ns_MP_Name: '',
        });

        // Enrich absences with party and member information
        const enrichedAbsences = enrichAbsences(rawAbsences, partiesFromMembers, membersData.colListMP);

        setAssembly(assemblyData);
        setParties(partiesFromMembers);
        setMembers(membersData.colListMP);
        setAllAbsences(enrichedAbsences);

        // Preload all unique member images in the background
        const uniqueImageUrls = [...new Set(enrichedAbsences.map(a => a.memberImageUrl))];
        preloadImages(uniqueImageUrls).catch(err => {
          console.warn('Some images failed to preload:', err);
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load initial data';
        setError(errorMessage);
        console.error('Error loading initial data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  const value: AppContextType = {
    assembly,
    parties,
    members,
    allAbsences,
    loading,
    error,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Custom hook to access App Context
 * Throws error if used outside AppProvider
 */
export function useAppContext(): AppContextType {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error('useAppContext must be used within AppProvider');
  }

  return context;
}
