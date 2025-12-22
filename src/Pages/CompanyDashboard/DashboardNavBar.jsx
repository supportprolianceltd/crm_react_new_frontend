import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LogoIcon } from "../../assets/icons/LogoIcon";
import { LogoWhiteIcon } from "../../assets/icons/LogoWhiteIcon";
import { useTheme } from "../../context/ThemeContext";
import Notification from "./Notification";

import {
  MagnifyingGlassIcon,
  CheckIcon,
  UserIcon,
  XMarkIcon,
  Bars3Icon,
  HomeIcon,
  BellIcon as BellIconOutline,
  Cog6ToothIcon as SettingsIconOutline,
} from "@heroicons/react/24/outline";

import RecruitmentIcon from "../../assets/Img/CRMPack/Recruitment.svg";
import ComplianceIcon from "../../assets/Img/CRMPack/Compliance.svg";
// TrainingIcon removed (not used in this component)
import AssetmanagementIcon from "../../assets/Img/CRMPack/Assetmanagement.svg";
import RosteringIcon from "../../assets/Img/CRMPack/Rostering.svg";
import HRIcon from "../../assets/Img/CRMPack/HR.svg";
import FinanceIcon from "../../assets/Img/CRMPack/Finance.svg";
import WorkSpace from "../../assets/Img/CRMPack/Workspace.svg";

import CompanyIcon from "../../Pages/StaffDashboard/Img/CRMPack/GenericCompanyLogo.png";
import { useMobileNav } from "../../context/MobileNavContext";
import { capitalizeFirstLetter } from "../../utils/helpers";
import { hasAppAccess } from "../../utils/access";

// App access mapping and logic moved to src/utils/access.js

const DashboardNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tenantSchema = localStorage.getItem("tenantSchema");
  const [showFeaturesDropdown, setShowFeaturesDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const panelRef = useRef(null);
  const bellRef = useRef(null); // ✅ ref for BellIcon
  let parsedUser = null;
  try {
    parsedUser = JSON.parse(localStorage.getItem("user"));
  } catch {
    parsedUser = null;
  }
  const user = parsedUser;
  const userId = user?.profile?.employee_id || null;
  const [unreadCount, setUnreadCount] = useState(0); // 🔹 Track unread
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const profileRef = useRef(null);
  // removed unused chat/calendar refs
  const { mobileNavActive, setMobileNavActive } = useMobileNav();
  const { darkMode } = useTheme();

  // ✅ Close when clicking outside (but not when clicking BellIcon)
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        bellRef.current &&
        !bellRef.current.contains(e.target)
      ) {
        setIsPanelOpen(false);
      }
    }

    if (isPanelOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPanelOpen]);

  // clock state/handler removed (unused in this component)

  const [loading] = useState(false);
  // theme toggle handler removed (UI control is commented out)

  // Define all apps, including Workspace
  const [allApps] = useState(() => {
    const baseApps = [
      {
        name: "Admin",
        icon: CompanyIcon,
        path: "/company",
      },
      {
        name: "Recruitment",
        icon: RecruitmentIcon,
        path: "/company/recruitment",
      },
      {
        name: "Audit & Compliance",
        icon: ComplianceIcon,
        path: "/company/audit-compliance",
      },
      // {
      //   name: "Training",
      //   icon: TrainingIcon,
      //   path: "/company/training",
      // },
      {
        name: "Assets management",
        icon: AssetmanagementIcon,
        path: "/company/assets",
      },
      {
        name: "Rostering",
        icon: RosteringIcon,
        path: "/company/rostering",
      },
      {
        name: "HR",
        icon: HRIcon,
        path: "/company/hr",
      },
      {
        name: "Finance",
        icon: FinanceIcon,
        path: "/company/finance",
      },
      {
        name: "My Workspace",
        icon: WorkSpace,
        path: "/staff",
      },
    ];
    return baseApps;
  });

  // All CRM apps (excluding Workspace) for display
  const allCrmApps = useMemo(
    () => allApps.filter((app) => app.name !== "My Workspace"),
    [allApps]
  );

  // Filter apps based on search query
  const filteredApps = useMemo(() => {
    if (!searchQuery) return allCrmApps;
    return allCrmApps.filter((app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allCrmApps, searchQuery]);

  // Determine the current app based on the URL.
  // Choose the app with the longest path that matches the start of the pathname
  const currentApp = useMemo(() => {
    if (!location || !location.pathname) return allApps[0] || null;

    // Special-case staff exact path
    if (location.pathname === "/staff") {
      return allApps.find((app) => app.name === "My Workspace") || null;
    }

    // Find all apps whose path is a prefix of the current pathname
    const matches = allApps.filter(
      (app) => app.path && location.pathname.startsWith(app.path)
    );

    if (matches.length === 0) {
      // fallback to workspace if nothing matches
      return allApps.find((app) => app.name === "My Workspace") || null;
    }

    // Pick the match with the longest path (most specific)
    matches.sort((a, b) => b.path.length - a.path.length);
    return matches[0] || null;
  }, [location, allApps]);

  // Delegate access checks to shared helper
  const checkAppAccess = useCallback((appName) => hasAppAccess(user, appName), [user]);

  const accessibleAppsCount = useMemo(() => {
    return allCrmApps.filter((app) => checkAppAccess(app.name)).length;
  }, [allCrmApps, checkAppAccess]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const unread = 3; // or fetch from your API
        setUnreadCount(unread); // ensure the badge is shown immediately
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, []);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowFeaturesDropdown(false);
        setSearchQuery("");
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (activeButton && buttonRef.current && !buttonRef.current.contains(event.target)) {
        setActiveButton(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeButton]);

  const handleFeatureClick = () => {
    setShowFeaturesDropdown(false);
    setSearchQuery("");
  };
  const handleProfileClick = () => setShowProfileDropdown(!showProfileDropdown);
  const closeProfileDropdown = () => setShowProfileDropdown(false);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    closeProfileDropdown();
    navigate("/login");
  };

  const getInitials = (user) => {
    if (!user || typeof user !== "object") return "N/A";
    // prefer top-level name fields, fall back to profile
    const first = user.first_name || user?.profile?.first_name;
    const last = user.last_name || user?.profile?.last_name;
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
    const email = user.email || user?.profile?.email;
    if (email) return email.slice(0, 2).toUpperCase();
    return "N/A";
  };

  const getFullName = (user) => {
    if (!user || typeof user !== "object") return "Unknown";
    const first = user.first_name || user?.profile?.first_name;
    const last = user.last_name || user?.profile?.last_name;
    if (first && last) return `${first} ${last}`;
    return user.email || user?.profile?.email || "Unknown";
  };

  // getPosition removed (unused)

  return (
    <div className="DashboardNavBar">
      {loading && (
        <div
          className="theme-loader"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: darkMode ? "#141127" : "#fff", // loader bg
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            color: darkMode ? "#fff" : "#372580",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          <div className="loader"></div>
        </div>
      )}

      <nav className="Top-NaV">
        <div className="NaV-1">
          <span
            className="Mbbl-NAv-Togler mobile-Show"
            onClick={() => setMobileNavActive((prev) => !prev)}
          >
            {mobileNavActive ? <XMarkIcon /> : <Bars3Icon />}
          </span>
          <Link to="/" className="Nav-Brand">
            {darkMode ? <LogoWhiteIcon /> : <LogoIcon />}
          </Link>

          <Link to={currentApp.path} className="SSl-CUrent-APP mobile-Hide">
            <span>
              <img src={currentApp.icon} alt={currentApp.name} />
            </span>
            {currentApp.name}
          </Link>
          <AnimatePresence>
            {showFeaturesDropdown && (
              <motion.div
                ref={dropdownRef}
                className="genn-Drop-Sec Gen-Boxshadow"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="genn-Drop-Search">
                  <span>
                    <MagnifyingGlassIcon />
                  </span>
                  <input
                    type="text"
                    placeholder="Find CRM Features"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="feat-Main">
                  {filteredApps.length > 0 ? (
                    filteredApps.map(({ name, icon, path }) => {
                      const hasAccess = checkAppAccess(name);

                      return (
                        <Link
                          key={path || name}
                          className={`app-link ${!hasAccess ? "disabled-app" : ""}`}
                          onClick={(e) => {
                            if (!hasAccess) {
                              e.preventDefault();
                              return;
                            }
                            handleFeatureClick();
                            // allow Link to handle navigation
                          }}
                          to={hasAccess ? path : "#"} // Only provide valid path if accessible
                          style={{ cursor: hasAccess ? "pointer" : "not-allowed" }}
                        >
                          {!hasAccess ? (
                            // Show padlocked version for inaccessible apps
                            <>
                              <div className="app-icon-wrapper">
                                <img
                                  src={icon}
                                  alt={name}
                                  className="disabled-icon"
                                />
                                <div className="padlock-overlay">
                                  <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 1C8.676 1 6 3.676 6 7v1H4v14h16V8h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v1H8V7c0-2.276 1.724-4 4-4zm0 10c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" />
                                  </svg>
                                </div>
                              </div>
                              <p>{name}</p>
                            </>
                          ) : (
                            // Show normal version for accessible apps
                            <>
                              <img src={icon} alt={name} />
                              <p>{name}</p>
                            </>
                          )}
                        </Link>
                      );
                    })
                  ) : (
                    <p className="no-results">No apps found</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="NaV-2">
          <div className="NaV-2-Icons">
            <p className="tenanti-Nmame mobile-Hide">
              {capitalizeFirstLetter(tenantSchema)}
            </p>

            <Link to="/staff" title="My Workspace" className="mobile-Hide UYjad-POlajsjs">
              <HomeIcon className="h-6 w-6" />
              My Workspace
            </Link>
            <span
              ref={bellRef}
              title="Notifications"
              role="button"
              aria-label="Notifications"
              tabIndex={0}
              onClick={() => setIsPanelOpen((prev) => !prev)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setIsPanelOpen((prev) => !prev);
              }}
              style={{ cursor: "pointer" }}
              className="mobile-Hide"
            >
              <BellIconOutline className="h-6 w-6" />
              {unreadCount > 0 && <i className="nottti-Inddi"></i>}
            </span>

            {/* <span
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
              onClick={handleThemeToggle} // use loader
              style={{ cursor: "pointer" }}
            >
              {darkMode ? (
                <SunIcon className="h-6 w-6" />
              ) : (
                <MoonIcon className="h-6 w-6" />
              )}
            </span> */}

            <span
              ref={buttonRef}
              className={`HYsi ${showFeaturesDropdown ? "active-Gent-Trangl" : ""}`}
              title="Features Launcher"
              role="button"
              aria-label="Open features launcher"
              tabIndex={0}
              onClick={() => setShowFeaturesDropdown(!showFeaturesDropdown)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setShowFeaturesDropdown((prev) => !prev);
              }}
            >
              <svg
                viewBox="0 0 49 49"
                fill="#372580"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.61963 4.65527C10.8288 4.65527 12.6196 6.44613 12.6196 8.65527C12.6196 10.8644 10.8288 12.6553 8.61963 12.6553C6.41049 12.6553 4.61963 10.8644 4.61963 8.65527C4.61963 6.44613 6.41049 4.65527 8.61963 4.65527ZM24.6196 4.65527C26.8288 4.65527 28.6196 6.44613 28.6196 8.65527C28.6196 10.8644 26.8288 12.6553 24.6196 12.6553C22.4104 12.6553 20.6196 10.8644 20.6196 8.65527C20.6196 6.44613 22.4104 4.65527 24.6196 4.65527ZM44.6196 8.65527C44.6196 6.44613 42.8288 4.65527 40.6196 4.65527C38.4104 4.65527 36.6196 6.44613 36.6196 8.65527C36.6196 10.8644 38.4104 12.6553 40.6196 12.6553C42.8288 12.6553 44.6196 10.8644 44.6196 8.65527ZM8.61963 20.6553C10.8288 20.6553 12.6196 22.4461 12.6196 24.6553C12.6196 26.8645 10.8288 28.6553 8.61963 28.6553C6.41049 28.6553 4.61963 26.8645 4.61963 24.6553C4.61963 22.4461 6.41049 20.6553 8.61963 20.6553ZM28.6196 24.6553C28.6196 22.4461 26.8288 20.6553 24.6196 20.6553C22.4104 20.6553 20.6196 22.4461 20.6196 24.6553C20.6196 26.8645 22.4104 28.6553 24.6196 28.6553C26.8288 28.6553 28.6196 26.8645 28.6196 24.6553ZM40.6196 20.6553C42.8288 20.6553 44.6196 22.4461 44.6196 24.6553C44.6196 26.8645 42.8288 28.6553 40.6196 28.6553C38.4104 28.6553 36.6196 26.8645 36.6196 24.6553C36.6196 22.4461 38.4104 20.6553 40.6196 20.6553ZM12.6196 40.6553C12.6196 38.4461 10.8288 36.6553 8.61963 36.6553C6.41049 36.6553 4.61963 38.4461 4.61963 40.6553C4.61963 42.8645 6.41049 44.6553 8.61963 44.6553C10.8288 44.6553 12.6196 42.8645 12.6196 40.6553ZM24.6196 36.6553C26.8288 36.6553 28.6196 38.4461 28.6196 40.6553C28.6196 42.8645 26.8288 44.6553 24.6196 44.6553C22.4104 44.6553 20.6196 42.8645 20.6196 40.6553C20.6196 38.4461 22.4104 36.6553 24.6196 36.6553ZM44.6196 40.6553C44.6196 38.4461 42.8288 36.6553 40.6196 36.6553C38.4104 36.6553 36.6196 38.4461 36.6196 40.6553C36.6196 42.8645 38.4104 44.6553 40.6196 44.6553C42.8288 44.6553 44.6196 42.8645 44.6196 40.6553Z"
                />
              </svg>
              <span className="accessible-apps-count">
                {accessibleAppsCount}
              </span>
            </span>
          </div>
          <div
            className={`NaV-2-Prof ${
              showProfileDropdown ? "active-NavProfa" : ""
            }`}
            onClick={handleProfileClick}
            ref={profileRef}
          >
            <div className="NaV-2-Prof-1">
              {user?.profile?.profile_image_url ? (
                <img src={user?.profile?.profile_image_url} />
              ) : (
                <span>{getInitials(user)}</span>
              )}
            </div>
            <AnimatePresence>
              {showProfileDropdown && (
                <motion.div
                  className="All_Drop_Down lkma-oop Gen-Boxshadow"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to={currentApp.path}
                    className="SSl-CUrent-APP mobile-Show"
                  >
                    <span>
                      <img src={currentApp.icon} alt={currentApp.name} />
                    </span>
                    {currentApp.name}
                  </Link>

                  <h3 className="teanns-iInnss mobile-Show">
                    {capitalizeFirstLetter(tenantSchema)}
                  </h3>
                  <div className="All-TTo-Nagbs-main ouj-pia">
                    <div className="All-TTo-Nagbs-1">
                      {user?.profile?.profile_image_url ? (
                        <img src={user?.profile?.profile_image_url} />
                      ) : (
                        <span>{getInitials(user)}</span>
                      )}
                      &nbsp;
                    </div>
                    <div className="All-TTo-Nagbs-2 oujah-osi">
                      <p>{getFullName(user)}</p>
                      <span>ID: {userId}</span>
                    </div>
                    <div className="All-TTo-Nagbs-3 ouajjs-sua">
                      <CheckIcon />
                    </div>
                  </div>
                  <Link
                    to="/staff"
                    title="My Workspace"
                    className="mobile-Show"
                  >
                    <HomeIcon className="h-6 w-6" />
                    Home
                  </Link>

                  <Link
                    to="/company/notifications"
                    className="mobile-Show"
                    onClick={closeProfileDropdown}
                  >
                    <BellIconOutline /> Notifications
                  </Link>
                  <Link
                    to="/company/settings"
                    className="mobile-Show"
                    onClick={closeProfileDropdown}
                  >
                    <SettingsIconOutline /> Settings
                  </Link>
                  <Link to="/staff/profile" onClick={closeProfileDropdown}>
                    <UserIcon /> Profile
                  </Link>
                  <button
                    className="logout-btn btn-primary-bg"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            ref={panelRef}
            className="Nottic-Panel"
            initial={{ x: "100%" }} // start off-screen to the right
            animate={{ x: 0 }} // slide in
            exit={{ x: "100%" }} // slide out
            transition={{ type: "tween", duration: 0.4 }}
          >
            <div className="Nottic-Panel-Top">
              <div className="Nottic-Panel-Top-1">
                <span>
                  <BellIconOutline />
                </span>
              </div>
              <div className="Nottic-Panel-Top-2">
                <div>
                  <h3>Notification</h3>
                  <p>You have {unreadCount} unread notifications</p>
                </div>
              </div>
              <span
                className="close-Nottic-Panel"
                onClick={() => setIsPanelOpen(false)}
                style={{ cursor: "pointer" }}
              >
                <XMarkIcon />
              </span>
            </div>

            <div className="Nottic-Panel-BoDDy">
              <Notification onUnreadChange={setUnreadCount} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardNavBar;
