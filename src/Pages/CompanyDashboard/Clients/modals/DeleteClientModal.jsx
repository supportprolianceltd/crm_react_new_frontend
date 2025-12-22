// src/components/DeleteClientModal.jsx
import { useState } from "react";
import Modal from "../../../../components/Modal";
import { deleteClient } from "../config/apiService";
import ToastNotification from "../../../../components/ToastNotification";
import { FiLoader } from "react-icons/fi";

const DeleteClientModal = ({
  isOpen,
  onClose,
  client,
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
      await deleteClient(client.id);
      setSuccessMessage(
        `${client.firstName} ${client.lastName} deleted successfully!`
      );
      setErrorMessage(null);
      onDeleteSuccess();
      // Close the modal after 1.5 seconds to allow user to see the success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setErrorMessage(
        `Failed to delete ${client.firstName} ${client.lastName}. Please try again.`
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
        title="Delete Client"
        message={`Are you sure you want to delete ${client?.firstName} ${client?.lastName}? This action cannot be undone.`}
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

export default DeleteClientModal;
