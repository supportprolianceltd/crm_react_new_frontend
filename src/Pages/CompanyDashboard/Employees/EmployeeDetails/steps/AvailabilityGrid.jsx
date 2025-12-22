import { useState, useEffect } from "react";
import ToggleButton from "../../../../../components/ToggleButton";

export const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const times = ["Am", "PM", "Night"];

export const AvailabilityGrid = ({ value = {}, onChange }) => {
  const defaultAvailability = times.reduce((acc, time) => {
    acc[time] = days.reduce((dAcc, day) => {
      dAcc[day] = false;
      return dAcc;
    }, {});
    return acc;
  }, {});

  const [availability, setAvailability] = useState({
    ...defaultAvailability,
    ...value,
  });

  // Only sync down from parent when value changes
  useEffect(() => {
    setAvailability({
      ...defaultAvailability,
      ...value,
    });
  }, [value]);

  const handleToggle = (time, day, val) => {
    const updated = {
      ...availability,
      [time]: { ...availability[time], [day]: val },
    };
    setAvailability(updated);

    // Push change up immediately when user toggles
    if (onChange) {
      onChange(updated);
    }
  };

  return (
    <div className="availability-grid">
      <div className="grid-header">
        <div className="empty-cell"></div>
        {days.map((day) => (
          <div key={day} className="day-cell">
            {day}
          </div>
        ))}
      </div>

      {times.map((time) => (
        <div key={time} className="grid-row">
          <div className="time-cell">{time}</div>
          {days.map((day) => (
            <div key={day} className="toggle-cell">
              <ToggleButton
                isOn={availability[time][day]}
                onToggle={(val) => handleToggle(time, day, val)}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
