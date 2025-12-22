import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  HomeIcon as HomeOutline,
  UsersIcon as UsersOutline,
  UserPlusIcon as UserPlusOutline,
  UserMinusIcon as UserMinusOutline,
  ClipboardDocumentListIcon as ClipboardOutline,
  ChartBarIcon as ChartBarOutline,
  Cog6ToothIcon as Cog6ToothOutline,
  TrophyIcon as TrophyOutline,
  TrashIcon as TrashOutline,
  FolderIcon as FolderOutline,
} from "@heroicons/react/24/outline";

import {
  HomeIcon as HomeSolid,
  UsersIcon as UsersSolid,
  UserPlusIcon as UserPlusSolid,
  UserMinusIcon as UserMinusSolid,
  ClipboardDocumentListIcon as ClipboardSolid,
  ChartBarIcon as ChartBarSolid,
  Cog6ToothIcon as Cog6ToothSolid,
  TrophyIcon as TrophySolid,
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon as TrashSolid,
  BuildingOffice2Icon,
  FolderIcon as FolderSolid,
} from "@heroicons/react/24/solid";

import { Bars3BottomLeftIcon } from "@heroicons/react/24/solid";
import { ArrowLongRightIcon } from "@heroicons/react/24/outline";

const iconClass = "w-5 h-5";
const basePath = "/company/hr";

