import Modal from "../../../../../../components/Modal";
import { FiLoader } from "react-icons/fi"; // Import loader icon

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="confirmation-body">
        <div className="confirmation-icon">
          <span role="img" aria-label="lightning">
            ⚡
          </span>
        </div>
        <h3 className={`status-modal-title`}>{title}</h3>

        <p>{message}</p>
      </div>

      <div className="modal-footer">
        <button
          className="modal-button modal-button-cancel"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          className="modal-button modal-button-confirm"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <FiLoader
                style={{
                  animation: "spin 1s linear infinite",
                  marginRight: "0.3rem",
                }}
              />
              Saving...
            </>
          ) : (
            "Yes, continue"
          )}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
