// New component: steps/AvailabilityStep.jsx
import { useState } from "react";
import { PencilIcon } from "../../../../../assets/icons/PencilIcon";
import { IoMdClose } from "react-icons/io";
import Modal from "../../../../../components/Modal";
import ScheduleSelector from "../../../../../components/ScheduleSelector";

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === "admin" || currentUser.role === "co-admin" || currentUser.role === "root-admin";
  const hasStaffInUrl = window.location.pathname.includes("staff");
  const shouldDisableSensitiveFields = hasStaffInUrl || !isAdmin;


const defaultSchedule = {
  monday: {
    enabled: false,
    slots: [],
  },
  tuesday: {
    enabled: false,
    slots: [],
  },
  wednesday: {
    enabled: false,
    slots: [],
  },
  thursday: {
    enabled: false,
    slots: [],
  },
  friday: {
    enabled: false,
    slots: [],
  },
  saturday: {
    enabled: false,
    slots: [],
  },
  sunday: {
    enabled: false,
    slots: [],
  },
};

const dayLabels = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const parseWorkingDaysToSchedule = (workingDaysStr) => {
  if (!workingDaysStr) return defaultSchedule;
  const schedule = { ...defaultSchedule };
  const days = workingDaysStr.split(", ");
  days.forEach((dayStr) => {
    const match = dayStr.match(
      /^(\w+) (\d{2}:\d{2})-(\d{2}:\d{2}) \(Lunch: (\d{2}:\d{2})-(\d{2}:\d{2})\)$/
    );
    if (match) {
      const [, dayName, start, end] = match;
      const dayKey = Object.keys(dayLabels).find(
        (key) => dayLabels[key].toLowerCase() === dayName.toLowerCase()
      );
      if (dayKey && schedule[dayKey]) {
        schedule[dayKey] = {
          enabled: true,
          slots: [{ startTime: start, endTime: end, id: `working-${dayKey}-0` }],
        };
      }
    }
  });
  return schedule;
};

const parseAvailabilityToSchedule = (availability) => {
  const schedule = { ...defaultSchedule };
  if (!availability || typeof availability !== "object") return schedule;
  Object.entries(availability).forEach(([day, data]) => {
    if (data && typeof data === 'object') {
      if (Array.isArray(data)) {
        // multiple slots
        schedule[day] = {
          enabled: true,
          slots: data.map(slot => ({ startTime: slot.start, endTime: slot.end, id: `parsed-${day}-${Math.random()}` })),
        };
      } else if (data.available === false) {
        schedule[day].enabled = false;
        schedule[day].slots = [];
      } else if (data.available === true) {
        // single slot
        schedule[day] = {
          enabled: true,
          slots: [{ startTime: data.start, endTime: data.end, id: `parsed-${day}-0` }],
        };
      }
    }
  });
  return schedule;
};

const getScheduleForDisplay = (availability) => {
  if (typeof availability === "string") {
    return parseWorkingDaysToSchedule(availability);
  } else if (typeof availability === "object" && availability !== null) {
    return parseAvailabilityToSchedule(availability);
  }
  return defaultSchedule;
};

const formatScheduleToString = (schedule) => {
  if (typeof schedule !== "object" || schedule === null) return "";
  return Object.keys(schedule)
    .filter((day) => schedule[day]?.enabled)
    .map((day) => {
      const d = schedule[day];
      const dayName = dayLabels[day];
      const slots = d.slots;
      if (slots.length === 1) {
        return `${dayName} ${slots[0].startTime}-${slots[0].endTime}`;
      } else {
        const times = slots.map(slot => `${slot.startTime}-${slot.endTime}`).join(', ');
        return `${dayName} ${times}`;
      }
    })
    .join(", ");
};

const AvailabilityStep = ({
  formData,
  isEditing,
  handleEditToggle,
  handleInputChange,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(defaultSchedule);

  const handleOpenModal = () => {
    let scheduleToUse = defaultSchedule;
    if (typeof formData.availability === "string") {
      scheduleToUse = parseWorkingDaysToSchedule(formData.availability);
    } else if (
      typeof formData.availability === "object" &&
      formData.availability !== null
    ) {
      scheduleToUse = parseAvailabilityToSchedule(formData.availability);
    }
    setCurrentSchedule(scheduleToUse);
    setShowModal(true);
  };

  const handleSaveSchedule = (internalSchedule) => {
    const availabilityObj = {};
    Object.entries(internalSchedule).forEach(([day, dayData]) => {
      if (dayData.enabled && dayData.slots?.length > 0) {
        if (dayData.slots.length === 1) {
          availabilityObj[day] = {
            start: dayData.slots[0].startTime,
            end: dayData.slots[0].endTime,
            available: true
          };
        } else {
          availabilityObj[day] = dayData.slots.map(slot => ({
            start: slot.startTime,
            end: slot.endTime,
            available: true
          }));
        }
      } else {
        availabilityObj[day] = { available: false };
      }
    });
    handleInputChange("availability", "availability", availabilityObj);
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  if (!formData) return null;

  const displaySchedule = getScheduleForDisplay(formData.availability);
  const displayAvailability = formatScheduleToString(displaySchedule);

  return (
    <div className="step-form">
      <div className="info-card">
        <div className="card-header">
          <h4>Availability</h4>
          <div>
            <button
              className="edit-button"
              onClick={() => handleEditToggle("availability")}
            >
              {isEditing.availability ? (
                <>
                  Cancel <IoMdClose />
                </>
              ) : (
                <>
                  Edit <PencilIcon />
                </>
              )}
            </button>
          </div>
        </div>
        <div className="info-grid" style={{ padding: "20px 0" }}>
          <div
            className={`info-item ${!isEditing.availability ? "disabled" : ""}`}
          >
            <label>Working Days</label>
            {isEditing.availability ? (
              <div
                className="edit-input"
                style={{
                  cursor: "pointer",
                  border: "1px solid #ccc",
                  padding: "4px",
                  borderRadius: "6px",
                  backgroundColor: "white",
                  minHeight: "30px",
                  display: "flex",
                  alignItems: "center",
                }}
                onClick={handleOpenModal}
              >
                {displayAvailability || "Select Working Days"}
              </div>
            ) : (
              <span>{displayAvailability || "-"}</span>
            )}
          </div>
        </div>
        {(() => {
          const lastUpdated =
            formData.lastUpdatedBy || formData.last_updated_by || formData.profile?.last_updated_by || null;
          if (!lastUpdated) return null;
          return (
            <div className="last-edited-by">
              Last Edited By : {lastUpdated.first_name} {" "}
              {lastUpdated.last_name} - {lastUpdated.email}
            </div>
          );
        })()}
      </div>
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Availability Schedule"
      >
        <ScheduleSelector
          initialSchedule={currentSchedule}
          onSave={handleSaveSchedule}
          showLunch={false}
          multiSlot={true}
          defaultSlotStart="08:00"
          defaultSlotEnd="17:00"
          includeSunday={true}
        />
      </Modal>
    </div>
  );
};

export default AvailabilityStep;
