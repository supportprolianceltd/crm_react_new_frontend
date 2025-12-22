import React, { useState, useEffect, useRef } from "react";
import { CalendarDaysIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import StatusBadge from "../../../components/StatusBadge";
import { getWeekRange } from "../../../utils/helpers";
import Table from "../../../components/Table/Table";

export const CalendarDropdown = ({ selectedDate, onSelect, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
  const calendarRef = useRef(null);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (

    <div className="OOcalendar-dropdown" ref={calendarRef}>
      <div className="OOcalendar-header">
        <button onClick={prevMonth} aria-label="Previous month">
          &lt;
        </button>
        <h4>
          {new Date(currentYear, currentMonth).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h4>
        <button onClick={nextMonth} aria-label="Next month">
          &gt;
        </button>
      </div>
      <div className="OOcalendar-weekdays">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day, i) => (
          <div key={i} className="weekday">
            {day}
          </div>
        ))}
      </div>
      <div className="OOcalendar-days">
        {Array(firstDayOfMonth)
          .fill(null)
          .map((_, i) => (
            <div key={`empty-${i}`} className="calendar-day empty" />
          ))}
        {days.map((day) => {
          const isSelected =
            day === selectedDate.getDate() &&
            currentMonth === selectedDate.getMonth() &&
            currentYear === selectedDate.getFullYear();
          const isToday =
            day === new Date().getDate() &&
            currentMonth === new Date().getMonth() &&
            currentYear === new Date().getFullYear();
          return (
            <div
              key={day}
              className={`OOcalendar-day ${isSelected ? "selected" : ""} ${
                isToday ? "today" : ""
              }`}
              onClick={() => {
                const newDate = new Date(currentYear, currentMonth, day);
                onSelect(newDate);
                onClose();
              }}
              aria-label={`Select date ${day}`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};


// export const ActionDropdown = ({ index, isLastRow }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef(null);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const dropdownVariants = {
//     hidden: { opacity: 0, y: -10, scale: 0.95 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       scale: 1,
//       transition: { duration: 0.2, ease: "easeOut" },
//     },
//     exit: {
//       opacity: 0,
//       y: -10,
//       scale: 0.95,
//       transition: { duration: 0.2, ease: "easeIn" },
//     },
//   };

//   return (
//     <div className="relative" ref={dropdownRef}>
//       <button
//         aria-label="More options"
//         title="More options"
//         className="mmmo-BBTH-Drop"
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         <EllipsisHorizontalIcon className="h-6 w-6" />
//       </button>
//       {isOpen && (
//         <motion.div
//           className={`dropdown-menu ${
//             isLastRow ? "last-row-dropdown" : "not-last-row-dropdown"
//           }`}
//           variants={dropdownVariants}
//           initial="hidden"
//           animate="visible"
//           exit="exit"
//         >
//           <Link
//             to={`/attendance-report/${index}`}
//             onClick={() => setIsOpen(false)}
//           >
//             Report
//           </Link>
//         </motion.div>
//       )}
//     </div>
//   );
// };

// export const PaginationControls = ({
//   currentPage,
//   totalPages,
//   rowsPerPage,
//   onRowsPerPageChange,
//   onPrevPage,
//   onNextPage,
// }) => (
//   <div className="pagination-controls">
//     <div className="Dash-OO-Boas-foot">
//       <div className="Dash-OO-Boas-foot-1">
//         <div className="items-per-page">
//           <p>Number of rows:</p>
//           <select
//             className="form-select"
//             value={rowsPerPage}
//             onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
//             aria-label="Select number of rows per page"
//           >
//             <option value={5}>5</option>
//             <option value={10}>10</option>
//             <option value={20}>20</option>
//             <option value={50}>50</option>
//           </select>
//         </div>
//       </div>
//     </div>
//     <div className="page-navigation">
//       <span className="page-info">
//         Page {currentPage} of {totalPages}
//       </span>
//       <div className="page-navigation-Btns">
//         <button
//           className="page-button"
//           onClick={onPrevPage}
//           disabled={currentPage === 1}
//           aria-label="Previous page"
//         >
//           <ChevronLeftIcon className="h-5 w-5" />
//         </button>
//         <button
//           className="page-button"
//           onClick={onNextPage}
//           disabled={currentPage === totalPages}
//           aria-label="Next page"
//         >
//           <ChevronRightIcon className="h-5 w-5" />
//         </button>
//       </div>
//     </div>
//   </div>
// );

const AttendanceSection = ({ filters, setFilters, attendanceData }) => {
  const [showAttendanceCalendar, setShowAttendanceCalendar] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredData?.length / itemsPerPage);

  const tableColumns = [
    {
      key: "date",
      header: "Date",
      render: (entry) => formatDate(entry.date),
    },
    {
      key: "day",
      header: "Day",
    },
    {
      key: "clockIn",
      header: "Clock In",
      render: (entry) => (
        <div className="DDa-Statuss">
          <p>{entry.clockIn}</p>
          <span className={entry.clockInStatus}>
            {entry.clockInStatus.replace("-", " ")}
          </span>
        </div>
      ),
    },
    {
      key: "clockOut",
      header: "Clock Out",
      render: (entry) => (
        <div className="DDa-Statuss">
          <p>{entry.clockOut}</p>
          <span className={entry.clockOutStatus}>
            {entry.clockOutStatus.replace("-", " ")}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (entry) => {
        let status = "present";
        let variant = "success";

        if (!entry.clockIn || !entry.clockOut) {
          status = "absent";
          variant = "error";
        } else if (
          entry.clockInStatus === "late-entry" ||
          entry.clockOutStatus === "early-exit"
        ) {
          status = "partial";
          variant = "warning";
        }

        return <StatusBadge status={status} variant={variant} />;
      },
    },
    {
      key: "remark",
      header: "Remark",
      render: (entry) => <span className="remack-SmmmnRy">{entry.remark}</span>,
    },
  ];

  useEffect(() => {
    let filtered = attendanceData;

    if (filters?.date) {
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date);
        return (
          entryDate.getFullYear() === filters?.date.getFullYear() &&
          entryDate.getMonth() === filters?.date.getMonth() &&
          entryDate.getDate() === filters?.date.getDate()
        );
      });
    } else if (filters?.period === "This Week") {
      const today = new Date();
      const { start, end } = getWeekRange(today);
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= start && entryDate <= end;
      });
    } else if (filters?.month !== "Month" && filters?.year !== "Year") {
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
      ].indexOf(filters?.month);
      filtered = filtered?.filter((entry) => {
        const entryDate = new Date(entry.date);
        return (
          entryDate.getMonth() === monthIndex &&
          entryDate.getFullYear() === Number(filters?.year)
        );
      });
    } else if (filters?.month !== "Month") {
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
      ].indexOf(filters?.month);
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === monthIndex;
      });
    } else if (filters?.year !== "Year") {
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === Number(filters?.year);
      });
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [filters, attendanceData]);

  const handleAttendanceDateSelect = (date) => {
    setFilters({
      period: "Today",
      date,
      month: "Month",
      year: "Year",
    });
    setShowAttendanceCalendar(false);
  };

  const handleMonthSelect = (e) => {
    setFilters((prev) => ({
      ...prev,
      period: null,
      date: null,
      month: e.target.value,
    }));
  };

  const handleYearSelect = (e) => {
    setFilters((prev) => ({
      ...prev,
      period: null,
      date: null,
      year: e.target.value,
    }));
  };

  const handlePeriodSelect = (period) => {
    setFilters({
      period,
      date: null,
      month: "Month",
      year: "Year",
    });
  };

  const handleResetFilters = () => {
    setFilters({
      period: "All Dates",
      date: null,
      month: "Month",
      year: "Year",
    });
    setShowAttendanceCalendar(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const periodText = filters?.date
    ? formatDate(filters?.date)
    : filters?.month !== "Month" && filters?.year !== "Year"
    ? `${filters?.month} ${filters?.year}`
    : filters?.month !== "Month"
    ? filters?.month
    : filters?.year !== "Year"
    ? filters?.year
    : filters?.period;

  return (
    <div className="Attendd-Sec Simp-Boxshadow">
      <div className="GHGb-MMIn-DDahs-Top">
        <div className="olikk-IOkiks">
          <h3>Attendance - {periodText}</h3>
        </div>
        <div className="olikk-IOkiks olkk-Hnn">
          <select
            value={filters?.month}
            onChange={handleMonthSelect}
            className="form-select"
            aria-label="Select month"
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
            value={filters?.year}
            onChange={handleYearSelect}
            className="form-select"
            aria-label="Select year"
          >
            <option value="Year">Year</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
            <option value="2029">2029</option>
            <option value="2030">2030</option>
          </select>
          <ul className="period-controls">
            <li
              className={
                filters?.period === "This Week" ? "active-GGTba-LI" : ""
              }
              onClick={() => handlePeriodSelect("This Week")}
              aria-label="Filter by this week"
            >
              This Week
            </li>
            <li
              className={
                filters?.period === "All Dates" ? "active-GGTba-LI" : ""
              }
              onClick={() => handlePeriodSelect("All Dates")}
              aria-label="Show all dates"
            >
              All Dates
            </li>
            <li
              style={{ position: "relative" }}
              onClick={() => setShowAttendanceCalendar(!showAttendanceCalendar)}
              aria-label="Open calendar"
            >
              <CalendarDaysIcon className="h-6 w-6" />
              Calendar
              {showAttendanceCalendar && (
                <div
                  className="OOcalendar-container"
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    zIndex: 100,
                  }}
                >
                  <CalendarDropdown
                    selectedDate={filters?.date || new Date()}
                    onSelect={handleAttendanceDateSelect}
                    onClose={() => setShowAttendanceCalendar(false)}
                  />
                </div>
              )}
            </li>
            <li
              onClick={handleResetFilters}
              aria-label="Reset filters"
              style={{ cursor: "pointer" }}
              title="Reset"
            >
              <ArrowPathIcon />
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
};

export default AttendanceSection;
