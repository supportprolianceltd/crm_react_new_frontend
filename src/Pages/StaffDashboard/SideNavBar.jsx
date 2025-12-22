import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  HomeIcon as HomeOutline,
  ClipboardDocumentIcon as ClipboardOutline,
  BellIcon as BellOutline,
  Cog6ToothIcon as SettingsOutline,
  InboxIcon,
  UserCircleIcon,
  PaperAirplaneIcon as PaperAirplaneOutline,
  ChevronDownIcon,
  ClockIcon as ClockOutline,
  ArchiveBoxIcon as ArchiveOutline,
  FolderIcon,
  ReceiptPercentIcon,
  BriefcaseIcon as BriefcaseOutline,
  CubeIcon as CubeOutline,
  ScaleIcon as ScaleOutline,
  WrenchScrewdriverIcon as WrenchScrewdriverOutline,
  KeyIcon as KeyOutline,
  CalendarDaysIcon as CalendarOutline,
} from "@heroicons/react/24/outline";

import {
  HomeIcon as HomeSolid,
  ClipboardDocumentIcon as ClipboardSolid,
  BellIcon as BellSolid,
  Cog6ToothIcon as SettingsSolid,
  InboxIcon as InboxSolid,
  UserCircleIcon as UserCircleSolid,
  PaperAirplaneIcon as PaperAirplaneSolid,
  ArchiveBoxIcon as ArchiveSolid,
  FolderIcon as FolderSolid,
  ReceiptPercentIcon as ReceiptSolid,
  BriefcaseIcon as BriefcaseSolid,
  CubeIcon as CubeSolid,
  ClockIcon as ClockSolid,
  ScaleIcon as ScaleSolid,
  WrenchScrewdriverIcon as WrenchScrewdriverSolid,
  KeyIcon as KeySolid,
} from "@heroicons/react/24/solid";

import "./Request.css";
import { IconWalk } from "@tabler/icons-react";
import { initiatePasswordReset } from "../../Pages/CompanyDashboard/Recruitment/ApiService";

const iconClass = "w-5 h-5";
const basePath = "/staff";

