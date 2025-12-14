import { useState, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Typography, CircularProgress, Alert } from '@mui/material';
import { MainLayout } from './components/Layout/MainLayout';
import { DateRangeSelector } from './components/DateRangeSelector';
import { TopAbsentPartiesPanel } from './components/TopAbsentPartiesPanel';
import { AbsentMembersList } from './components/AbsentMembersList';
import { AppProvider, useAppContext } from './context/AppContext';
import { useAbsences } from './hooks/useAbsences';
import { getToday } from './utils/datePresets';
import { getTopAbsentPartiesByName } from './utils/aggregations';
import { theme } from './theme';
import type { DateRange } from './utils/datePresets';

/**
 * Main dashboard component
 * Displays date selector, top absent parties, and absent members list
 */
function Dashboard() {
  const { assembly, members, loading: contextLoading, error: contextError } = useAppContext();
  const [dateRange, setDateRange] = useState<DateRange>(getToday());
  const { absences, loading: absencesLoading, error: absencesError } = useAbsences(dateRange);

  // Calculate top 3 parties by grouping enriched absences by party name
  const topParties = useMemo(
    () => getTopAbsentPartiesByName(absences, members, 3),
    [absences, members]
  );
  // Show loading state while initial data loads
  if (contextLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading parliament data...
        </Typography>
      </Box>
    );
  }

  // Show error state
  if (contextError) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {contextError}
      </Alert>
    );
  }

  return (
    <>
      {/* Assembly Info */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          {assembly?.A_ns_CL_value_short || assembly?.A_ns_CL_value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Active Members: {assembly?.A_ns_C_active_count}
        </Typography>
      </Box>

      {/* Date Range Selector */}
      <DateRangeSelector dateRange={dateRange} onChange={setDateRange} />

      {/* Top Absent Parties */}
      <TopAbsentPartiesPanel parties={topParties} />

      {/* Absent Members Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
          Absent Members
        </Typography>
        <AbsentMembersList
          absences={absences}
          loading={absencesLoading}
          error={absencesError}
        />
      </Box>
    </>
  );
}

/**
 * Root App component with providers
 */
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <MainLayout>
          <Dashboard />
        </MainLayout>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
