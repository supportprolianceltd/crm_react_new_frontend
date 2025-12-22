import React, { useState, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import "./Dashboard.css";
import usePageTitle from "../../hooks/usecrmPageTitle";

// Components
import DashboardNavBar from "./DashboardNavBar";
import DashFooter from "./DashFooter";
import DashboardHome from "./Home/DashboardHome";
import TasksPage from "./Tasks/TasksPage";
import EmployeesListPage from "./Employees/EmployeesListPage";
import PendingEmployeesListPage from "./Employees/PendingEmployeesListPage";
import CreateEmployeePage from "./Employees/CreateEmployeePage";
import EmployeeDetailsPage from "./Employees/EmployeeDetails/EmployeeDetailsPage";
import ClientsListPage from "./Clients/ClientsListPage";
import CreateClientForHealthcarePage from "./Clients/CreateClientForHealthcarePage";
import CreateClientForOthersPage from "./Clients/CreateClientForOthersPage";
import InternalRequestsPage from "./Requests/InternalRequests";
import ExternalRequestsPage from "./Requests/ExternalRequests/ExternalRequests";
import CreateExternalRequestPage from "./Requests/ExternalRequests/pages/CreateExternalRequestPage";
import EligibilityReport from "./Requests/ExternalRequests/pages/EligibilityReport";

import Recruitment from "./Recruitment/Recruitment";
import Compliance from "./Compliance/Compliance";
import Training from "./Training/Training";
import AssetManagement from "./AssetManagement/AssetManagement";
import Rostering from "./Rostering/Rostering";
import HR from "./HR/HR";
import Finance from "./Finance/Finance";

import { ChevronUpIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import HRHome from "./HR/HRHome";
import Attendance from "./Attendance/Attendance";
import ProtectedRoute from "../../ProtectedRoute";
import CreateCarePlanPage from "./Clients/CarePlan/CreateCarePlanPage";
import EmailSettings from "./Recruitment/EmailSettings";

const Dashboard = () => {
  usePageTitle();
  const location = useLocation();

  const hideFooter =
    location.pathname.startsWith("/company/rostering") ||
    location.pathname.startsWith("/rostering");

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="Dashboard-Page">
      <DashboardNavBar />
      <div className="Main_Dashboard_Page">
        <Routes>
          {/* Pages */}
          <Route path="/*" element={<DashboardHome />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/employees" element={<EmployeesListPage />} />
          <Route
            path="/employees/pending"
            element={<PendingEmployeesListPage />}
          />
          <Route
            path="/employees/create/:applicantId?"
            element={<CreateEmployeePage />}
          />
          <Route
            path="/employees/view/:employeeId"
            element={<EmployeeDetailsPage />}
          />
          <Route path="/clients" element={<ClientsListPage />} />

          <Route path="/attendance" element={<Attendance />} />
          <Route
            path="/clients/create/healthcare"
            element={<CreateClientForHealthcarePage />}
          />
          <Route
            path="/clients/create/others"
            element={<CreateClientForOthersPage />}
          />
          <Route
            path="/rostering/profile/care-plan/create-care-plan/:id"
            element={<CreateCarePlanPage />}
          />
          <Route
            path="/requests/internal-requests"
            element={<InternalRequestsPage />}
          />
          <Route
            path="/requests/external-requests"
            element={<ExternalRequestsPage />}
          />
          <Route
            path="/requests/external-requests/create"
            element={<CreateExternalRequestPage />}
          />
          <Route
            path="/requests/external-requests/eligibility-report"
            element={<EligibilityReport />}
          />
          <Route
            path="/requests/external-requests/:id/eligibility-report"
            element={<EligibilityReport />}
          />

          {/* Apps */}
          <Route
            path="/recruitment/*"
            element={
              <ProtectedRoute accessKey="system_access_recruitment">
                <Recruitment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-compliance/*"
            element={
              <ProtectedRoute accessKey="system_access_compliance">
                <Compliance />
              </ProtectedRoute>
            }
          />
          {/* <Route path="/training/*" element={<Training />} /> */}
          <Route
            path="/assets/*"
            element={
              <ProtectedRoute accessKey="system_access_asset_management">
                <AssetManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rostering/*"
            element={
              <ProtectedRoute accessKey="system_access_rostering">
                <Rostering />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/*"
            element={
              <ProtectedRoute accessKey="system_access_hr">
                <HRHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/*"
            element={
              <ProtectedRoute accessKey="system_access_finance">
                <Finance />
              </ProtectedRoute>
            }
          />
        </Routes>

        {!hideFooter && <DashFooter />}
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            className="AllaScrollToTopBtn"
            onClick={scrollToTop}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronUpIcon className="h-6 w-6 text-white" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
