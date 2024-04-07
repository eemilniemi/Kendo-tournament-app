import { Box, Typography } from "@mui/material";
import React from "react";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import "dayjs/locale/en-gb";

interface DateRangePickerProps {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  onStartDateChange: (date: Dayjs | null) => void;
  onEndDateChange: (date: Dayjs | null) => void;
}

dayjs.locale("en-gb");

// A component to choose date range for filtering tournaments
const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}) => {
  const handleStartDateChange = (date: Dayjs | null): void => {
    onStartDateChange(date);
  };

  const handleEndDateChange = (date: Dayjs | null): void => {
    onEndDateChange(date);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <Box display="flex" alignItems="center" marginBottom="10px">
        <DatePicker
          value={startDate}
          onChange={handleStartDateChange}
          format="DD/MM/YYYY"
        />
        <Typography sx={{ marginX: 1 }}>-</Typography>
        <DatePicker
          value={endDate}
          onChange={handleEndDateChange}
          format="DD/MM/YYYY"
        />
      </Box>
    </LocalizationProvider>
  );
};

export default DateRangePicker;
