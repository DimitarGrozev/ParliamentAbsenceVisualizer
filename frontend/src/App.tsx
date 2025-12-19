import { useState, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Typography, CircularProgress, Alert } from '@mui/material';
import { MainLayout } from './components/Layout/MainLayout';
import { DynamicIslandNavbar } from './components/Layout/DynamicIslandNavbar';
import { TopAbsentPartiesPanel } from './components/TopAbsentPartiesPanel';
import { AbsentMembersList } from './components/AbsentMembersList';
import { AppProvider, useAppContext } from './context/AppContext';
import { useAbsences } from './hooks/useAbsences';
import { getTopAbsentPartiesByName } from './utils/aggregations';
import { theme } from './theme';
import type { DateRange } from './utils/datePresets';
import MemberDetailPage from './pages/MemberDetailPage';

/**
 * Main dashboard component
 * Displays dynamic island navbar, top absent parties, and absent members list
 */
function Dashboard() {
  const { members, loading: contextLoading, error: contextError } = useAppContext();
  const [dateRange, setDateRange] = useState<DateRange>({ date1: '', date2: '' });
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
      {/* Dynamic Island Navbar */}
      <DynamicIslandNavbar
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {/* Top Absent Parties */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 0, sm: 2, md: 4 }, mt: 4 }}>
        <TopAbsentPartiesPanel parties={topParties} />
      </Box>

      {/* Absent Members Section */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 0, sm: 2, md: 4 }, mb: 3 }}>
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
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/member/:memberId" element={<MemberDetailPage />} />
          </Routes>
        </MainLayout>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
