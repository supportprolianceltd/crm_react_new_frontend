import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AgreedCareVisit = () => {
  const checkboxes = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const times = {
    Monday: { start: '09:00 AM', end: '12:00 PM' },
    Tuesday: { start: '10:00 AM', end: '01:00 PM' },
    Wednesday: { start: '11:00 AM', end: '02:00 PM' },
    Thursday: { start: '12:00 PM', end: '03:00 PM' },
    Friday: { start: '01:00 PM', end: '04:00 PM' },
    Saturday: { start: '09:30 AM', end: '12:30 PM' },
    Sunday: { start: '10:30 AM', end: '01:30 PM' },
  };

  const [activeLabel, setActiveLabel] = useState(checkboxes[0]);

  const handleCheckboxChange = (label) => {
    setActiveLabel(label);
  };

  // Animation variants for sliding in from the right
  const slideVariants = {
    hidden: { opacity: 0, x: -5 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 5 },
  };

  return (
    <div className='Moduls-SeCC'>
      <div className='Moduls-LefNV custom-scroll-bar'>
        {checkboxes.map((label) => (
          <label key={label}>
            <span className={activeLabel === label ? 'active' : ''}>
              <input
                type='checkbox'
                checked={activeLabel === label}
                onChange={() => handleCheckboxChange(label)}
              />
              {label}
            </span>
          </label>
        ))}
      </div>

      <div className='Moduls-Mains'>
        <div className='Moduls-Top Profll-Da'>
          <h3>{activeLabel}</h3>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeLabel} // Important for AnimatePresence to detect changes
            className="Ggen-BDa custom-scroll-bar"
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4 }}
          >
            <h3 className='Aagr-VsT-Time'>Agreed Visit Time</h3>
            <div className="Gthstg-Bddy">
              <p>
                <b>Start Time</b>
                <span>{times[activeLabel].start}</span>
              </p>
              <p>
                <b>End Time</b>
                <span>{times[activeLabel].end}</span>
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AgreedCareVisit;
