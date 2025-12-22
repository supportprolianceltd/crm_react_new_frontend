import { useState } from "react";
import Modal from "../../../../components/Modal";
import { apiClient } from "../../../../config";
import ToastNotification from "../../../../components/ToastNotification";
import { FiLoader } from "react-icons/fi";
import { deleteOnboardingDocument } from "../config/apiConfig";

const DeleteOnboardingDocumentModal = ({
  isOpen,
  onClose,
  document,
  onDeleteSuccess,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteOnboardingDocument(document.id);
      setSuccessMessage(`"${document.title}" deleted successfully!`);
      setErrorMessage(null);
      onDeleteSuccess(document.id);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error deleting document:", error);
      setErrorMessage(
        `Failed to delete "${document.title}". Please try again.`
      );
      setSuccessMessage(null);
    } finally {
      setIsDeleting(false);
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
        title="Delete Document"
        message={`Are you sure you want to delete "${document?.title}"? This action cannot be undone.`}
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

export default DeleteOnboardingDocumentModal;
