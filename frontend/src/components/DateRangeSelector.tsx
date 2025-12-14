import { Box, Button, ButtonGroup, Stack } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { bg } from 'date-fns/locale';
import { useState } from 'react';
import type { DateRange } from '../utils/datePresets';
import {
  getToday,
  getThisWeek,
  getThisMonth,
  getAssemblyRange,
  getCustomRange,
} from '../utils/datePresets';

interface DateRangeSelectorProps {
  dateRange: DateRange;
  onChange: (dateRange: DateRange) => void;
}

/**
 * Date range selector with preset buttons and custom date pickers
 * Allows users to select predefined ranges or custom dates
 */
export function DateRangeSelector({ dateRange, onChange }: DateRangeSelectorProps) {
  const [startDate, setStartDate] = useState<Date | null>(dateRange.date1 ? new Date(dateRange.date1) : null);
  const [endDate, setEndDate] = useState<Date | null>(new Date(dateRange.date2));

  const handlePresetClick = (preset: 'today' | 'week' | 'month' | 'assembly') => {
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
    onChange(newRange);
  };

  const handleStartDateChange = (date: Date | null) => {
    if (date && endDate) {
      setStartDate(date);
      onChange(getCustomRange(date, endDate));
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date && startDate) {
      setEndDate(date);
      onChange(getCustomRange(startDate, date));
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={bg}>
      <Box sx={{ mb: 4 }}>
        <Stack spacing={3}>
          {/* Preset Buttons */}
          <ButtonGroup variant="outlined" fullWidth>
            <Button onClick={() => handlePresetClick('today')}>Today</Button>
            <Button onClick={() => handlePresetClick('week')}>This Week</Button>
            <Button onClick={() => handlePresetClick('month')}>This Month</Button>
            <Button onClick={() => handlePresetClick('assembly')}>Current Assembly</Button>
          </ButtonGroup>

          {/* Custom Date Pickers */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={handleStartDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={handleEndDateChange}
              minDate={startDate || undefined}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </Stack>
        </Stack>
      </Box>
    </LocalizationProvider>
  );
}
