import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import {
  HomeIcon as HomeOutline,
  ClipboardDocumentIcon as ClipboardOutline,
  UserGroupIcon as UserGroupOutline,
  CalendarDaysIcon as CalendarOutline,
  UsersIcon as UsersOutline,
  ClockIcon as ClockOutline,
  DocumentTextIcon as DocumentTextOutline,
  ChartBarIcon as ChartBarOutline,
  Cog6ToothIcon as SettingsOutline,
  LifebuoyIcon as HelpOutline,
  CubeIcon as CompanyOutline,
  BellIcon as BellOutline,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowLeftOnRectangleIcon as LoginHistoryOutline,
  FolderIcon as FolderOutline,
  CreditCardIcon as CreditCardOutline, // ✅ New Payment & Billings icon (outline)
} from "@heroicons/react/24/outline";

import {
  HomeIcon as HomeSolid,
  ClipboardDocumentIcon as ClipboardSolid,
  UserGroupIcon as UserGroupSolid,
  CalendarDaysIcon as CalendarSolid,
  UsersIcon as UsersSolid,
  ClockIcon as ClockSolid,
  DocumentTextIcon as DocumentTextSolid,
  ChartBarIcon as ChartBarSolid,
  Cog6ToothIcon as SettingsSolid,
  LifebuoyIcon as HelpSolid,
  CubeIcon as CompanySolid,
  BellIcon as BellSolid,
  BuildingOffice2Icon,
  ArrowLeftOnRectangleIcon as LoginHistorySolid,
  FolderIcon as FolderSolid,
  CreditCardIcon as CreditCardSolid, // ✅ New Payment & Billings icon (solid)
} from "@heroicons/react/24/solid";

import { Bars3BottomLeftIcon } from "@heroicons/react/24/solid";
import { ArrowLongRightIcon } from "@heroicons/react/24/outline";
import { UserSquareIcon, UsersRoundIcon } from "lucide-react";

const iconClass = "w-5 h-5";
const basePath = "/company";

