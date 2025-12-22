import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

const StatusCards = ({ counts }) => {
  const controls = {
    pending: useAnimation(),
    approved: useAnimation(),
    declined: useAnimation(),
  };

  // Animate numbers when counts change
  useEffect(() => {
    const animateCounts = async () => {
      await controls.pending.start({
        scale: [1, 1.2, 1],
        transition: { duration: 0.5 },
      });
    };
    animateCounts();
  }, [counts.pending]);

  useEffect(() => {
    const animateCounts = async () => {
      await controls.approved.start({
        scale: [1, 1.2, 1],
        transition: { duration: 0.5 },
      });
    };
    animateCounts();
  }, [counts.approved]);

  useEffect(() => {
    const animateCounts = async () => {
      await controls.declined.start({
        scale: [1, 1.2, 1],
        transition: { duration: 0.5 },
      });
    };
    animateCounts();
  }, [counts.declined]);

  return (
    <div className="status-cards-container">
      {/* Pending Card */}
      <motion.div
        className="status-card pending"
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <h3>Total Pending</h3>
        <motion.p className="status-count" animate={controls.pending}>
          {counts.pending}
        </motion.p>
      </motion.div>

      {/* Approved Card */}
      <motion.div
        className="status-card approved"
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <h3>Total Approved</h3>
        <motion.p className="status-count" animate={controls.approved}>
          {counts.approved}
        </motion.p>
      </motion.div>

      {/* Declined Card */}
      <motion.div
        className="status-card declined"
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <h3>Total Declined</h3>
        <motion.p className="status-count" animate={controls.declined}>
          {counts.declined}
        </motion.p>
      </motion.div>
    </div>
  );
};

export default StatusCards;
