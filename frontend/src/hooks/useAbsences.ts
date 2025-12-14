import { useMemo } from 'react';
import type { EnrichedAbsence } from '../types/absence';
import { useAppContext } from '../context/AppContext';
import type { DateRange } from '../utils/datePresets';

interface UseAbsencesResult {
  absences: EnrichedAbsence[];
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to filter absences for a given date range
 * Uses cached absences from AppContext and filters client-side
 * This eliminates API calls for date range changes after initial load
 */
export function useAbsences(dateRange: DateRange): UseAbsencesResult {
  const { allAbsences, loading, error } = useAppContext();

  // Filter absences by date range client-side
  const filteredAbsences = useMemo(() => {
    // If no date constraints, return all
    if (!dateRange.date1 && !dateRange.date2) {
      return allAbsences;
    }

    return allAbsences.filter(absence => {
      const absenceDate = absence.MP_Ab_date;

      // Check start date constraint
      if (dateRange.date1 && absenceDate < dateRange.date1) {
        return false;
      }

      // Check end date constraint
      if (dateRange.date2 && absenceDate > dateRange.date2) {
        return false;
      }

      return true;
    });
  }, [allAbsences, dateRange.date1, dateRange.date2]);

  return {
    absences: filteredAbsences,
    loading,
    error,
  };
}
