import React, { useState } from "react";
import Modal from "../../../components/Modal";
import { deleteTenant } from "../config/apiConfig";
import ToastNotification from "../../../components/ToastNotification";
import { FiLoader } from "react-icons/fi";

const DeleteTenantModal = ({
  isOpen,
  onClose,
  tenant,
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
      await deleteTenant(tenant.id);
      setSuccessMessage(`Tenant ${tenant?.name} deleted successfully!`);
      setErrorMessage(null);
      onDeleteSuccess();
      // Close the modal after 1.5 seconds to allow user to see the success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error deleting tenant:", error);
      setErrorMessage(
        `Failed to delete tenant ${tenant?.name}. Please try again.`
      );
      setSuccessMessage(null);
    } finally {
      setIsDeleting(false);
      setIsLoading(false);
      // Clear messages after 3 seconds
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
        title="Delete Tenant"
        message={`Are you sure you want to delete the tenant ${tenant?.name}? This action cannot be undone.`}
      >
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

export default DeleteTenantModal;
