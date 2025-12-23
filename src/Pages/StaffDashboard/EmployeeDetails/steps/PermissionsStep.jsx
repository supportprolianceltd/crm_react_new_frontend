import { PencilIcon } from "../../../../assets/icons/PencilIcon";
import { IoMdClose } from "react-icons/io";
import ToggleButton from "../../../../components/ToggleButton";
import CheckboxGroup from "../../../../components/CheckboxGroup";
import InputField from "../../../../components/Input/InputField";
import {
  AvailabilityGrid,
  systemAccessOptions,
} from "../../../CompanyDashboard/Employees/components/steps/DrivingStatusDetailsStep";
import { normalizeText } from "../../../../utils/helpers";

const PermissionsStep = ({
  formData,
  isEditing,
  handleEditToggle,
  handleInputChange,
}) => {
  if (!formData) return null;

  return (
    <div className="step-form">
      <div className="info-card">
        <div className="card-header">
          <h4>Permissions</h4>
          <button
            className="edit-button"
            onClick={() => handleEditToggle("permissions")}
          >
            {isEditing.permissions ? (
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
            <label>Access Duration</label>
            {isEditing.permissions ? (
              <ToggleButton
                isOn={formData.accessDuration || false}
                onToggle={(value) =>
                  handleInputChange("permissions", "accessDuration", value)
                }
              />
            ) : (
              <span>{formData.accessDuration ? "Enabled" : "Disabled"}</span>
            )}
            <p>Allow access until official exit date</p>
          </div>
          {formData.accessDuration && (
            <div className="info-item">
              <label>Access Expiry Date</label>
              {isEditing.permissions ? (
                <input
                  type="date"
                  name="accessExpiryDate"
                  value={formData.accessExpiryDate || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "permissions",
                      "accessExpiryDate",
                      e.target.value
                    )
                  }
                  className="edit-input"
                />
              ) : (
                <span>{formData.accessExpiryDate || "-"}</span>
              )}
            </div>
          )}
          <div className="info-item">
            <label>System Access</label>
            {isEditing.permissions ? (
              <ToggleButton
                isOn={formData.systemAccess || false}
                onToggle={(value) =>
                  handleInputChange("permissions", "systemAccess", value)
                }
              />
            ) : (
              <span>{formData.systemAccess ? "Enabled" : "Disabled"}</span>
            )}
          </div>
          {formData.systemAccess && (
            <div className="info-item">
              <label>System Access Selections</label>
              {isEditing.permissions ? (
                <CheckboxGroup
                  options={systemAccessOptions}
                  value={formData.systemAccessSelections}
                  onChange={(selectedValues) =>
                    handleInputChange(
                      "permissions",
                      "systemAccessSelections",
                      selectedValues
                    )
                  }
                  multiple={true}
                />
              ) : (
                <span>
                  {normalizeText(formData.systemAccessSelections.join(", ")) ||
                    "-"}
                </span>
              )}
            </div>
          )}
          <div className="info-item">
            <label>Manage Permission</label>
            {isEditing.permissions ? (
              <ToggleButton
                isOn={formData.manage_permission || false}
                onToggle={(isOn) => handleInputChange("permissions", "manage_permission", isOn)}
              />
            ) : (
              <span>{formData.manage_permission ? "Yes" : "No"}</span>
            )}
          </div>
          {/* <div className="info-item">
            <label>Sync with Roster</label>
            {isEditing.permissions ? (
              <ToggleButton
                isOn={formData.isSyncWithRoster || false}
                onToggle={(value) =>
                  handleInputChange(
                    "permissions",
                    "isSyncWithRoster",
                    null,
                    value
                  )
                }
              />
            ) : (
              <span>{formData.isSyncWithRoster ? "Enabled" : "Disabled"}</span>
            )}
          </div>
          {formData.isSyncWithRoster && (
            <div className="info-item">
              <label>Availability</label>
              {isEditing.permissions ? (
                <AvailabilityGrid
                  value={formData.availability}
                  onChange={(val) =>
                    handleInputChange("permissions", "availability", null, val)
                  }
                />
              ) : (
                <span>{JSON.stringify(formData.availability) || "-"}</span>
              )}
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default PermissionsStep;
