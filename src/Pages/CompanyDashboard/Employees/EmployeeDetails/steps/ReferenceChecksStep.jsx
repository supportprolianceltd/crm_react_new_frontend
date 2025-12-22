import React, { useEffect } from "react";
import { PencilIcon } from "../../../../../assets/icons/PencilIcon";
import { IoMdClose } from "react-icons/io";
import { FiPlus, FiTrash2 } from "react-icons/fi";

const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
const isAdmin = currentUser.role === "admin" || currentUser.role === "co-admin" || currentUser.role === "root-admin";
const hasStaffInUrl = window.location.pathname.includes("staff");
const shouldDisableSensitiveFields = hasStaffInUrl || !isAdmin;


const ReferenceChecksStep = ({
  formData,
  isEditing,
  handleEditToggle,
  handleInputChange,
  addReferenceCheck,
  removeReferenceCheck,
}) => {
  // Automatically add an empty reference record when entering edit mode if none exist
  useEffect(() => {
    if (isEditing.referenceChecks && formData.referenceChecks.length === 0) {
      addReferenceCheck();
    }
  }, [isEditing.referenceChecks, formData.referenceChecks, addReferenceCheck]);

  if (!formData) return null;

  return (
    <div className="step-form">
      {/* REFERENCE CHECKS SECTION */}
      <div className="info-card">
        <div className="card-header">
          <h4>Reference Checks</h4>
          <div>
            <button
              className="edit-button"
              onClick={() => handleEditToggle("referenceChecks")}
            >
              {isEditing.referenceChecks ? (
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
        {formData.referenceChecks.length === 0 && !isEditing.referenceChecks ? (
          <p>No reference checks available.</p>
        ) : (
          formData.referenceChecks.map((referee, index) => {
            const isLast = index === formData.referenceChecks.length - 1;

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
                  <label>Name</label>
                  {isEditing.referenceChecks ? (
                    <input
                      type="text"
                      value={referee.name || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "referenceChecks",
                          "name",
                          e.target.value,
                          index
                        )
                      }
                      className="edit-input"
                      placeholder="Enter referee name"
                    />
                  ) : (
                    <span>{referee.name || "-"}</span>
                  )}
                </div>

                {/* Updated Phone Number Field */}
                <div className="info-item">
                  <label>Phone Number</label>
                  {isEditing.referenceChecks ? (
                    <input
                      type="text"
                      value={referee.phoneNumber || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "referenceChecks",
                          "phoneNumber",
                          e.target.value,
                          index
                        )
                      }
                      className="edit-input"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <span>{referee.phoneNumber || "-"}</span>
                  )}
                </div>

                <div className="info-item">
                  <label>Email</label>
                  {isEditing.referenceChecks ? (
                    <input
                      type="email"
                      value={referee.email || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "referenceChecks",
                          "email",
                          e.target.value,
                          index
                        )
                      }
                      className="edit-input"
                      placeholder="Enter email address"
                    />
                  ) : (
                    <span>{referee.email || "-"}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Relationship to Applicant</label>
                  {isEditing.referenceChecks ? (
                    <input
                      type="text"
                      value={referee.relationship || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "referenceChecks",
                          "relationship",
                          e.target.value,
                          index
                        )
                      }
                      className="edit-input"
                      placeholder="Enter relationship"
                    />
                  ) : (
                    <span>{referee.relationship || "-"}</span>
                  )}
                </div>
                {isEditing.referenceChecks && (
                  <div className="button-container">
                    <button
                      className="icon-button remove-icon-button"
                      onClick={() => removeReferenceCheck(index)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
        {isEditing.referenceChecks && (
          <button
            className="icon-button add-icon-button"
            onClick={addReferenceCheck}
          >
            <FiPlus />
          </button>
        )}
      
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
    </div>
  );
};

export default ReferenceChecksStep;
