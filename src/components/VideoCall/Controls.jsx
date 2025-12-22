// components/VideoCall/Controls.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaRecordVinyl,
  FaStop,
  FaPhone,
} from "react-icons/fa";

const Controls = ({
  isCameraOn,
  isMuted,
  isRecording,
  isCallActive,
  onToggleCamera,
  onToggleMute,
  onStartRecording,
  onLeaveMeeting,
}) => {
  const containerVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const buttonVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    hover: { scale: 1.1, y: -3 },
    tap: { scale: 0.95 },
  };

  const iconVariants = {
    on: { scale: 1.1, rotate: 0 },
    off: { scale: 1, rotate: 0 },
  };

  return (
    <motion.div
      className="call-controls"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={onToggleCamera}
        className={`control-btn ${!isCameraOn ? "active" : ""}`}
        aria-label={isCameraOn ? "Turn off camera" : "Turn on camera"}
        data-testid="camera-toggle"
      >
        {isCameraOn ? <FaVideo /> : <FaVideoSlash />}
      </motion.button>

      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={onToggleMute}
        className={`control-btn ${isMuted ? "active" : ""}`}
        aria-label={isMuted ? "Unmute" : "Mute"}
        data-testid="mute-toggle"
      >
        {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
      </motion.button>

      {isCallActive && (
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onStartRecording}
          className={`control-btn ${isRecording ? "stop-btn" : "record-btn"}`}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          data-testid="recording-toggle"
        >
          {isRecording ? (
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                color: ["#ff0000", "#ff5555", "#ff0000"],
              }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <FaStop />
            </motion.div>
          ) : (
            <FaRecordVinyl />
          )}
        </motion.button>
      )}

      <motion.button
        variants={buttonVariants}
        whileHover={{ scale: 1.1, backgroundColor: "#ff4444" }}
        whileTap="tap"
        onClick={onLeaveMeeting}
        className="control-btn end-call"
        aria-label="Leave meeting"
        data-testid="end-call"
      >
        <FaPhone />
      </motion.button>
    </motion.div>
  );
};

export default Controls;
