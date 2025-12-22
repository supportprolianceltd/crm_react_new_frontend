import React, { useState, useEffect } from "react"; // Add useEffect import
import {
  Route,
  Routes,
  useLocation,
  Link,
  useNavigate,
} from "react-router-dom";
import SideNav from "./SideNav";
import { IconHome, IconChevronRight, IconX } from "@tabler/icons-react";
import BasicInfo from "./BasicInfo";
import Availability from "./Availability";
import Clients from "./Clients";
import Skills from "./Skills";
import TravelLogistics from "./TravelLogistics";
import EmployeeFeed from "./EmployeeFeed";

const BASE_PATH = "/company/rostering/employee-profile";

const routeNames = {
  "": "Basic Info",
  "basic-info": "Basic Info",
  "employee-feed": "Employee Feed",
  operations: "Operations",
  travellogistics: "Travel & Logistics",
  onboarding: "Onboarding",
  skills: "Skills",
  clients: "Clients",
  availability: "Availability",
  calendar: "Calendar",
  admin: "Admin",
};

const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // NEW: Use useState to persist employeeData across sub-route navigations
  // Initialize from location.state on mount (only runs once)
  const [employeeData, setEmployeeData] = useState(location.state);

  // NEW: On mount, check if employeeData is missing (e.g., refresh/direct access) and redirect
  useEffect(() => {
    if (!employeeData) {
      navigate("/company/rostering/employees");
    }
  }, []); // Empty deps: runs only once on mount

  // Get the parts of the path after /profile
  const relativePath = location.pathname
    .replace(BASE_PATH, "")
    .split("/")
    .filter(Boolean);

  // Determine current page for H3
  let currentKey = relativePath[relativePath.length - 1] || "";
  let currentPage =
    routeNames[currentKey] ||
    currentKey.charAt(0).toUpperCase() + currentKey.slice(1);

  const handleBackToEmployees = () => {
    navigate("/company/rostering/employees");
  };

  return (
    <div className="GEn-Profile-Pag">
      <div className="RostDB-Envt-Container">
        <div className="GEn-Profile-PartSSS">
          <div className="Left-GEn-Profile">
            {/* UPDATED: Pass persisted employeeData */}
            <SideNav employeeData={employeeData} />
          </div>
          <div className="Right-GEn-Profile">
            <div className="GTH-TTNAVBS">
              {/* Back to Employees X Button */}
              <button
                onClick={handleBackToEmployees}
                className="back-to-employees-btn"
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "24px",
                  color: "#6b7280",
                }}
              >
                <IconX stroke={1.5} />
              </button>

              {/* Dynamic H3 */}
              <h3>{currentPage}</h3>

              {/* Breadcrumbs */}
              <div className="GGh-LInkss">
                {/* Home */}
                <Link to="/company/rostering/">
                  <IconHome stroke={1.5} />
                </Link>
                <span>
                  <IconChevronRight stroke={1.5} />
                </span>

                {/* Employees */}
                <Link
                  to="/company/rostering/employees"
                  className={
                    location.pathname.startsWith("/company/rostering/employees")
                      ? "active"
                      : ""
                  }
                >
                  Employees
                </Link>

                {/* Current Page */}
                <span>
                  <IconChevronRight stroke={1.5} />
                </span>
                <span className="active">{currentPage}</span>
              </div>
            </div>

            {/* Routes - UPDATED: Use persisted employeeData prop */}
            <Routes>
              <Route
                path="/"
                element={<BasicInfo employeeData={employeeData} />}
              />
              <Route
                path="/basic-info"
                element={<BasicInfo employeeData={employeeData} />}
              />
              <Route path="/employee-feed" element={<EmployeeFeed />} />
              <Route path="/travellogistics" element={<TravelLogistics />} />
              {/* <Route path="/onboarding" element={<div>Onboarding</div>} /> */}
              <Route path="/skills" element={<Skills employeeData={employeeData} />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/availability" element={<Availability employeeData={employeeData} />} />
              <Route path="/calendar" element={<div>Calendar</div>} />
              <Route path="/admin" element={<div>Admin</div>} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
