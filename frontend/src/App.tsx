import { useState, useMemo, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Typography, CircularProgress, Alert, Fab, Zoom } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
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
  const { members, loading: contextLoading, error: contextError, dashboardScrollPosition, setDashboardScrollPosition } = useAppContext();
  const [dateRange, setDateRange] = useState<DateRange>({ date1: '', date2: '' });
  const { absences, loading: absencesLoading, error: absencesError } = useAbsences(dateRange);

  // Calculate top 3 parties by grouping enriched absences by party name
  const topParties = useMemo(
    () => getTopAbsentPartiesByName(absences, members, 3),
    [absences, members]
  );

  // Restore scroll position when component mounts
  useEffect(() => {
    if (dashboardScrollPosition > 0) {
      window.scrollTo(0, dashboardScrollPosition);
    }
  }, []);

  // Track scroll position for save and show/hide scroll-to-top button
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setDashboardScrollPosition(window.scrollY);
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setDashboardScrollPosition]);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      <Box sx={{ pt: 14 }}>
        {/* Dynamic Island Navbar */}
        <DynamicIslandNavbar
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        {/* Top Absent Parties */}
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 0, sm: 2, md: 4 }, mt: { xs: 10, sm: 4 } }}>
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
      </Box>

      {/* Scroll to Top Button */}
      <Zoom in={showScrollTop}>
        <Fab
          size="medium"
          onClick={handleScrollToTop}
          sx={{
            backgroundColor: 'rgba(217, 239, 253, 0.7)',
            backdropFilter: 'blur(8px)',
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            '&:hover': {
              backgroundColor: 'rgba(200, 230, 250, 0.8)',
            },
          }}
          aria-label="scroll to top"
        >
          <KeyboardArrowUpIcon />
        </Fab>
      </Zoom>
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
      {/* Fixed background image of parliament building */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: {
            xs: 'translateX(-25%) scale(2.5)',
            sm: 'translateX(-30%) scale(1.8)',
            md: 'translateX(-42%)',
          },
          transformOrigin: 'bottom center',
          width: '100%',
          maxWidth: 1600,
          height: 'auto',
          zIndex: 0,
          pointerEvents: 'none',
          opacity: 0.1,
        }}
      >
        <img
          src="/parliament-bg.png"
          alt=""
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
          }}
        />
      </Box>
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
