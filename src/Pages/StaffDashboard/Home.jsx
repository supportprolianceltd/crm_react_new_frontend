import React, { useState, useRef, useEffect } from "react";
import { apiClient } from "../../config";
import { Link, useNavigate } from "react-router-dom";
import ProductivityChart from "./ProductivityChart";
import UserProfYl from "./Img/user-placeholder.png";

import RecruitmentIcon from "./Img/CRMPack/Recruitment.svg";
import ComplianceIcon from "./Img/CRMPack/Compliance.svg";
import TrainingIcon from "./Img/CRMPack/Training.svg";
import AssetmanagementIcon from "./Img/CRMPack/Assetmanagement.svg";
import RosteringIcon from "./Img/CRMPack/Rostering.svg";
import HRIcon from "./Img/CRMPack/HR.svg";
import FinanceIcon from "./Img/CRMPack/Finance.svg";
import CompanyIcon from "./Img/CRMPack/GenericCompanyLogo.png";

import { Squares2X2Icon, CalendarDaysIcon } from "@heroicons/react/24/solid";
import { ClockIcon } from "@heroicons/react/24/outline";
import { AnimatePresence } from "framer-motion";
import { hasAppAccess } from "../../utils/access";

import TeamMembers from "./TeamMembers";

// Icons
const ArrowUpIcon = (
  <svg
    width="14"
    height="10"
    viewBox="0 0 14 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5.59444 1.75696C6.16691 1.04137 6.45314 0.683571 6.82175 0.616796C6.93962 0.595443 7.06038 0.595443 7.17825 0.616796C7.54686 0.683571 7.83309 1.04137 8.40556 1.75695L12.6604 7.07555C13.5544 8.19295 14.0013 8.75165 13.8945 9.22162C13.8612 9.36822 13.7953 9.50541 13.7016 9.62301C13.4013 10 12.6858 10 11.2549 10H2.74512C1.31416 10 0.59867 10 0.298409 9.62301C0.204749 9.50541 0.138808 9.36822 0.105491 9.22162C-0.00131863 8.75165 0.445641 8.19295 1.33956 7.07555L5.59444 1.75696Z"
      fill="#35C220"
    />
  </svg>
);

const ArrowDownIcon = (
  <svg
    width="14"
    height="10"
    viewBox="0 0 14 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8.40556 8.24304C7.83309 8.95863 7.54686 9.31643 7.17825 9.3832C7.06038 9.40456 6.93962 9.40456 6.82175 9.3832C6.45314 9.31643 6.16691 8.95863 5.59444 8.24305L1.33956 2.92445C0.445641 1.80705 -0.00131863 1.24835 0.105491 0.77838C0.138808 0.631777 0.204749 0.494589 0.298409 0.376989C0.59867 0 1.31416 0 2.74512 0H11.2549C12.6858 0 13.4013 0 13.7016 0.376989C13.7953 0.494589 13.8612 0.631777 13.8945 0.77838C14.0013 1.24835 13.5544 1.80705 12.6604 2.92445L8.40556 8.24304Z"
      fill="#F03D3D"
    />
  </svg>
);

// App access mapping and logic moved to src/utils/access.js


// --- Task Stats Logic ---
const useCarerTaskStats = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const carerId = user?.id;
    if (!carerId) return;

    setIsLoadingTasks(true);
    apiClient
      .get(`/api/rostering/tasks/carer/${carerId}/visits`)
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [];
        // Flatten all tasks from all visits into a single array
        const allTasks = data.flatMap((visit) => Array.isArray(visit.tasks) ? visit.tasks : []);
        setTasks(allTasks);
        setIsLoadingTasks(false);
      })
      .catch(() => setIsLoadingTasks(false));
  }, []);

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const pendingTasks = tasks.filter(
    (t) => t.status === "PENDING" || t.status === "SCHEDULED" || t.status === "IN_PROGRESS"
  ).length;
  const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate chart data based on real tasks
  const calculateChartData = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // Helper to get date key
    const getDateKey = (date, period) => {
      if (period === "today") return date.getHours() + ":00";
      if (period === "week") return date.toLocaleDateString("en-US", { weekday: "short" });
      if (period === "month") return date.getDate();
      if (period === "year") return date.toLocaleDateString("en-US", { month: "short" });
    };

    // Group tasks by period
    const groupByPeriod = (period, startDate) => {
      const grouped = {};
      tasks.forEach((task) => {
        const taskDate = new Date(task.startDate || task.createdAt);
        if (taskDate >= startDate) {
          const key = getDateKey(taskDate, period);
          if (!grouped[key]) grouped[key] = { completed: 0, pending: 0 };
          if (task.status === "COMPLETED") grouped[key].completed++;
          else grouped[key].pending++;
        }
      });
      return Object.keys(grouped).map((key) => ({
        [period === "today" ? "time" : period === "week" ? "day" : period === "month" ? "day" : "month"]: key,
        completed: grouped[key].completed,
        pending: grouped[key].pending,
      }));
    };

    return {
      today: groupByPeriod("today", today),
      week: groupByPeriod("week", weekStart),
      month: groupByPeriod("month", monthStart),
      year: groupByPeriod("year", yearStart),
    };
  };

  const dataSets = calculateChartData();

  return {
    isLoadingTasks,
    totalTasks,
    completedTasks,
    pendingTasks,
    productivity,
    dataSets,
  };
};

