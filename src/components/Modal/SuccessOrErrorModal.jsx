import Modal from ".";
import {
  FiCheckCircle,
  FiXCircle,
  FiX,
  FiPlus,
  FiList,
  FiArrowRight,
} from "react-icons/fi";
import "./SuccessOrErrorModal.css";
import successIcon from "../../assets/icons/success-icon.svg";

const SuccessOrErrorModal = ({
  isOpen,
  onClose,
  type,
  name,
  title,
  message,
  onAddAnother,
  onViewList,
  showAddAnother = true,
  showContinue = false,
  onContinue,
  isFinalStep = false,
  showProceedCarePlan = false,
  onProceedCarePlan,
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="medium">
      <div className="status-modal-content-container">
        <div className="status-container">
          <div className="status-icon">
            {type === "success" ? (
              <div className="success-icon-wrapper">
                <img className="success-icon" src={successIcon} />
              </div>
            ) : (
              <FiXCircle size={48} className="error-icon" />
            )}
          </div>

          <h3
            className={`status-modal-title ${
              type !== "success" ? "error-title" : ""
            }`}
          >
            {title}
          </h3>

          <div className="status-message">
            <p>{message}</p>
          </div>
        </div>

        <div className="status-modal-footer dual-buttons">
          {type === "success" ? (
            <>
              {isFinalStep ? (
                // Final step - show Add Another and View List or Proceed to Care Plan buttons
                <>
                  {showAddAnother && (
                    <button
                      className="status-modal-button secondary-button"
                      onClick={onAddAnother}
                    >
                      <FiPlus size={18} />
                      Add Another {name}
                    </button>
                  )}
                  {showProceedCarePlan ? (
                    <button
                      className="status-modal-button primary-button"
                      onClick={onProceedCarePlan}
                    >
                      <FiArrowRight size={18} />
                      Proceed to create care plan
                    </button>
                  ) : (
                    <button
                      className="status-modal-button primary-button"
                      onClick={onViewList}
                    >
                      <FiList size={18} />
                      View {name} List
                    </button>
                  )}
                </>
              ) : (
                // Intermediate step - show Continue button
                <>
                  <button
                    className="status-modal-button secondary-button"
                    onClick={onViewList}
                  >
                    Skip for now
                  </button>
                  <button
                    className="status-modal-button primary-button"
                    onClick={onContinue || onClose}
                  >
                    <FiArrowRight size={18} />
                    Continue to Next Step
                  </button>
                </>
              )}
            </>
          ) : (
            // Error state
            <>
              <button
                className="status-modal-button secondary-button"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="status-modal-button primary-button"
                onClick={onAddAnother}
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SuccessOrErrorModal;
