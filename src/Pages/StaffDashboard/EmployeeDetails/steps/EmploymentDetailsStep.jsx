import { useEffect } from "react";
import { PencilIcon } from "../../../../assets/icons/PencilIcon";
import { IoMdClose } from "react-icons/io";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import FileUploader from "../../../../components/FileUploader/FileUploader";
import { normalizeText } from "../../../../utils/helpers";
import useCurrencies from "../../../../hooks/useCurrencies";

const EmploymentDetailsStep = ({
  formData,
  isEditing,
  handleEditToggle,
  handleInputChange,
  handleRightToWorkFileChange,
  removeRightToWorkFile,
  rightToWorkFileRef,
  handleRightToRentFileChange,
  removeRightToRentFile,
  rightToRentFileRef,
  handleInsuranceFileChange,
  removeInsuranceFile,
  insuranceFileRef,
  handlePhoneChange,
  addEmploymentRecord,
  removeEmploymentRecord,
}) => {
  const currencies = useCurrencies();

  // Initialize an empty employment record when entering edit mode if none exist
  useEffect(() => {
    if (isEditing.employment && formData.employmentDetails.length === 0) {
      addEmploymentRecord(); // Add a new empty record
    }
  }, [isEditing.employment, formData.employmentDetails, addEmploymentRecord]);

  if (!formData) return null;

  const disabledFields = [
    "Currency",
    "Salary",
    "Work Email",
    "Employment Type",
    "Working Days",
    "Maximum Working Hours",
  ];

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
        {formData.employmentDetails.length === 0 && !isEditing.employment ? (
          <p>No employment details available.</p>
        ) : (
          formData.employmentDetails.map((employment, index) => {
            const isLast = index === formData.employmentDetails.length - 1;

            return (
              <div
                key={index}
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
                <div
                  className={`info-item ${
                    !isEditing.employment &&
                    disabledFields.includes("Work Email")
                      ? "disabled"
                      : ""
                  }`}
                >
                  <label>Work Email</label>
                  {isEditing.employment ? (
                    <input
                      name={`workEmail-${index}`}
                      value={employment.workEmail || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "employmentDetails",
                          "workEmail",
                          e.target.value,
                          index
                        )
                      }
                      className="edit-input"
                    />
                  ) : (
                    <span>{employment.workEmail || "-"}</span>
                  )}
                </div>
                <div
                  className={`info-item ${
                    !isEditing.employment &&
                    disabledFields.includes("Employment Type")
                      ? "disabled"
                      : ""
                  }`}
                >
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
                      value={employment.employmentStartDate || ""}
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
                    <span>{employment.employmentStartDate || "-"}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>End Date</label>
                  {isEditing.employment ? (
                    <input
                      type="date"
                      name={`employmentEndDate-${index}`}
                      value={employment.employmentEndDate || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "employmentDetails",
                          "employmentEndDate",
                          e.target.value,
                          index
                        )
                      }
                      className="edit-input"
                    />
                  ) : (
                    <span>{employment.employmentEndDate || "-"}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Probation End Date</label>
                  {isEditing.employment ? (
                    <input
                      type="date"
                      name={`probationEndDate-${index}`}
                      value={employment.probationEndDate || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "employmentDetails",
                          "probationEndDate",
                          e.target.value,
                          index
                        )
                      }
                      className="edit-input"
                    />
                  ) : (
                    <span>{employment.probationEndDate || "-"}</span>
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
                <div
                  className={`info-item ${
                    !isEditing.employment && disabledFields.includes("Currency")
                      ? "disabled"
                      : ""
                  }`}
                >
                  <label>Currency</label>
                  {isEditing.employment ? (
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
                  ) : (
                    <span>{employment.currency || "-"}</span>
                  )}
                </div>
                <div
                  className={`info-item ${
                    !isEditing.employment && disabledFields.includes("Salary")
                      ? "disabled"
                      : ""
                  }`}
                >
                  <label>Salary</label>
                  {isEditing.employment ? (
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
                  ) : (
                    <span>{employment.salary || "-"}</span>
                  )}
                </div>
                <div
                  className={`info-item ${
                    !isEditing.employment &&
                    disabledFields.includes("Working Days")
                      ? "disabled"
                      : ""
                  }`}
                >
                  <label>Working Days</label>
                  {isEditing.employment ? (
                    <input
                      name={`workingDays-${index}`}
                      value={employment.workingDays || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "employmentDetails",
                          "workingDays",
                          e.target.value,
                          index
                        )
                      }
                      className="edit-input"
                    />
                  ) : (
                    <span>{employment.workingDays || "-"}</span>
                  )}
                </div>
                <div
                  className={`info-item ${
                    !isEditing.employment &&
                    disabledFields.includes("Maximum Working Hours")
                      ? "disabled"
                      : ""
                  }`}
                >
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
                {/* Remove Button */}
                {isEditing.employment && (
                  <div className="button-container">
                    <button
                      className="icon-button remove-icon-button"
                      onClick={() => removeEmploymentRecord(index)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
        {/* Add Button */}
        {isEditing.employment && (
          <button
            className="icon-button add-icon-button"
            onClick={addEmploymentRecord}
          >
            <FiPlus />
          </button>
        )}
      </div>
    </div>
  );
};

export default EmploymentDetailsStep;
