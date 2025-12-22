// src/components/RequestDemo.js
import usePageTitle from "../../hooks/usecrmPageTitle";
import { useState } from "react";
import "./RequestDemo.css";
import DemoCalendar from "./DemoCalendar";
import SheduleDemo from "./SheduleDemo";
import {
  ArrowLongRightIcon,
  ArrowLongLeftIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useSelectedFeatures } from "../../context/SelectedFeaturesContext";

import {
  CalendarIcon as CalendarSolid,
  ClockIcon as ClockSolid,
  CheckIcon as CheckSolid,
  CheckIcon,
} from "@heroicons/react/24/solid";
import {
  CalendarIcon as CalendarOutline,
  ClockIcon as ClockOutline,
  CheckIcon as CheckOutline,
} from "@heroicons/react/24/outline";

import RecruitmentIcon from "../../assets/Img/CRMPack/Recruitment.svg";
import ComplianceIcon from "../../assets/Img/CRMPack/Compliance.svg";
import TrainingIcon from "../../assets/Img/CRMPack/Training.svg";
import AssetmanagementIcon from "../../assets/Img/CRMPack/Assetmanagement.svg";
import RosteringIcon from "../../assets/Img/CRMPack/Rostering.svg";
import HRIcon from "../../assets/Img/CRMPack/HR.svg";
import FinanceIcon from "../../assets/Img/CRMPack/Finance.svg";

import MessageSentImg from "../../assets/Img/message-sent-img.png";

import { motion } from "framer-motion";

const containerVariant = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariant = {
  hidden: { x: -50, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

const features = [
  { icon: RecruitmentIcon, label: "Recruitment" },
  { icon: ComplianceIcon, label: "Compliance" },
  { icon: TrainingIcon, label: "Training" },
  { icon: AssetmanagementIcon, label: "Assets management" },
  { icon: RosteringIcon, label: "Rostering" },
  { icon: HRIcon, label: "HR" },
  { icon: FinanceIcon, label: "Finance" },
];

function RequestDemo() {
  usePageTitle();
  const [activeStep, setActiveStep] = useState("calendar");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const { selectedFeatures, toggleFeature } = useSelectedFeatures();

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setActiveStep("schedule");
  };

  const handleScheduleSuccess = () => {
    setActiveStep("done");
  };

  return (
    <div className="RequestDemo">
      <div className="large-container">
        <div className="RequestDemo-Main">
          <div className="AllO-Ramp">
            <div className="AllO-Ramp-Main">
              {/* Steps */}
              <div className="AllO-Ramp-Part-1 Gen-Boxshadow">
                <span
                  className={
                    activeStep === "calendar" ? "active-All-RampSpan" : ""
                  }
                  onClick={() => setActiveStep("calendar")}
                >
                  {activeStep === "calendar" ? (
                    <CalendarSolid className="h-5 w-5 mr-1" />
                  ) : (
                    <CalendarOutline className="h-5 w-5 mr-1" />
                  )}
                  Calendar
                </span>

                <span
                  className={
                    activeStep === "schedule" ? "active-All-RampSpan" : ""
                  }
                  onClick={() => {
                    if (selectedSlot) {
                      setActiveStep("schedule");
                    } else {
                      setShowAlert(true);
                      setTimeout(() => setShowAlert(false), 3000); // auto hide after 3 sec
                    }
                  }}
                >
                  {activeStep === "schedule" ? (
                    <ClockSolid className="h-5 w-5 mr-1" />
                  ) : (
                    <ClockOutline className="h-5 w-5 mr-1" />
                  )}
                  Schedule
                </span>

                <span
                  className={
                    activeStep === "done"
                      ? "active-All-RampSpan disabled"
                      : "disabled"
                  }
                  style={{ pointerEvents: "none" }}
                >
                  {activeStep === "done" ? (
                    <CheckSolid className="h-5 w-5 mr-1" />
                  ) : (
                    <CheckOutline className="h-5 w-5 mr-1" />
                  )}
                  Done
                </span>
              </div>

              {/* Animated Feature List */}
              <motion.div
                className="AllO-Ramp-Part-2 custom-scroll-bar"
                variants={containerVariant}
                initial="hidden"
                animate="visible"
              >
                {features.map((item, idx) => (
                  <motion.div
                    key={idx}
                    className={`YU-Box ${
                      selectedFeatures.includes(item.label)
                        ? "active-YU-Box"
                        : ""
                    }`}
                    variants={itemVariant}
                    onClick={() => toggleFeature(item.label)}
                  >
                    <button>
                      <span>
                        <CheckIcon />
                      </span>
                      <img src={item.icon} alt={item.label} />
                    </button>
                    <p>{item.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Conditional Content */}
          <div className="AllU-Ramp Gen-Boxshadow">
            {/* Calendar Step */}
            {activeStep === "calendar" && (
              <div className="Cland-Sec">
                <div className="Gllas-Header">
                  <h3>Demo Schedule Calendar</h3>
                </div>
                <div className="Gllas-body">
                  <DemoCalendar onSlotSelect={handleSlotSelect} />
                </div>
              </div>
            )}

            {/* Schedule Step */}
            {activeStep === "schedule" && (
              <div className="Cland-Sec">
                <div className="Gllas-Header">
                  <h3>Demo Schedule</h3>
                  <button
                    className="back-to-calendar-btn"
                    onClick={() => setActiveStep("calendar")}
                  >
                    <ArrowLongLeftIcon /> Back to Calendar
                  </button>
                </div>
                <div className="Gllas-body">
                  <SheduleDemo
                    selectedSlot={selectedSlot}
                    onSuccess={handleScheduleSuccess}
                  />
                </div>
              </div>
            )}

            {/* Done Step */}
            {activeStep === "done" && (
              <div className="Cland-Sec">
                <div className="Gllas-body">
                  <div className="success-Secc">
                    <div className="success-Secc-Box">
                      <motion.img
                        src={MessageSentImg}
                        alt="Message sent"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                      />
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                      >
                        <h3 className="mid-text">Demo Request Sent!</h3>
                        <p>
                          Thank you for your interest! We've received your demo
                          request and will get back to you shortly to confirm
                          the details via email. We look forward to showing you
                          how our CRM can help you achieve your goals.
                        </p>
                        <h6>
                          Have any question? <a href="#">Contact sales</a>
                        </h6>
                        <Link to="/" className="backhome-btn btn-primary-bg">
                          Back to Home
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {showAlert && (
          <motion.div
            className="custom-alert"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <p>Please select a schedule date</p>
          </motion.div>
        )}

        <footer className="ddde-Footer">
          <p>© {new Date().getFullYear()} Kaefy CRM. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default RequestDemo;
