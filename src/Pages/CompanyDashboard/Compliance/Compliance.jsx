import { useState, useEffect, useCallback, useMemo } from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ComplianceHome from "./ComplianceHome";
import SideNavBar from "./SideNavBar";
import "./Compliance.css";
import StaffDetailsComplianceCheckPage from "./pages/StaffDetailsComplianceCheckPage";
import NewStaffComplianceCheckPage from "./pages/NewStaffComplianceCheckPage";
import ExistingStaffComplianceCheckPage from "./pages/ExistingStaffComplianceCheckPage";
import ExistingStaffDetailsComplianceCheckPage from "./pages/ExistingStaffDetailsComplianceCheckPage";

const Compliance = () => {
  const navigate = useNavigate();
  const user = useMemo(() => JSON.parse(localStorage.getItem("user")), []);

  // Redirect to staff dashboard if user does not have access
  useEffect(() => {
    if (!user?.profile?.system_access_compliance) {
      navigate("/staff", { replace: true });
    }
  }, [user, navigate]);

  if (!user?.profile?.system_access_compliance) {
    navigate("/staff", { replace: true });

    return null; // Prevents rendering sub-routes/content
  }

  const [shrinkNav, setShrinkNav] = useState(false);
  const [activePopup, setActivePopup] = useState(null);

  const closePopups = useCallback(() => {
    setActivePopup(null);
  }, []);

  return (
    <>
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
              <Route
                path="/"
                element={
                  <Navigate
                    to="/company/audit-compliance/recruitment/new-staff"
                    replace
                  />
                }
              />
              <Route
                path="/recruitment"
                element={
                  <Navigate
                    to="/company/audit-compliance/recruitment/new-staff"
                    replace
                  />
                }
              />
              <Route
                path="/recruitment/new-staff"
                element={<NewStaffComplianceCheckPage />}
              />
              <Route
                path="/recruitment/existing-staff"
                element={<ExistingStaffComplianceCheckPage />}
              />
              <Route
                path="/recruitment/new-staff/:applicantId"
                element={<StaffDetailsComplianceCheckPage />}
              />
              <Route
                path="/recruitment/existing-staff/:employeeId"
                element={<ExistingStaffDetailsComplianceCheckPage />}
              />
            </Routes>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Compliance;
