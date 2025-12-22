import React, { useState } from "react";
import { motion } from "framer-motion";

const steps = [
  {
    title: "Personal Information",
    subtitle: "Basic Information & Contact Details",
  },
  {
    title: "Address & Next of Kin Details",
    subtitle: "",
  },
  {
    title: "Review & Submit",
    subtitle: "",
  },
];

const Stepper = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="Progres-Contne">
    <div className="stepper-container">
      <div className="stepper-steps">
        {steps.map((step, index) => (
          <div key={index} className="step-item">
            {/* Circle */}
            <motion.div
              className={`step-circle ${index <= currentStep ? "active" : ""}`}
              initial={{ scale: 0.8 }}
              animate={{ scale: index === currentStep ? 1.1 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="inner-circle" />
              <div className="completed-icon">
                <svg width="13" height="11" viewBox="0 0 13 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M11.5965 0.390159L4.4365 7.30016L2.5365 5.27016C2.1865 4.94016 1.6365 4.92016 1.2365 5.20016C0.846504 5.49016 0.736503 6.00016 0.976503 6.41016L3.2265 10.0702C3.4465 10.4102 3.8265 10.6202 4.2565 10.6202C4.6665 10.6202 5.0565 10.4102 5.2765 10.0702C5.6365 9.60016 12.5065 1.41016 12.5065 1.41016C13.4065 0.490159 12.3165 -0.31984 11.5965 0.38016V0.390159Z" fill="#7F56D9"/>
                </svg>

              </div>
            </motion.div>

            {/* Labels */}
            <div
              className="step-labels">
              <p className={`step-title ${index === currentStep ? "active" : ""}`}>
                {step.title}
              </p>
              {step.subtitle && <p className="step-subtitle">{step.subtitle}</p>}
            </div>
          </div>
        ))}

        {/* Progress line behind dots */}
        <div className="stepper-line">
          <motion.div
            className="stepper-progress"
            initial={{ width: 0 }}
            animate={{
              width: `${(currentStep / (steps.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Navigation */}
      {/* <div className="stepper-nav">
        <button onClick={handlePrev} disabled={currentStep === 0}>
          Back
        </button>
        <button onClick={handleNext} disabled={currentStep === steps.length - 1}>
          Next
        </button>
      </div> */}
    </div>
    </div>
  );
};

export default Stepper;
