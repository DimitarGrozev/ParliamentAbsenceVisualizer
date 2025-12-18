import { Box, Typography, CircularProgress, Alert, TextField } from '@mui/material';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AbsentMemberCard } from './AbsentMemberCard';
import type { EnrichedAbsence } from '../types/absence';
import { aggregateAbsencesByMember } from '../utils/aggregations';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import SearchIcon from '@mui/icons-material/Search';

interface AbsentMembersListProps {
  absences: EnrichedAbsence[];
  loading?: boolean;
  error?: string | null;
}

/**
 * Grid layout of absent member cards
 * Handles loading, error, and empty states
 * Always shows aggregated view grouped by member
 * Supports client-side name filtering
 */
export function AbsentMembersList({ absences, loading, error }: AbsentMembersListProps) {
  const navigate = useNavigate();
  const [nameFilter, setNameFilter] = useState('');

  // Filter absences by name (case-insensitive)
  // Must be before early returns to satisfy Rules of Hooks
  const filteredAbsences = useMemo(() => {
    if (!nameFilter.trim()) {
      return absences;
    }

    const filterLower = nameFilter.toLowerCase();
    return absences.filter(absence =>
      absence.fullName.toLowerCase().includes(filterLower)
    );
  }, [absences, nameFilter]);

  // Aggregate filtered absences by member (always aggregated)
  // Must be before early returns to satisfy Rules of Hooks
  const displayData = useMemo(() => {
    return aggregateAbsencesByMember(filteredAbsences);
  }, [filteredAbsences]);

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 300,
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  // Empty state
  if (absences.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300,
          color: 'text.secondary',
        }}
      >
        <EventBusyIcon sx={{ fontSize: 80, mb: 2, opacity: 0.5 }} />
        <Typography variant="h5" gutterBottom>
          No absences recorded for this period
        </Typography>
        <Typography variant="body2">
          Select a different date range to view absences
        </Typography>
      </Box>
    );
  }

  // Display grid of aggregated member cards
  return (
    <Box>
      {/* Controls: Search */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search by name */}
        <TextField
          placeholder="Search by name..."
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          size="small"
          sx={{ flexGrow: 1, minWidth: 200, maxWidth: 400 }}
          slotProps={{
            input: {
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            },
          }}
        />

        {/* Results count */}
        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
          {displayData.length} member{displayData.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Grid of cards or empty state */}
      {displayData.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 3,
          }}
        >
          {displayData.map((item) => (
            <AbsentMemberCard
              key={item.A_ns_MP_id}
              absence={item}
              onClick={() => navigate(`/member/${item.A_ns_MP_id}`)}
            />
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
            color: 'text.secondary',
          }}
        >
          <SearchIcon sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" gutterBottom>
            No results found
          </Typography>
          <Typography variant="body2">
            Try a different search term
          </Typography>
        </Box>
      )}
    </Box>
  );
}
