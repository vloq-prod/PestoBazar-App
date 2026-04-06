// hooks/useCountdown.ts

import { useState, useEffect } from "react";

export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

const calculate = (expiryDate: string): CountdownResult => {
  const diff = new Date(expiryDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const totalSec = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
    expired: false,
  };
};

export const useCountdown = (expiryDate: string): CountdownResult => {
  const [time, setTime] = useState<CountdownResult>(() => calculate(expiryDate));

  useEffect(() => {
    const id = setInterval(() => setTime(calculate(expiryDate)), 1000);
    return () => clearInterval(id);
  }, [expiryDate]);

  return time;
};