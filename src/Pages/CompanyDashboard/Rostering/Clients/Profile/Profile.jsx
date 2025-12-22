import React, { useState, useEffect } from "react"; // Add useEffect import
import {
  Route,
  Routes,
  useLocation,
  Link,
  useNavigate,
} from "react-router-dom";
import "./css/Profile.css";
import Home from "./Dashboard/Home";
import SideNav from "./SideNav";
import { IconHome, IconChevronRight, IconX } from "@tabler/icons-react";

import ClientInfo from "./ClientInfo/ClientInfo";
import CarePlan from "./CarePlan/CarePlan";
import CareVisits from "./CareVisits/CareVisits";
import Medications from "./Medications/Medications";
import CareTask from "./CareTask/CareTask";
import CareTeam from "./CareTeam/CareTeam";
import CareLog from "./CareLog/CareLog";
import CareCircle from "./CareCircle/CareCircle";

const BASE_PATH = "/company/rostering/profile";

const routeNames = {
  "": "Overview",
  "client-info": "Client Information",
  "care-visits": "Care Visits",
  "care-plan": "Care Plan",
  medications: "Medications",
  "care-tasks": "Care Tasks",
  "care-log": "Care Log",
  calendar: "Calendar",
  "care-team": "Care Team",
  "care-cycle": "Care Cycle",
  "access-settings": "Access Settings",
  settings: "Settings",
};

const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // NEW: Use useState to persist clientData across sub-route navigations
  // Initialize from location.state on mount (only runs once)
  const [clientData, setClientData] = useState(location.state);

  // NEW: On mount, check if clientData is missing (e.g., refresh/direct access) and redirect
  useEffect(() => {
    if (!clientData) {
      navigate("/company/rostering/clients");
    }
  }, []); // Empty deps: runs only once on mount

  // Get the parts of the path after /profile
  const relativePath = location.pathname
    .replace(BASE_PATH, "")
    .split("/")
    .filter(Boolean);

  // Determine if we are in care-plan or subpages
  const isCarePlan = relativePath.includes("care-plan");
  const isMedications = relativePath.includes("medications");

  // Determine current page for H3
  let currentKey = relativePath[relativePath.length - 1] || "";
  let currentPage =
    routeNames[currentKey] ||
    (isCarePlan ? "Care Plan" : isMedications ? "Medications" : "Overview");

  // Capitalize if not in routeNames (fallback)
  const formatName = (key) =>
    routeNames[key] || key.charAt(0).toUpperCase() + key.slice(1);

  const handleBackToClients = () => {
    navigate("/company/rostering/clients");
  };

  return (
    <div className="GEn-Profile-Pag">
      <div className="RostDB-Envt-Container">
        <div className="GEn-Profile-PartSSS">
          <div className="Left-GEn-Profile">
            {/* UPDATED: Pass persisted clientData */}
            <SideNav clientData={clientData} />
          </div>
          <div className="Right-GEn-Profile">
            <div className="GTH-TTNAVBS">
              {/* Back to Clients X Button */}
              <button
                onClick={handleBackToClients}
                className="back-to-clients-btn"
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

                {/* Clients */}
                <Link
                  to="/company/rostering/clients"
                  className={
                    location.pathname.startsWith("/company/rostering/clients")
                      ? "active"
                      : ""
                  }
                >
                  Clients
                </Link>

                {/* Care Plan or Medications breadcrumbs */}
                {isCarePlan || isMedications ? (
                  <>
                    <span>
                      <IconChevronRight stroke={1.5} />
                    </span>
                    <Link
                      to={`${BASE_PATH}/${
                        isCarePlan ? "care-plan" : "medications"
                      }`}
                      className={
                        relativePath[0] ===
                        (isCarePlan ? "care-plan" : "medications")
                          ? "active"
                          : ""
                      }
                    >
                      {isCarePlan ? "Care Plan" : "Medications"}
                    </Link>

                    {relativePath.length > 1 && (
                      <>
                        <span>
                          <IconChevronRight stroke={1.5} />
                        </span>
                        <span className="active">{formatName(currentKey)}</span>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <span>
                      <IconChevronRight stroke={1.5} />
                    </span>
                    <span className="active">{formatName(currentKey)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Routes - UPDATED: Use persisted clientData prop */}
            <Routes>
              <Route path="/" element={<Home clientData={clientData} />} />
              <Route
                path="/client-info"
                element={<ClientInfo clientData={clientData} />}
              />
              <Route
                path="/care-plan/*"
                element={<CarePlan clientData={clientData} />}
              />
              <Route
                path="/care-tasks"
                element={<CareTask clientData={clientData} />}
              />
              <Route
                path="/medications/*"
                element={<Medications clientData={clientData} />}
              />
              <Route
                path="/care-visits"
                element={<CareVisits clientData={clientData} />}
              />
              <Route path="/care-log" element={<CareLog />} />
              <Route path="/calendar" element={<div>Calendar Page</div>} />
              <Route
                path="/care-team"
                element={<CareTeam clientData={clientData} />}
              />
              <Route path="/care-cycle" element={<CareCircle />} />
              <Route
                path="/access-settings"
                element={<div>Access Settings Page</div>}
              />
              <Route path="/settings" element={<div>Settings Page</div>} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
