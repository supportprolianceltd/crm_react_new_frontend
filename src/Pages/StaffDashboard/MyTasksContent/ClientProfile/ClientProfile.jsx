import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BasicInfo from "./BasicInfo";
import ContactInfo from "./ContactInfo";
import CultureInfo from "./CultureInfo";
import LifeHistory from "./LifeHistory";
import NextOfKin from "./NextOfKin";
import Address from "./Address";
import MedicalInfo from "./MedicalInfo";

const ClientProfile = () => {
  const checkboxes = [
    'Basic Information',
    'Contact Information',
    'Address Details',
    'Next of Kin/Emergency Details',
    'Culture Value and Identity',
    'Life History',
    'Medical Information',
  ];

  const [activeLabel, setActiveLabel] = useState(checkboxes[0]);
  const [activeButton, setActiveButton] = useState('Task'); // optional, for buttons

  const handleCheckboxChange = (label) => {
    setActiveLabel(label);
  };

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
  };

  const contentVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 10, transition: { duration: 0.3 } },
  };

  // Map label to component
  const renderContent = () => {
    switch(activeLabel) {
      case 'Basic Information': return <BasicInfo />;
      case 'Contact Information': return <ContactInfo />;
      case 'Address Details': return <Address />;
      case 'Next of Kin/Emergency Details': return <NextOfKin />;
      case 'Culture Value and Identity': return <CultureInfo />;
      case 'Life History': return <LifeHistory />;
      case 'Medical Information': return <MedicalInfo />;
      default: return null;
    }
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

        <div className="Ggen-BDa custom-scroll-bar">
          <AnimatePresence exitBeforeEnter>
            <div
              key={activeLabel} // important for AnimatePresence
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {renderContent()}
            </div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
