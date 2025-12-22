import { useState } from "react";
import Modal from "../../../../components/Modal";
import { updateEmployeeStatus } from "../config/apiService";
import ToastNotification from "../../../../components/ToastNotification";
import { FiLoader } from "react-icons/fi";

const ChangeStatusModal = ({
  isOpen,
  onClose,
  employee,
  onUpdateSuccess,
  setIsLoading,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const newStatus = employee?.status === "active" ? "inactive" : "active";
  const actionText = newStatus === "inactive" ? "deactivate" : "activate";

  const handleStatusChange = async () => {
    try {
      setIsUpdating(true);
      setIsLoading(true);
      const updatedEmployee = await updateEmployeeStatus(employee.id, newStatus);
      setSuccessMessage(
        `${employee.first_name} ${employee.last_name} has been ${actionText}d successfully!`
      );
      setErrorMessage(null);
      onUpdateSuccess(updatedEmployee);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error updating status:", error);
      setErrorMessage(
        `Failed to ${actionText} ${employee.first_name} ${employee.last_name}. Please try again.`
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
        title={`Change Employee Status`}
      >
        <div style={{ paddingBottom: "1rem" }}>
          {employee ? (
            <div style={{ marginBottom: "1rem" }}>
              <p style={{ fontSize: "1rem", fontWeight: "500", color: "#374151", marginBottom: "0.5rem" }}>
                You are about to {actionText} the employee: <strong>{employee.first_name} {employee.last_name}</strong>
              </p>
              <div style={{
                backgroundColor: "#fef3c7",
                border: "1px solid #fcd34d",
                borderRadius: "6px",
                padding: "1rem",
                marginBottom: "1rem"
              }}>
                <p style={{
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  color: "#d97706",
                  margin: "0 0 0.5rem 0",
                  display: "flex",
                  alignItems: "center"
                }}>
                  ⚠️ Notice
                </p>
                <p style={{
                  fontSize: "0.9rem",
                  color: "#4b5563",
                  lineHeight: "1.5",
                  margin: 0
                }}>
                  This will change the employee's status to <strong>{newStatus}</strong>. The employee will {newStatus === "inactive" ? "lose access to the system" : "regain access to the system"}. This action can be reversed later.
                </p>
              </div>
              <p style={{ fontSize: "0.9rem", color: "#6b7280", fontStyle: "italic" }}>
                Please confirm that you wish to proceed.
              </p>
            </div>
          ) : (
            <div style={{ marginBottom: "1rem" }}>
              <p style={{ fontSize: "1rem", fontWeight: "500", color: "#374151", marginBottom: "0.5rem" }}>
                You are about to change this employee's status.
              </p>
              <div style={{
                backgroundColor: "#fef3c7",
                border: "1px solid #fcd34d",
                borderRadius: "6px",
                padding: "1rem",
                marginBottom: "1rem"
              }}>
                <p style={{
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  color: "#d97706",
                  margin: "0 0 0.5rem 0",
                  display: "flex",
                  alignItems: "center"
                }}>
                  ⚠️ Notice
                </p>
                <p style={{
                  fontSize: "0.9rem",
                  color: "#4b5563",
                  lineHeight: "1.5",
                  margin: 0
                }}>
                  This will change the employee's status. This action can be reversed later.
                </p>
              </div>
              <p style={{ fontSize: "0.9rem", color: "#6b7280", fontStyle: "italic" }}>
                Please confirm that you wish to proceed.
              </p>
            </div>
          )}
        </div>
        <div className="modal-footer" style={{ marginTop: "1rem" }}>
          <button
            className="modal-button modal-button-cancel"
            onClick={onClose}
            disabled={isUpdating}
          >
            Cancel
          </button>
          <button
            className="modal-button modal-button-confirm"
            onClick={handleStatusChange}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <FiLoader
                  style={{
                    animation: "spin 1s linear infinite",
                    margin: "0.5rem 0.3rem 0 0",
                  }}
                />
                Updating...
              </>
            ) : (
              `Confirm ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`
            )}
          </button>
        </div>
      </Modal>
    </>
  );
};

export default ChangeStatusModal;