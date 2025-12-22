import { motion, AnimatePresence } from "framer-motion";

const ToastNotification = ({ successMessage, errorMessage }) => {
  return (
    <>
      {/* Success notification */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            className="success-notification"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            style={{
              //   position: "fixed",
              //   top: "20px",
              //   left: "50%",
              //   transform: "translateX(-50%)",
              //   background: "#d1fae5", // Light green
              //   padding: "1.5rem",
              //   borderRadius: "8px",
              //   display: "flex",
              //   alignItems: "center",
              //   zIndex: 4001,
              //   maxWidth: "600px",
              //   boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              //   color: "#065f46", // Dark green
              fontSize: "14px",
              // lineHeight: "1.5",
            }}
          >
            {/* <svg
                  viewBox="0 0 24 24"
                  style={{
                    width: "24px",
                    height: "24px",
                    marginRight: "0.75rem",
                    fill: "#065f46", // Match text color
                  }}
                >
                  <path d="M12 0C5.371 0 0 5.371 0 12s5.371 12 12 12 12-5.371 12-12S18.629 0 12 0zm-1.2 17.2l-4.8-4.8 1.4-1.4 3.4 3.4 6.4-6.4 1.4 1.4-7.8 7.8z" />
                </svg> */}
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error notification */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            className="error-notification"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#fee2e2",
              padding: "1rem",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              zIndex: 4001,
              width: "100%",
              maxWidth: "600px", // Increase maxWidth for longer messages
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              color: "#fff",
              fontSize: "14px",
              lineHeight: "20px",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              style={{
                width: "24px",
                height: "24px",
                marginRight: "0.75rem",
                fill: "#721c24",
              }}
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ToastNotification;
