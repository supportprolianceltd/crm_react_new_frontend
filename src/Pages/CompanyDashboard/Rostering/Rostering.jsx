import React, { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import "./css/Rostering.css";
import DashFooter from "./DashFooter";
import SubSideNav from "./SubSideNav";
import Overview from "./Overview/Overview";
import Clients from "./Clients/Clients";
import ClientProfile from "./Clients/Profile/Profile";
import EmployeeProfile from "./Employees/Profile/Profile";
import RosterPlanner from "./RosterPlanner/RosterPlanner";

import Cluster from "./NewCluster/NewCluster";
import Roster from "./Roster/Roster";
import Employees from "./Employees/Employees";
import RosteringSettings from "./RosteringSettings/RosteringSettings";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import RosteringRequest from "./RosteringRequest/RosteringRequest";
// import Logs from "./Logs/Logs";
import AuditCompliance from "./AuditCompliance/AuditCompliance";

// CoverageMapModal Component
const CoverageMapModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="Coverage-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // Close modal when clicking on overlay
        >
          <motion.div
            className="Coverage-modal-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <CoverageMap />
            <button onClick={onClose} className="Coverage-modal-close-btn">
              <XMarkIcon />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
const Rostering = () => {
  const location = useLocation();
  const [sideNavShrinked, setSideNavShrinked] = useState(false);
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isEmployeeDetailsPage = location.pathname.startsWith(
    "/company/rostering/employee-details"
  );
  const openCoverageModal = () => setIsModalOpen(true);
  return (
    <div
      className={`RosttDDn-PAg ${
        isEmployeeDetailsPage ? "Have-SideNavBar" : ""
      } ${isEmployeeDetailsPage && sideNavShrinked ? "SideNav-ShrinkEd" : ""}`}
    >
      <SubSideNav />
      <div className="RostMain-DB-Envt">
        {/* Pass the modal trigger function as prop to child pages */}
        <Routes>
          <Route
            path="/"
            element={<Overview openCoverageModal={openCoverageModal} />}
          />
          <Route
            path="/clients"
            element={<Clients openCoverageModal={openCoverageModal} />}
          />
          <Route
            path="/rostering-requests"
            element={<RosteringRequest openCoverageModal={openCoverageModal} />}
          />
          <Route
            path="/profile/*"
            element={<ClientProfile openCoverageModal={openCoverageModal} />}
          />
          <Route
            path="/employee-profile/*"
            element={<EmployeeProfile openCoverageModal={openCoverageModal} />}
          />
          <Route
            path="/cluster"
            element={<Cluster openCoverageModal={openCoverageModal} />}
          />
          {/* <Route path="/roster-planner">
            <Route index element={<RosterPlanner />} />
            <Route
              path="cluster"
              element={<Cluster openCoverageModal={openCoverageModal} />}
            />
            <Route
              path="settings"
              element={
                <RosteringSettings openCoverageModal={openCoverageModal} />
              }
            />
          </Route> */}
          <Route
            path="/roster"
            element={<Roster openCoverageModal={openCoverageModal} />}
          />
          <Route
            path="/employees"
            element={<Employees openCoverageModal={openCoverageModal} />}
          />
          {/* <Route
            path="/logs"
            element={<Logs openCoverageModal={openCoverageModal} />}
          /> */}
          <Route
            path="/rostering-settings"
            element={
              <RosteringSettings openCoverageModal={openCoverageModal} />
            }
          />
          <Route
            path="/audit-compliance"
            element={<AuditCompliance openCoverageModal={openCoverageModal} />}
          />
        </Routes>
      </div>
      <DashFooter />
      {/* Coverage Map Modal */}
      <CoverageMapModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
export default Rostering;
