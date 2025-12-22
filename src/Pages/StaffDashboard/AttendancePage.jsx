import { useState } from "react";
import AttendanceAnalytics from "./AttendanceAnalytics";
import AttendanceSection from "./AttendanceSection";

const AttendancePage = () => {
  const [filters, setFilters] = useState({
    period: "All Dates",
    date: null,
    month: "Month",
    year: "Year",
  });

  const attendanceData = [
    {
      day: "Sunday",
      date: "2025-01-05",
      clockIn: "7:30 AM",
      clockInStatus: "early-entry",
      clockOut: "5:45 PM",
      clockOutStatus: "late-exit",
      remark: "Clocked in early, stayed late",
    },
    {
      day: "Friday",
      date: "2025-01-10",
      clockIn: "8:00 AM",
      clockInStatus: "late-entry",
      clockOut: "5:00 PM",
      clockOutStatus: "early-exit",
      remark: "Late due to traffic",
    },
    {
      day: "Wednesday",
      date: "2025-01-15",
      clockIn: "7:45 AM",
      clockInStatus: "early-entry",
      clockOut: "6:00 PM",
      clockOutStatus: "late-exit",
      remark: "Extended meeting",
    },
    {
      day: "Monday",
      date: "2025-01-20",
      clockIn: "8:15 AM",
      clockInStatus: "late-entry",
      clockOut: "4:45 PM",
      clockOutStatus: "early-exit",
      remark: "Personal appointment",
    },
    {
      day: "Sunday",
      date: "2025-06-01",
      clockIn: "7:50 AM",
      clockInStatus: "early-entry",
      clockOut: "5:30 PM",
      clockOutStatus: "late-exit",
      remark: "Weekend task",
    },
    {
      day: "Thursday",
      date: "2025-06-05",
      clockIn: "8:00 AM",
      clockInStatus: "late-entry",
      clockOut: "5:15 PM",
      clockOutStatus: "early-exit",
      remark: "Client meeting",
    },
    {
      day: "Tuesday",
      date: "2025-06-10",
      clockIn: "7:40 AM",
      clockInStatus: "early-entry",
      clockOut: "5:50 PM",
      clockOutStatus: "late-exit",
      remark: "Prepared reports",
    },
    {
      day: "Sunday",
      date: "2025-06-15",
      clockIn: "8:10 AM",
      clockInStatus: "late-entry",
      clockOut: "5:00 PM",
      clockOutStatus: "early-exit",
      remark: "Weekend shift",
    },
    {
      day: "Tuesday",
      date: "2025-07-01",
      clockIn: "7:30 AM",
      clockInStatus: "early-entry",
      clockOut: "5:45 PM",
      clockOutStatus: "late-exit",
      remark: "Clocked in early, stayed late",
    },
    {
      day: "Wednesday",
      date: "2025-07-02",
      clockIn: "8:00 AM",
      clockInStatus: "late-entry",
      clockOut: "5:00 PM",
      clockOutStatus: "early-exit",
      remark: "Late due to traffic",
    },
    {
      day: "Thursday",
      date: "2025-07-03",
      clockIn: "7:45 AM",
      clockInStatus: "early-entry",
      clockOut: "6:00 PM",
      clockOutStatus: "late-exit",
      remark: "Extended meeting",
    },
    {
      day: "Friday",
      date: "2025-07-04",
      clockIn: "8:15 AM",
      clockInStatus: "late-entry",
      clockOut: "4:45 PM",
      clockOutStatus: "early-exit",
      remark: "Personal appointment",
    },
    {
      day: "Saturday",
      date: "2025-07-05",
      clockIn: "7:50 AM",
      clockInStatus: "early-entry",
      clockOut: "5:30 PM",
      clockOutStatus: "late-exit",
      remark: "Worked on weekend task",
    },
    {
      day: "Sunday",
      date: "2025-07-13",
      clockIn: "7:30 AM",
      clockInStatus: "early-entry",
      clockOut: "5:45 PM",
      clockOutStatus: "late-exit",
      remark: "Clocked in early and clocked out late",
    },
    {
      day: "Wednesday",
      date: "2026-07-01",
      clockIn: "7:40 AM",
      clockInStatus: "early-entry",
      clockOut: "5:50 PM",
      clockOutStatus: "late-exit",
      remark: "Prepared reports",
    },
    {
      day: "Sunday",
      date: "2026-07-05",
      clockIn: "8:10 AM",
      clockInStatus: "late-entry",
      clockOut: "5:00 PM",
      clockOutStatus: "early-exit",
      remark: "Weekend shift",
    },
    {
      day: "Tuesday",
      date: "2026-07-10",
      clockIn: "7:55 AM",
      clockInStatus: "early-entry",
      clockOut: "6:15 PM",
      clockOutStatus: "late-exit",
      remark: "Overtime for project",
    },
    {
      day: "Saturday",
      date: "2026-08-01",
      clockIn: "8:05 AM",
      clockInStatus: "late-entry",
      clockOut: "4:50 PM",
      clockOutStatus: "early-exit",
      remark: "Early departure approved",
    },
    {
      day: "Wednesday",
      date: "2026-08-05",
      clockIn: "7:45 AM",
      clockInStatus: "early-entry",
      clockOut: "5:40 PM",
      clockOutStatus: "late-exit",
      remark: "Team collaboration session",
    },
    {
      day: "Monday",
      date: "2026-08-10",
      clockIn: "7:30 AM",
      clockInStatus: "early-entry",
      clockOut: "5:45 PM",
      clockOutStatus: "late-exit",
      remark: "Weekend support",
    },
  ];

  return (
    <>
      <AttendanceAnalytics
        filters={filters}
        setFilters={setFilters}
        attendanceData={attendanceData}
      />
      <AttendanceSection
        filters={filters}
        setFilters={setFilters}
        attendanceData={attendanceData}
      />
    </>
  );
};

export default AttendancePage;
