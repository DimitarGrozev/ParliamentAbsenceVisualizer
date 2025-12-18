import { useState, useEffect } from 'react';
import type { MemberProfile } from '../types/memberProfile';

interface UseMemberProfileResult {
  profile: MemberProfile | null;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to fetch detailed member profile data from the API
 * @param memberId - The member ID to fetch profile for
 * @returns Profile data, loading state, and error state
 */
export function useMemberProfile(memberId: string | undefined): UseMemberProfileResult {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when memberId changes
    setProfile(null);
    setError(null);
    setLoading(true);

    // Don't fetch if no memberId
    if (!memberId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/memberprofile/${memberId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch member profile: ${response.statusText}`);
        }

        const data: MemberProfile = await response.json();
        setProfile(data);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [memberId]);

  return { profile, loading, error };
}
