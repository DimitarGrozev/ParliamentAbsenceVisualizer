import { Box, Typography } from '@mui/material';
import { PartyAbsenceCard } from './PartyAbsenceCard';
import type { PartyWithAbsences } from '../types/party';

interface TopAbsentPartiesPanelProps {
  parties: PartyWithAbsences[];
}

/**
 * Panel displaying top 3 parties with most absences
 * Shows ranking with medal indicators
 */
export function TopAbsentPartiesPanel({ parties }: TopAbsentPartiesPanelProps) {
  if (parties.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
        Top Parties by Absences
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
        }}
      >
        {parties.map((party, index) => (
          <PartyAbsenceCard key={party.A_ns_C_id} party={party} rank={index + 1} />
        ))}
      </Box>
    </Box>
  );
}
