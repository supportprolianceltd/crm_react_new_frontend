import React, { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import "./SmallCalendar.css";

const SmallCalendar = ({ selectedDate, onSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Generate days array
  const days = [];
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Previous month
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Next month
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="small-calendar-wrapper">
      <div className="small-calendar-header">
        <button className="small-calendar-nav-btn" onClick={prevMonth}>
          <ChevronLeftIcon className="small-calendar-icon" />
        </button>
        <h3 className="small-calendar-month-year">
          {new Date(currentYear, currentMonth).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <button className="small-calendar-nav-btn" onClick={nextMonth}>
          <ChevronRightIcon className="small-calendar-icon" />
        </button>
      </div>

      <div className="small-calendar-weekdays">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
          <div key={i} className="small-calendar-weekday-label">
            {day}
          </div>
        ))}
      </div>

      <div className="small-calendar-grid">
        {Array(firstDayOfMonth)
          .fill(null)
          .map((_, i) => (
            <div key={`empty-${i}`} className="small-calendar-day empty"></div>
          ))}

        {days.map((day) => {
          const currentDate = new Date();
          const dateToCheck = new Date(currentYear, currentMonth, day);

          const isSelected =
            day === selectedDate.getDate() &&
            currentMonth === selectedDate.getMonth() &&
            currentYear === selectedDate.getFullYear();

          const isTodayDate =
            day === currentDate.getDate() &&
            currentMonth === currentDate.getMonth() &&
            currentYear === currentDate.getFullYear();

          return (
            <button
              key={day}
              className={`small-calendar-day ${isSelected ? "selected" : ""} ${
                isTodayDate ? "today" : ""
              }`}
              onClick={() => {
                const newDate = new Date(currentYear, currentMonth, day);
                onSelect(newDate);
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SmallCalendar;