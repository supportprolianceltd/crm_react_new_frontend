// modals/ConfirmTitleEditModal.jsx
import { motion, AnimatePresence } from "framer-motion";
import Modal from "../../../../components/Modal";
import ToastNotification from "../../../../components/ToastNotification";

const ConfirmTitleEditModal = ({
  isOpen,
  onClose,
  onConfirm,
  originalTitle,
  newTitle,
  isLoading,
  successMessage,
  errorMessage,
}) => {
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  };

  if (!isOpen) return null;

  return (
    <>
      <ToastNotification
        successMessage={successMessage}
        errorMessage={errorMessage}
      />
      <Modal isOpen={isOpen} onClose={onClose} title={`Confirm Title Change`}>
        <p>
          You have changed the document title from "{originalTitle}" to "
          {newTitle}". Do you want to proceed?
        </p>
        <div
          className="modal-footer"
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            marginTop: "1rem",
          }}
        >
          <button
            onClick={onClose}
            className="modal-button modal-button-cancel"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="modal-button modal-button-confirm"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Proceed"}
          </button>
        </div>
      </Modal>
    </>
  );
};

export default ConfirmTitleEditModal;
