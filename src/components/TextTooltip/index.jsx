import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./styles.css";

const TextTooltip = ({
  isVisible,
  position,
  content,
  tooltipWidth = 280,
  tooltipHeight = 350,
  title = "Details",
  placement = "left", // 'top', 'bottom', 'left', 'right'
}) => {
  if (!isVisible || !content) return null;

  let tooltipStyle = {
    position: "absolute",
    zIndex: 1000,
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "12px 16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    fontSize: "14px",
    maxWidth: "300px",
    minWidth: "250px",
    whiteSpace: "normal",
    wordWrap: "break-word",
    lineHeight: "1.4",
  };

  let arrowStyle = {
    position: "absolute",
    width: "0",
    height: "0",
    border: "6px solid transparent",
    filter: "drop-shadow(-1px 0 1px rgba(0,0,0,0.1))",
  };

  switch (placement) {
    case "top":
      tooltipStyle.left = `${position.x - tooltipWidth / 2}px`;
      tooltipStyle.top = `${position.y - tooltipHeight}px`;
      arrowStyle.bottom = "-6px";
      arrowStyle.left = "50%";
      arrowStyle.transform = "translateX(-50%)";
      arrowStyle.borderTop = "6px solid white";
      break;
    case "bottom":
      tooltipStyle.left = `${position.x - tooltipWidth / 2}px`;
      tooltipStyle.top = `${position.y}px`;
      arrowStyle.top = "-6px";
      arrowStyle.left = "50%";
      arrowStyle.transform = "translateX(-50%)";
      arrowStyle.borderBottom = "6px solid white";
      break;
    case "left":
      tooltipStyle.left = `${position.x - tooltipWidth}px`;
      tooltipStyle.top = `${position.y - tooltipHeight / 2}px`;
      arrowStyle.left = "-6px";
      arrowStyle.top = "50%";
      arrowStyle.transform = "translateY(-50%)";
      arrowStyle.borderRight = "6px solid white";
      break;
    case "right":
      tooltipStyle.left = `${position.x}px`;
      tooltipStyle.top = `${position.y - tooltipHeight / 2}px`;
      arrowStyle.right = "-6px";
      arrowStyle.top = "50%";
      arrowStyle.transform = "translateY(-50%)";
      arrowStyle.borderLeft = "6px solid white";
      break;
    default:
      // Default to left
      tooltipStyle.left = `${position.x - tooltipWidth}px`;
      tooltipStyle.top = `${position.y - tooltipHeight / 2}px`;
      arrowStyle.left = "-6px";
      arrowStyle.top = "50%";
      arrowStyle.transform = "translateY(-50%)";
      arrowStyle.borderRight = "6px solid white";
  }

  return (
    <AnimatePresence>
      <motion.div
        className="text-tooltip"
        style={tooltipStyle}
        initial={{ opacity: 0, scale: 0.9, x: -10 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.9, x: -10 }}
        transition={{ duration: 0.2 }}
      >
        <div className="tooltip-content">
          <div className="tooltip-header" style={{ marginBottom: "8px" }}>
            <h4
              style={{
                margin: "0 0 4px 0",
                fontSize: "15px",
                fontWeight: "600",
                color: "#1e293b",
              }}
            >
              {title}
            </h4>
          </div>

          <div className="tooltip-details">
            <div
              style={{
                color: "#0f172a",
                fontSize: "14px",
                whiteSpace: "pre-wrap",
              }}
            >
              {content}
            </div>
          </div>
        </div>

        {/* Tooltip arrow */}
        <div style={arrowStyle} />
      </motion.div>
    </AnimatePresence>
  );
};

export default TextTooltip;
