import React from 'react';
import { format } from 'date-fns/format';
import { isSameDay } from 'date-fns/isSameDay';
import { startOfMonth } from 'date-fns/startOfMonth';
import { endOfMonth } from 'date-fns/endOfMonth';
import { eachDayOfInterval } from 'date-fns';
import { getDay } from 'date-fns/getDay';
import './InterviewCalendar.css';


const InterviewCalendar = ({ interviewDate }) => {
  if (!interviewDate) {
    return <p>No interview date provided.</p>;
  }

  const monthStart = startOfMonth(interviewDate);
  const monthEnd = endOfMonth(interviewDate);
 const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfMonth = getDay(monthStart);

  // Weekday labels
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];



  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h3>{format(interviewDate, 'MMMM yyyy')}</h3>
      </div>
      <div className="calendar-grid">
        {weekdays.map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="calendar-day empty" />
        ))}
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={`calendar-day ${isSameDay(day, interviewDate) ? 'highlight' : ''}`}
          >
            {format(day, 'd')}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewCalendar;