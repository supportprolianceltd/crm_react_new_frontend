import { useState } from "react";
import Modal from "../../../../components/Modal";
import { deleteEmployee } from "../config/apiService";
import ToastNotification from "../../../../components/ToastNotification";
import { FiLoader } from "react-icons/fi";

const DeleteUserModal = ({
  isOpen,
  onClose,
  employee,
  onDeleteSuccess,
  setIsLoading,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setIsLoading(true);
      await deleteEmployee(employee.id);
      setSuccessMessage(
        `${employee.first_name} ${employee.last_name} deleted successfully!`
      );
      setErrorMessage(null);
      onDeleteSuccess();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error deleting employee:", error);
      setErrorMessage(
        `Failed to delete ${employee.first_name} ${employee.last_name}. Please try again.`
      );
      setSuccessMessage(null);
    } finally {
      setIsDeleting(false);
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
        title="Delete Employee"
      >
        <div style={{ paddingBottom: "1rem" }}>
          {employee ? (
            <div style={{ marginBottom: "1rem" }}>
              <p style={{ fontSize: "1rem", fontWeight: "500", color: "#374151", marginBottom: "0.5rem" }}>
                You are about to delete the employee: <strong>{employee.first_name} {employee.last_name}</strong>
              </p>
              <div style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "6px",
                padding: "1rem",
                marginBottom: "1rem"
              }}>
                <p style={{
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  color: "#dc2626",
                  margin: "0 0 0.5rem 0",
                  display: "flex",
                  alignItems: "center"
                }}>
                  ⚠️ Warning
                </p>
                <p style={{
                  fontSize: "0.9rem",
                  color: "#4b5563",
                  lineHeight: "1.5",
                  margin: 0
                }}>
                  This action is irreversible. All user data, including personal information, employment records, and associated files, will be permanently deleted and cannot be recovered. This operation is final and cannot be undone.
                </p>
              </div>
              <p style={{ fontSize: "0.9rem", color: "#6b7280", fontStyle: "italic" }}>
                Please confirm that you understand the consequences and wish to proceed.
              </p>
            </div>
          ) : (
            <div style={{ marginBottom: "1rem" }}>
              <p style={{ fontSize: "1rem", fontWeight: "500", color: "#374151", marginBottom: "0.5rem" }}>
                You are about to delete this user.
              </p>
              <div style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "6px",
                padding: "1rem",
                marginBottom: "1rem"
              }}>
                <p style={{
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  color: "#dc2626",
                  margin: "0 0 0.5rem 0",
                  display: "flex",
                  alignItems: "center"
                }}>
                  ⚠️ Warning
                </p>
                <p style={{
                  fontSize: "0.9rem",
                  color: "#4b5563",
                  lineHeight: "1.5",
                  margin: 0
                }}>
                  This action is irreversible. All user data will be permanently deleted and cannot be recovered. This operation is final and cannot be undone.
                </p>
              </div>
              <p style={{ fontSize: "0.9rem", color: "#6b7280", fontStyle: "italic" }}>
                Please confirm that you understand the consequences and wish to proceed.
              </p>
            </div>
          )}
        </div>
        <div className="modal-footer" style={{ marginTop: "1rem" }}>
          <button
            className="modal-button modal-button-cancel"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="modal-button modal-button-confirm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <FiLoader
                  style={{
                    animation: "spin 1s linear infinite",
                    margin: "0.5rem 0.3rem 0 0",
                  }}
                />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </Modal>
    </>
  );
};

export default DeleteUserModal;
