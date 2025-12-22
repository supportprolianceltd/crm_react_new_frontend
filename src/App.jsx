import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import CRMLandingpage from "./Pages/CRMLandingPages/CRMLandingpage";
import "./App.css";
import CompanyDashboard from "./Pages/CompanyDashboard/Dashboard";
import StaffDashboard from "./Pages/StaffDashboard/Dashboard";
import SocialCallback from "./Pages/CRMLandingPages/SocialCallback";
import ScrollToTop from "./assets/ScrollToTop";
import JobApplication from "./Pages/CRMLandingPages/JobApplication";
import PrivateRoute from "./PrivateRoute";
import { useMobileNav } from "./context/MobileNavContext";
import { useTheme } from "./context/ThemeContext";

import InterviewDetailsPage from "./Pages/CompanyDashboard/InterviewDetailsPage";
import LiveMapTracker from "./Pages/LiveMapTracker/LiveMapTracker";
import CompanyPublicJobListingsPage from "./Pages/CompanyDashboard/CompanyPublicJobListingsPage";

function App() {
  const { mobileNavActive, setMobileNavActive } = useMobileNav();
  const { darkMode } = useTheme();
  const location = useLocation();

  // ✅ Check if the current route is a dashboard route
  const isDashboardRoute =
    location.pathname.startsWith("/company") ||
    location.pathname.startsWith("/staff");

  // ✅ Close the nav when overlay is clicked
  const handleOverlayClick = () => {
    if (mobileNavActive) {
      setMobileNavActive(false);
    }
  };

  // ✅ Automatically close the nav whenever the route changes
  useEffect(() => {
    if (mobileNavActive) {
      setMobileNavActive(false);
    }
  }, [location.pathname]);

  return (
    <div
      className={`App 
        ${mobileNavActive ? "GenActivee-MObileNav" : ""} 
        ${darkMode && isDashboardRoute ? "ThemeSwitch" : ""}`}
    >
      {/* ✅ Dark overlay (only visible when mobile nav is active) */}
      {mobileNavActive && (
        <div className="NavBoody" onClick={handleOverlayClick}></div>
      )}

      <ScrollToTop />

      <Routes>
        <Route path="/*" element={<CRMLandingpage />} />

        {/* ✅ Protected dashboard routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/company/*" element={<CompanyDashboard />} />
          <Route path="/staff/*" element={<StaffDashboard />} />
        </Route>

        {/* ✅ Other routes */}
        <Route path="/api/social/callback/" element={<SocialCallback />} />
        <Route path="/jobs/:unique_link" element={<JobApplication />} />
        <Route
          path="/view-advertised-jobs/:tenantId"
          element={<CompanyPublicJobListingsPage />}
        />
        <Route path="/live-map-tracker" element={<LiveMapTracker />} />
        <Route
          path="/interview/:room/:jwt"
          element={<InterviewDetailsPage />}
        />
      </Routes>
    </div>
  );
}

export default App;


