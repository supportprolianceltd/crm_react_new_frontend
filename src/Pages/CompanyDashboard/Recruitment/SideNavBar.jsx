import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  ClipboardDocumentIcon as ClipboardOutline,
  UsersIcon as UsersOutline,
  CalendarDaysIcon as CalendarOutline,
  BriefcaseIcon as BriefcaseOutline,
  MegaphoneIcon as MegaphoneOutline,
  Cog6ToothIcon as Cog6ToothOutline,
  TrashIcon as TrashOutline,
  HomeIcon as HomeOutline,
  ChartBarSquareIcon as ChartBarSquareIconOutline,
  EyeIcon as EyeOutline, // 👈 added for Insight
  ShieldCheckIcon as ShieldCheckOutline,
} from "@heroicons/react/24/outline";

import {
  ClipboardDocumentIcon as ClipboardSolid,
  UsersIcon as UsersSolid,
  CalendarDaysIcon as CalendarSolid,
  BriefcaseIcon as BriefcaseSolid,
  MegaphoneIcon as MegaphoneSolid,
  Cog6ToothIcon as Cog6ToothSolid,
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon as TrashSolid,
  BuildingOffice2Icon,
  HomeIcon as HomeSolid,
  ChartBarSquareIcon as ChartBarSquareIconSolid,
  EyeIcon as EyeSolid, // 👈 added for Insight
  ShieldCheckIcon as ShieldCheckSolid,
} from "@heroicons/react/24/solid";


const iconClass = "w-5 h-5";
const basePath = "/company/recruitment";

