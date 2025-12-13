import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Assembly } from '../types/assembly';
import type { Party } from '../types/party';
import type { Member } from '../types/member';
import { fetchAssembly, fetchParties, fetchMembers } from '../services/api';

interface AppContextType {
  assembly: Assembly | null;
  parties: Party[];
  members: Member[];
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [assemblyData, partiesData, membersData] = await Promise.all([
          fetchAssembly(),
          fetchParties(),
          fetchMembers(),
        ]);

        setAssembly(assemblyData);
        setParties(partiesData);
        setMembers(membersData.colListMP);
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
