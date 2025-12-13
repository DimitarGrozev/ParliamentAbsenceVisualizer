import { Card, CardContent, CardMedia, Typography, Box, Avatar, Chip, Badge } from '@mui/material';
import { useState } from 'react';
import type { EnrichedAbsence, AggregatedMemberAbsence } from '../types/absence';
import { getMemberInitials } from '../utils/aggregations';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';

interface AbsentMemberCardProps {
  absence: EnrichedAbsence | AggregatedMemberAbsence;
  onClick?: () => void; // Extension point for future detail view
}

// Type guard to check if absence is aggregated
function isAggregated(absence: EnrichedAbsence | AggregatedMemberAbsence): absence is AggregatedMemberAbsence {
  return 'absenceCount' in absence;
}

/**
 * Card component displaying an absent member with their photo
 * Emphasizes the member photo as the focal point
 * Supports both individual absences and aggregated member absences
 */
export function AbsentMemberCard({ absence, onClick }: AbsentMemberCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const aggregated = isAggregated(absence);

  // Format date for display (only for non-aggregated)
  const formattedDate = !aggregated
    ? format(new Date(absence.MP_Ab_date), 'dd MMM yyyy', { locale: bg })
    : null;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      {/* Member Photo with optional badge */}
      <Badge
        badgeContent={aggregated ? absence.absenceCount : null}
        color="error"
        overlap="circular"
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          width: '100%',
          '& .MuiBadge-badge': {
            fontSize: '1rem',
            height: '32px',
            minWidth: '32px',
            borderRadius: '16px',
            top: '12px',
            right: '12px',
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            paddingTop: '100%', // 1:1 Aspect ratio
            backgroundColor: 'grey.200',
            width: '100%',
          }}
        >
          {!imageError ? (
            <CardMedia
              component="img"
              image={absence.memberImageUrl}
              alt={absence.fullName}
              onError={handleImageError}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <Avatar
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 80,
                height: 80,
                fontSize: '2rem',
                bgcolor: 'primary.main',
              }}
            >
              {getMemberInitials(absence)}
            </Avatar>
          )}
        </Box>
      </Badge>

      {/* Member Information */}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h3" gutterBottom noWrap>
          {absence.fullName}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {absence.partyShortName || absence.partyName}
        </Typography>

        {aggregated ? (
          <Box sx={{ mt: 1, mb: 1 }}>
            <Chip
              label={`${absence.absenceCount} absences`}
              size="small"
              color="error"
              sx={{ mr: 1 }}
            />
          </Box>
        ) : (
          <Box sx={{ mt: 1, mb: 1 }}>
            <Chip
              label={formattedDate}
              size="small"
              color="error"
              variant="outlined"
              sx={{ mr: 1 }}
            />
          </Box>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {absence.A_ns_CL_value}
        </Typography>
      </CardContent>
    </Card>
  );
}