const SideNavBar = ({ setShrinkNav }) => {
  const location = useLocation();
  let relativePath = location.pathname.startsWith(basePath)
    ? location.pathname.slice(basePath.length)
    : location.pathname;
  if (relativePath.startsWith("/")) relativePath = relativePath.slice(1);

  // const [tenantUniqueId, setTenantUniqueId] = useState("");

  const tenantUniqueId = localStorage.getItem("tenantUniqueId") || "";

  const initialActive = relativePath.startsWith("settings/")
    ? relativePath
    : relativePath.startsWith("interviews/")
    ? relativePath
    : relativePath === ""
    ? "job-requisition"
    : relativePath.split("/")[0];

  const user = JSON.parse(localStorage.getItem("user"));

  const [active, setActive] = useState(initialActive);
  const [interviewsOpen, setInterviewsOpen] = useState(
    initialActive.startsWith("interviews/")
  );
  const [complianceOpen, setComplianceOpen] = useState(
    initialActive.startsWith("interviews/")
  );
  const [settingsOpen, setSettingsOpen] = useState(
    initialActive.startsWith("settings/")
  );
  const [menuToggled, setMenuToggled] = useState(false);

  const settingsRef = useRef(null);
  const interviewsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest(".SubMenu-Settings")) return;
      if (event.target.closest(".SubMenu-Interviews")) return;
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsOpen(false);
      }
      if (
        interviewsRef.current &&
        !interviewsRef.current.contains(event.target)
      ) {
        setInterviewsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let relPath = location.pathname.startsWith(basePath)
      ? location.pathname.slice(basePath.length)
      : location.pathname;
    if (relPath.startsWith("/")) relPath = relPath.slice(1);

    if (relPath.startsWith("settings/")) {
      setActive(relPath);
      setSettingsOpen(true);
      setInterviewsOpen(false);
    } else if (relPath.startsWith("interviews/")) {
      setActive(relPath);
      setInterviewsOpen(true);
      setSettingsOpen(false);
    } else if (relPath === "") {
      setActive("job-requisition");
      setSettingsOpen(false);
      setInterviewsOpen(false);
    } else {
      setActive(relPath.split("/")[0]);
      setSettingsOpen(false);
      setInterviewsOpen(false);
    }
  }, [location]);

  const renderIcon = (name, OutlineIcon, SolidIcon) => {
    if (name === "settings") {
      return active.startsWith("settings/") ? (
        <SolidIcon className={iconClass} />
      ) : (
        <OutlineIcon className={iconClass} />
      );
    }
    if (name === "interviews") {
      return active.startsWith("interviews/") ? (
        <SolidIcon className={iconClass} />
      ) : (
        <OutlineIcon className={iconClass} />
      );
    }
    return active === name ? (
      <SolidIcon className={iconClass} />
    ) : (
      <OutlineIcon className={iconClass} />
    );
  };

  const MenuItem = ({
    name,
    label,
    OutlineIcon,
    SolidIcon,
    extraIcon,
    onClick,
    to,
  }) => (
    <li
      className={
        active === name ||
        (name === "settings" && active.startsWith("settings/")) ||
        (name === "interviews" && active.startsWith("interviews/"))
          ? "active"
          : ""
      }
      ref={
        name === "settings"
          ? settingsRef
          : name === "interviews"
          ? interviewsRef
          : null
      }
    >
      {to ? (
        <Link
          to={to}
          className="flex items-center justify-between"
          title={menuToggled ? label : undefined}
          onClick={(e) => {
            if (onClick) {
              e.preventDefault();
              onClick();
            } else {
              setActive(name);
            }
          }}
        >
          <span className="LefB-Icon">
            {renderIcon(name, OutlineIcon, SolidIcon)}
          </span>
          <span className="LefB-label flex justify-between items-center w-full">
            {label}
            {extraIcon && <span className="ml-1">{extraIcon}</span>}
          </span>
        </Link>
      ) : (
        <a
          href="#"
          className="flex items-center justify-between"
          title={menuToggled ? label : undefined}
          onClick={(e) => {
            e.preventDefault();
            if (onClick) onClick();
            else setActive(name);
          }}
        >
          <span className="LefB-Icon">
            {renderIcon(name, OutlineIcon, SolidIcon)}
          </span>
          <span className="LefB-label flex justify-between items-center w-full">
            {label}
            {extraIcon && <span className="ml-1">{extraIcon}</span>}
          </span>
        </a>
      )}
    </li>
  );

  const SubMenuItem = ({ name, label, to, target }) => (
    <li
      className={
        active === `settings/${name}` || active === `interviews/${name}`
          ? "active"
          : ""
      }
    >
      <Link
        to={to}
        className="submenu"
        title={menuToggled ? label : undefined}
        onClick={(e) => {
          e.stopPropagation();
          setActive(
            `${name.includes("interviews") ? "interviews" : "settings"}/${name}`
          );
        }}
        target={target}
        style={{ backgroundColor: "inherit" }}
      >
        {label}
      </Link>
    </li>
  );

  // Fetch tenant information from the backend
  // const fetchTenantInfo = async () => {
  //   try {
  //     const tenant = await fetchTenantConfig();
  //     setTenantUniqueId(tenant?.unique_id);
  //   } catch (err) {
  //     console.error(err.message || "Failed to fetch tenant information");
  //   }
  // };

  // useEffect(() => {
  //   fetchTenantInfo();
  // }, []);

  return (
    <motion.div
      className="SideNavBar Gen-Boxshadow"
      initial={{ opacity: 0, x: 0 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="SideNavBar-Main custom-scroll-bar">
        <ul className="LeftnavBr-Icons">
          <MenuItem
            name="job-requisition"
            label="Job Requisition"
            OutlineIcon={BriefcaseOutline}
            SolidIcon={BriefcaseSolid}
            to={`${basePath}/`}
          />
          <MenuItem
            name="job-adverts"
            label="Job Adverts"
            OutlineIcon={MegaphoneOutline}
            SolidIcon={MegaphoneSolid}
            to={`${basePath}/job-adverts`}
          />
          <MenuItem
            name="applications"
            label="Applications"
            OutlineIcon={ChartBarSquareIconOutline}
            SolidIcon={ChartBarSquareIconSolid}
            to={`${basePath}/applications`}
          />

          {/* Interviews Menu with Submenu */}
          <MenuItem
            name="interviews"
            label="Interviews"
            OutlineIcon={CalendarOutline}
            SolidIcon={CalendarSolid}
            extraIcon={
              interviewsOpen ? (
                <ChevronUpIcon className="wddss-Cgatgs" />
              ) : (
                <ChevronDownIcon className="wddss-Cgatgs" />
              )
            }
            onClick={() => {
              setInterviewsOpen(!interviewsOpen);
              setMenuToggled(false);
              setShrinkNav(false);
            }}
          />
          <AnimatePresence>
            {interviewsOpen && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="SubMenu-Settings"
              >
                <SubMenuItem
                  name="scheduler"
                  label="Scheduler"
                  to={`${basePath}/schedule`}
                />
                <SubMenuItem
                  name="scheduled-interviews"
                  label="Scheduled Interviews"
                  to={`${basePath}/schedule-list`}
                />
              </motion.ul>
            )}
          </AnimatePresence>

          <MenuItem
            name="decision"
            label="Employment Decision"
            OutlineIcon={ClipboardOutline}
            SolidIcon={ClipboardSolid}
            to={`${basePath}/employment-decision`}
          />

          {/* Compliance Menu with Submenu */}
          <MenuItem
            name="compliance"
            label="Compliance Check"
            OutlineIcon={ShieldCheckOutline} // 👈 Replace Cog6ToothOutline
            SolidIcon={ShieldCheckSolid}
            extraIcon={
              complianceOpen ? (
                <ChevronUpIcon className="wddss-Cgatgs" />
              ) : (
                <ChevronDownIcon className="wddss-Cgatgs" />
              )
            }
            onClick={() => {
              setComplianceOpen(!complianceOpen);
              setMenuToggled(false);
              setShrinkNav(false);
            }}
          />
          <AnimatePresence>
            {complianceOpen && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="SubMenu-Settings"
              >
                <SubMenuItem
                  name="new-staff"
                  label="New Staff"
                  to={`${basePath}/compliance/new-staff`}
                />
                <SubMenuItem
                  name="existing-staff"
                  label="Existing Staff"
                  to={`${basePath}/compliance/existing-staff`}
                />
              </motion.ul>
            )}
          </AnimatePresence>
{/* 
          <MenuItem
            name="audit-reporting"
            label="Audit & Reports"
            OutlineIcon={ClipboardOutline}
            SolidIcon={ClipboardSolid}
            to={`${basePath}/audit-reports`}
          /> */}

          {/* Settings Menu with Submenu */}
          <MenuItem
            name="settings"
            label="Settings"
            OutlineIcon={Cog6ToothOutline}
            SolidIcon={Cog6ToothSolid}
            extraIcon={
              settingsOpen ? (
                <ChevronUpIcon className="wddss-Cgatgs" />
              ) : (
                <ChevronDownIcon className="wddss-Cgatgs" />
              )
            }
            onClick={() => {
              setSettingsOpen(!settingsOpen);
              setMenuToggled(false);
              setShrinkNav(false);
            }}
          />
          <AnimatePresence>
            {settingsOpen && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="SubMenu-Settings"
              >
                {/* <SubMenuItem
                  name="api-settings"
                  label="API Settings"
                  to={`${basePath}/settings/api-settings`}
                /> */}
                {/* <SubMenuItem
                  name="email-configuration"
                  label="Email Configuration"
                  to={`${basePath}/settings/email-configuration`}
                />
                <SubMenuItem
                  name="notification-settings"
                  label="Notification Settings"
                  to={`${basePath}/settings/notification-settings`}
                /> */}
                {/* <SubMenuItem
                  name="update-company-profile"
                  label="Update Company Profile"
                  to={`${basePath}/settings/update-company-profile`}
                /> */}
                <SubMenuItem
                  name="view-advertised-jobs"
                  label="View Advertised Jobs"
                  to={`/view-advertised-jobs/${tenantUniqueId}`}
                  target="_blank"
                />
              </motion.ul>
            )}
          </AnimatePresence>

          {/* <MenuItem
            name="recycle-bin"
            label="Recycle Bin"
            OutlineIcon={TrashOutline}
            SolidIcon={TrashSolid}
            to={`${basePath}/recycle-bin`}
          /> */}
        </ul>

        <div className="tenaj-Prolt">
          <Link to="" className="tenaj-Prolt-Main">
            <div className="tenaj-Prolt-Main-1">
              <span>p</span>
            </div>
            <div className="tenaj-Prolt-Main-2">
              <div className="tenaj-Prolt-Main-2-Main">
                <h4>Proliance LTD</h4>
                <p>Tenant ID: 000672 </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default SideNavBar;
