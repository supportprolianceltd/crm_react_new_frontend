import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BriefcaseIcon as BriefcaseOutline,
  ClipboardDocumentIcon as ClipboardOutline,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  BriefcaseIcon as BriefcaseSolid,
  ClipboardDocumentIcon as ClipboardSolid,
} from "@heroicons/react/24/solid";

const iconClass = "w-5 h-5";

const SideNavBar = ({ setShrinkNav }) => {
  const location = useLocation();
  const [isComplianceOpen, setIsComplianceOpen] = useState(true);

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const renderIcon = (path, OutlineIcon, SolidIcon) => {
    return isActiveRoute(path) ? (
      <SolidIcon className={iconClass} />
    ) : (
      <OutlineIcon className={iconClass} />
    );
  };

  const MenuItem = ({ name, label, OutlineIcon, SolidIcon, to, submenu }) => {
    const hasSubmenu = submenu && submenu.length > 0;
    const isActive = hasSubmenu
      ? submenu.some((item) => isActiveRoute(item.to))
      : isActiveRoute(to);

    const handleClick = (e) => {
      if (hasSubmenu) {
        e.preventDefault();
        setIsComplianceOpen(!isComplianceOpen);
      } else {
        // Close the submenu when clicking a non-submenu item
        setIsComplianceOpen(false);
      }
    };

    return (
      <li
        className={`${isActive ? "active" : ""} ${
          hasSubmenu ? "has-submenu-super" : ""
        }`}
      >
        <Link
          to={to}
          className="flex items-center justify-between"
          title={label}
          onClick={handleClick}
        >
          <span className="LefB-Icon">
            {renderIcon(to, OutlineIcon, SolidIcon)}
          </span>
          <span className="LefB-label">
            <span className="fffin-OOlka" style={{ whiteSpace: "nowrap" }}>
              {label}
            </span>
            {hasSubmenu && (
              <motion.div
                animate={{ rotate: isComplianceOpen ? 180 : 0 }}
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
              height: isComplianceOpen ? "auto" : 0,
              opacity: isComplianceOpen ? 1 : 0.8,
            }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <motion.ul
              className="submenu-super"
              initial="collapsed"
              animate={isComplianceOpen ? "open" : "collapsed"}
              variants={{
                open: { opacity: 1, transition: { staggerChildren: 0.05 } },
                collapsed: { opacity: 0 },
              }}
            >
              {submenu.map((item) => (
                <motion.li
                  key={item.name}
                  className={isActiveRoute(item.to) ? "active" : ""}
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
                    onClick={() => setIsComplianceOpen(true)} // Ensure submenu stays open when clicking submenu items
                  >
                    <span className="LefB-Icon">
                      {renderIcon(item.to, item.OutlineIcon, item.SolidIcon)}
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
      <div className="SideNavBar-Main custom-scroll-bar">
        <ul className="LeftnavBr-Icons">
          <MenuItem
            name="recruitment"
            label="Recruitment"
            OutlineIcon={BriefcaseOutline}
            SolidIcon={BriefcaseSolid}
            to="/company/audit-compliance/recruitment/new-staff"
            submenu={[
              {
                name: "new-staff",
                label: "New Staff Compliance",
                OutlineIcon: BriefcaseOutline,
                SolidIcon: BriefcaseSolid,
                to: "/company/audit-compliance/recruitment/new-staff",
              },
              {
                name: "existing-staff",
                label: "Existing Staff Compliance",
                OutlineIcon: BriefcaseOutline,
                SolidIcon: BriefcaseSolid,
                to: "/company/audit-compliance/recruitment/existing-staff",
              },
            ]}
          />
          {/* <MenuItem
            name="rostering"
            label="Rostering"
            OutlineIcon={CalendarOutline}
            SolidIcon={CalendarSolid}
            to="/company/compliance/rostering"
          />
          <MenuItem
            name="hr"
            label="HR"
            OutlineIcon={UsersOutline}
            SolidIcon={UsersSolid}
            to="/company/compliance/hr"
          /> */}
          <MenuItem
            name="audit-reporting"
            label="Audit & Reporting"
            OutlineIcon={ClipboardOutline}
            SolidIcon={ClipboardSolid}
            to="/company/compliance/audit-reporting"
          />
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
