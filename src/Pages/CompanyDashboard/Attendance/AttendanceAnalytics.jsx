import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UsersIcon, // Assuming UsersIcon is available; if not, import from @heroicons/react/24/outline
} from "@heroicons/react/24/outline";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { CalendarDropdown } from "./AttendanceSection";
import { getWeekRange } from "../../../utils/helpers";

const AnimatedCounter = ({ value, prefix = "", suffix = "" }) => {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1.4, stiffness: 70, damping: 20 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    mv.set(value);
    const unsub = spring.on("change", (v) =>
      setDisplay(v % 1 !== 0 ? parseFloat(v.toFixed(1)) : Math.floor(v))
    );
    return () => unsub();
  }, [value]);

  return (
    <h3>
      {prefix}
      {display}
      {suffix}
    </h3>
  );
};

const AttendanceAnalytics = ({ filters, setFilters, attendanceData, onCardClick }) => { // Add onCardClick prop
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  const calculateAnalytics = (data) => {
    // Staff who have clocked in (present, including those currently working)
    const present = data.filter(
      (entry) => entry.clockInTime
    ).length;
    
    // Staff who haven't clocked in at all (truly absent)
    const absent = data.filter(
      (entry) => !entry.clockInTime
    ).length;
    
    // Staff currently working (clocked in but not out)
    const currentlyWorking = data.filter(
      (entry) => entry.clockInTime && !entry.clockOutTime
    ).length;
    
    // Staff who have completed their shift (clocked in and out)
    const completed = data.filter(
      (entry) => entry.clockInTime && entry.clockOutTime
    ).length;
    
    const lateArrivals = data.filter(
      (entry) => entry.clockInStatus === "late-entry"
    ).length;
    const earlyDepartures = data.filter(
      (entry) => entry.clockOutStatus === "early-exit"
    ).length;

    // Calculate hours only for completed shifts
    const totalHours = data.reduce((sum, entry) => {
      if (!entry.clockInTime || !entry.clockOutTime) return sum;
      const inTime = new Date(entry.clockInTime);
      const outTime = new Date(entry.clockOutTime);
      return sum + (outTime - inTime) / (1000 * 60 * 60);
    }, 0);
    const averageHours = completed > 0 ? totalHours / completed : 0;

    return {
      totalDays: data.length,
      present,
      absent,
      currentlyWorking,
      completed,
      lateArrivals,
      earlyDepartures,
      averageHours,
    };
  };

  const handlePeriodSelect = (period) => {
    setFilters({
      period,
      date: null,
      month: "Month",
      year: "Year",
    });
    setShowCalendar(false);
  };

  const handleDateSelect = (date) => {
    setFilters({
      period: "Today",
      date,
      month: "Month",
      year: "Year",
    });
    setShowCalendar(false);
  };

  const handleMonthSelect = (e) => {
    const month = e.target.value;
    setFilters((prev) => ({
      ...prev,
      period: null,
      date: null,
      month,
    }));
    setShowCalendar(false);
  };

  const handleYearSelect = (e) => {
    const year = e.target.value;
    setFilters((prev) => ({
      ...prev,
      period: null,
      date: null,
      year,
    }));
    setShowCalendar(false);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const periodText = filters.date
    ? formatDate(filters.date)
    : filters.month !== "Month" && filters.year !== "Year"
    ? `${filters.month} ${filters.year}`
    : filters.month !== "Month"
    ? filters.month
    : filters.year !== "Year"
    ? filters.year
    : filters.period;

  const filteredData = useMemo(() => {
    let filtered = attendanceData;

    if (filters.date) {
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date || entry.rawAttendance?.date);
        return (
          entryDate.getFullYear() === filters.date.getFullYear() &&
          entryDate.getMonth() === filters.date.getMonth() &&
          entryDate.getDate() === filters.date.getDate()
        );
      });
    } else if (filters.period === "Today") {
      const today = new Date();
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date || entry.rawAttendance?.date);
        return entryDate.toDateString() === today.toDateString();
      });
    } else if (filters.period === "This Week") {
      const today = new Date();
      const { start, end } = getWeekRange(today);
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date || entry.rawAttendance?.date);
        return entryDate >= start && entryDate <= end;
      });
    } else if (filters.month !== "Month" && filters.year !== "Year") {
      const monthIndex = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ].indexOf(filters.month);
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date || entry.rawAttendance?.date);
        return (
          entryDate.getMonth() === monthIndex &&
          entryDate.getFullYear() === Number(filters.year)
        );
      });
    } else if (filters.month !== "Month") {
      const monthIndex = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ].indexOf(filters.month);
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date || entry.rawAttendance?.date);
        return entryDate.getMonth() === monthIndex;
      });
    } else if (filters.year !== "Year") {
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date || entry.rawAttendance?.date);
        return entryDate.getFullYear() === Number(filters.year);
      });
    }

    return filtered;
  }, [filters, attendanceData]);

  const analyticsData = calculateAnalytics(filteredData);

  const cards = [
    {
      title: "Total Staffs",
      icon: <UsersIcon />, // Or use a suitable icon; adjust import if needed
      value: analyticsData.totalDays,
      subtitle: `in this period`,
      bg: "#F3E5F5",
      color: "#7B1FA2",
      suffix: "",
      type: "total", // Type for filtering (resets to all)
    },
    {
      title: "Staffs Present",
      icon: <CheckCircleIcon />,
      value: analyticsData.present,
      subtitle: `out of ${analyticsData.totalDays} days`,
      bg: "#E8F5E9",
      color: "#388E3C",
      suffix: "",
      type: "present", // Add type for filtering
    },
    {
      title: "Staffs Absent",
      icon: <XCircleIcon />,
      value: analyticsData.absent,
      subtitle: `out of ${analyticsData.totalDays} days`,
      bg: "#FFEBEE",
      color: "#D32F2F",
      suffix: "",
      type: "absent", // Add type for filtering
    },
    {
      title: "Late Arrivals",
      icon: <ClockIcon />,
      value: analyticsData.lateArrivals,
      subtitle: `this period`,
      bg: "#FFF3E0",
      color: "#F57C00",
      suffix: "",
      type: "late", // Add type for filtering
    },
    {
      title: "Avg. Staff Work Hours",
      icon: <ClockIcon />,
      value: analyticsData.averageHours,
      subtitle: `per day`,
      bg: "#E0F7FA",
      color: "#00796B",
      suffix: " hrs",
      type: "average", // Add type for filtering (will reset)
    },
  ];

  return (
    <div className="GHGb-MMIn-DDahs-Sec unttoop-POPa">
      <div className="GHGb-MMIn-DDahs-Top">
        <div className="olikk-IOkiks">
          <h3>Attendance Analytics</h3>
          <p>{periodText}</p>
        </div>
        <ul className="period-controls">
          <li
            className={filters.period === "Today" ? "active-GGTba-LI" : ""}
            onClick={() => handlePeriodSelect("Today")}
          >
            Today
          </li>
          <li
            className={filters.period === "This Week" ? "active-GGTba-LI" : ""}
            onClick={() => handlePeriodSelect("This Week")}
          >
            This Week
          </li>
          <li
            className={filters.period === "Calendar" ? "active-GGTba-LI" : ""}
            onClick={() => setShowCalendar(!showCalendar)}
            style={{ position: "relative" }}
          >
            <CalendarDaysIcon /> Calendar
            {showCalendar && (
              <div
                className="OOcalendar-container"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  zIndex: 100,
                }}
              >
                <CalendarDropdown
                  selectedDate={filters.date || new Date()}
                  onSelect={handleDateSelect}
                  onClose={() => setShowCalendar(false)}
                />
              </div>
            )}
          </li>
          <select
            value={filters.month}
            onChange={handleMonthSelect}
            className="form-select"
          >
            <option value="Month">Month</option>
            <option value="January">January</option>
            <option value="February">February</option>
            <option value="March">March</option>
            <option value="April">April</option>
            <option value="May">May</option>
            <option value="June">June</option>
            <option value="July">July</option>
            <option value="August">August</option>
            <option value="September">September</option>
            <option value="October">October</option>
            <option value="November">November</option>
            <option value="December">December</option>
          </select>
          <select
            value={filters.year}
            onChange={handleYearSelect}
            className="form-select"
          >
            <option value="Year">Year</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
            <option value="2029">2029</option>
            <option value="2030">2030</option>
          </select>
        </ul>
      </div>

      <div className="ooilaui-Cards">
        {cards.map((card, index) => (
          <div 
            key={index} 
            className="ooilaui-Card Simp-Boxshadow" 
            onClick={() => onCardClick?.(card.type)} // Add click handler
            style={{ cursor: 'pointer' }} // Visual cue for clickability
          >
            <h4>
              {card.title}
              <span style={{ backgroundColor: card.bg, color: card.color }}>
                {card.icon}
              </span>
            </h4>
            <AnimatedCounter
              value={card.value}
              prefix={card.prefix}
              suffix={card.suffix}
            />
            <p>{card.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceAnalytics;