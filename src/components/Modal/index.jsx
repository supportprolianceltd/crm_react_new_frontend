import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import "./styles.css";

const Modal = ({
  isOpen,
  onClose,
  title,
  message,
  children,
  isLargeModal = false,
  headerActions = null,
  showCloseButton = true,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`modal-overlay ${
            isLargeModal ? "pdf-modal-backdrop" : ""
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={isLargeModal ? "pdf-modal-content" : "modal-content"}
            initial={
              isLargeModal ? { y: -100, opacity: 0 } : { y: 50, opacity: 0 }
            }
            animate={isLargeModal ? { y: 0, opacity: 1 } : { y: 0, opacity: 1 }}
            exit={
              isLargeModal ? { y: -100, opacity: 0 } : { y: 50, opacity: 0 }
            }
            transition={isLargeModal ? { duration: 0.4 } : {}}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className={`modal-header ${
                isLargeModal ? "pdf-modal-header" : ""
              }`}
            >
              <div className={isLargeModal ? "PPf-D-1" : ""}>
                <h3
                  className={isLargeModal ? "pdf-modal-title" : "modal-title"}
                >
                  {title}
                </h3>
              </div>

              <div className={isLargeModal ? "PPf-D-2" : ""}>
                {/* Header Actions */}
                {headerActions && (
                  <div className="modal-header-actions">{headerActions}</div>
                )}

                {/* Close Button */}
                {showCloseButton && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    className={
                      isLargeModal ? "close-icon" : "modal-close-button"
                    }
                  >
                    {isLargeModal ? (
                      <XMarkIcon className="h-6 w-6" />
                    ) : (
                      <>&times;</>
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* Body */}
            <div
              className={`modal-body ${
                isLargeModal ? "pdf-modal-content-main" : ""
              }`}
            >
              {!isLargeModal && <p className="modal-message">{message}</p>}
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
