import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import type { PartyWithAbsences } from '../types/party';

interface PartyAbsenceCardProps {
  party: PartyWithAbsences;
  rank?: number; // 1, 2, 3 for top parties
  onClick?: () => void; // Extension point for future detail view
}

/**
 * Card component showing party absence statistics
 * Displays party name and total absence count
 */
export function PartyAbsenceCard({ party, rank, onClick }: PartyAbsenceCardProps) {
  // Medal emojis for top 3 ranks
  const getRankBadge = (rank?: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  const rankBadge = getRankBadge(rank);

  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={onClick}
    >
      <CardContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          pb: 2,
          '&:last-child': {
            pb: 2,
          },
        }}
      >
        {/* Rank Badge */}
        {rankBadge && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              fontSize: '2rem',
            }}
          >
            {rankBadge}
          </Box>
        )}

        {/* Party Name - Takes up available space */}
        <Typography variant="h6" component="h3" gutterBottom sx={{ pr: rank ? 6 : 0 }}>
          {party.A_ns_CL_value}
        </Typography>

        {/* Spacer to push content to bottom */}
        <Box sx={{ flex: 1 }} />

        {/* Absence Count - Sticks to bottom */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Chip
            label={`${party.absenceCount} absences`}
            color="error"
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
              height: 40,
              px: 1,
            }}
          />
        </Box>

        {/* Additional Info - Sticks to bottom */}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          Total members: {party.A_ns_C_active_count}
        </Typography>
      </CardContent>
    </Card>
  );
}
