import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import "./Offcanvas.css";

const OffCanvas = ({
  isOpen,
  onClose,
  title,
  subtitle,
  headerActions,
  children,
  width = "400px",
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="offcanvas-backdrop"
          />
          {/* OffCanvas */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="offcanvas"
            style={{ width }}
          >
            <div className="offcanvas-header">
              <div className="offcanvas-header-left">
                <h2>{title}</h2>
                {subtitle && <p className="offcanvas-subtitle">{subtitle}</p>}
              </div>
              <div className="offcanvas-header-right">
                {headerActions}
                <button className="offcanvas-close-btn" onClick={onClose}>
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="offcanvas-body">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OffCanvas;
