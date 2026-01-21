import { Box, Typography, CircularProgress, Alert, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
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
  const [partyFilter, setPartyFilter] = useState('');

  // Extract unique party names from absences
  const availableParties = useMemo(() => {
    const partyNames = new Set<string>();
    absences.forEach(absence => {
      if (absence.partyName) {
        partyNames.add(absence.partyName);
      }
    });
    return Array.from(partyNames).sort((a, b) => a.localeCompare(b, 'bg'));
  }, [absences]);

  // Filter absences by name and party (case-insensitive)
  // Must be before early returns to satisfy Rules of Hooks
  const filteredAbsences = useMemo(() => {
    let filtered = absences;

    // Filter by party
    if (partyFilter) {
      filtered = filtered.filter(absence => absence.partyName === partyFilter);
    }

    // Filter by name
    if (nameFilter.trim()) {
      const filterLower = nameFilter.toLowerCase();
      filtered = filtered.filter(absence =>
        absence.fullName.toLowerCase().includes(filterLower)
      );
    }

    return filtered;
  }, [absences, nameFilter, partyFilter]);

  // Aggregate filtered absences by member (always aggregated)
  // Sort by number of absences (descending), then by name (ascending)
  // Must be before early returns to satisfy Rules of Hooks
  const displayData = useMemo(() => {
    const aggregated = aggregateAbsencesByMember(filteredAbsences);
    return aggregated.sort((a, b) => {
      // First sort by absence count (descending)
      if (b.absenceCount !== a.absenceCount) {
        return b.absenceCount - a.absenceCount;
      }
      // Then sort by full name (ascending)
      return a.fullName.localeCompare(b.fullName, 'bg');
    });
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
      {/* Controls: Search and Party Filter */}
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'stretch', sm: 'center' } }}>
        {/* Search by name */}
        <TextField
          placeholder="Filter by name..."
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          size="small"
          sx={{ width: { xs: '100%', sm: 300 } }}
          slotProps={{
            input: {
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            },
          }}
        />

        {/* Filter by party */}
        <FormControl size="small" sx={{ width: { xs: '100%', sm: 300 } }}>
          <InputLabel id="party-filter-label">Filter by party...</InputLabel>
          <Select
            labelId="party-filter-label"
            value={partyFilter}
            label="Filter by party..."
            onChange={(e) => setPartyFilter(e.target.value)}
          >
            <MenuItem value="">
              <em>All Parties</em>
            </MenuItem>
            {availableParties.map((party) => (
              <MenuItem key={party} value={party}>
                {party}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Results count */}
        <Typography variant="body2" color="text.secondary" sx={{ ml: { xs: 0, sm: 'auto' }, textAlign: { xs: 'right', sm: 'left' } }}>
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