const SideNavBar = ({ setShrinkNav }) => {
  const location = useLocation();

  let relativePath = location.pathname.startsWith(basePath)
    ? location.pathname.slice(basePath.length)
    : location.pathname;
  if (relativePath.startsWith("/")) relativePath = relativePath.slice(1);

  const initialActive =
    relativePath === "" ? "dashboard" : relativePath.split("/")[0];
  const [active, setActive] = useState(initialActive);
  const [menuToggled, setMenuToggled] = useState(false);
  const [showOtherMenu, setShowOtherMenu] = useState(false);

  useEffect(() => {
    let relPath = location.pathname.startsWith(basePath)
      ? location.pathname.slice(basePath.length)
      : location.pathname;
    if (relPath.startsWith("/")) relPath = relPath.slice(1);
    setActive(relPath === "" ? "dashboard" : relPath.split("/")[0]);
  }, [location]);

  const renderIcon = (name, OutlineIcon, SolidIcon) =>
    active === name ? (
      <SolidIcon className={iconClass} />
    ) : (
      <OutlineIcon className={iconClass} />
    );

  // MenuItem component
  const MenuItem = ({
    name,
    label,
    OutlineIcon,
    SolidIcon,
    to,
    onClick,
    submenu,
  }) => {
    const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
    const hasSubmenu = submenu && submenu.length > 0;

    return (
      <li
        className={`${active === name ? "active" : ""} ${
          hasSubmenu ? "has-submenu-super" : ""
        }`}
      >
        <Link
          to={to}
          className="flex items-center justify-between"
          title={menuToggled ? label : undefined}
          onClick={(e) => {
            if (onClick) {
              e.preventDefault();
              onClick();
            }
            if (hasSubmenu) {
              e.preventDefault();
              setIsSubmenuOpen(!isSubmenuOpen);
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
            {hasSubmenu && (
              <motion.div
                animate={{ rotate: isSubmenuOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDownIcon className="w-4 h-4 ml-2" />
              </motion.div>
            )}
          </span>
        </Link>

        {hasSubmenu && (
          <motion.div
            initial={false}
            animate={{
              height: isSubmenuOpen ? "auto" : 0,
              opacity: isSubmenuOpen ? 1 : 0.8,
            }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <motion.ul
              className="submenu-super"
              initial="collapsed"
              animate={isSubmenuOpen ? "open" : "collapsed"}
              variants={{
                open: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 },
                },
                collapsed: { opacity: 0 },
              }}
            >
              {submenu.map((item) => (
                <motion.li
                  key={item.name}
                  className={active === item.name ? "active" : ""}
                  variants={{
                    open: {
                      y: 0,
                      opacity: 1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 24,
                      },
                    },
                    collapsed: { y: -10, opacity: 0 },
                  }}
                >
                  <Link
                    to={item.to}
                    onClick={() => setActive(item.name)}
                    className="flex items-center"
                  >
                    <span className="LefB-Icon">
                      {renderIcon(item.name, item.OutlineIcon, item.SolidIcon)}
                    </span>
                    <span className="LefB-label">
                      <span className="fffin-OOlka">{item.label}</span>
                    </span>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </li>
    );
  };

  return (
    <motion.div
      className="SideNavBar Gen-Boxshadow"
      initial={{ opacity: 0, x: 0 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="SideNavBar-Main">
        <ul className="LeftnavBr-Icons">
          <MenuItem
            name="dashboard"
            label="Dashboard"
            OutlineIcon={HomeOutline}
            SolidIcon={HomeSolid}
            to={`${basePath}/`}
          />
          {/* <MenuItem
            name="tasks"
            label="Visits"
            OutlineIcon={ClipboardOutline}
            SolidIcon={ClipboardSolid}
            to={`${basePath}/tasks`}
          /> */}
          <MenuItem
            name="calendar"
            label="Calendar"
            OutlineIcon={CalendarOutline}
            SolidIcon={CalendarSolid}
            to={`${basePath}/calendar`}
          />
        </ul>

        <ul className="LeftnavBr-Icons">
          <MenuItem
            name="employees"
            label="Employees"
            OutlineIcon={UsersOutline}
            SolidIcon={UsersSolid}
            to={`${basePath}/employees`}
          />
          <MenuItem
            name="clients"
            label="Clients"
            OutlineIcon={UserGroupOutline}
            SolidIcon={UserGroupSolid}
            to={`${basePath}/clients`}
          />
          <MenuItem
            name="attendance"
            label="Attendance"
            OutlineIcon={ClockOutline}
            SolidIcon={ClockSolid}
            to={`${basePath}/attendance`}
          />
          <MenuItem
            name="requests"
            label="Requests"
            OutlineIcon={DocumentTextOutline}
            SolidIcon={DocumentTextSolid}
            submenu={[
              {
                name: "internal-requests",
                label: "Internal Requests",
                OutlineIcon: DocumentTextOutline,
                SolidIcon: DocumentTextSolid,
                to: `${basePath}/requests/internal-requests`,
              },
              {
                name: "external-requests",
                label: "External Requests",
                OutlineIcon: DocumentTextOutline,
                SolidIcon: DocumentTextSolid,
                to: `${basePath}/requests/external-requests`,
              },
            ]}
          />

          {/* ✅ New Onboarding Documents */}
          <MenuItem
            name="onboarding-documents"
            label="Onboarding Documents"
            OutlineIcon={FolderOutline}
            SolidIcon={FolderSolid}
            to={`${basePath}/onboarding-documents`}
          />

          {/* <MenuItem
            name="payment-billings"
            label="Payment & Billings"
            OutlineIcon={CreditCardOutline}
            SolidIcon={CreditCardSolid}
            to={`${basePath}/payment-billings`}
          /> */}

          {/* <MenuItem
            name="report"
            label="Audit & Report"
            OutlineIcon={ChartBarOutline}
            SolidIcon={ChartBarSolid}
            to={`${basePath}/report`}
          /> */}
          {/* <MenuItem
            name="notification"
            label="Notifications"
            OutlineIcon={BellOutline}
            SolidIcon={BellSolid}
            to={`${basePath}/notification`}
          /> */}
          <MenuItem
            name="settings"
            label="Settings"
            OutlineIcon={SettingsOutline}
            SolidIcon={SettingsOutline}
            submenu={[
              {
                name: "email-configurations",
                label: "Email Configurations",
                OutlineIcon: DocumentTextOutline,
                SolidIcon: DocumentTextSolid,
                to: `${basePath}/settings/email-configurations`,
              },
            ]}
          />
          {/* <MenuItem
            name="login-history"
            label="Login History"
            OutlineIcon={LoginHistoryOutline}
            SolidIcon={LoginHistorySolid}
            to={`${basePath}/login-history`}
          /> */}
          {/* <MenuItem
            name="help"
            label="Help & Support"
            OutlineIcon={HelpOutline}
            SolidIcon={HelpSolid}
            to={`${basePath}/help`}
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
