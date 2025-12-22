import React, { useState } from 'react';
import './Dragable-task-calendar.css';

const WeeklyCalendar = () => {
  // State for current date and events
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([
    { id: 1, title: 'Team Meeting', day: 1, startTime: 9, duration: 1 },
    { id: 2, title: 'Lunch with Client', day: 2, startTime: 12, duration: 1.5 },
    { id: 3, title: 'Project Review', day: 3, startTime: 14, duration: 2 },
    { id: 4, title: 'Gym', day: 4, startTime: 17, duration: 1 },
  ]);
  
  // Get start of week (Monday)
  const getStartOfWeek = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(start.setDate(diff));
  };

  // Generate week days
  const generateWeek = (startDate) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Navigation handlers
  const previousWeek = () => {
    setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)));
  };

  const nextWeek = () => {
    setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)));
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  // Drag and drop handlers
  const handleDragStart = (e, event) => {
    e.dataTransfer.setData('eventId', event.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dayIndex, hour) => {
    e.preventDefault();
    const eventId = parseInt(e.dataTransfer.getData('eventId'));
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        return { ...event, day: dayIndex, startTime: hour };
      }
      return event;
    });
    setEvents(updatedEvents);
  };

  // Generate time slots (8 AM to 8 PM)
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8);

  const weekStart = getStartOfWeek(currentDate);
  const weekDays = generateWeek(weekStart);

  return (
    <div style={styles.calendar}>
      <div style={styles.header}>
        <button style={styles.navButton} onClick={previousWeek}>&lt; Previous</button>
        <h2 style={styles.title}>
          {weekDays[0].toLocaleDateString()} - {weekDays[6].toLocaleDateString()}
        </h2>
        <div>
          <button style={styles.navButton} onClick={nextWeek}>Next &gt;</button>
          <button style={{...styles.navButton, marginLeft: '10px'}} onClick={today}>Today</button>
        </div>
      </div>

      <div style={styles.weekGrid}>
        {/* Time column */}
        <div style={styles.timeColumn}>
          <div style={styles.timeHeader}></div>
          {timeSlots.map(hour => (
            <div key={hour} style={styles.timeSlot}>
              {hour <= 12 ? `${hour} AM` : `${hour - 12} PM`}
            </div>
          ))}
        </div>
        
        {/* Day columns */}
        {weekDays.map((day, dayIndex) => (
          <div key={dayIndex} style={styles.dayColumn}>
            <div style={styles.dayHeader}>
              <div style={styles.weekday}>{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div style={styles.date}>{day.toLocaleDateString('en-US', { day: 'numeric' })}</div>
            </div>
            <div style={styles.timeSlots}>
              {timeSlots.map(hour => (
                <div 
                  key={hour} 
                  style={styles.timeSlot}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, dayIndex, hour)}
                >
                  {/* Render events for this time slot */}
                  {events
                    .filter(event => event.day === dayIndex && event.startTime === hour)
                    .map(event => (
                      <div 
                        key={event.id}
                        style={{
                          ...styles.event,
                          height: `${event.duration * 60}px`,
                        }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, event)}
                      >
                        {event.title}
                      </div>
                    ))
                  }
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Styles
const styles = {
  calendar: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
  },
  title: {
    margin: '0',
    fontSize: '1.2rem',
    color: '#333',
  },
  navButton: {
    padding: '8px 16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  weekGrid: {
    display: 'grid',
    gridTemplateColumns: '80px repeat(7, 1fr)',
    gap: '1px',
    backgroundColor: '#e0e0e0',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  timeColumn: {
    gridColumn: '1',
    backgroundColor: 'white',
  },
  dayColumn: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '0',
  },
  dayHeader: {
    backgroundColor: '#f5f5f5',
    padding: '12px',
    textAlign: 'center',
    position: 'sticky',
    top: '0',
    zIndex: '2',
    minHeight: '60px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  weekday: {
    fontWeight: 'bold',
    fontSize: '16px',
    color: '#333',
  },
  date: {
    fontSize: '20px',
    color: '#4CAF50',
  },
  timeSlots: {
    flex: '1',
  },
  timeSlot: {
    height: '60px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: 'white',
    position: 'relative',
    padding: '2px',
  },
  timeHeader: {
    height: '60px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  event: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '4px',
    borderRadius: '4px',
    fontSize: '12px',
    overflow: 'hidden',
    cursor: 'move',
    position: 'absolute',
    width: '95%',
    zIndex: '3',
  },
};

export default WeeklyCalendar;