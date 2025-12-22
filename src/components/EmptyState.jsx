import React from "react";
import { motion } from "framer-motion";

const EmptyState = ({
  message = "No data found",
  description = "",
  icon = null,
  cta = null, // { text: string, onClick: function }
}) => {
  return (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="empty-state-content">
        {icon && <div className="empty-state-icon">{icon}</div>}
        <h3 className="empty-state-message">{message}</h3>
        {description && (
          <p className="empty-state-description">{description}</p>
        )}
        {cta && (
          <div className="FOOt-SNA-SeC">
            <button onClick={cta.onClick} className="btn-primary-bg">
              {cta.text}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyState;
