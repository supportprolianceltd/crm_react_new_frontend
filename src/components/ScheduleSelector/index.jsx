import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ToggleButton from "../ToggleButton";
import "./styles.css";
import { AddIcon } from "../../assets/icons/AddIcon";
import { FiTrash2 } from "react-icons/fi";

const ScheduleSelector = ({
  initialSchedule,
  onSave,
  showLunch = false,
  multiSlot = false,
  defaultSlotStart = "09:00",
  defaultSlotEnd = "17:00",
  includeSunday = true,
}) => {
  const days = includeSunday
    ? [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ]
    : ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

  const dayLabels = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  // Transform initialSchedule to internal structure
  const transformedInitial = {};
  if (initialSchedule) {
    Object.entries(initialSchedule).forEach(([day, data]) => {
      if (data && typeof data === "object") {
        let slots = [];
        if (Array.isArray(data.slots)) {
          // Care mode: already has slots
          slots = data.slots.map((slot, i) => ({
            ...slot,
            id: slot.id || `initial-${day}-${i}`,
          }));
        } else {
          // Employment mode: transform start/end to single slot
          if (data.startTime && data.endTime) {
            slots = [
              {
                startTime: data.startTime,
                endTime: data.endTime,
                id: `initial-${day}-0`,
              },
            ];
          }
        }
        transformedInitial[day] = {
          enabled: data.enabled || false,
          slots,
          lunchStart: data.lunchStart || "",
          lunchEnd: data.lunchEnd || "",
        };
      }
    });
  }

  // Add missing days and ensure enabled days have at least one slot
  days.forEach((day) => {
    if (!transformedInitial[day]) {
      transformedInitial[day] = {
        enabled: false,
        slots: [],
        lunchStart: "",
        lunchEnd: "",
      };
    } else if (
      transformedInitial[day].enabled &&
      transformedInitial[day].slots.length === 0
    ) {
      transformedInitial[day].slots = [
        {
          startTime: defaultSlotStart,
          endTime: defaultSlotEnd,
          id: `initial-${day}-0`,
        },
      ];
    }
  });

  const [schedule, setSchedule] = useState(transformedInitial);

  const [errors, setErrors] = useState({});

  const getWorkHours = (day) => {
    const slots = schedule[day].slots;
    if (slots.length > 0) {
      return { start: slots[0].startTime, end: slots[0].endTime };
    }
    return { start: "", end: "" };
  };

  const validateSlotTime = (startTime, endTime) => {
    if (!startTime || !endTime) {
      return "Start and end times are required";
    }
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    if (end <= start) {
      return "End time must be after start time";
    }
    return null;
  };

  const validateLunchTime = (day, lunchStart, lunchEnd, workStart, workEnd) => {
    const newErrors = { ...errors };
    let hasError = false;

    // Clear previous lunch errors
    delete newErrors[`${day}Lunch`];
    delete newErrors[`${day}LunchRange`];

    if (lunchStart && lunchEnd) {
      const lunchStartTime = new Date(`1970-01-01T${lunchStart}:00`);
      const lunchEndTime = new Date(`1970-01-01T${lunchEnd}:00`);

      if (lunchEndTime <= lunchStartTime) {
        newErrors[`${day}Lunch`] = "Lunch end must be after lunch start";
        hasError = true;
      }

      if (workStart && workEnd) {
        const workStartTime = new Date(`1970-01-01T${workStart}:00`);
        const workEndTime = new Date(`1970-01-01T${workEnd}:00`);

        if (lunchStartTime < workStartTime || lunchEndTime > workEndTime) {
          newErrors[`${day}LunchRange`] =
            "Lunch time must be within work hours";
          hasError = true;
        }
      }
    }

    setErrors(newErrors);
    return !hasError;
  };

  const handleToggle = (day, newEnabled) => {
    let newSlots = schedule[day].slots;
    if (newEnabled && newSlots.length === 0) {
      newSlots = [
        {
          startTime: defaultSlotStart,
          endTime: defaultSlotEnd,
          id: `${day}-default-0`,
        },
      ];
    } else if (!newEnabled) {
      newSlots = [];
    }

    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: newEnabled,
        slots: newSlots,
      },
    }));

    // Clear errors on toggle
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`${day}_no_slots`];
      newSlots.forEach((_, i) => delete newErrors[`${day}_slot_${i}`]);
      delete newErrors[`${day}Lunch`];
      delete newErrors[`${day}LunchRange`];
      return newErrors;
    });
  };

  const handleSlotTimeChange = (day, slotIndex, field, value) => {
    const newSlots = [...schedule[day].slots];
    newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value };

    const newSchedule = {
      ...schedule,
      [day]: { ...schedule[day], slots: newSlots },
    };

    setSchedule(newSchedule);

    const currentStart =
      field === "startTime" ? value : newSlots[slotIndex].startTime;
    const currentEnd =
      field === "endTime" ? value : newSlots[slotIndex].endTime;
    const err = validateSlotTime(currentStart, currentEnd);

    setErrors((prev) => {
      const newErrors = { ...prev };
      if (err) {
        newErrors[`${day}_slot_${slotIndex}`] = err;
      } else {
        delete newErrors[`${day}_slot_${slotIndex}`];
      }
      return newErrors;
    });

    // Validate lunch if changed work hours
    if (showLunch && newSlots.length > 0) {
      const { start: ws, end: we } = getWorkHours(day);
      validateLunchTime(
        day,
        schedule[day].lunchStart,
        schedule[day].lunchEnd,
        ws,
        we
      );
    }
  };

  const handleLunchChange = (day, field, value) => {
    const newSchedule = {
      ...schedule,
      [day]: { ...schedule[day], [field]: value },
    };

    setSchedule(newSchedule);

    const { start: ws, end: we } = getWorkHours(day);
    validateLunchTime(
      day,
      field === "lunchStart" ? value : newSchedule[day].lunchStart,
      field === "lunchEnd" ? value : newSchedule[day].lunchEnd,
      ws,
      we
    );
  };

  const addSlot = (day) => {
    if (!multiSlot) return;
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [
          ...prev[day].slots,
          {
            startTime: defaultSlotStart,
            endTime: defaultSlotEnd,
            id: Date.now().toString(),
          },
        ],
      },
    }));
  };

  const removeSlot = (day, slotIndex) => {
    if (!multiSlot) return;
    const newSlots = schedule[day].slots.filter((_, i) => i !== slotIndex);
    // Prevent removing the last slot
    if (newSlots.length === 0) return;
    const newSchedule = {
      ...schedule,
      [day]: { ...schedule[day], slots: newSlots },
    };

    setSchedule(newSchedule);

    // Clear error for removed slot
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`${day}_slot_${slotIndex}`];
      return newErrors;
    });

    // Validate lunch if removed first slot
    if (showLunch && newSlots.length > 0) {
      const { start: ws, end: we } = getWorkHours(day);
      validateLunchTime(
        day,
        schedule[day].lunchStart,
        schedule[day].lunchEnd,
        ws,
        we
      );
    }
  };

  const handleSave = () => {
    let hasErrors = false;
    const newErrors = { ...errors };

    days.forEach((day) => {
      if (schedule[day].enabled) {
        const slots = schedule[day].slots;
        if (slots.length === 0) {
          newErrors[`${day}_no_slots`] = "At least one time slot is required";
          hasErrors = true;
        } else {
          slots.forEach((slot, i) => {
            const err = validateSlotTime(slot.startTime, slot.endTime);
            if (err) {
              newErrors[`${day}_slot_${i}`] = err;
              hasErrors = true;
            } else {
              delete newErrors[`${day}_slot_${i}`];
            }
          });
        }

        if (showLunch) {
          const { start: ws, end: we } = getWorkHours(day);
          const lunchValid = validateLunchTime(
            day,
            schedule[day].lunchStart,
            schedule[day].lunchEnd,
            ws,
            we
          );
          if (!lunchValid) {
            hasErrors = true;
          }
        }
      } else {
        // Clear errors for disabled days
        delete newErrors[`${day}_no_slots`];
        schedule[day].slots.forEach(
          (_, i) => delete newErrors[`${day}_slot_${i}`]
        );
        delete newErrors[`${day}Lunch`];
        delete newErrors[`${day}LunchRange`];
      }
    });

    setErrors(newErrors);

    if (!hasErrors && isAnyDayEnabled) {
      onSave(schedule);
    }
  };

  // Check if at least one day is enabled
  const isAnyDayEnabled = days.some((day) => schedule[day].enabled);

  // Check if there are any validation errors
  const hasValidationErrors = Object.keys(errors).length > 0;

  const renderTimeInputs = (day, slot, slotIndex, errorKey) => (
    <>
      <div className="time-col">
        <label>Start Time*</label>
        <input
          type="time"
          value={slot.startTime}
          onChange={(e) =>
            handleSlotTimeChange(day, slotIndex, "startTime", e.target.value)
          }
          disabled={!schedule[day].enabled}
          className={errors[errorKey] ? "error" : ""}
        />
        {errors[errorKey] && (
          <span className="error-message">{errors[errorKey]}</span>
        )}
      </div>
      <div className="time-col">
        <label>End Time*</label>
        <input
          type="time"
          value={slot.endTime}
          onChange={(e) =>
            handleSlotTimeChange(day, slotIndex, "endTime", e.target.value)
          }
          disabled={!schedule[day].enabled}
          className={errors[errorKey] ? "error" : ""}
        />
      </div>
    </>
  );

  const areAllDaysEnabled = days.every((day) => schedule[day].enabled);
  const handleToggleAllDays = () => {
    setSchedule((prev) => {
      const updated = { ...prev };
      days.forEach((day) => {
        if (!areAllDaysEnabled) {
          updated[day] = {
            ...updated[day],
            enabled: true,
            slots:
              updated[day].slots.length > 0
                ? updated[day].slots
                : [
                    {
                      startTime: defaultSlotStart,
                      endTime: defaultSlotEnd,
                      id: `${day}-default-0`,
                    },
                  ],
          };
        } else {
          updated[day] = {
            ...updated[day],
            enabled: false,
            slots: [],
          };
        }
      });
      return updated;
    });
  };

  return (
    <form className="weekly-schedule">
      <button
        type="button"
        className="toggle-all-btn"
        onClick={handleToggleAllDays}
      >
        {areAllDaysEnabled ? "Disable All Days" : "Enable All Days"}
      </button>

      {days.map((day) => {
        const enabled = schedule[day].enabled;
        const slots = schedule[day].slots;
        const hasNoSlotsError =
          enabled && slots.length === 0 && errors[`${day}_no_slots`];
        const firstSlotErrorKey = `${day}_slot_0`;
        const isFirstLast = slots.length === 1;
        const firstAddVisibility =
          multiSlot && isFirstLast ? "visible" : "hidden";
        return (
          <div
            key={day}
            className={`day-section ${enabled ? "enabled" : "disabled"}`}
          >
            <div className="day-header">
              <div className="toggle-day-group">
                <ToggleButton
                  isOn={enabled}
                  onToggle={(newState) => handleToggle(day, newState)}
                  showTick={true}
                />
                <span className="day-label">{dayLabels[day]}</span>
              </div>
              <div>
                <AnimatePresence>
                  {enabled && slots.length > 0 && (
                    <motion.div
                      key={`${day}-header-slot`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3 }}
                      className="header-slot-row"
                    >
                      {renderTimeInputs(day, slots[0], 0, firstSlotErrorKey)}
                      {multiSlot && slots.length > 1 && (
                        <div className="remove-col">
                          <FiTrash2 onClick={() => removeSlot(day, 0)} />
                        </div>
                      )}
                      <div
                        className="add-col"
                        style={{ visibility: firstAddVisibility }}
                      >
                        <AddIcon onClick={() => addSlot(day)} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {enabled && multiSlot && (
                  <div className="additional-slots">
                    <AnimatePresence>
                      {slots.slice(1).map((slot, i) => {
                        const slotIndex = i + 1;
                        const errorKey = `${day}_slot_${slotIndex}`;
                        const isLastSlot = slotIndex === slots.length - 1;
                        const addVisibility =
                          multiSlot && isLastSlot ? "visible" : "hidden";
                        return (
                          <motion.div
                            key={slot.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.25 }}
                            className="slot-row"
                          >
                            {renderTimeInputs(day, slot, slotIndex, errorKey)}
                            <div className="remove-col">
                              <FiTrash2
                                onClick={() => removeSlot(day, slotIndex)}
                              />
                            </div>
                            <div
                              className="add-col"
                              style={{ visibility: addVisibility }}
                            >
                              <AddIcon onClick={() => addSlot(day)} />
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
              {hasNoSlotsError && (
                <span className="error-message">
                  {errors[`${day}_no_slots`]}
                </span>
              )}
            </div>

            <AnimatePresence>
              {enabled && showLunch && (
                <motion.div
                  key={`${day}-lunch`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="lunch-row"
                >
                  <span className="lunch-label">Lunch Time</span>
                  <div className="lunch-times-row">
                    <div className="time-col">
                      <label>Lunch Start Time</label>
                      <input
                        type="time"
                        value={schedule[day].lunchStart}
                        onChange={(e) =>
                          handleLunchChange(day, "lunchStart", e.target.value)
                        }
                        disabled={!enabled}
                        className={
                          errors[`${day}Lunch`] || errors[`${day}LunchRange`]
                            ? "error"
                            : ""
                        }
                      />
                      {errors[`${day}Lunch`] && (
                        <span className="error-message">
                          {errors[`${day}Lunch`]}
                        </span>
                      )}
                    </div>
                    <div className="time-col">
                      <label>Lunch End Time</label>
                      <input
                        type="time"
                        value={schedule[day].lunchEnd}
                        onChange={(e) =>
                          handleLunchChange(day, "lunchEnd", e.target.value)
                        }
                        disabled={!enabled}
                        className={
                          errors[`${day}Lunch`] || errors[`${day}LunchRange`]
                            ? "error"
                            : ""
                        }
                      />
                      {errors[`${day}LunchRange`] && (
                        <span className="error-message">
                          {errors[`${day}LunchRange`]}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      <button
        className="save-button"
        style={{ padding: "10px 15px", borderRadius: "30px" }}
        type="button"
        onClick={handleSave}
        disabled={!isAnyDayEnabled || hasValidationErrors}
      >
        Save Schedule
      </button>
    </form>
  );
};

export default ScheduleSelector;
