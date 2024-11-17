import React from "react";
import { Typography } from "@mui/material";

interface TimerComponentProps {
  timer: number;
}

const Timer: React.FC<TimerComponentProps> = ({ timer }) => {
  return (
    <Typography className="timer" variant="h2">
      {formatTime(timer)}
    </Typography>
  );
};

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
};

export default Timer;
