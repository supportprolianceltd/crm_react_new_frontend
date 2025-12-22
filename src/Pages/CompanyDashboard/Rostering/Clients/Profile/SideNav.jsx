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
} from "@tabler/icons-react";

const BASE_PATH = "/company/rostering/profile";

const SideNav = ({ clientData }) => {
  const location = useLocation();

  const links = [
    { name: "Overview", icon: IconActivity, path: `${BASE_PATH}` },
    {
      name: "Client Information",
      icon: IconUser,
      path: `${BASE_PATH}/client-info`,
    },
    {
      name: "Care Plan",
      icon: IconClipboardText,
      path: `${BASE_PATH}/care-plan`,
    },
    {
      name: "Care Tasks",
      icon: IconChecklist,
      path: `${BASE_PATH}/care-tasks`,
    },
    { name: "Medications", icon: IconPill, path: `${BASE_PATH}/medications` },
    {
      name: "Care Visits",
      icon: IconCalendarEvent,
      path: `${BASE_PATH}/care-visits`,
    },
    { name: "Care Team", icon: IconUsers, path: `${BASE_PATH}/care-team` },
    // { name: "Calendar", icon: IconCalendar, path: `${BASE_PATH}/calendar` },
    { name: "Care Log", icon: IconNotes, path: `${BASE_PATH}/care-log` },
    { name: "Care Cycle", icon: IconRefresh, path: `${BASE_PATH}/care-cycle` },
    // {
    //   name: "Access Settings",
    //   icon: IconSettings,
    //   path: `${BASE_PATH}/access-settings`,
    // },
    // { name: "Settings", icon: IconSettings, path: `${BASE_PATH}/settings` },
  ];

  return (
    <div className="Pfoll-SideNav">
      {/* Top section */}
      <div className="Top-Pfoll-SideNav">
        <div className="Top-Pfoll-SideNav-Main">
          <div className="OOl-1">
            {clientData?.profilePicture ? (
              <img src={clientData.profilePicture} />
            ) : (
              <span>{clientData?.initials}</span>
            )}
          </div>
          <div className="OOl-2">
            <div>
              <h4>
                {clientData?.firstName}&nbsp;
                {clientData?.lastName}
              </h4>
              <p>ID: {clientData?.client_id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main links */}
      <div className="Main-Pfoll-SideNav custom-scroll-bar">
        <ul>
          {links.map((link) => {
            const isActive =
              link.name === "Overview"
                ? location.pathname === link.path
                : location.pathname === link.path ||
                  location.pathname.startsWith(link.path + "/");

            return (
              <li
                key={link.name}
                className={`SideNav-link ${isActive ? "active" : ""}`}
              >
                <Link to={link.path} state={clientData}>
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
      <div className="FOOt-SNA-SeC">
        <button className="btn-primary-bg">
          Download Client Profile <IconDownload stroke={1.5} />
        </button>
      </div>
    </div>
  );
};

export default SideNav;