const Home = ({ onMessageClick }) => {
  const {
    isLoadingTasks,
    totalTasks,
    completedTasks,
    pendingTasks,
    productivity,
    dataSets,
  } = useCarerTaskStats();

  const currentStats = [
    {
      title: "Total Tasks",
      value: isLoadingTasks ? "..." : totalTasks,
      change: "",
      direction: "up",
    },
    {
      title: "Completed Tasks",
      value: isLoadingTasks ? "..." : completedTasks,
      change: "",
      direction: "up",
    },
    {
      title: "Pending Tasks",
      value: isLoadingTasks ? "..." : pendingTasks,
      change: "",
      direction: "down",
    },
    {
      title: "Productivity",
      value: isLoadingTasks ? "..." : `${productivity}%`,
      change: "",
      direction: productivity >= 80 ? "up" : "down",
    },
  ];
  const user = JSON.parse(localStorage.getItem("user")) || {
    role: "staff",
    profile: {},
  };
  const visibleApps = 5;
  const [showMore, setShowMore] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();

  // Delegate access checks to shared helper
  const checkAppAccess = (appName) => hasAppAccess(user, appName);

  const allApps = [
    ...(user?.role === "root-admin" || user?.role === "co-admin" || user?.profile?.system_access_co_superadmin
      ? [{ name: "Admin", icon: CompanyIcon, path: "/company" }]
      : []),
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
    { name: "Training", icon: TrainingIcon, path: "/company/training" },
    {
      name: "Assets management",
      icon: AssetmanagementIcon,
      path: "/company/assets",
    },
    { name: "Rostering", icon: RosteringIcon, path: "/company/rostering" },
    { name: "HR", icon: HRIcon, path: "/company/hr" },
    { name: "Finance", icon: FinanceIcon, path: "/company/finance" },
  ];

  const accessibleApps = allApps.filter((app) => checkAppAccess(app.name));

  const visibleAppList = accessibleApps.slice(0, visibleApps);
  const hiddenAppList = accessibleApps.slice(visibleApps);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMore(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="RRR-SS-HHomss">
      {/* User Greeting */}
      <div className="Oukaujs-Secs">
        <div className="Oukaujs-1">
          <div className="paols-Ola">
            <img
              src={user?.profile?.profile_image_url ?? UserProfYl}
              alt="User Profile"
            />
          </div>
          <div className="GGtgs-Pls">
            <div>
              <p>Hi {user?.first_name},</p>
              <h2>Welcome to E3OS Workspace</h2>
            </div>
          </div>
        </div>

        {/* Apps Section */}
        <div className="Oukaujs-2">
          <div className="soika-DDOlsk">
            <h3>Apps in use</h3>
            <div className="appls-D" ref={dropdownRef}>
              {visibleAppList.map(({ name, icon, path }, idx) => (
                <Link
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(path);
                  }}
                  to={path}
                >
                  <img src={icon} alt={name} />
                  <p>{name}</p>
                </Link>
              ))}

              {/* "+X More" Button */}
              {hiddenAppList.length > 0 && (
                <div
                  className="more-apps"
                  onClick={() => setShowMore((prev) => !prev)}
                >
                  <Squares2X2Icon style={{ width: 20, height: 20 }} />
                  <p>+{hiddenAppList.length} More</p>
                </div>
              )}

              {/* Animated Dropdown */}
              <AnimatePresence>
                {showMore && (
                  <motion.div
                    className="more-apps-dropdown"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      marginTop: "8px",
                      gap: "6px",
                      background: "#fff",
                      padding: "8px",
                      borderRadius: "6px",
                      boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                    }}
                  >
                    {hiddenAppList.map(({ name, icon, path }, idx) => (
                      <a
                        href="#"
                        key={idx}
                        style={{
                          display: "flex",
                          gap: "6px",
                          alignItems: "center",
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(path);
                          setShowMore(false);
                        }}
                      >
                        <img
                          src={icon}
                          style={{ width: 20, height: 20 }}
                          alt={name}
                        />
                        <p>{name}</p>
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="RRR-SS-HHomss-TOPP">
        <div className="RRR-SS-HHomss-TOPP-Grid">
          {currentStats.map((item, index) => (
            <a href="#" className="RRR-SS-HHomss-Card" key={index}>
              <p>{item.title}</p>
              <h3>{item.value}</h3>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "2px" }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                  }}
                >
                  {item.direction === "up" ? ArrowUpIcon : ArrowDownIcon}
                  {item.change}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Graphs Section */}
      <div className="OverViewGraphs-Seec">
        <TeamMembers onMessageClick={onMessageClick} />

        <div className="OverViewGraphs-Card Gen-Boxshadow">
          <div className="OVG-Header">
            <div className="OVG-Header-L">
              <h3>Performance</h3>
            </div>
            <div className="OVG-Header-R">
              <p>
                <span>9:10 AM</span>
                <span>1m Ago</span>
              </p>
              {/* <a href="#">View report</a> */}
            </div>
          </div>
          <ProductivityChart dataSets={dataSets} />
        </div>
      </div>

      {/* <div className="RegAveTrav-Sec"> */}
        {/* <div className="RegAveTrav-Card Gen-Boxshadow"> */}
          {/* <div className="OVG-Header">
            <div className="OVG-Header-L">
              <h3>Recent Activities</h3>
            </div>
          </div>
          <div className="Gen-OOplBg-Sec custom-scroll-bar">
            <Link to="/staff" className="Gen-OOplBg-Part">
              <div className="Gen-OOplBg-Part-1">
                <span>
                  <ClockIcon />
                </span>
              </div>
              <div className="Gen-OOplBg-Part-2">
                <div>
                  <p>You have a new Task</p>
                  <h4>
                    <span>
                      <b>Date:</b> 22 Aug 2025
                    </span>
                    <span>
                      <b>Time:</b> 5:30 PM (10mins ago)
                    </span>
                  </h4>
                </div>
              </div>
            </Link>

            <Link to="/staff" className="Gen-OOplBg-Part">
              <div className="Gen-OOplBg-Part-1">
                <span>
                  <ClockIcon />
                </span>
              </div>
              <div className="Gen-OOplBg-Part-2">
                <div>
                  <p>You have a new Task</p>
                  <h4>
                    <span>
                      <b>Date:</b> 22 Aug 2025
                    </span>
                    <span>
                      <b>Time:</b> 5:30 PM (10mins ago)
                    </span>
                  </h4>
                </div>
              </div>
            </Link>

            <Link to="/staff" className="Gen-OOplBg-Part">
              <div className="Gen-OOplBg-Part-1">
                <span>
                  <ClockIcon />
                </span>
              </div>
              <div className="Gen-OOplBg-Part-2">
                <div>
                  <p>You have a new Task</p>
                  <h4>
                    <span>
                      <b>Date:</b> 22 Aug 2025
                    </span>
                    <span>
                      <b>Time:</b> 5:30 PM (10mins ago)
                    </span>
                  </h4>
                </div>
              </div>
            </Link>

            <Link to="/staff" className="Gen-OOplBg-Part">
              <div className="Gen-OOplBg-Part-1">
                <span>
                  <ClockIcon />
                </span>
              </div>
              <div className="Gen-OOplBg-Part-2">
                <div>
                  <p>You have a new Task</p>
                  <h4>
                    <span>
                      <b>Date:</b> 22 Aug 2025
                    </span>
                    <span>
                      <b>Time:</b> 5:30 PM (10mins ago)
                    </span>
                  </h4>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Home;
