import { useState } from 'react';
import { Box, Typography, IconButton, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
  const [isExpanded, setIsExpanded] = useState(true);

  if (parties.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <Typography variant="h5" component="h2" sx={{ flex: 1 }}>
          Top Parties by Absences
        </Typography>
        <IconButton
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{
            transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 0.3s ease',
          }}
          aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>

      <Collapse in={isExpanded} timeout={300}>
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
      </Collapse>
    </Box>
  );
}
