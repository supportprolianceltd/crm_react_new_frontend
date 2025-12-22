import { useEffect, useState } from "react";
import { PencilIcon } from "../../../../../assets/icons/PencilIcon";
import { IoMdClose } from "react-icons/io";
import {
  formatDisplayDate,
  formatDateForInput,
  validateEndDateAfterStart,
} from "../../../../../utils/helpers";
import useCurrencies from "../../../../../hooks/useCurrencies";
import Modal from "../../../../../components/Modal";
import ScheduleSelector from "../../../../../components/ScheduleSelector";

const EmploymentDetailsStep = ({
  formData,
  isEditing,
  handleEditToggle,
  handleInputChange,
  addEmploymentRecord,
  isOwnProfile,
}) => {
  const currencies = useCurrencies();
  const [showWorkingDaysModal, setShowWorkingDaysModal] = useState(false);
  const [currentEmploymentIndex, setCurrentEmploymentIndex] = useState(null);
  const [currentSchedule, setCurrentSchedule] = useState(null);

  const defaultSchedule = {
    monday: {
      enabled: false,
      startTime: "09:00",
      endTime: "17:00",
      lunchStart: "12:00",
      lunchEnd: "13:00",
    },
    tuesday: {
      enabled: false,
      startTime: "09:00",
      endTime: "17:00",
      lunchStart: "12:00",
      lunchEnd: "13:00",
    },
    wednesday: {
      enabled: false,
      startTime: "09:00",
      endTime: "17:00",
      lunchStart: "12:00",
      lunchEnd: "13:00",
    },
    thursday: {
      enabled: false,
      startTime: "09:00",
      endTime: "17:00",
      lunchStart: "12:00",
      lunchEnd: "13:00",
    },
    friday: {
      enabled: false,
      startTime: "09:00",
      endTime: "17:00",
      lunchStart: "12:00",
      lunchEnd: "13:00",
    },
    saturday: {
      enabled: false,
      startTime: "09:00",
      endTime: "17:00",
      lunchStart: "12:00",
      lunchEnd: "13:00",
    },
    sunday: {
      enabled: false,
      startTime: "09:00",
      endTime: "17:00",
      lunchStart: "12:00",
      lunchEnd: "13:00",
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

  const handleOpenWorkingDaysModal = (index) => {
    const current =
      formData.employmentDetails[index].workingSchedule || defaultSchedule;
    setCurrentSchedule(current);
    setCurrentEmploymentIndex(index);
    setShowWorkingDaysModal(true);
  };

  console.log(currentSchedule);

  const handleSaveSchedule = (internalSchedule) => {
    // Transform back to old structure for employment
    const transformedSchedule = Object.fromEntries(
      Object.entries(internalSchedule).map(([day, dayData]) => [
        day,
        {
          enabled: dayData.enabled,
          startTime: dayData.slots[0]?.startTime || "09:00",
          endTime: dayData.slots[0]?.endTime || "17:00",
          lunchStart: dayData.lunchStart || "12:00",
          lunchEnd: dayData.lunchEnd || "13:00",
        },
      ])
    );

    handleInputChange(
      "employmentDetails",
      "workingSchedule",
      transformedSchedule,
      currentEmploymentIndex
    );
    const enabledDays = Object.keys(transformedSchedule)
      .filter((day) => transformedSchedule[day].enabled)
      .map((day) => {
        const d = transformedSchedule[day];
        const dayName = dayLabels[day];
        const timeStr = `${d.startTime}-${d.endTime}`;
        const lunchStr = `${d.lunchStart}-${d.lunchEnd}`;
        return `${dayName} ${timeStr} (Lunch: ${lunchStr})`;
      })
      .join(", ");
    handleInputChange(
      "employmentDetails",
      "workingDays",
      enabledDays,
      currentEmploymentIndex
    );
    setShowWorkingDaysModal(false);
  };

  const handleCloseModal = () => {
    setShowWorkingDaysModal(false);
  };

  // Initialize an empty employment record when entering edit mode if none exist
  useEffect(() => {
    if (isEditing.employment && formData.employmentDetails.length === 0) {
      const newRecord = { workingSchedule: defaultSchedule };
      addEmploymentRecord(newRecord); // Pass default if needed
    }
  }, [isEditing.employment, formData.employmentDetails, addEmploymentRecord]);

  if (!formData) return null;

  const disabledFields = [
    "Employment Type",
    "Working Days",
    "Maximum Working Hours",
  ];

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === "admin" || currentUser.role === "co-admin" || currentUser.role === "root-admin";
  const hasStaffInUrl = window.location.pathname.includes("staff");
  const shouldDisableSensitiveFields = hasStaffInUrl || !isAdmin;

  const handleEndDateChange = (e, index, employment) => {
    const newEndDate = e.target.value;
    const startDate = employment.employmentStartDate;
    if (validateEndDateAfterStart(startDate, newEndDate)) {
      handleInputChange(
        "employmentDetails",
        "employmentEndDate",
        newEndDate,
        index
      );
    }
  };

  const handleProbationEndDateChange = (e, index, employment) => {
    const newProbationEndDate = e.target.value;
    const startDate = employment.employmentStartDate;
    if (validateEndDateAfterStart(startDate, newProbationEndDate)) {
      handleInputChange(
        "employmentDetails",
        "probationEndDate",
        newProbationEndDate,
        index
      );
    }
    // Optionally, add user feedback here if invalid, e.g., alert or set error state
  };

  if (formData.employmentDetails.length === 0 && !isEditing.employment) {
    return (
      <div className="step-form">
        <div className="info-card">
          <div className="card-header">
            <h4>Employment Details</h4>
            <div>
              <button
                className="edit-button"
                onClick={() => handleEditToggle("employment")}
              >
                {isEditing.employment ? (
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
          <p>No employment details available.</p>
        </div>
        
      </div>
    );
  }

  return (
    <div className="step-form">
      {/* EMPLOYMENT DETAILS SECTION */}
      <div className="info-card">
        <div className="card-header">
          <h4>Employment Details</h4>
          <div>
            <button
              className="edit-button"
              onClick={() => handleEditToggle("employment")}
            >
              {isEditing.employment ? (
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
        {formData.employmentDetails.map((employment, index) => {
          const isLast = index === formData.employmentDetails.length - 1;
          const startDateFormatted = formatDateForInput(
            employment.employmentStartDate
          );

          return (
            <div key={index}>
              <div
                className="info-grid"
                style={{
                  borderBottom: isLast ? "none" : "1px dashed #333",
                  padding: "20px 0",
                }}
              >
              <div className="info-item">
                <label>Job Role</label>
                {isEditing.employment ? (
                  <input
                    name={`jobRole-${index}`}
                    value={employment.jobRole || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "employmentDetails",
                        "jobRole",
                        e.target.value,
                        index
                      )
                    }
                    className="edit-input"
                  />
                ) : (
                  <span>{employment.jobRole || "-"}</span>
                )}
              </div>
              <div className="info-item">
                <label>Hierarchy</label>
                {isEditing.employment ? (
                  <select
                    name={`hierarchy-${index}`}
                    value={employment.hierarchy || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "employmentDetails",
                        "hierarchy",
                        e.target.value,
                        index
                      )
                    }
                    className="edit-input"
                  >
                    <option value="">Select Hierarchy</option>
                    <option value="Junior">Junior</option>
                    <option value="Middle">Middle</option>
                    <option value="Senior">Senior</option>
                  </select>
                ) : (
                  <span>{employment.hierarchy || "-"}</span>
                )}
              </div>
              <div className="info-item">
                <label>Department</label>
                {isEditing.employment ? (
                  <input
                    name={`department-${index}`}
                    value={employment.department || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "employmentDetails",
                        "department",
                        e.target.value,
                        index
                      )
                    }
                    className="edit-input"
                  />
                ) : (
                  <span>{employment.department || "-"}</span>
                )}
              </div>
              <div className="info-item disabled">
                <label>Work Email</label>
                <span>{formData.email}</span>
              </div>
              <div className="info-item ">
                <label>Employment Type</label>

                {isEditing.employment ? (
                  <select
                    name={`employmentType-${index}`}
                    value={employment.employmentType || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "employmentDetails",
                        "employmentType",
                        e.target.value,
                        index
                      )
                    }
                    className="edit-input"
                  >
                    <option value="">Select Employment Type</option>
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                  </select>
                ) : (
                  <span>{employment.employmentType || "-"}</span>
                )}
              </div>
              <div className="info-item">
                <label>Start Date</label>
                {isEditing.employment ? (
                  <input
                    type="date"
                    name={`employmentStartDate-${index}`}
                    value={formatDateForInput(employment.employmentStartDate)}
                    onChange={(e) =>
                      handleInputChange(
                        "employmentDetails",
                        "employmentStartDate",
                        e.target.value,
                        index
                      )
                    }
                    className="edit-input"
                  />
                ) : (
                  <span>
                    {formatDisplayDate(
                      employment.employmentStartDate,
                      "ordinal"
                    )}
                  </span>
                )}
              </div>
              <div className="info-item">
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
              </div>
              <div className="info-item">
                <label>Probation End Date (if applicable)</label>
                {isEditing.employment ? (
                  <input
                    type="date"
                    name={`probationEndDate-${index}`}
                    value={formatDateForInput(employment.probationEndDate)}
                    min={startDateFormatted}
                    onChange={(e) =>
                      handleProbationEndDateChange(e, index, employment)
                    }
                    className="edit-input"
                  />
                ) : (
                  <span>
                    {formatDisplayDate(employment.probationEndDate, "ordinal")}
                  </span>
                )}
              </div>
              <div className="info-item">
                <label>Line Manager</label>
                {isEditing.employment ? (
                  <input
                    name={`lineManager-${index}`}
                    value={employment.lineManager || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "employmentDetails",
                        "lineManager",
                        e.target.value,
                        index
                      )
                    }
                    className="edit-input"
                  />
                ) : (
                  <span>{employment.lineManager || "-"}</span>
                )}
              </div>
              <div className="info-item ">
                <label>Salary</label>

                {isEditing.employment ? (
                  <div
                    className="salary-row"
                    style={{ display: "flex", gap: "10px", width: "100%" }}
                  >
                    <div className="info-item" style={{ flex: 1 }}>
                      <label>Currency</label>
                      <select
                        name={`currency-${index}`}
                        value={employment.currency || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "employmentDetails",
                            "currency",
                            e.target.value,
                            index
                          )
                        }
                        className="edit-input"
                      >
                        <option value="">Select Currency</option>
                        {currencies.map((currency) => (
                          <option key={currency.code} value={currency.code}>
                            {currency.code}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="info-item" style={{ flex: 1 }}>
                      <label>Salary</label>
                      <input
                        type="number"
                        name={`salary-${index}`}
                        value={employment.salary || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "employmentDetails",
                            "salary",
                            e.target.value,
                            index
                          )
                        }
                        className="edit-input"
                      />
                    </div>
                    <div className="info-item" style={{ flex: 1 }}>
                      <label>Salary Rate</label>
                      <select
                        name={`salaryRate-${index}`}
                        value={employment.salaryRate || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "employmentDetails",
                            "salaryRate",
                            e.target.value,
                            index
                          )
                        }
                        className="edit-input"
                      >
                        <option value="">Select Salary Rate</option>
                        <option value="daily">per day</option>
                        <option value="weekly">per week</option>
                        <option value="monthly">per month</option>
                        <option value="annually">per year</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <span>
                    {employment.currency && employment.salary
                      ? `${employment.currency} ${employment.salary}/${
                          employment.salaryRate
                            ? employment.salaryRate.replace("per ", "")
                            : ""
                        }`
                      : "-"}
                  </span>
                )}
              </div>
              <div className="info-item ">
                <label>Working Days</label>
                {isEditing.employment ? (
                  <div
                    className="edit-input"
                    style={{
                      cursor: "pointer",
                      border: "1px solid #ccc",
                      padding: "4px",
                      borderRadius: "6px",
                      backgroundColor: "white",
                      minHeight: "30px",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                    onClick={() => handleOpenWorkingDaysModal(index)}
                  >
                    {employment.workingDays || "Select Working Days"}
                  </div>
                ) : (
                  <span>{employment.workingDays || "-"}</span>
                )}
              </div>
              <div className="info-item">
                <label>Maximum Working Hours</label>
                {isEditing.employment ? (
                  <input
                    type="number"
                    name={`maxWorkingHours-${index}`}
                    value={employment.maxWorkingHours || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "employmentDetails",
                        "maxWorkingHours",
                        e.target.value,
                        index
                      )
                    }
                    className="edit-input"
                  />
                ) : (
                  <span>{employment.maxWorkingHours || "-"}</span>
                )}
              </div>
           
              </div>
              {(() => {
                const lastUpdated =
                  employment.lastUpdatedBy ||
                  employment.last_updated_by ||
                  formData.lastUpdatedBy ||
                  formData.last_updated_by ||
                  null;
                if (!lastUpdated) return null;
                return (
                  <div className="last-edited-by">
                    Last Edited By : {lastUpdated.first_name} {" "}
                    {lastUpdated.last_name} - {lastUpdated.email}
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>

      {/* Working Days Modal */}
      <Modal
        isOpen={showWorkingDaysModal}
        onClose={handleCloseModal}
        title="Working Days Schedule"
      >
        <ScheduleSelector
          initialSchedule={currentSchedule}
          onSave={handleSaveSchedule}
          showLunch={true}
          multiSlot={false}
          defaultSlotStart="09:00"
          defaultSlotEnd="17:00"
          includeSunday={true}
          toggleAllDays={true}
        />
      </Modal>

     
    </div>
  );
};

export default EmploymentDetailsStep;
