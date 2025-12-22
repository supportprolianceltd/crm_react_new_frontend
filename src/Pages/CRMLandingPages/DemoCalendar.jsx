import React, { useEffect, useState, useRef } from "react";
import "./DemoCalendar.css";
import { ArrowLongRightIcon, ArrowLongLeftIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const calendarData = [
  { day: 0, start: 8, end: 9 },
  { day: 0, start: 10, end: 11 },
  { day: 1, start: 8.25, end: 8.5 },
  { day: 2, start: 9, end: 9.5 },
  { day: 4, start: 8, end: 9 },
  { day: 5, start: 8, end: 8.5 },
  { day: 5, start: 10, end: 11 },
  { day: 5, start: 14, end: 15 },
  { day: 5, start: 18, end: 19 },
  { day: 1, start: 14, end: 15 },
  { day: 3, start: 16, end: 17 },
  { day: 6, start: 12, end: 13 },
];

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hours = Array.from({ length: 13 }, (_, i) => 7 + i); // 7 AM - 7 PM

export default function DemoCalendar({ onSlotSelect }) {
  const [now, setNow] = useState(new Date());
  const [weekStartDate, setWeekStartDate] = useState(getStartOfWeek(new Date()));
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const calendarRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Close calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentDay = now.getDay();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  function getEventAt(dayIdx, hour) {
    return calendarData.find(
      (event) =>
        event.day === dayIdx &&
        hour >= Math.floor(event.start) &&
        hour < event.end
    );
  }

  function getTimeOfDay(hour) {
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  }

  function getStatus(dayIdx, hour) {
    const thisDate = new Date(weekStartDate);
    thisDate.setDate(weekStartDate.getDate() + dayIdx);
    const isToday = isSameDay(thisDate, now);

    const cellStart = new Date(thisDate);
    cellStart.setHours(hour, 0, 0, 0);

    const cellEnd = new Date(thisDate);
    cellEnd.setHours(hour + 1, 0, 0, 0);

    if (thisDate < new Date(now.toDateString())) {
      return "past";
    }

    if (isToday) {
      if (now >= cellEnd) {
        return "past";
      }
    }

    return "future";
  }

  function handlePrevWeek() {
    const prev = new Date(weekStartDate);
    prev.setDate(prev.getDate() - 7);
    setWeekStartDate(prev);
  }

  function handleNextWeek() {
    const next = new Date(weekStartDate);
    next.setDate(next.getDate() + 7);
    setWeekStartDate(next);
  }

  function handleDateSelect(date) {
    setWeekStartDate(getStartOfWeek(date));
    setShowCalendar(false);
  }

  function goToPrevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }

  function goToNextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }

  function goToToday() {
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  }

  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 6);

  const generateCalendarDays = () => {
    const daysArr = [];
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = endDate.getDate();
    const startDay = startDate.getDay();

    const prevMonthEnd = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const dayDate = new Date(currentYear, currentMonth - 1, prevMonthEnd - i);
      daysArr.push({
        date: dayDate,
        isCurrentMonth: false
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(currentYear, currentMonth, i);
      daysArr.push({
        date: dayDate,
        isCurrentMonth: true
      });
    }

    const totalCells = 42;
    const nextMonthDays = totalCells - daysArr.length;
    for (let i = 1; i <= nextMonthDays; i++) {
      const dayDate = new Date(currentYear, currentMonth + 1, i);
      daysArr.push({
        date: dayDate,
        isCurrentMonth: false
      });
    }

    return daysArr;
  };

  function getNearestCurrentAvailability() {
    if (currentDay < 0 || currentDay > 6) return null;
    const todayEvents = calendarData.filter(
      (event) => event.day === currentDay && event.end > currentHour
    );
    if (todayEvents.length === 0) return null;
    let nearest = todayEvents[0];
    let minDiff = Math.abs(nearest.start - currentHour);
    for (const ev of todayEvents) {
      const diff = Math.abs(ev.start - currentHour);
      if (diff < minDiff) {
        nearest = ev;
        minDiff = diff;
      }
    }
    return nearest;
  }

  const nearestAvailability = getNearestCurrentAvailability();
  const calendarDays = generateCalendarDays();

  return (
    <div className="Democalendar-container">
      <div className="Democalendar-header">
        <div className="ol-cardl">
          <button
            className="Demotoday-button"
            onClick={() => setWeekStartDate(getStartOfWeek(new Date()))}
          >
            Today
          </button>
          <div className="Democalendar-nav">
            <button onClick={handlePrevWeek}><ArrowLongLeftIcon className="nav-icon" /></button>
            {formatDateRange(weekStartDate, weekEndDate)}
            <button onClick={handleNextWeek}><ArrowLongRightIcon className="nav-icon" /></button>
          </div>
        </div>

        <div className="Democalendar-dropdown-container" ref={calendarRef}>
          <button
            className="Democalendar-dropdown"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            Calendar <ChevronDownIcon className="chevron-icon" />
          </button>
          {showCalendar && (
            <div className="Democalendar-popup">
              <div className="Democalendar-month-header">
                <button onClick={goToPrevMonth}>&lt;</button>
                <div>
                  {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} {currentYear}
                </div>
                <button onClick={goToNextMonth}>&gt;</button>
              </div>
              <button className="Demotoday-button" onClick={goToToday}>
                Today
              </button>
              <div className="Democalendar-weekdays">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
                  <div key={day} className="calendar-weekday">{day}</div>
                ))}
              </div>
              <div className="Democalendar-days-grid">
                {calendarDays.map((day, idx) => {
                  const isToday = isSameDay(day.date, now);
                  const isSelected = isSameDay(day.date, weekStartDate);

                  return (
                    <div
                      key={idx}
                      className={`calendar-day ${
                        !day.isCurrentMonth ? "other-month" : ""
                      } ${isToday ? "today" : ""} ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={() => handleDateSelect(day.date)}
                    >
                      {day.date.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="Democalendar-grid">
        <div className="Democalendar-times">
          <div className="calendar-day-header time-header"></div>
          {hours.map((h) => (
            <div key={h} className="calendar-cell time-cell">
              {h <= 11 ? h + " AM" : (h - 12 || 12) + " PM"}
            </div>
          ))}
        </div>

        {days.map((day, dayIdx) => {
          const dayDate = new Date(weekStartDate);
          dayDate.setDate(weekStartDate.getDate() + dayIdx);
          const isToday = isSameDay(dayDate, now);

          return (
            <div key={day} className="calendar-day-column">
              <div className={`calendar-day-header ${isToday ? "current-day" : ""}`}>
                <span>{day}</span> <p>{dayDate.getDate()}</p>
              </div>
              {hours.map((hour) => {
                const event = getEventAt(dayIdx, hour);
                const status = getStatus(dayIdx, hour);
                const timeOfDay = getTimeOfDay(hour);
                const isCurrent =
                  dayIdx === currentDay &&
                  hour <= currentHour &&
                  hour + 1 > currentHour &&
                  event;

                return (
                  <div
                    key={hour}
                    className={`calendar-cell ${
                      event && status === "past" ? "closed-slot" : status
                    } ${event && status !== "past" ? timeOfDay : ""} ${
                      isCurrent ? "current-available" : ""
                    } ${isToday ? "today-cell" : ""}`}
                    onClick={() => {
                      if (event && status !== "past") {
                        // Call the onSlotSelect prop with slot data
                        if (onSlotSelect) {
                          onSlotSelect({
                            day: days[dayIdx],
                            date: dayDate,
                            start: event.start,
                            end: event.end,
                            formattedDate: dayDate.toLocaleDateString(),
                            formattedTime: `${formatTime(event.start)} - ${formatTime(event.end)}`
                          });
                        }
                      }
                    }}
                    style={{
                      cursor:
                        event && status !== "past" ? "pointer" : "default",
                    }}
                  >
                    {event && status === "past" ? (
                      <div className="closed-text">Closed</div>
                    ) : event ? (
                      <>
                        <div className="event-name">Available</div>
                        <div className="event-time">
                          {formatTime(event.start)} - {formatTime(event.end)}
                        </div>
                      </>
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {nearestAvailability && (
        <div className="nearest-availability">
          <h3>Nearest Availability</h3>
          <p>
            {days[nearestAvailability.day]}{" "}
            {formatTime(nearestAvailability.start)} -{" "}
            {formatTime(nearestAvailability.end)}
          </p>
        </div>
      )}
    </div>
  );
}

function formatDateRange(start, end) {
  const startOptions = { month: "short", day: "numeric" };
  const endOptions = { month: "short", day: "numeric" };
  const startStr = start.toLocaleDateString(undefined, startOptions);
  const endStr = end.toLocaleDateString(undefined, endOptions);
  return `${startStr} - ${endStr}`;
}

function formatTime(time) {
  const hour = Math.floor(time);
  const minutes = Math.round((time - hour) * 60);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // Sunday is first day of week
  return new Date(d.setDate(diff));
}

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}