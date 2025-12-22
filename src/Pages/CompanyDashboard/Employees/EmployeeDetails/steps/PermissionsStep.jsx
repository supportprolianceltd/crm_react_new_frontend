import React, { useEffect } from "react";
import { PencilIcon } from "../../../../../assets/icons/PencilIcon";
import { IoMdClose } from "react-icons/io";
import ToggleButton from "../../../../../components/ToggleButton";
import CheckboxGroup from "../../../../../components/CheckboxGroup";
import InputField from "../../../../../components/Input/InputField";
import {
  AvailabilityGrid,
  systemAccessOptions,
  systemAdminAccessOptions,
} from "../../components/steps/DrivingStatusDetailsStep";
import { capitalizeFirstLetter } from "../../../../../utils/helpers";

const PermissionsStep = ({
  formData,
  isEditing,
  handleEditToggle,
  handleInputChange,
  
}) => {
  if (!formData) return null;

  // Hide System Admin Access if the viewed user is root-admin
  const isViewedUserRootAdmin = formData.role === "root-admin";

  // For any user, set system access selections from profile fields, or all if root-admin
  useEffect(() => {
    if (!Array.isArray(systemAccessOptions)) return;
    // Only auto-set if not editing and no selections yet
    if (isEditing && isEditing.permissions) return;
    if (formData.systemAccessSelections && formData.systemAccessSelections.length > 0) return;
    let selections = [];
    if (isViewedUserRootAdmin) {
      selections = systemAccessOptions.map((opt) => opt.value);
    } else if (formData.profile) {
      selections = systemAccessOptions
        .filter((opt) => {
          const key = `system_access_${opt.value}`;
          // Only accept strict true for checked, strict false for unchecked
          return formData.profile[key] === true;
        })
        .map((opt) => opt.value);
    }
    // Always update selections, even if empty
    handleInputChange(
      "permissions",
      "systemAccessSelections",
      selections
    );
  }, [isViewedUserRootAdmin, formData.profile, formData.systemAccessSelections, isEditing, handleInputChange]);

  // Set role to "co-admin" when Co-Admin is selected in System Admin Access

  // Handler for System Admin Access checkbox
  const handleSystemAdminAccessChange = (selectedValues) => {
    handleInputChange(
      "permissions",
      "systemAdminAccessSelections",
      selectedValues
    );
    if (selectedValues.includes("co-admin")) {
      handleInputChange(null, "role", "co-admin");
    } else {
      handleInputChange(null, "role", "staff");
    }
  };

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
            <label>System Access</label>
            {isEditing.permissions ? (
              <CheckboxGroup
                options={systemAccessOptions}
                value={formData.systemAccessSelections || []}
                onChange={(selectedValues) => {
                  handleInputChange(
                    "permissions",
                    "systemAccessSelections",
                    selectedValues
                  );
                  // Force update HR profile key
                  if (formData.profile) {
                    const hrChecked = selectedValues.includes("hr");
                    console.log("Force HR update", hrChecked);
                    handleInputChange(
                      "profile",
                      "system_access_hr",
                      hrChecked
                    );
                    // Also update all other keys as before
                    systemAccessOptions.forEach(opt => {
                      if (opt.value !== "hr") {
                        const checked = selectedValues.includes(opt.value);
                        handleInputChange(
                          "profile",
                          `system_access_${opt.value}`,
                          checked
                        );
                      }
                    });
                  }
                }}
                multiple={true}
              />
            ) : (
              <span>
                {formData.systemAccessSelections &&
                formData.systemAccessSelections.length > 0
                  ? formData.systemAccessSelections
                      // .map((item) =>
                        // item?.trim() === "hr"
                          // ? "HR"
                          // : capitalizeFirstLetter(item?.trim() || "")
                      // )
                      .join(", ")
                  : "-"}
              </span>
            )}
          </div>

          {!isViewedUserRootAdmin && (
            <div className="info-item">
              <label>System Admin Access</label>
              {isEditing.permissions ? (
                <CheckboxGroup
                  options={systemAdminAccessOptions}
                  value={formData.systemAdminAccessSelections || []}
                  onChange={handleSystemAdminAccessChange}
                  multiple={true}
                />
              ) : (
                <span>
                  {formData.systemAdminAccessSelections &&
                  formData.systemAdminAccessSelections.length > 0
                    ? formData.systemAdminAccessSelections
                        .map(
                          (value) =>
                            systemAdminAccessOptions.find(
                              (o) => o.value === value
                            )?.label || capitalizeFirstLetter(value)
                        )
                        .join(", ")
                    : "-"}
                </span>
              )}
            </div>
          )}
        </div>

        {(() => {
          const lastUpdated =
            formData.lastUpdatedBy ||
            formData.last_updated_by ||
            formData.profile?.last_updated_by ||
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
    </div>
  );
};

export default PermissionsStep;
