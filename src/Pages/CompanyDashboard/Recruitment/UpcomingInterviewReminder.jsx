import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import "./UpcomingInterviewReminder.css";

const UpcomingInterviewReminder = ({ interview, onEnd }) => {
  const [now, setNow] = useState(new Date());
  const [manuallyClosed, setManuallyClosed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const interviewTime = new Date(interview?.interview_start_date_time);
  const endTime = new Date(interviewTime.getTime() + 30 * 60 * 1000);

  const timeUntilStart = (interviewTime - now) / 60000;
  const timeUntilEnd = (endTime - now) / 60000;

  const isStarted = timeUntilStart <= 0 && timeUntilEnd > 0;
  const isUpcoming = timeUntilStart > 0 && timeUntilStart <= 3000;
  const isOnInterviewPage = location.pathname.includes("interview-details");

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeUntilEnd <= 0) {
      onEnd();
    }
  }, [timeUntilEnd, onEnd]);

  const handleNavigate = () => {
    setManuallyClosed(true);
    onEnd();
    navigate("/company/recruitment/interview-details", {
      state: { interview },
    });
  };

  const handleClose = () => {
    setManuallyClosed(true);
    onEnd();
  };

  // Don't show if:
  // 1. We're on the interview details page, OR
  // 2. User manually closed the popup, OR
  // 3. The interview time has passed
  const shouldShow =
    !isOnInterviewPage && !manuallyClosed && (isUpcoming || isStarted);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          className="interview-popup"
          initial={{ scale: 0.8, opacity: 0, y: -20 }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: 1,
            y: 0,
          }}
          exit={{ scale: 0.8, opacity: 0, y: -20 }}
          transition={{
            scale: {
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            },
            default: { type: "spring", stiffness: 300, damping: 20 },
          }}
        >
          <div className="popup-header">
            <strong>
              {isStarted
                ? "Your interview has started"
                : "Interview starting soon"}
            </strong>
            <button onClick={handleClose}>✕</button>
          </div>
          <p>
            Interview with <b>{interview.candidate_name}</b>{" "}
            {isStarted ? "has started." : "starts in a few minutes."}
          </p>
          <button onClick={handleNavigate} className="view-btn">
            {isStarted ? "Join Now" : "View Interview"}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpcomingInterviewReminder;
