import { useState } from "react";
import CheckboxGroup from "../../../../../components/CheckboxGroup";
import ScheduleSelector from "../../../../../components/ScheduleSelector";

const dayLabels = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const CareRequirementsStep = ({ formData, handleChange }) => {
  const schedule = formData.agreedCareVisits || {};
  const hasEnabledDays = Object.values(schedule).some((d) => d.enabled);
  const [isEditingSchedule, setIsEditingSchedule] = useState(!hasEnabledDays);

  const handleAgreedCareSave = (schedule) => {
    handleChange({
      name: "agreedCareVisits",
      value: schedule,
    });
    setIsEditingSchedule(false);
  };

  const handleEditSchedule = () => {
    setIsEditingSchedule(true);
  };

  if (!isEditingSchedule) {
    return (
      <>
        <div className="content-section">
          <div className="form-section">
            <h2 style={{ fontWeight: 600 }}>Care Type & Requirements</h2>
            <p
              style={{
                marginBottom: "1rem",
                fontSize: "0.9rem",
                color: "#666",
              }}
            >
              Specify the type of care needed and link relevant tasks
            </p>

            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="Care Type"
                options={[
                  { value: "SINGLE_HANDED_CALL", label: "Single Handed Call" },
                  { value: "DOUBLE_HANDED_CALL", label: "Double Handed Call" },
                  {
                    value: "SPECIALCARE",
                    label: "Special Care (e.g. Carers)",
                  },
                ]}
                value={formData.care_type || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "care_type",
                    value: newValues,
                  })
                }
                multiple={false}
                row={true}
              />
            </div>
          </div>
        </div>
        <div className="content-section">
          <div className="form-section">
            <h2 style={{ fontWeight: 600 }}>Agreed Care Visits</h2>
            <p
              style={{
                marginBottom: "1rem",
                fontSize: "0.9rem",
                color: "#666",
              }}
            >
              Set when the client is available for visits&nbsp;
            </p>
            <div className="schedule-view">
              {hasEnabledDays ? (
                <div className="schedule-summary">
                  {Object.entries(schedule).map(([day, data]) => {
                    if (!data.enabled || data.slots.length === 0) return null;
                    return (
                      <div key={day} className="day-entry">
                        <strong>{dayLabels[day]}:</strong>{" "}
                        {data.slots
                          .map((slot) => `${slot.startTime} - ${slot.endTime}`)
                          .join(", ")}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p>No visits scheduled.</p>
              )}
              <button
                onClick={handleEditSchedule}
                className="edit-schedule-btn"
              >
                Edit Schedule
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="content-section">
        <div className="form-section">
          <h2 style={{ fontWeight: 600 }}>Care Type & Requirements</h2>
          <p
            style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "#666" }}
          >
            Specify the type of care needed and link relevant tasks
          </p>

          <div
            className="checkbox-group-wrapper"
            style={{ marginBottom: "0.8rem" }}
          >
            <CheckboxGroup
              label="Care Type"
              options={[
                { value: "SINGLE_HANDED_CALL", label: "Single Handed Call" },
                { value: "DOUBLE_HANDED_CALL", label: "Double Handed Call" },
                { value: "SPECIALCARE", label: "Special Care (e.g. Carers)" },
              ]}
              value={formData.care_type || []}
              onChange={(newValues) =>
                handleChange({
                  name: "care_type",
                  value: newValues,
                })
              }
              multiple={false}
              row={true}
            />
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="form-section">
          <h2 style={{ fontWeight: 600 }}>Agreed Care Visits</h2>
          <p
            style={{
              marginBottom: "1rem",
              fontSize: "0.9rem",
              color: "#666",
            }}
          >
            Set when the client is available for visits{" "}
          </p>
          <ScheduleSelector
            initialSchedule={formData.agreedCareVisits}
            onSave={handleAgreedCareSave}
            showLunch={false}
            multiSlot={true}
            defaultSlotStart="09:00"
            defaultSlotEnd="17:00"
          />
        </div>
      </div>
      <div className="content-section">
        <div className="form-section">
          <h2 style={{ fontWeight: 600 }}>Contract Duration</h2>
          <p
            style={{
              marginBottom: "1rem",
              fontSize: "0.9rem",
              color: "#666",
            }}
          >
            {" "}
          </p>

          <div className="date-flex">
            <div className="date-item">
              <label>Start Date</label>
              <input
                type="date"
                name="contractStart"
                value={formData.contractStart || ""}
                onChange={handleChange}
                className="edit-input"
              />
            </div>

            <div className="date-item">
              <label>End Date</label>
              <input
                type="date"
                name="contractEnd"
                value={formData.contractEnd || ""}
                onChange={handleChange}
                className="edit-input"
              />
            </div>
          </div>

          {/* <div className="info-item">
            <label>End Date</label>
            {isEditing.employment ? (
              <input
                type="date"
                name={`employmentEndDate-${index}`}
                value={formatDateForInput(employment.employmentEndDate)}
                min={startDateFormatted}
                onChange={(e) => handleEndDateChange(e, index, employment)}
                className="edit-input"
              />
            ) : (
              <span>
                {formatDisplayDate(employment.employmentEndDate, "ordinal")}
              </span>
            )}
          </div> */}
        </div>
      </div>
    </>
  );
};

export default CareRequirementsStep;
