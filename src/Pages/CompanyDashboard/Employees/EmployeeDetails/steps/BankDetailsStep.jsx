import React from "react";
import { PencilIcon } from "../../../../../assets/icons/PencilIcon";
import { IoMdClose } from "react-icons/io";

const BankDetailsStep = ({
  formData,
  isEditing,
  handleEditToggle,
  handleInputChange,
}) => {
  if (!formData) return null;

  const disabledFields = ["accountName", "accountType"];
  const accountTypeOptions = ["Savings", "Current"];

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === "admin" || currentUser.role === "co-admin" || currentUser.role === "root-admin";
  const hasStaffInUrl = window.location.pathname.includes("staff");
  const shouldDisableSensitiveFields = hasStaffInUrl || !isAdmin;


  const isFieldDisabled = (fieldName) => disabledFields.includes(fieldName);

  return (
    <div className="step-form">
      <div className="info-card">
        <div className="card-header">
          <h4>Bank Details</h4>
          <button
            className="edit-button"
            onClick={() => handleEditToggle("bank")}
          >
            {isEditing.bank ? (
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
        <div className="info-grid">
          <div className="info-item">
            <label>Bank Name</label>
            {isEditing.bank ? (
              <input
                type="text"
                name="bankName"
                value={formData.bankName || ""}
                onChange={(e) =>
                  handleInputChange("bank", "bankName", e.target.value)
                }
                className="edit-input"
              />
            ) : (
              <span>{formData.bankName || "-"}</span>
            )}
          </div>
          <div className="info-item">
            <label>Account Number</label>
            {isEditing.bank ? (
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber || ""}
                onChange={(e) =>
                  handleInputChange("bank", "accountNumber", e.target.value)
                }
                className="edit-input"
              />
            ) : (
              <span>{formData.accountNumber || "-"}</span>
            )}
          </div>
          <div
            className={`info-item ${
              isFieldDisabled("accountName") ? "disabled" : ""
            }`}
          >
            <label>Account Name</label>
            {isEditing.bank ? (
              <input
                type="text"
                name="accountName"
                value={formData.accountName || ""}
                onChange={(e) =>
                  handleInputChange("bank", "accountName", e.target.value)
                }
                className="edit-input"
                // disabled={isFieldDisabled("accountName")}
              />
            ) : (
              <span>{formData.accountName || "-"}</span>
            )}
          </div>
          <div
            className={`info-item ${
              isFieldDisabled("accountType") ? "disabled" : ""
            }`}
          >
            <label>Account Type</label>
            {isEditing.bank ? (
              <select
                name="accountType"
                value={formData.accountType || ""}
                onChange={(e) =>
                  handleInputChange("bank", "accountType", e.target.value)
                }
                className="edit-input"
                // disabled={isFieldDisabled("accountType")}
              >
                <option value="">Select Account Type</option>
                {accountTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <span>{formData.accountType || "-"}</span>
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
    </div>
  );
};

export default BankDetailsStep;