const SideNavBar = ({ setShrinkNav }) => {
  const location = useLocation();
  let relativePath = location.pathname.startsWith(basePath)
    ? location.pathname.slice(basePath.length)
    : location.pathname;
  if (relativePath.startsWith("/")) relativePath = relativePath.slice(1);

  const initialActive = (() => {
    if (
      relativePath.startsWith("requests/") ||
      relativePath.startsWith("settings/")
    ) {
      return relativePath;
    } else if (relativePath === "") {
      return "overview";
    } else {
      return relativePath.split("/")[0];
    }
  })();

  const initialRequestsOpen = relativePath.startsWith("requests/");
  const initialSettingsOpen = relativePath.startsWith("settings/");

  const [active, setActive] = useState(initialActive);
  const [requestsOpen, setRequestsOpen] = useState(initialRequestsOpen);
  const [settingsOpen, setSettingsOpen] = useState(initialSettingsOpen);
  const [menuToggled, setMenuToggled] = useState(false);

  const settingsRef = useRef(null);
  const requestsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        event.target.closest(".SubMenu-Settings") ||
        event.target.closest(".SubMenu-Requests")
      )
        return;
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsOpen(false);
      }
      if (requestsRef.current && !requestsRef.current.contains(event.target)) {
        setRequestsOpen(false);
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

    if (relPath.startsWith("requests/")) {
      setActive(relPath);
      setRequestsOpen(true);
      setSettingsOpen(false);
    } else if (relPath.startsWith("settings/")) {
      setActive(relPath);
      setSettingsOpen(true);
      setRequestsOpen(false);
    } else if (relPath === "") {
      setActive("overview");
      setRequestsOpen(false);
      setSettingsOpen(false);
    } else {
      setActive(relPath.split("/")[0]);
      setRequestsOpen(false);
      setSettingsOpen(false);
    }
  }, [location]);

  const renderIcon = (name, OutlineIcon, SolidIcon) => {
    const isActive = active === name || active.startsWith(`${name}/`);
    return isActive ? (
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
        active === name || active.startsWith(`${name}/`) ? "active" : ""
      }
      ref={
        name === "settings"
          ? settingsRef
          : name === "requests"
          ? requestsRef
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

  const SubMenuItem = ({
    name,
    label,
    to,
    OutlineIcon,
    SolidIcon,
    parent = "settings",
  }) => (
    <li className={active === `${parent}/${name}` ? "active" : ""}>
      <Link
        to={to}
        className="submenu flex items-center"
        title={menuToggled ? label : undefined}
        onClick={(e) => {
          e.stopPropagation();
          setActive(`${parent}/${name}`);
        }}
        style={{ backgroundColor: "inherit" }}
      >
        {OutlineIcon && (
          <span className="LefB-Icon">
            {renderIcon(`${parent}/${name}`, OutlineIcon, SolidIcon)}
          </span>
        )}
        <span className="LefB-label">
          <span className="fffin-OOlka">{label}</span>
        </span>
      </Link>
    </li>
  );

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
            name="overview"
            label="Overview"
            OutlineIcon={HomeOutline}
            SolidIcon={HomeSolid}
            to={`${basePath}/`}
          />
          <MenuItem
            name="employees"
            label="Employees"
            OutlineIcon={UsersOutline}
            SolidIcon={UsersSolid}
            to={`${basePath}/employees`}
          />
          {/* <MenuItem
            name="onboarding"
            label="Onboarding"
            OutlineIcon={UserPlusOutline}
            SolidIcon={UserPlusSolid}
            to={`${basePath}/onboarding`}
          />
          <MenuItem
            name="offboarding"
            label="Offboarding"
            OutlineIcon={UserMinusOutline}
            SolidIcon={UserMinusSolid}
            to={`${basePath}/offboarding`}
          /> */}
          <MenuItem
            name="requests"
            label="Requests"
            OutlineIcon={ClipboardOutline}
            SolidIcon={ClipboardSolid}
            to={`${basePath}/requests`}
            extraIcon={
              requestsOpen ? (
                <ChevronUpIcon className="wddss-Cgatgs" />
              ) : (
                <ChevronDownIcon className="wddss-Cgatgs" />
              )
            }
            onClick={() => {
              setRequestsOpen(!requestsOpen);
              setMenuToggled(false);
              setShrinkNav(false);
            }}
          />
          <AnimatePresence>
            {requestsOpen && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="SubMenu-Requests"
              >
                <SubMenuItem
                  name="internal-requests"
                  label="Internal Requests"
                  to={`${basePath}/requests/internal-requests`}
                  OutlineIcon={ClipboardOutline}
                  SolidIcon={ClipboardSolid}
                  parent="requests"
                />
                {/* <SubMenuItem
                  name="external-requests"
                  label="External Requests"
                  to={`${basePath}/requests/external-requests`}
                  OutlineIcon={ClipboardOutline}
                  SolidIcon={ClipboardSolid}
                  parent="requests"
                /> */}
              </motion.ul>
            )}
          </AnimatePresence>
          <MenuItem
            name="onboarding-documents"
            label="Onboarding Documents"
            OutlineIcon={FolderOutline}
            SolidIcon={FolderSolid}
            to={`${basePath}/onboarding-documents`}
          />
          {/* <MenuItem
            name="employee-appraisals"
            label="Employee Appraisals"
            OutlineIcon={ChartBarOutline}
            SolidIcon={ChartBarSolid}
            to={`${basePath}/employee-appraisals`}
          /> */}
          <MenuItem
            name="rewards-penalties"
            label="Rewards & Penalties"
            OutlineIcon={TrophyOutline}
            SolidIcon={TrophySolid}
            to={`${basePath}/rewards-penalties`}
          />
          {/* <MenuItem
            name="reports-analytics"
            label="Reports & Analytics"
            OutlineIcon={ChartBarOutline}
            SolidIcon={ChartBarSolid}
            to={`${basePath}/reports-analytics`}
          /> */}
          {/* <MenuItem
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
          /> */}
          {/* <AnimatePresence>
            {settingsOpen && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="SubMenu-Settings"
              >
                <SubMenuItem
                  name="user-management"
                  label="User Management"
                  to={`${basePath}/settings/user-management`}
                  parent="settings"
                />
                <SubMenuItem
                  name="permissions"
                  label="Permissions"
                  to={`${basePath}/settings/permissions`}
                  parent="settings"
                />
                <SubMenuItem
                  name="system-configuration"
                  label="System Configuration"
                  to={`${basePath}/settings/system-configuration`}
                  parent="settings"
                />
              </motion.ul>
            )}
          </AnimatePresence> */}
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
