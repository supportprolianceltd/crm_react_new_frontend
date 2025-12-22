import React, { useMemo } from "react";
import "./TaskCalendar.css";

/* ------------- CONFIG ------------- */
const startHour = 0; // 12 AM
const endHour = 23; // 11 PM
const DESK_ROW = 64;

// Days of the week
const days = [
  { label: "Monday", color: "#5C54FF" },
  { label: "Tuesday", color: "#9B26FF" },
  { label: "Wednesday", color: "#4A2AB7" },
  { label: "Thursday", color: "#FF6F61" },
  { label: "Friday", color: "#26A69A" },
  { label: "Saturday", color: "#FF9800" },
  { label: "Sunday", color: "#607D8B" },
];

/* ------------- MAIN COMPONENT ------------- */
export default function TaskCalendar() {
  /* grid prep */
  const hours = useMemo(
    () =>
      Array.from({ length: endHour - startHour + 1 }, (_, i) => {
        const h = startHour + i;
        return {
          h,
          txt:
            h === 12
              ? "12 PM"
              : h > 12
              ? `${h - 12} PM`
              : h === 0
              ? "12 AM"
              : `${h} AM`,
        };
      }),
    []
  );

  return (
    <div className="Tsssk-Secc">
      <div className="Tsssk-Box">
        {/* ------------ MAIN GRID ------------- */}
        <div className="Tsssk-Box-Main custom-scroll-bar">
          {/* header row */}
          <div className="tsk-header-wrap">
            <div className="tsk-time-col dummy" />
            {days.map((d) => (
              <div key={d.label} className="tsk-header-cell">
                <span className="tsk-header-title">{d.label}</span>
              </div>
            ))}
          </div>

          {/* grid */}
          <div className="tsk-scroll-x">
            <div className="tsk-main-grid">
              {/* times */}
              <div className="tsk-time-col">
                {hours.map(({ h, txt }) => (
                  <div key={h} className="tsk-time-label" data-hour={h}>
                    {txt}
                  </div>
                ))}
              </div>

              {/* day columns (empty, just slots) */}
              {days.map((d) => (
                <div
                  key={d.label}
                  className="tsk-shift-col"
                  style={{ position: "relative" }}
                >
                  {hours.map(({ h }) => (
                    <div key={h} className="tsk-time-slot" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
