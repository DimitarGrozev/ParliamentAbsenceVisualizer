import { useState, useEffect } from 'react';
import type { Absence, EnrichedAbsence, AbsenceRequest } from '../types/absence';
import { fetchAbsences } from '../services/api';
import { enrichAbsences } from '../utils/aggregations';
import { useAppContext } from '../context/AppContext';
import type { DateRange } from '../utils/datePresets';

interface UseAbsencesResult {
  absences: EnrichedAbsence[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch absences for a given date range
 * Automatically enriches absences with party and member information
 */
export function useAbsences(dateRange: DateRange): UseAbsencesResult {
  const { parties, members } = useAppContext();
  const [absences, setAbsences] = useState<EnrichedAbsence[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build request payload
      const request: AbsenceRequest = {
        search: 1,
        date1: dateRange.date1,
        date2: dateRange.date2,
        A_ns_MP_Name: '', // No member filter for now
      };

      const rawAbsences: Absence[] = await fetchAbsences(request);

      // Enrich absences with party and member information
      const enrichedAbsences = enrichAbsences(rawAbsences, parties, members);

      setAbsences(enrichedAbsences);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch absences';
      setError(errorMessage);
      console.error('Error fetching absences:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.date1, dateRange.date2]);

  return {
    absences,
    loading,
    error,
    refetch: fetchData,
  };
}
