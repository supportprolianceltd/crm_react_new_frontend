import { useState, useEffect } from "react";
import Modal from "../../../../components/Modal";
import { updateEmployee } from "../config/apiService";
import ToastNotification from "../../../../components/ToastNotification";
import { FiLoader } from "react-icons/fi";
import ToggleButton from "../../../../components/ToggleButton";

const permissionOptions = [
  { key: "system_access_recruitment", label: "Recruitment" },
  { key: "system_access_hr", label: "HR" },
  { key: "system_access_compliance", label: "Compliance" },
  { key: "system_access_rostering", label: "Rostering" },
  { key: "system_access_training", label: "Training" },
  { key: "system_access_asset_management", label: "Assets Management" },
  { key: "system_access_finance", label: "Payroll" },
  { key: "system_access_co_superadmin", label: "Super Admin" },
];

const ManageUserAppPermissionsModal = ({
  isOpen,
  onClose,
  user,
  onUpdateSuccess,
  setIsLoading,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [permissions, setPermissions] = useState({
    system_access_rostering: false,
    system_access_hr: false,
    system_access_recruitment: false,
    system_access_training: false,
    system_access_finance: false,
    system_access_compliance: false,
    system_access_co_superadmin: false,
    system_access_asset_management: false,
  });

  // Initialize permissions when modal opens
  useEffect(() => {
    if (isOpen && user) {
      // Set permissions from user profile data
      const initialPermissions = { ...permissions };

      // Update each permission based on user profile data
      permissionOptions.forEach((option) => {
        if (user.profile && user.profile.hasOwnProperty(option.key)) {
          initialPermissions[option.key] = user.profile[option.key];
        }
      });

      setPermissions(initialPermissions);
    }
  }, [isOpen, user]);

  const handlePermissionToggle = (permissionKey, isOn) => {
    setPermissions((prev) => ({
      ...prev,
      [permissionKey]: isOn,
    }));
  };

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      setIsLoading(true);

      // Create updated profile object with new permissions
      const updatedProfile = {
        ...user.profile,
        ...permissions,
      };

      await updateEmployee(user.id, {
        ...user,
        profile: updatedProfile,
      });

      setSuccessMessage(
        `${user.first_name}'s app permissions updated successfully!`
      );
      setErrorMessage(null);

      onUpdateSuccess({
        ...user,
        profile: updatedProfile,
      });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setErrorMessage(
        `Failed to update ${user.first_name}'s app permissions. Please try again.`
      );
      setSuccessMessage(null);
    } finally {
      setIsUpdating(false);
      setIsLoading(false);
      setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 3000);
    }
  };

  return (
    <>
      <ToastNotification
        successMessage={successMessage}
        errorMessage={errorMessage}
      />
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Manage User App Permissions"
        message={`Adjust app permissions for ${user?.first_name} ${user?.last_name}`}
      >
        {/* Permissions Toggles */}
        <div style={{ marginTop: "1rem" }}>
          {permissionOptions.map((option) => (
            <ToggleButton
              key={option.key}
              label={option.label}
              isOn={permissions[option.key]}
              onToggle={(isOn) => handlePermissionToggle(option.key, isOn)}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            className="modal-button modal-button-cancel"
            onClick={onClose}
            disabled={isUpdating}
          >
            Cancel
          </button>
          <button
            className="modal-button modal-button-confirm"
            onClick={handleUpdate}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <FiLoader
                  style={{
                    animation: "spin 1s linear infinite",
                    margin: "0.6rem 0.3rem 0 0",
                  }}
                />
                Updating...
              </>
            ) : (
              "Update"
            )}
          </button>
        </div>
      </Modal>
    </>
  );
};

export default ManageUserAppPermissionsModal;
