// context/ClockContext.js
import React, { createContext, useContext, useState } from 'react';

const ClockContext = createContext();

export const useClock = () => useContext(ClockContext);

export const ClockProvider = ({ children }) => {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [clockOutTime, setClockOutTime] = useState(null);

  const clockIn = () => {
    setIsClockedIn(true);
    setClockInTime(new Date());
  };

  const clockOut = () => {
    setIsClockedIn(false);
    setClockOutTime(new Date());
  };

  return (
    <ClockContext.Provider
      value={{ isClockedIn, clockInTime, clockOutTime, clockIn, clockOut }}
    >
      {children}
    </ClockContext.Provider>
  );
};
