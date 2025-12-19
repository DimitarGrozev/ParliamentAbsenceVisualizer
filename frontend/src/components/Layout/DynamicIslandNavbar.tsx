import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Collapse,
  Stack,
  Chip,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { bg } from 'date-fns/locale';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SearchIcon from '@mui/icons-material/Search';
import type { DateRange } from '../../utils/datePresets';
import { useAppContext } from '../../context/AppContext';
import {
  getToday,
  getThisWeek,
  getThisMonth,
  getAssemblyRange,
  getCustomRange,
} from '../../utils/datePresets';

interface DynamicIslandNavbarProps {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
}

/**
 * Dynamic Island-style navbar inspired by iPhone
 * Expands when at top, contracts when scrolling down
 * 2-row layout: title on row 1, date controls on row 2
 */
export function DynamicIslandNavbar({
  dateRange,
  onDateRangeChange,
}: DynamicIslandNavbarProps) {
  const theme = useTheme();
  const { refetchAbsences, memberNameFilter, setMemberNameFilter } = useAppContext();
  const [isExpanded, setIsExpanded] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [startDate, setStartDate] = useState<Date | null>(dateRange.date1 ? new Date(dateRange.date1) : null);
  const [endDate, setEndDate] = useState<Date | null>(dateRange.date2 ? new Date(dateRange.date2) : null);
  const [activePreset, setActivePreset] = useState<string>('assembly');
  const [isSearching, setIsSearching] = useState(false);
  const searchButtonRef = useRef<HTMLButtonElement | null>(null);

  // Sync internal state when dateRange prop changes
  useEffect(() => {
    setStartDate(dateRange.date1 ? new Date(dateRange.date1) : null);
    setEndDate(dateRange.date2 ? new Date(dateRange.date2) : null);
  }, [dateRange]);

  // Handle scroll to expand/contract navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 50) {
        // At the top - expand
        setIsExpanded(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down - contract
        setIsExpanded(false);
      } else {
        // Scrolling up - expand
        setIsExpanded(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handlePresetClick = async (preset: 'today' | 'week' | 'month' | 'assembly') => {
    let newRange: DateRange;

    switch (preset) {
      case 'today':
        newRange = getToday();
        break;
      case 'week':
        newRange = getThisWeek();
        break;
      case 'month':
        newRange = getThisMonth();
        break;
      case 'assembly':
        newRange = getAssemblyRange(); // No start date, only end date (today)
        break;
    }

    setStartDate(newRange.date1 ? new Date(newRange.date1) : null);
    setEndDate(new Date(newRange.date2));
    setActivePreset(preset);

    // Automatically fetch data with new date range, preserving member name filter
    setIsSearching(true);
    try {
      await refetchAbsences(newRange.date1, newRange.date2, memberNameFilter);
      onDateRangeChange(newRange);
    } catch (error) {
      console.error('Error fetching absences for preset:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    if (date && endDate) {
      onDateRangeChange(getCustomRange(date, endDate));
      setActivePreset('');
    } else if (!date && endDate) {
      // If clearing start date, use assembly range (no start, only end)
      onDateRangeChange({ date1: '', date2: endDate.toISOString().split('T')[0] });
      setActivePreset('');
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    if (date && startDate) {
      onDateRangeChange(getCustomRange(startDate, date));
      setActivePreset('');
    } else if (date && !startDate) {
      // If no start date, use assembly range (no start, only end)
      onDateRangeChange({ date1: '', date2: date.toISOString().split('T')[0] });
      setActivePreset('');
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const date1 = startDate ? startDate.toISOString().split('T')[0] : '';
      const date2 = endDate ? endDate.toISOString().split('T')[0] : '';

      await refetchAbsences(date1, date2, memberNameFilter);

      // Update the date range in parent component
      onDateRangeChange({ date1, date2 });
    } catch (error) {
      console.error('Error searching absences:', error);
    } finally {
      searchButtonRef.current?.blur();
      setIsSearching(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={bg}>
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1300,
          width: isExpanded ? { xs: '95%', sm: '90%', md: '75%', lg: '65%' } : { xs: '60%', sm: '50%', md: '40%' },
          maxWidth: isExpanded ? 1000 : 600,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Box
          sx={{
            background: `linear-gradient(135deg,
              ${alpha(theme.palette.primary.dark, 0.95)} 0%,
              ${alpha(theme.palette.primary.main, 0.92)} 50%,
              ${alpha(theme.palette.secondary.main, 0.9)} 100%)`,
            backdropFilter: 'blur(20px)',
            borderRadius: isExpanded ? 6 : 50,
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
            border: `1px solid ${alpha('#fff', 0.18)}`,
            padding: isExpanded ? { xs: 2, sm: 2.5 } : { xs: 1.5, sm: 2 },
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
          }}
        >
          {/* Compact Header - Always Visible */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{
              cursor: isExpanded ? 'default' : 'pointer',
            }}
            onClick={() => !isExpanded && setIsExpanded(true)}
          >
            <AccountBalanceIcon
              sx={{
                fontSize: isExpanded ? 28 : 24,
                color: 'white',
                transition: 'all 0.3s ease',
              }}
            />

            {!isExpanded && (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon sx={{ fontSize: 18, color: alpha('#fff', 0.8) }} />
                <Box sx={{ color: 'white', fontSize: 13, fontWeight: 500 }}>
                  {dateRange.date1
                    ? new Date(dateRange.date1).toLocaleDateString('bg-BG', { month: 'short', day: 'numeric' })
                    : 'From'}
                    {' - '}
                  {dateRange.date2
                    ? new Date(dateRange.date2).toLocaleDateString('bg-BG', { month: 'short', day: 'numeric' })
                    : 'To'}
                </Box>
              </Box>
            )}

            {isExpanded && (
              <Box sx={{ color: 'white', fontSize: { xs: 16, sm: 18 }, fontWeight: 600, flex: 1 }}>
                Bulgarian Parliament Absence Tracker
              </Box>
            )}
          </Stack>

          {/* Expanded Content - Single Row with Presets, Date Pickers, Member Name, and Search */}
          <Collapse in={isExpanded} timeout={400}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{
                mt: 2,
                alignItems: { xs: 'stretch', sm: 'center' }
              }}
            >
              {/* Date Range Presets */}
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {[
                  { key: 'today', label: 'Today' },
                  { key: 'week', label: 'Week' },
                  { key: 'month', label: 'Month' },
                  { key: 'assembly', label: 'Last 1000' },
                ].map((preset) => (
                  <Chip
                    key={preset.key}
                    label={preset.label}
                    size="small"
                    onClick={() => handlePresetClick(preset.key as any)}
                    sx={{
                      backgroundColor: activePreset === preset.key
                        ? alpha('#fff', 0.3)
                        : alpha('#fff', 0.1),
                      color: 'white',
                      fontWeight: activePreset === preset.key ? 600 : 500,
                      fontSize: '0.75rem',
                      height: 28,
                      border: `1px solid ${activePreset === preset.key ? alpha('#fff', 0.5) : 'transparent'}`,
                      '&:hover': {
                        backgroundColor: alpha('#fff', 0.25),
                      },
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </Stack>

              {/* Date Pickers - Compact */}
              <Stack direction="row" spacing={1} sx={{ flex: 1, minWidth: 0, alignItems: 'flex-start' }}>
                <DatePicker
                  label="From"
                  value={startDate}
                  onChange={handleStartDateChange}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      size: 'small',
                      placeholder: 'DD/MM/YYYY',
                      error: false,
                      sx: {
                        flex: 1,
                        minWidth: { xs: 48, sm: 0 },
                        maxWidth: { xs: 48, sm: 'none' },
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: alpha('#fff', 0.1),
                          color: 'white',
                          fontSize: '0.875rem',
                          justifyContent: { xs: 'center', sm: 'flex-start' },
                          paddingLeft: { xs: 0, sm: '14px' },
                          paddingRight: { xs: 0, sm: '14px' },
                          '& fieldset': {
                            borderColor: alpha('#fff', 0.3),
                          },
                          '&:hover fieldset': {
                            borderColor: alpha('#fff', 0.5),
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: alpha('#fff', 0.7),
                          },
                          '& input': {
                            display: { xs: 'none', sm: 'block' },
                            paddingLeft: { xs: 0, sm: 0 },
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: alpha('#fff', 0.7),
                          fontSize: '0.875rem',
                          display: { xs: 'none', sm: 'block' },
                        },
                        '& .MuiInputAdornment-root': {
                          marginLeft: { xs: 0, sm: 'auto' },
                          marginRight: { xs: 0, sm: 0 },
                        },
                        '& .MuiSvgIcon-root': {
                          color: alpha('#fff', 0.7),
                          fontSize: '1.25rem',
                        },
                      },
                    },
                    field: {
                      clearable: true,
                      onClear: () => handleStartDateChange(null),
                    },
                  }}
                />
                <DatePicker
                  label="To"
                  value={endDate}
                  onChange={handleEndDateChange}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      size: 'small',
                      placeholder: 'DD/MM/YYYY',
                      error: false,
                      sx: {
                        flex: 1,
                        minWidth: { xs: 48, sm: 0 },
                        maxWidth: { xs: 48, sm: 'none' },
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: alpha('#fff', 0.1),
                          color: 'white',
                          fontSize: '0.875rem',
                          justifyContent: { xs: 'center', sm: 'flex-start' },
                          paddingLeft: { xs: 0, sm: '14px' },
                          paddingRight: { xs: 0, sm: '14px' },
                          '& fieldset': {
                            borderColor: alpha('#fff', 0.3),
                          },
                          '&:hover fieldset': {
                            borderColor: alpha('#fff', 0.5),
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: alpha('#fff', 0.7),
                          },
                          '& input': {
                            display: { xs: 'none', sm: 'block' },
                            paddingLeft: { xs: 0, sm: 0 },
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: alpha('#fff', 0.7),
                          fontSize: '0.875rem',
                          display: { xs: 'none', sm: 'block' },
                        },
                        '& .MuiInputAdornment-root': {
                          marginLeft: { xs: 0, sm: 'auto' },
                          marginRight: { xs: 0, sm: 0 },
                        },
                        '& .MuiSvgIcon-root': {
                          color: alpha('#fff', 0.7),
                          fontSize: '1.25rem',
                        },
                      },
                    },
                    field: {
                      clearable: true,
                      onClear: () => handleEndDateChange(null),
                    },
                  }}
                />

                {/* Member Name Search */}
                <TextField
                  label="Member Name"
                  value={memberNameFilter}
                  onChange={(e) => setMemberNameFilter(e.target.value)}
                  placeholder="Search by name..."
                  size="small"
                  sx={{
                    minWidth: 160,
                    maxWidth: 180,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: alpha('#fff', 0.1),
                      color: 'white',
                      fontSize: '0.875rem',
                      '& fieldset': {
                        borderColor: alpha('#fff', 0.3),
                      },
                      '&:hover fieldset': {
                        borderColor: alpha('#fff', 0.5),
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: alpha('#fff', 0.7),
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: alpha('#fff', 0.7),
                      fontSize: '0.875rem',
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: alpha('#fff', 0.5),
                      opacity: 1,
                    },
                  }}
                />

                {/* Search Button */}
                <Tooltip title="">
                  <IconButton
                    ref={searchButtonRef}
                    onClick={handleSearch}
                    disabled={isSearching}
                    sx={{
                      backgroundColor: alpha('#fff', 0.15),
                      color: 'white',
                      height: 40,
                      width: 40,
                      '&:hover': {
                        backgroundColor: alpha('#fff', 0.25),
                      },
                      '&:disabled': {
                        backgroundColor: alpha('#fff', 0.05),
                        color: alpha('#fff', 0.3),
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <SearchIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Collapse>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
