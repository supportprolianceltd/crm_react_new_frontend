import React, { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SideNavBar from "./SideNavBar";
import ChattingApp from "./ChattingApp";
import Messaging from "./Messaging";
import "./DashboardHome.css";
import Home from "./Home";
import MyTasks from "./MyTasks";
import StaffJobRequisitions from "./Requisitions/StaffJobRequisitions";
import AttendancePage from "./AttendancePage";
import MaterialRequisitions from "./Requisitions/MaterialRequisitions";
import NewMaterialRequest from "./Requisitions/NewMaterialRequest";
import EditMaterialRequest from "./Requisitions/EditMaterialRequest";
import LeaveRequisitions from "./Requisitions/LeaveRequisitions";
import NewLeaveRequest from "./Requisitions/NewLeaveRequest";
import EditLeaveRequest from "./Requisitions/EditLeaveRequest";
import ServiceRequisitions from "./Requisitions/ServiceRequisitions";
import NewServiceRequest from "./Requisitions/NewServiceRequest";
import EditServiceRequest from "./Requisitions/EditServiceRequest";
import StaffonboardingDocuments from "./OnboardingDocuments/StaffonboardingDocuments";
import Messages from "./Messages/Messages";
import StaffDetailsPage from "./EmployeeDetails/StaffDetailsPage";
import EmployeeDetailsPage from "../CompanyDashboard/Employees/EmployeeDetails/EmployeeDetailsPage";
import RewardsPenaltiesPage from "./RewardsPenalties/RewardsPenaltiesPage";
import Calendar from "./Calendar";
import TravelLogistics from "./TravelLogistics";
import ChangePassword from "./Settings/ChangePassword";

// Animation variants for the messaging panel
const messagingVariants = {
  hidden: { y: 100, opacity: 0, scale: 0.9 },
  visible: { y: 0, opacity: 1, scale: 1 },
  exit: { y: 100, opacity: 0, scale: 0.9 },
};

const DashboardHome = ({ shrinkNav, setShrinkNav }) => {
  const [showMessaging, setShowMessaging] = useState(false);
  const [selectedSender, setSelectedSender] = useState(null);

  const location = useLocation(); // <-- get current route

  const handleNotificationClick = (senderInfo) => {
    const storageKey = `chatMessages_${senderInfo.name.replace(/\s+/g, "_")}`;
    const messages = JSON.parse(localStorage.getItem(storageKey) || "[]");

    const updatedMessages = messages.map((msg) => ({ ...msg, read: true }));
    localStorage.setItem(storageKey, JSON.stringify(updatedMessages));

    setSelectedSender(senderInfo);
    setShowMessaging(true);
  };

  return (
    <div className="DB-Envt">
      <SideNavBar setShrinkNav={setShrinkNav} />

      <div className="Main-DB-Envt">
        <Routes>
          <Route path="/my-tasks" element={<MyTasks />} />
          <Route path="/messages" element={<Messages />} />
        </Routes>

        <div className="DB-Envt-Container">
          {/* Render ChattingApp only if NOT on /messages */}
          {location.pathname !== "/staff/messages" && <ChattingApp />}

          <Routes>
            <Route
              path="/"
              element={<Home onMessageClick={handleNotificationClick} />}
            />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/travel-logistics" element={<TravelLogistics />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route
              path="/material-requisitions"
              element={<MaterialRequisitions />}
            />
            <Route
              path="/new-material-request"
              element={<NewMaterialRequest />}
            />
            <Route
              path="/edit-material-request"
              element={<EditMaterialRequest />}
            />
            <Route path="/leave-requisitions" element={<LeaveRequisitions />} />
            <Route path="/new-leave-request" element={<NewLeaveRequest />} />
            <Route path="/edit-leave-request" element={<EditLeaveRequest />} />
            <Route
              path="/service-requisitions"
              element={<ServiceRequisitions />}
            />
            <Route
              path="/new-service-request"
              element={<NewServiceRequest />}
            />
            <Route
              path="/edit-service-request"
              element={<EditServiceRequest />}
            />
            <Route
              path="/onboarding-documents"
              element={<StaffonboardingDocuments />}
            />
            <Route
              path="/request/job-requisitions"
              element={<StaffJobRequisitions />}
            />
            <Route
              path="/rewards-penalties"
              element={<RewardsPenaltiesPage />}
            />
            <Route path="/profile" element={<EmployeeDetailsPage />} />
            <Route path="/change-password" element={<ChangePassword />} />

          </Routes>
        </div>
      </div>

      <AnimatePresence>
        {showMessaging && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setShowMessaging(false)}
              className="messaging-overlay"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "black",
                zIndex: 2000,
              }}
            />

            <motion.div
              key="messaging-panel"
              variants={messagingVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="ppol-Messaging-Section"
            >
              <Messaging
                closeMessaging={() => setShowMessaging(false)}
                sender={selectedSender}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardHome;
