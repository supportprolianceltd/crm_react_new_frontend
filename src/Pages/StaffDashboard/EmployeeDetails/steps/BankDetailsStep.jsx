import { PencilIcon } from "../../../../assets/icons/PencilIcon";
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
      </div>
    </div>
  );
};

export default BankDetailsStep;
