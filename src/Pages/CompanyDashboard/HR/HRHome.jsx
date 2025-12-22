import { useState, useEffect, useCallback, useMemo } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./HR.css";
import SideNavBar from "./SideNavBar";
import OverviewPage from "./pages/Overview/OverviewPage";
import OnboardingPage from "./pages/Onboarding/OnboardingPage";
import OnboardingChecklistPage from "./pages/Onboarding/OnboardingChecklistPage";
import OffboardingPage from "./pages/Offboarding/OffboardingPage";
import EmployeeAppraisalsPage from "./pages/EmployeeAppraisalsPage/EmployeeAppraisalsPage";
import InternalRequestsPage from "../Requests/InternalRequests";
import ExternalRequestsPage from "../Requests/ExternalRequests/ExternalRequests";
import RewardsPenaltiesPage from "./pages/RewardsPenalties/RewardsPenaltiesPage";
import ReportsAnalyticsPage from "./pages/ReportsAnalytics/ReportsAnalyticsPage";
import OnboardingDocuments from "../OnboardingDocuments/OnboardingDocuments";
// import UserManagementPage from "./pages/UserManagementPage";
// import PermissionsPage from "./pages/PermissionsPage";
// import SystemConfigurationPage from "./pages/SystemConfigurationPage";
import SettingsPage from "./pages/Settings/SettingsPage";
import EmployeesListPage from "../Employees/EmployeesListPage";
import EmployeeDetailsPage from "../Employees/EmployeeDetails/EmployeeDetailsPage";
import CreateEmployeePage from "../Employees/CreateEmployeePage";
import PendingEmployeesListPage from "../Employees/PendingEmployeesListPage";

const HRHome = () => {
  const navigate = useNavigate();
  const user = useMemo(() => JSON.parse(localStorage.getItem("user")), []);

  // Redirect to staff dashboard if user does not have access
  useEffect(() => {
    if (!user?.profile?.system_access_hr) {
      navigate("/staff", { replace: true });
    }
  }, [user, navigate]);

  if (!user?.profile?.system_access_hr) {
    navigate("/staff", { replace: true });

    return null; // Prevents rendering sub-routes/content
  }

  const [shrinkNav, setShrinkNav] = useState(false);
  const [activePopup, setActivePopup] = useState(null);

  const closePopups = useCallback(() => {
    setActivePopup(null);
  }, []);

  return (
    <motion.div
      className={`DB-Envt ${shrinkNav ? "ShrinkNav" : ""}`}
      onClick={closePopups}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SideNavBar setShrinkNav={setShrinkNav} />
      <div className="Main-DB-Envt">
        <div className="DB-Envt-Container">
          <Routes>
            <Route path="/" element={<OverviewPage />} />
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

            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route
              path="/onboarding/:id"
              element={<OnboardingChecklistPage />}
            />
            <Route path="/offboarding" element={<OffboardingPage />} />
            <Route
              path="/requests/internal-requests"
              element={<InternalRequestsPage />}
            />
            {/* <Route
              path="/requests/external-requests"
              element={<ExternalRequestsPage />}
            /> */}
            <Route
              path="/onboarding-documents"
              element={<OnboardingDocuments />}
            />
            <Route
              path="/employee-appraisals"
              element={<EmployeeAppraisalsPage />}
            />
            <Route
              path="/rewards-penalties"
              element={<RewardsPenaltiesPage />}
            />
            <Route
              path="/reports-analytics"
              element={<ReportsAnalyticsPage />}
            />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </div>
    </motion.div>
  );
};

export default HRHome;