const SideNavBar = ({ setShrinkNav }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const notificationCount = 3;

  const handleChangePasswordClick = async (to) => {
    try {
      const tenantDomain = localStorage.getItem("tenantDomain");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userEmail = user.email;
      const userUsername = user.username;

      let identifier = {};
      if (userEmail && userEmail.includes(tenantDomain)) {
        identifier = { email: userEmail };
      } else {
        identifier = { username: userUsername };
      }

      await initiatePasswordReset(identifier);
      navigate(to);
    } catch (err) {
      alert("Failed to initiate password reset. Please try again.");
    }
  };

  const getActiveState = () => {
    const relPath = location.pathname.replace(basePath, "").replace(/^\//, "");
    if (relPath.includes("/")) {
      const [main, sub] = relPath.split("/");
      return { main: main || "dashboard", sub: sub || null };
    }
    return { main: relPath === "" ? "dashboard" : relPath, sub: null };
  };

  const { main: activeMenu, sub: activeSubmenu } = getActiveState();

  const renderIcon = (name, Outline, Solid, isSub = false, to = "") => {
    if (isSub) {
      const isActive = location.pathname === to;
      return isActive ? (
        <Solid className={iconClass} />
      ) : (
        <Outline className={iconClass} />
      );
    }
    return activeMenu === name ? (
      <Solid className={iconClass} />
    ) : (
      <Outline className={iconClass} />
    );
  };

  const MenuItem = ({
    name,
    label,
    OutlineIcon,
    SolidIcon,
    to,
    onClick,
    badge,
    submenu,
  }) => {
    const [isSubmenuOpen, setIsSubmenuOpen] = useState(activeMenu === name);
    const hasSubmenu = submenu && submenu.length > 0;

    const isActiveMain = activeMenu === name;

    return (
      <li
        className={`${isActiveMain ? "active" : ""} ${
          hasSubmenu ? "has-submenu-super" : ""
        }`}
      >
        <Link
          to={to}
          className="flex items-center justify-between"
          title={label}
          onClick={(e) => {
            if (onClick) {
              e.preventDefault();
              onClick();
            }
            if (hasSubmenu) {
              e.preventDefault();
              setIsSubmenuOpen(!isSubmenuOpen);
            }
          }}
        >
          <span className="LefB-Icon">
            {renderIcon(name, OutlineIcon, SolidIcon)}
          </span>
          <span className="LefB-label">
            <span className="fffin-OOlka">{label}</span>
            {badge > 0 && (
              <span className="notification-badge ml-2">{badge}</span>
            )}
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
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <motion.ul
              className="submenu-super"
              initial="collapsed"
              animate={isSubmenuOpen ? "open" : "collapsed"}
              variants={{
                open: { opacity: 1, transition: { staggerChildren: 0.05 } },
                collapsed: { opacity: 0 },
              }}
            >
              {submenu.map((item) => (
                <motion.li
                  key={item.name}
                  className={location.pathname === item.to ? "active" : ""}
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
                    className="flex items-center"
                    onClick={(e) => {
                      if (item.onClick) {
                        e.preventDefault();
                        item.onClick();
                      }
                    }}
                  >
                    <span className="LefB-Icon">
                      {renderIcon(
                        item.name,
                        item.OutlineIcon,
                        item.SolidIcon,
                        true,
                        item.to
                      )}
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

  const navItems = [
    {
      name: "dashboard",
      label: "Dashboard",
      OutlineIcon: HomeOutline,
      SolidIcon: HomeSolid,
      to: `${basePath}/`,
    },
    {
      name: "my-tasks",
      label: "My Tasks",
      OutlineIcon: ClipboardOutline,
      SolidIcon: ClipboardSolid,
      to: `${basePath}/my-tasks`,
    },
    //  {
    //     name: "travel-logistics",
    //     label: "Travel & Logistics",
    //     OutlineIcon: IconWalk,
    //     SolidIcon: IconWalk,
    //     to: `${basePath}/travel-logistics`,
    //   },
    // {
    //   name: "attendance",
    //   label: "Attendance",
    //   OutlineIcon: ClockOutline,
    //   SolidIcon: ClockSolid,
    //   to: `${basePath}/attendance`,
    //   submenu: [
    //     {
    //       name: "attendance",
    //       label: "Attendance",
    //       OutlineIcon: ClockOutline,
    //       SolidIcon: ClockSolid,
    //       to: `${basePath}/attendance`,
    //     },
    //     {
    //       name: "travel-logistics",
    //       label: "Travel & Logistics",
    //       OutlineIcon: IconWalk,
    //       SolidIcon: IconWalk,
    //       to: `${basePath}/travel-logistics`,
    //     },
    //   ],
    // },
    // {
    //   name: "travel-logistics",
    //   label: "Travel & Logistics",
    //   OutlineIcon: IconWalk,
    //   SolidIcon: IconWalk,
    //   to: `${basePath}/travel-logistics`,
    // },
    // {
    //   name: "messages",
    //   label: "Messages",
    //   OutlineIcon: InboxIcon,
    //   SolidIcon: InboxSolid,
    //   to: `${basePath}/messages`,
    // },
    {
      name: "calendar",
      label: "Calendar",
      OutlineIcon: CalendarOutline,
      SolidIcon: CalendarOutline,
      to: `${basePath}/calendar`,
    },
    {
      name: "onboarding-documents",
      label: "Onboarding Documents",
      OutlineIcon: FolderIcon,
      SolidIcon: FolderSolid,
      to: `${basePath}/onboarding-documents`,
    },
    // {
    //   name: "notifications",
    //   label: "Notifications",
    //   OutlineIcon: BellOutline,
    //   SolidIcon: BellSolid,
    //   to: `${basePath}/notifications`,
    //   badge: notificationCount,
    // },
    {
      name: "request",
      label: "Request",
      OutlineIcon: PaperAirplaneOutline,
      SolidIcon: PaperAirplaneSolid,
      to: `${basePath}/request`,
      submenu: [
        {
          name: "job-requisitions",
          label: "Job Requests",
          OutlineIcon: BriefcaseOutline,
          SolidIcon: BriefcaseSolid,
          to: `${basePath}/request/job-requisitions`,
        },
        {
          name: "material-requisitions",
          label: "Material Requests",
          OutlineIcon: CubeOutline,
          SolidIcon: CubeSolid,
          to: `${basePath}/material-requisitions`,
        },
        {
          name: "leave-requisitions",
          label: "Leave Requests",
          OutlineIcon: ClockOutline,
          SolidIcon: ClockSolid,
          to: `${basePath}/leave-requisitions`,
        },
        {
          name: "service-requisitions",
          label: "Service Requests",
          OutlineIcon: WrenchScrewdriverOutline,
          SolidIcon: WrenchScrewdriverSolid,
          to: `${basePath}/service-requisitions`,
        },
      ],
    },
    // {
    //   name: "asset",
    //   label: "Asset",
    //   OutlineIcon: ArchiveOutline,
    //   SolidIcon: ArchiveSolid,
    //   to: `${basePath}/asset`,
    // },
    // {
    //   name: "pay-slip",
    //   label: "Pay Slip",
    //   OutlineIcon: ReceiptPercentIcon,
    //   SolidIcon: ReceiptSolid,
    //   to: `${basePath}/pay-slip`,
    // },
    {
      name: "rewards-penalties",
      label: "Rewards & Penalties",
      OutlineIcon: ScaleOutline,
      SolidIcon: ScaleSolid,
      to: `${basePath}/rewards-penalties`,
    },
    {
      name: "settings",
      label: "Settings",
      OutlineIcon: SettingsOutline,
      SolidIcon: SettingsSolid,
      to: `${basePath}/settings`,
      submenu: [
        {
          name: "profile",
          label: "Profile",
          OutlineIcon: UserCircleIcon,
          SolidIcon: UserCircleSolid,
          to: `${basePath}/profile`,
        },
        {
          name: "change-password",
          label: "Change Password",
          OutlineIcon: KeyOutline,
          SolidIcon: KeySolid,
          to: `${basePath}/change-password`,
          onClick: () =>
            handleChangePasswordClick(`${basePath}/change-password`),
        },
      ],
    },
  ];

  return (
    <motion.div
      className="SideNavBar Gen-Boxshadow"
      initial={{ opacity: 0, x: 0 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* <div className="SideNavBar-Main custom-scroll-bar"> */}
      <div className="SideNavBar-Main">
        <ul className="LeftnavBr-Icons">
          {navItems.map(
            ({
              name,
              label,
              OutlineIcon,
              SolidIcon,
              to,
              onClick,
              badge,
              submenu,
            }) => (
              <MenuItem
                key={name}
                name={name}
                label={label}
                OutlineIcon={OutlineIcon}
                SolidIcon={SolidIcon}
                to={to}
                onClick={onClick}
                badge={badge}
                submenu={submenu}
              />
            )
          )}
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
