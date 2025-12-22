import React, { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import "./Dashboard.css";
import usePageTitle from "../../hooks/usecrmPageTitle";

// Components
import DashboardHome from "./DashboardHome";
import DashboardNavBar from "../CompanyDashboard/DashboardNavBar";
import DashFooter from "../CompanyDashboard/DashFooter";

import ClockInOutNotifier from "./ClockInOutNotifier";

const Dashboard = () => {
  usePageTitle();

  const [shrinkNav, setShrinkNav] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolling(true);
      } else {
        setIsScrolling(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`Dashboard-Page  ${shrinkNav ? "ShrinkNav" : ""}`}>
      <ClockInOutNotifier />
      <div className="Main_Dashboard_Page Full-MMains">
        <DashboardNavBar className={isScrolling ? "ScrollingPgae" : ""} />

        <Routes>
          {/* Pass shrinkNav and setShrinkNav as props */}
          <Route
            path="/*"
            element={
              <DashboardHome
                shrinkNav={shrinkNav}
                setShrinkNav={setShrinkNav}
              />
            }
          />
        </Routes>
        <DashFooter />
      </div>
    </div>
  );
};

export default Dashboard;
