import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  IconActivity,
  IconUser,
  IconCalendarEvent,
  IconClipboardText,
  IconPill,
  IconChecklist,
  IconDownload,
  IconNotes,
  IconCalendar,
  IconUsers,
  IconRefresh,
  IconSettings,
  IconWalk,
} from "@tabler/icons-react";

const BASE_PATH = "/company/rostering/employee-profile";

const SideNav = ({ employeeData }) => {
  const location = useLocation();

  const links = [
    { name: "Basic Info", icon: IconUser, path: `${BASE_PATH}` },
    {
      name: "Employee Feed",
      icon: IconActivity,
      path: `${BASE_PATH}/employee-feed`,
    },
    // {
    //   name: "Travel & Logistics",
    //   icon: IconWalk,
    //   path: `${BASE_PATH}/travellogistics`,
    // },
    // {
    //   name: "Onboarding",
    //   icon: IconChecklist,
    //   path: `${BASE_PATH}/onboarding`,
    // },
    { name: "Skills", icon: IconSettings, path: `${BASE_PATH}/skills` },
    { name: "Clients", icon: IconUsers, path: `${BASE_PATH}/clients` },
    {
      name: "Availability",
      icon: IconCalendar,
      path: `${BASE_PATH}/availability`,
    },
  ];

  return (
    <div className="Pfoll-SideNav">
      {/* Top section */}
      <div className="Top-Pfoll-SideNav">
        <div className="Top-Pfoll-SideNav-Main">
          <div className="OOl-1">
            {employeeData?.profilePicture ? (
              <img src={employeeData.profilePicture} />
            ) : (
              <span>{employeeData?.initials}</span>
            )}
          </div>
          <div className="OOl-2">
            <div>
              <h4>
                {employeeData?.firstName}&nbsp;
                {employeeData?.lastName}
              </h4>
              <p>ID: {employeeData?.employee_id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main links */}
      <div className="Main-Pfoll-SideNav custom-scroll-bar">
        <ul>
          {links.map((link) => {
            const isActive =
              location.pathname === link.path ||
              (link.path !== BASE_PATH &&
                location.pathname.startsWith(link.path + "/"));

            return (
              <li
                key={link.name}
                className={`SideNav-link ${isActive ? "active" : ""}`}
              >
                <Link to={link.path} state={employeeData}>
                  <span>
                    <link.icon size={24} />
                  </span>
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer */}
      {/* <div className="FOOt-SNA-SeC">
        <button className="btn-primary-bg">
          Download Profile <IconDownload stroke={1.5} />
        </button>
      </div> */}
    </div>
  );
};

export default SideNav;
