import { useState } from "react";
import { FiLoader } from "react-icons/fi";
import Modal from "../../components/Modal";
import ToastNotification from "../../components/ToastNotification";
import { deleteRequisition } from "../CompanyDashboard/Recruitment/ApiService";

const DeleteRequisitionModal = ({
  isOpen,
  onClose,
  requisition,
  onDeleteSuccess,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteRequisition(requisition.id);

      setSuccessMessage(
        `Requisition #${requisition.job_requisition_code} has been deleted successfully!`
      );
      setErrorMessage(null);

      if (onDeleteSuccess) {
        onDeleteSuccess();
      }

      // Close the modal after success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error deleting requisition:", error);
      setErrorMessage(
        `Failed to delete requisition #${requisition.job_requisition_code}. Please try again.`
      );
      setSuccessMessage(null);
    } finally {
      setIsDeleting(false);
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
        title="Delete Requisition"
        message={`Are you sure you want to delete requisition #${requisition?.job_requisition_code} (${requisition?.title})? This action cannot be undone.`}
      >
        <div className="modal-footer">
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
                Cancelling...
              </>
            ) : (
              "Confirm Cancel"
            )}
          </button>
        </div>
      </Modal>
    </>
  );
};

export default DeleteRequisitionModal;
