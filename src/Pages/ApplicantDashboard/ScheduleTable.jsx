import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DateTime } from "luxon";
import "./ScheduleTable.css";

const getTopOffset = (start) => {
  const slotHeight = 60;
  return start * slotHeight;
};

const parseTimeToHours = (dateTime, timeZone) => {
  try {
    const dt = DateTime.fromISO(dateTime, { zone: "UTC" }).setZone(timeZone);
    if (!dt.isValid) throw new Error(`Invalid timezone: ${timeZone}`);
    return dt.hour + dt.minute / 60;
  } catch (error) {
    console.error(`Invalid timezone ${timeZone} for ${dateTime}:`, error);
    return (
      DateTime.fromISO(dateTime, { zone: "UTC" }).hour +
      DateTime.fromISO(dateTime, { zone: "UTC" }).minute / 60
    );
  }
};

const formatTime = (dateTime, timeZone) => {
  try {
    const dt = DateTime.fromISO(dateTime, { zone: "UTC" }).setZone(timeZone);
    if (!dt.isValid) throw new Error(`Invalid timezone: ${timeZone}`);
    return dt.toFormat("h:mm a");
  } catch (error) {
    console.error(`Invalid timezone ${timeZone} for ${dateTime}:`, error);
    return DateTime.fromISO(dateTime, { zone: "UTC" }).toFormat("h:mm a");
  }
};

const formatHeaderDate = (dateTime, timeZone) => {
  try {
    const dt = DateTime.fromISO(dateTime, { zone: "UTC" }).setZone(timeZone);
    if (!dt.isValid) throw new Error(`Invalid timezone: ${timeZone}`);
    return dt.toFormat("cccc, LLLL d");
  } catch (error) {
    console.error(`Invalid timezone ${timeZone} for ${dateTime}:`, error);
    return DateTime.fromISO(dateTime, { zone: "UTC" }).toFormat("cccc, LLLL d");
  }
};

const getTimezoneLabel = (timeZone) => {
  try {
    const dt = DateTime.now().setZone(timeZone);
    if (!dt.isValid) throw new Error(`Invalid timezone: ${timeZone}`);
    return dt.zoneName; // e.g., "Europe/London" or "BST"
  } catch (error) {
    console.error(`Invalid timezone ${timeZone}:`, error);
    return "UTC";
  }
};

const calculateDuration = (startDateTime, endDateTime, timeZone) => {
  try {
    const start = DateTime.fromISO(startDateTime, { zone: "UTC" }).setZone(
      timeZone
    );
    const end = DateTime.fromISO(endDateTime, { zone: "UTC" }).setZone(
      timeZone
    );

    if (!start.isValid || !end.isValid)
      throw new Error(`Invalid timezone: ${timeZone}`);

    const duration = end.diff(start, "hours").toObject().hours;
    return Math.max(0.5, Math.round(duration * 2) / 2); // Round to nearest 0.5 hour, minimum 0.5
  } catch (error) {
    console.error(
      `Error calculating duration for timezone ${timeZone}:`,
      error
    );
    return 1; // Default to 1 hour if there's an error
  }
};

const DailySchedule = ({ schedules = [] }) => {
  const [appointmentsByDate, setAppointmentsByDate] = useState({});
  const currentTime = DateTime.fromISO("2025-07-11T11:50:00+01:00", {
    zone: "Africa/Lagos",
  }); // 11:50 AM WAT

  const slotHeight = 60;
  const startHour = 0;
  const endHour = 24;
  const hours = endHour - startHour;

  useEffect(() => {
    const groupedByDate = schedules.reduce((acc, sch) => {
      const date = DateTime.fromISO(sch.interview_start_date_time, {
        zone: "UTC",
      })
        .setZone(sch.timezone)
        .toFormat("yyyy-MM-dd");
      acc[date] = acc[date] || [];

      const duration = calculateDuration(
        sch.interview_start_date_time,
        sch.interview_end_date_time,
        sch.timezone
      );

      acc[date].push({
        ...sch,
        start: parseTimeToHours(sch.interview_start_date_time, sch.timezone),
        startTime: formatTime(sch.interview_start_date_time, sch.timezone),
        endTime: formatTime(sch.interview_end_date_time, sch.timezone),
        name: "Virtual Interview",
        role: sch.meeting_mode,
        duration: duration,
        timezoneLabel: getTimezoneLabel(sch.timezone),
      });
      return acc;
    }, {});
    setAppointmentsByDate(groupedByDate);
  }, [schedules]);

  const renderCurrentTimeLine = (timezone, scheduleDate) => {
    try {
      const currentInTimezone = currentTime.setZone(timezone);
      const scheduleDt = DateTime.fromISO(scheduleDate, {
        zone: "UTC",
      }).setZone(timezone);
      if (
        currentInTimezone.toFormat("yyyy-MM-dd") !==
        scheduleDt.toFormat("yyyy-MM-dd")
      ) {
        return null; // Only show current time line if it's the same date
      }
      const currentHours =
        currentInTimezone.hour + currentInTimezone.minute / 60;
      return (
        <div
          className="current-line"
          style={{ top: `${getTopOffset(currentHours)}px` }}
        >
          <div className="dot" />
        </div>
      );
    } catch (error) {
      console.error(
        `Error rendering current time line for timezone ${timezone}:`,
        error
      );
      return null;
    }
  };

  return (
    <div className="schedule-container">
      {Object.entries(appointmentsByDate).length === 0 ? (
        <h2 className="schedule-header">No Scheduled Interviews</h2>
      ) : (
        Object.entries(appointmentsByDate).map(([date, appointments]) => (
          <div key={date}>
            <h2 className="schedule-header">
              {formatHeaderDate(
                appointments[0].interview_start_date_time,
                appointments[0].timezone
              )}{" "}
              <span className="year">
                {DateTime.fromISO(appointments[0].interview_start_date_time, {
                  zone: "UTC",
                })
                  .setZone(appointments[0].timezone)
                  .toFormat("yyyy")}
              </span>
              {appointments.some(
                (appt) => appt.timezone !== appointments[0].timezone
              ) && " (Multiple Timezones)"}
            </h2>
            <div
              className="schedule-body"
              style={{ height: `${hours * slotHeight}px` }}
            >
              {Array.from({ length: hours }, (_, i) => {
                const hour = startHour + i;
                return (
                  <div
                    key={hour}
                    className="time-slot"
                    style={{ top: `${i * slotHeight}px` }}
                  >
                    <div className="time-label">
                      {hour === 0
                        ? "12am"
                        : hour < 12
                        ? `${hour}am`
                        : hour === 12
                        ? "12pm"
                        : hour === 24
                        ? "12am"
                        : `${hour - 12}pm`}
                    </div>
                    <div className="time-line" />
                  </div>
                );
              })}
              {renderCurrentTimeLine(
                appointments[0].timezone,
                appointments[0].interview_start_date_time
              )}
              {appointments.map((appt, idx) => (
                <motion.div
                  key={idx}
                  className="appointment"
                  style={{
                    top: `${getTopOffset(appt.start)}px`,
                    height: `${appt.duration * slotHeight}px`,
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  title={`Candidate: ${appt.candidate_name}\nRole: ${appt.job_requisition_title}`}
                >
                  <h3 className="aaa-Heada">{appt.name}</h3>
                  <div className="details">
                    {appt.startTime} - {appt.endTime} · {appt.role} ·{" "}
                    {appt.timezoneLabel}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default DailySchedule;
