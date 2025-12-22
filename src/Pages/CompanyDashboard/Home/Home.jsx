import React, { useEffect, useRef, useState } from "react";
import {
  WrenchScrewdriverIcon,
  CreditCardIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowUpIcon,
  ChartBarIcon,
  BanknotesIcon,
  ExclamationCircleIcon,
  InboxStackIcon,
  AdjustmentsVerticalIcon,
  FaceSmileIcon,
  EllipsisHorizontalIcon,
  CalendarDaysIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserGroupIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  ClockIcon as ClockSolidIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { FiLoader } from "react-icons/fi";
import { motion, useMotionValue, useSpring, useInView } from "framer-motion";

import { fetchAllInternalRequests } from "../Requests/config/apiConfig";
import { Link } from "react-router-dom";
import { fetchScheduledVisits } from "../Rostering/config/apiConfig";
import { capitalizeFirstLetter } from "../../../utils/helpers";
import { apiClient } from "../../../config";

import DefaulUser from "../../../assets/Img/memberIcon.png";
import MembImg1 from "../../../assets/Img/memberIcon1.jpg";
import MembImg2 from "../../../assets/Img/memberIcon2.jpg";
import {
  fetchUsersNoPagination,
  fetchRosteringRequests,
} from "../Employees/config/apiService";

function formatNumberWithCommas(x) {
   if (typeof x !== "number") return x;
   return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
 }

// Helper function to format time from ISO string
const formatTime = (isoString) => {
   if (!isoString) return 'N/A';
   const date = new Date(isoString);
   return date.toLocaleTimeString('en-US', {
     hour: 'numeric',
     minute: '2-digit',
     hour12: true
   });
 };

// Helper function to determine if user is currently active (clocked in but not out)
const isUserActive = (attendance) => {
   return attendance.clockInTime && !attendance.clockOutTime;
 };

// Helper function to format status for display
const formatStatus = (status) => {
   if (!status) return 'on-time';
   return status.toLowerCase().replace('_', '-');
 };

const AnimatedCounter = ({ value, prefix = "", suffix = "" }) => {
  const ref = useRef(null);
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1.4, stiffness: 70, damping: 20 });
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isInView) mv.set(value);
    const unsub = spring.on("change", (v) => setDisplay(Math.floor(v)));
    return () => unsub();
  }, [isInView, value]);

  const formattedDisplay =
    prefix === "£" ? formatNumberWithCommas(display) : display;

  return (
    <h3 ref={ref}>
      {prefix}
      {formattedDisplay}
      {suffix}
    </h3>
  );
};


// Cards Data per branch type and period
const cardsData = (
  totalVisits,
  completedVisits,
  pendingVisits,
  inProgressVisits,
  cancelledVisits,
  newVisitsCount,
  newVisitsText,
  completionRate,
  overdueVisits
) => ({
  operations: {
    "All Branches": {
      Today: [
        {
          title: "Total Visits",
          icon: <ClipboardDocumentCheckIcon />,
          value: totalVisits,
          subtitle: `${newVisitsCount} ${newVisitsText}`,
          bg: "#E0F7FA",
          color: "#00796B",
        },
        {
          title: "Completed Visits",
          icon: <CheckCircleIcon />,
          value: completedVisits,
          subtitle: `${completionRate}% visit completion rate`,
          bg: "#E8F5E9",
          color: "#388E3C",
        },
        {
          title: "Pending Visits",
          icon: <ClockIcon />,
          value: pendingVisits,
          subtitle: `${overdueVisits} visits overdue`,
          bg: "#FFF3E0",
          color: "#F57C00",
        },
        {
          title: "Active Visits",
          icon: <ClockIcon />,
          value: inProgressVisits,
          subtitle: "Visits currently in progress",
          bg: "#E0F2F1",
          color: "#00695C",
        },
        {
          title: "Cancelled Visits",
          icon: <ExclamationTriangleIcon />,
          value: cancelledVisits,
          subtitle: "Visits that have been cancelled",
          bg: "#FFEBEE",
          color: "#C62828",
        },
      ],
      "This Week": [
        {
          title: "Total Visits",
          icon: <ClipboardDocumentCheckIcon />,
          value: totalVisits,
          subtitle: `${newVisitsCount} ${newVisitsText}`,
          bg: "#E0F7FA",
          color: "#00796B",
        },
        {
          title: "Completed Visits",
          icon: <CheckCircleIcon />,
          value: completedVisits,
          subtitle: `${completionRate}% visit completion rate`,
          bg: "#E8F5E9",
          color: "#388E3C",
        },
        {
          title: "Pending Visits",
          icon: <ClockIcon />,
          value: pendingVisits,
          subtitle: `${overdueVisits} visits overdue`,
          bg: "#FFF3E0",
          color: "#F57C00",
        },
      ],
      Month: [
        {
          title: "Total Visits",
          icon: <ClipboardDocumentCheckIcon />,
          value: totalVisits,
          subtitle: `${newVisitsCount} ${newVisitsText}`,
          bg: "#E0F7FA",
          color: "#00796B",
        },
        {
          title: "Completed Visits",
          icon: <CheckCircleIcon />,
          value: completedVisits,
          subtitle: `${completionRate}% visit completion rate`,
          bg: "#E8F5E9",
          color: "#388E3C",
        },
        {
          title: "Pending Visits",
          icon: <ClockIcon />,
          value: pendingVisits,
          subtitle: `${overdueVisits} visits overdue`,
          bg: "#FFF3E0",
          color: "#F57C00",
        },
      ],
      Year: [
        {
          title: "Total Visits",
          icon: <ClipboardDocumentCheckIcon />,
          value: totalVisits,
          subtitle: `${newVisitsCount} ${newVisitsText}`,
          bg: "#E0F7FA",
          color: "#00796B",
        },
        {
          title: "Completed Visits",
          icon: <CheckCircleIcon />,
          value: completedVisits,
          subtitle: `${completionRate}% visit completion rate`,
          bg: "#E8F5E9",
          color: "#388E3C",
        },
        {
          title: "Pending Visits",
          icon: <ClockIcon />,
          value: pendingVisits,
          subtitle: `${overdueVisits} visits overdue`,
          bg: "#FFF3E0",
          color: "#F57C00",
        },
      ],
    },
    "Main Branch": {
      Today: [
        {
          title: "Total Visits",
          icon: <ClipboardDocumentCheckIcon />,
          value: totalVisits,
          subtitle: `${newVisitsCount} ${newVisitsText}`,
          bg: "#E0F7FA",
          color: "#00796B",
        },
        {
          title: "Completed Visits",
          icon: <CheckCircleIcon />,
          value: completedVisits,
          subtitle: `${completionRate}% visit completion rate`,
          bg: "#E8F5E9",
          color: "#388E3C",
        },
        {
          title: "Pending Visits",
          icon: <ClockIcon />,
          value: pendingVisits,
          subtitle: `${overdueVisits} visits overdue`,
          bg: "#FFF3E0",
          color: "#F57C00",
        },
      ],
      "This Week": [
        {
          title: "Total Visits",
          icon: <ClipboardDocumentCheckIcon />,
          value: totalVisits,
          subtitle: `${newVisitsCount} ${newVisitsText}`,
          bg: "#E0F7FA",
          color: "#00796B",
        },
        {
          title: "Completed Visits",
          icon: <CheckCircleIcon />,
          value: completedVisits,
          subtitle: `${completionRate}% visit completion rate`,
          bg: "#E8F5E9",
          color: "#388E3C",
        },
        {
          title: "Pending Visits",
          icon: <ClockIcon />,
          value: pendingVisits,
          subtitle: `${overdueVisits} visits overdue`,
          bg: "#FFF3E0",
          color: "#F57C00",
        },
      ],
      Month: [
        {
          title: "Total Visits",
          icon: <ClipboardDocumentCheckIcon />,
          value: totalVisits,
          subtitle: `${newVisitsCount} ${newVisitsText}`,
          bg: "#E0F7FA",
          color: "#00796B",
        },
        {
          title: "Completed Visits",
          icon: <CheckCircleIcon />,
          value: completedVisits,
          subtitle: `${completionRate}% visit completion rate`,
          bg: "#E8F5E9",
          color: "#388E3C",
        },
        {
          title: "Pending Visits",
          icon: <ClockIcon />,
          value: pendingVisits,
          subtitle: `${overdueVisits} visits overdue`,
          bg: "#FFF3E0",
          color: "#F57C00",
        },
      ],
      Year: [
        {
          title: "Total Visits",
          icon: <ClipboardDocumentCheckIcon />,
          value: totalVisits,
          subtitle: `${newVisitsCount} ${newVisitsText}`,
          bg: "#E0F7FA",
          color: "#00796B",
        },
        {
          title: "Completed Visits",
          icon: <CheckCircleIcon />,
          value: completedVisits,
          subtitle: `${completionRate}% visit completion rate`,
          bg: "#E8F5E9",
          color: "#388E3C",
        },
        {
          title: "Pending Visits",
          icon: <ClockIcon />,
          value: pendingVisits,
          subtitle: `${overdueVisits} visits overdue`,
          bg: "#FFF3E0",
          color: "#F57C00",
        },
      ],
    },
  },
});

// Helper function to format dates
const formatDate = (date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Calendar component
const CalendarDropdown = ({ selectedDate, onSelect, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
  const calendarRef = useRef(null);

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Generate days array
  const days = [];
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Previous month
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Next month
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="OOcalendar-dropdown" ref={calendarRef}>
      <div className="OOcalendar-header">
        <button onClick={prevMonth}>&lt;</button>
        <h4>
          {new Date(currentYear, currentMonth).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h4>
        <button onClick={nextMonth}>&gt;</button>
      </div>

      <div className="OOcalendar-weekdays">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day, i) => (
          <div key={i} className="weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="OOcalendar-days">
        {Array(firstDayOfMonth)
          .fill(null)
          .map((_, i) => (
            <div key={`empty-${i}`} className="calendar-day empty"></div>
          ))}

        {days.map((day) => {
          const isSelected =
            day === selectedDate.getDate() &&
            currentMonth === selectedDate.getMonth() &&
            currentYear === selectedDate.getFullYear();
          const isToday =
            day === new Date().getDate() &&
            currentMonth === new Date().getMonth() &&
            currentYear === new Date().getFullYear();

          return (
            <div
              key={day}
              className={`OOcalendar-day ${isSelected ? "selected" : ""} ${
                isToday ? "today" : ""
              }`}
              onClick={() => {
                const newDate = new Date(currentYear, currentMonth, day);
                onSelect(newDate);
                onClose();
              }}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Dropdown component for the action button
const ActionDropdown = ({ employeeId, isLastRow }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        aria-label="More options"
        title="More options"
        className="mmmo-BBTH-Drop"
        onClick={() => setIsOpen(!isOpen)}
      >
        <EllipsisHorizontalIcon />
      </button>
      {isOpen && (
        <motion.div
          className={`dropdown-menu ${
            isLastRow ? "last-row-dropdown" : "not-last-row-dropdown"
          }`}
          variants={dropdownVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <Link to={`/company/employees/`} onClick={() => setIsOpen(false)}>
            Profile
          </Link>
          <Link
            to={`/attendance-history/${employeeId}`}
            onClick={() => setIsOpen(false)}
          >
            History
          </Link>
        </motion.div>
      )}
    </div>
  );
};

// Admin Analytics Cards Component
const AdminAnalyticsCards = ({
  tenantUsersCount,
  tenantUsers,
  totalInternalRequests = 0,
  newThisWeekRequests = 0,
  isUsersLoading = false,
  isRequestsLoading = false,
  rosteringRequests = {},
  isRosteringLoading = false,
  totalManHours = 0,
  thisWeekManHours = 0,
  scheduledVisitsToday = 0,
  completedToday = 0,
  pendingToday = 0,
}) => {
  const activeStaffCount =
    tenantUsers?.filter((user) => user.status === "active")?.length || 0;
  const inactiveStaffCount =
    tenantUsers?.filter((user) => user.status === "inactive")?.length || 0;

  // Calculate rostering requests stats
  const totalRosteringRequests = rosteringRequests?.pagination?.total || 0;
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newRosteringThisWeek =
    rosteringRequests?.data?.filter(
      (req) => new Date(req.createdAt) >= oneWeekAgo
    ).length || 0;

  // Dummy data for the admin analytics
  const adminAnalyticsData = [
    {
      title: "Total Staff",
      icon: <UserGroupIcon />,
      value: isUsersLoading ? (
        <FiLoader
          style={{
            animation: "spin 1s linear infinite",
            margin: "0.5rem 0.3rem 0 0",
          }}
        />
      ) : (
        tenantUsersCount
      ),
      subtitle: "",
      bg: "#E5F4FF",
      color: "#0077C8",
    },
    {
      title: "Internal Requests",
      icon: <DocumentTextIcon />,
      value: isRequestsLoading ? (
        <FiLoader
          style={{
            animation: "spin 1s linear infinite",
            margin: "0.5rem 0.3rem 0 0",
          }}
        />
      ) : (
        totalInternalRequests
      ),
      subtitle: `This week: ${newThisWeekRequests} new requests`,
      bg: "#FFF5E5",
      color: "#FF9800",
    },
    {
      title: "Clients",
      icon: <BriefcaseIcon />,
      value: isRosteringLoading ? (
        <FiLoader
          style={{
            animation: "spin 1s linear infinite",
            margin: "0.5rem 0.3rem 0 0",
          }}
        />
      ) : (
        totalRosteringRequests
      ),
      subtitle: `This week: ${newRosteringThisWeek} new requests`,
      bg: "#EDF7ED",
      color: "#2E7D32",
    },
    {
      title: "Completed Man-hours",
      icon: <ClockSolidIcon />,
      value: `${totalManHours} hrs`,
      subtitle: `This week: ${thisWeekManHours} hours`,
      bg: "#ECE8FC",
      color: "#450CD5",
    },
    {
      title: "Active/Inactive Staff",
      icon: <UsersIcon />,
      value: isUsersLoading ? (
        <FiLoader
          style={{
            animation: "spin 1s linear infinite",
            margin: "0.5rem 0.3rem 0 0",
          }}
        />
      ) : (
        `${activeStaffCount}/${inactiveStaffCount}`
      ),
      subtitle: "Active vs Inactive",
      bg: "#E8FFF3",
      color: "#0FA958",
    },
    {
      title: "Scheduled Visits Today",
      icon: <CalendarIcon />,
      value: scheduledVisitsToday,
      subtitle: `${completedToday} completed, ${pendingToday} pending`,
      bg: "#FFF0F5",
      color: "#C71585",
    },
    // {
    //   title: "Reported Incidents",
    //   icon: <ExclamationTriangleIcon />,
    //   value: 7,
    //   subtitle: "This week: 2 new incidents",
    //   bg: "#FFEFEC",
    //   color: "#FF5724",
    // },
  ];

  return (
    <div className="Admin-Analytics-Sec Simp-Boxshadow">
      <div className="GHGb-MMIn-DDahs-Top">
        <div className="olikk-IOkiks">
          <h3>Admin Analytics Overview</h3>
          <p>Real-time statistics for management</p>
        </div>
      </div>

      <div className="ooilaui-Cards admin-analytics-grid">
        {adminAnalyticsData.map((card, index) => {
          let toPath = null;
          if (
            card.title === "Total Staff" ||
            card.title === "Active/Inactive Staff"
          ) {
            toPath = "/company/employees";
          } else if (card.title === "Internal Requests") {
            toPath = "/company/requests/internal-requests";
          } else if (card.title === "Clients") {
            toPath = "/company/clients";
          }

          const CardContent = (
            <div className="ooilaui-Card admin-analytics-card">
              <h4>
                {card.title}
                <span style={{ backgroundColor: card.bg, color: card.color }}>
                  {card.icon}
                </span>
              </h4>
              <h3>{card.value}</h3>
              <p>{card.subtitle}</p>
            </div>
          );

          return toPath ? (
            <Link key={index} to={toPath}>
              {CardContent}
            </Link>
          ) : (
            <div key={index}>{CardContent}</div>
          );
        })}
      </div>
    </div>
  );
};

// Component
const Home = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [branchView, setBranchView] = useState("All Branches");
  const [activePeriod, setActivePeriod] = useState("Today");
  const [selectedMonth, setSelectedMonth] = useState("Month");
  const [selectedYear, setSelectedYear] = useState("Year");
  const [periodText, setPeriodText] = useState("Today");
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAttendanceCalendar, setShowAttendanceCalendar] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date());
  const [attendanceView, setAttendanceView] = useState('Today'); // 'Today' or 'All'
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedRows, setSelectedRows] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredAttendanceData, setFilteredAttendanceData] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [jobDetails, setJobDetails] = useState([]);
  const [tenantUsers, setTenantUsers] = useState([]);
  const [tenantUsersCount, setTenantUsersCount] = useState(0);
  const [totalInternalRequests, setTotalInternalRequests] = useState(0);
  const [newThisWeekRequests, setNewThisWeekRequests] = useState(0);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [isRequestsLoading, setIsRequestsLoading] = useState(true);
  const [rosteringRequests, setRosteringRequests] = useState({});
  const [isRosteringLoading, setIsRosteringLoading] = useState(true);
  const [visits, setVisits] = useState([]);
  const [visitsLoading, setVisitsLoading] = useState(true);
  const [totalManHours, setTotalManHours] = useState(0);
  const [thisWeekManHours, setThisWeekManHours] = useState(0);
  const [scheduledVisitsToday, setScheduledVisitsToday] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const [pendingToday, setPendingToday] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));

  // Fetch job details from API
  useEffect(() => {
    const fetchAllTenantUsers = async () => {
      try {
        setIsUsersLoading(true);
        const data = await fetchUsersNoPagination();
        setTenantUsers(data || []);
        setTenantUsersCount(data?.length || 0);
        setJobDetails(data);
      } catch (error) {
      } finally {
        setIsUsersLoading(false);
      }
    };
    fetchAllTenantUsers();
  }, []);

  // Fetch internal requests statistics
  useEffect(() => {
    const fetchInternalRequestsStats = async () => {
      try {
        setIsRequestsLoading(true);
        const fetchedRequests = await fetchAllInternalRequests();
        const nonCancelled = fetchedRequests.filter(
          (req) => req.status !== "cancelled"
        );
        setTotalInternalRequests(nonCancelled.length);
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        setNewThisWeekRequests(
          nonCancelled.filter((req) => new Date(req.created_at) >= oneWeekAgo)
            .length
        );
      } catch (error) {
      } finally {
        setIsRequestsLoading(false);
      }
    };
    fetchInternalRequestsStats();
  }, []);

  // Fetch rostering requests
  useEffect(() => {
    const fetchRostering = async () => {
      try {
        setIsRosteringLoading(true);
        const data = await fetchRosteringRequests();
        setRosteringRequests(data);
      } catch (error) {
      } finally {
        setIsRosteringLoading(false);
      }
    };
    fetchRostering();
  }, []);

  // Fetch visits (for debugging: log visit details)
  useEffect(() => {
    const fetchVisits = async () => {
      try {
        setVisitsLoading(true);
        const data = await fetchScheduledVisits();
        const visitsData = data?.items || [];
        setVisits(visitsData);
      } catch (error) {
      } finally {
        setVisitsLoading(false);
      }
    };
    fetchVisits();
  }, []);

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setAttendanceLoading(true);

        // Fetch attendance data
        const attendanceResponse = await apiClient.get('/api/rostering/attendance');
        const attendanceList = Array.isArray(attendanceResponse.data) ? attendanceResponse.data : [];

        // Fetch users data
        const usersResponse = await apiClient.get('/api/user/users');
        const usersList = Array.isArray(usersResponse.data.results)
          ? usersResponse.data.results
          : Array.isArray(usersResponse.data)
          ? usersResponse.data
          : [];

        // Create a lookup map for users by email
        const usersMap = {};
        usersList.forEach(user => {
          usersMap[user.email] = user;
        });

        // Merge attendance data with user information
        const mergedData = attendanceList.map(attendance => {
          const user = usersMap[attendance.staffId] || {};
          const profile = user.profile || {};

          return {
            id: user.id || attendance.staffId,
            attendanceId: attendance.attendanceId,
            carerVisitId: attendance.carerVisitId,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || attendance.staffId,
            email: attendance.staffId,
            role: user.role || 'Unknown',
            department: profile.department || 'Not specified',
            clockIn: formatTime(attendance.clockInTime),
            clockInTime: attendance.clockInTime,
            clockInStatus: formatStatus(attendance.entryStatus),
            clockOut: formatTime(attendance.clockOutTime),
            clockOutTime: attendance.clockOutTime,
            clockOutStatus: formatStatus(attendance.exitStatus),
            remark: attendance.remark || 'No remarks',
            image: profile.profile_image_url || DefaulUser,
            active: isUserActive(attendance),
            rawAttendance: attendance,
            rawUser: user
          };
        });

        setAttendanceData(mergedData);
        setFilteredAttendanceData(mergedData);

      } catch (err) {
      } finally {
        setAttendanceLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  // Calculate total man hours and today's visits from visits
  useEffect(() => {
    if (visits.length === 0) return;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    let totalCompletedMs = 0;
    let thisWeekCompletedMs = 0;
    let scheduledToday = 0;
    let completedTodayCount = 0;
    let pendingTodayCount = 0;

    visits.forEach((visit) => {
      const visitDate = new Date(visit.startDate);

      // Check if visit is today
      if (visitDate >= todayStart && visitDate < todayEnd) {
        scheduledToday++;
        if (visit.clockInAt && visit.clockOutAt) {
          completedTodayCount++;
        } else if (!visit.clockInAt) {
          pendingTodayCount++;
        }
      }

      if (visit.clockInAt && visit.clockOutAt) {
        const clockInTime = new Date(visit.clockInAt);
        const clockOutTime = new Date(visit.clockOutAt);
        const completedWorkMs = clockOutTime - clockInTime;
        if (completedWorkMs > 0) {
          totalCompletedMs += completedWorkMs;
          // Check if visit is this week
          if (visitDate >= oneWeekAgo) {
            thisWeekCompletedMs += completedWorkMs;
          }
        }
      }
    });

    const totalHrs = totalCompletedMs / (1000 * 60 * 60);
    const thisWeekHrs = thisWeekCompletedMs / (1000 * 60 * 60);

    setTotalManHours(Math.round(totalHrs * 10) / 10);
    setThisWeekManHours(Math.round(thisWeekHrs * 10) / 10);
    setScheduledVisitsToday(scheduledToday);
    setCompletedToday(completedTodayCount);
    setPendingToday(pendingTodayCount);
  }, [visits]);

  // Function to filter visits based on period
  const getFilteredVisits = (
    visits,
    filterType,
    selectedDate,
    selectedMonth,
    selectedYear
  ) => {
    const now = new Date();
    let startDate, endDate;

    switch (filterType) {
      case "Today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        );
        break;
      case "This Week":
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startDate = new Date(
          startOfWeek.getFullYear(),
          startOfWeek.getMonth(),
          startOfWeek.getDate()
        );
        endDate = new Date(
          startOfWeek.getFullYear(),
          startOfWeek.getMonth(),
          startOfWeek.getDate() + 7
        );
        break;
      case "Calendar":
        startDate = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate()
        );
        endDate = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate() + 1
        );
        break;
      case "Month":
        let monthIndex;
        if (selectedMonth !== "Month") {
          monthIndex = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ].indexOf(selectedMonth);
        } else {
          monthIndex = now.getMonth();
        }
        startDate = new Date(now.getFullYear(), monthIndex, 1);
        endDate = new Date(now.getFullYear(), monthIndex + 1, 1);
        break;
      case "Year":
        let year;
        if (selectedYear !== "Year") {
          year = parseInt(selectedYear);
        } else {
          year = now.getFullYear();
        }
        startDate = new Date(year, 0, 1);
        endDate = new Date(year + 1, 0, 1);
        break;
      default:
        return visits;
    }

    return visits.filter((visit) => {
      const visitDate = new Date(visit.startDate);
      return visitDate >= startDate && visitDate < endDate;
    });
  };

  // Determine filter type
  let filterType = activePeriod;
  if (periodText.startsWith("Month:")) filterType = "Month";
  if (periodText.startsWith("Year:")) filterType = "Year";

  const filteredVisits = getFilteredVisits(
    visits,
    filterType,
    selectedDate,
    selectedMonth,
    selectedYear
  );

  const totalVisits = filteredVisits.length;
  const completedVisits = filteredVisits.filter(
    (visit) => visit.status === "COMPLETED"
  ).length;
  const pendingVisits = filteredVisits.filter(
    (visit) => visit.status === "SCHEDULED"
  ).length;
  const inProgressVisits = filteredVisits.filter(
    (visit) => visit.status === "IN_PROGRESS"
  ).length;
  const cancelledVisits = filteredVisits.filter(
    (visit) => visit.status === "CANCELLED"
  ).length;

  // Calculate additional metrics
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const newVisitsThisWeek = visits.filter(
    (visit) => new Date(visit.startDate) >= oneWeekAgo
  ).length;
  const newVisitsToday = visits.filter(
    (visit) => new Date(visit.startDate) >= oneDayAgo
  ).length;
  const completionRate =
    totalVisits > 0 ? Math.round((completedVisits / totalVisits) * 100) : 0;
  const overdueVisits = filteredVisits.filter(
    (visit) =>
      visit.status !== "COMPLETED" &&
      visit.status !== "CANCELLED" &&
      new Date(visit.endDate) < now
  ).length;

  // Determine subtitle text based on filter type
  let newVisitsText = "new visits this week";
  let newVisitsCount = newVisitsThisWeek;
  if (filterType === "Today") {
    newVisitsText = "new visits today";
    newVisitsCount = newVisitsToday;
  } else if (filterType === "This Week") {
    newVisitsText = "new visits this week";
    newVisitsCount = newVisitsThisWeek;
  } else if (filterType === "Calendar") {
    newVisitsText = "new visits on selected date";
    // For calendar, perhaps count visits on selectedDate
    const selectedDayStart = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );
    const selectedDayEnd = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate() + 1
    );
    newVisitsCount = visits.filter((visit) => {
      const visitDate = new Date(visit.startDate);
      return visitDate >= selectedDayStart && visitDate < selectedDayEnd;
    }).length;
  } else if (filterType === "Month") {
    newVisitsText = "new visits this month";
    const monthStart =
      selectedMonth !== "Month"
        ? new Date(
            now.getFullYear(),
            [
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ].indexOf(selectedMonth),
            1
          )
        : new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth() + 1,
      1
    );
    newVisitsCount = visits.filter((visit) => {
      const visitDate = new Date(visit.startDate);
      return visitDate >= monthStart && visitDate < monthEnd;
    }).length;
  } else if (filterType === "Year") {
    newVisitsText = "new visits this year";
    const year =
      selectedYear !== "Year" ? parseInt(selectedYear) : now.getFullYear();
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year + 1, 0, 1);
    newVisitsCount = visits.filter((visit) => {
      const visitDate = new Date(visit.startDate);
      return visitDate >= yearStart && visitDate < yearEnd;
    }).length;
  }

  const getCurrentPeriodType = () => {
    if (activePeriod === "Today" || activePeriod === "This Week") {
      return activePeriod;
    } else if (selectedMonth !== "Month") {
      return "Month";
    } else if (selectedYear !== "Year") {
      return "Year";
    }
    return "Today";
  };

  const currentPeriod = getCurrentPeriodType();

  // Pagination calculations
  const totalPages = Math.ceil(filteredAttendanceData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredAttendanceData.slice(startIndex, endIndex);

  // Handle page navigation
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    setFilteredAttendanceData(
      filteredAttendanceData.filter(
        (employee) => !selectedRows.includes(employee.id)
      )
    );
    setSelectedRows([]);
    setCurrentPage(1); // Reset to first page after deletion
  };

  // Handle row selection
  const handleRowSelection = (employeeId) => {
    setSelectedRows((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  // Update filtered data when branchView or attendanceDate changes
  useEffect(() => {
    if (attendanceData.length === 0) return;

    let filtered = [];
    if (attendanceView === 'Today') {
      const selectedDateStart = new Date(attendanceDate);
      selectedDateStart.setHours(0, 0, 0, 0);
      const selectedDateEnd = new Date(attendanceDate);
      selectedDateEnd.setHours(23, 59, 59, 999);
      filtered = attendanceData.filter(attendance => {
        const attDate = new Date(attendance.clockInTime || attendance.clockOutTime);
        return attDate >= selectedDateStart && attDate <= selectedDateEnd;
      });
    } else {
      filtered = attendanceData;
    }
    setFilteredAttendanceData(filtered);
    setCurrentPage(1);
    setSelectedRows([]);
  }, [branchView, attendanceDate, attendanceData, attendanceView]);

  const handlePeriodSelect = (period) => {
    setActivePeriod(period);
    setPeriodText(period);
    setSelectedMonth("Month");
    setSelectedYear("Year");
    setShowCalendar(false);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setPeriodText(formatDate(date));
    setActivePeriod("Today");
    setShowCalendar(false);
  };

  const handleAttendanceDateSelect = (date) => {
    setAttendanceDate(date);
    setShowAttendanceCalendar(false);
  };

  const handleMonthSelect = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    setActivePeriod(null);
    setPeriodText(`Month: ${month}`);
    setShowCalendar(false);
  };

  const handleYearSelect = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    setActivePeriod(null);
    setPeriodText(`Year: ${year}`);
    setShowCalendar(false);
  };

  return (
    <div className="MM-Dash-HOoma">
      
      <div className="Toop-DDag-SEc">
        <div className="Toop-DDag-1">
          <h3>
            {user?.first_name} {user?.last_name}
            <span>{capitalizeFirstLetter(user?.role)}</span>
          </h3>
        </div>
        <div className="Toop-DDag-2">
          <div className="Toop-DDag-2-Main">
            {/* <h4>{capitalizeFirstLetter(user?.tenant)}</h4> */}
            {/* <p>Central Hub</p> */}
          </div>
        </div>
      </div>

      {/* Add the Admin Analytics Section */}
      <AdminAnalyticsCards
        tenantUsersCount={tenantUsersCount}
        tenantUsers={tenantUsers}
        totalInternalRequests={totalInternalRequests}
        newThisWeekRequests={newThisWeekRequests}
        isUsersLoading={isUsersLoading}
        isRequestsLoading={isRequestsLoading}
        rosteringRequests={rosteringRequests}
        isRosteringLoading={isRosteringLoading}
        totalManHours={totalManHours}
        thisWeekManHours={thisWeekManHours}
        scheduledVisitsToday={scheduledVisitsToday}
        completedToday={completedToday}
        pendingToday={pendingToday}
      />

      <div className="GHGb-MMIn-DDahs-Sec Simp-Boxshadow">
        <div className="GHGb-MMIn-DDahs-Top">
          <div className="olikk-IOkiks">
            <h3>Operation Statistics</h3>
            <p>{periodText}</p>
          </div>
          <ul className="period-controls">
            <li
              className={activePeriod === "Today" ? "active-GGTba-LI" : ""}
              onClick={() => handlePeriodSelect("Today")}
            >
              Today
            </li>
            <li
              className={activePeriod === "This Week" ? "active-GGTba-LI" : ""}
              onClick={() => handlePeriodSelect("This Week")}
            >
              This Week
            </li>
            <li
              className={activePeriod === "Calendar" ? "active-GGTba-LI" : ""}
              onClick={() => setShowCalendar(!showCalendar)}
              style={{ position: "relative" }}
            >
              <CalendarDaysIcon /> Calendar
              {showCalendar && (
                <div
                  className="OOcalendar-container"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    zIndex: 100,
                  }}
                >
                  <CalendarDropdown
                    selectedDate={selectedDate}
                    onSelect={handleDateSelect}
                    onClose={() => setShowCalendar(false)}
                  />
                </div>
              )}
            </li>
            <select value={selectedMonth} onChange={handleMonthSelect}>
              <option value="Month">Month</option>
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </select>
            <select value={selectedYear} onChange={handleYearSelect}>
              <option value="Year">Year</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
              <option value="2029">2029</option>
              <option value="2030">2030</option>
            </select>
          </ul>
        </div>

        <div className="ooilaui-Cards">
          {cardsData(
            totalVisits,
            completedVisits,
            pendingVisits,
            inProgressVisits,
            cancelledVisits,
            newVisitsCount,
            newVisitsText,
            completionRate,
            overdueVisits
          ).operations[branchView][currentPeriod].map((card, index) => {
            let toPath = `/company/visits`;
            if (card.title === "Completed Visits")
              toPath = `/company/rostering/roster`;
            else if (card.title === "Pending Visits")
              toPath = `/company/rostering/roster`;
            else if (card.title === "Active Visits")
              toPath = `/company/rostering/roster`;
            else if (card.title === "Cancelled Visits")
              toPath = `/company/rostering/roster`;
            return (
              <Link key={index} to={toPath} className="ooilaui-Card">
                <h4>
                  {card.title}
                  <span style={{ backgroundColor: card.bg, color: card.color }}>
                    {card.icon}
                  </span>
                </h4>
                {visitsLoading ? (
                  <FiLoader
                    style={{
                      animation: "spin 1s linear infinite",
                      margin: "0.5rem 0.3rem 0 0",
                    }}
                  />
                ) : (
                  <AnimatedCounter
                    value={card.value}
                    prefix={card.prefix}
                    suffix={card.suffix}
                  />
                )}
                <p>
                  <ArrowUpIcon /> {card.subtitle}
                </p>
              </Link>
            );
          })}
        </div>

 
      </div>

      <div className="Attendd-Sec Simp-Boxshadow">
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              borderRadius: 8,
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              border: "1px solid #e0e0e0",
              background: "#f8f9fa",
            }}
          >
            <button
              onClick={() => setAttendanceView("Today")}
              style={{
                padding: "8px 20px",
                border: "none",
                background:
                  attendanceView === "Today" ? "#7226ff" : "transparent",
                color: attendanceView === "Today" ? "#fff" : "#333",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.2s",
                outline: "none",
                borderRight: "1px solid #e0e0e0",
                fontSize: 15,
              }}
            >
              Show Today
            </button>
            <button
              onClick={() => setAttendanceView("All")}
              style={{
                padding: "8px 20px",
                border: "none",
                background:
                  attendanceView === "All" ? "#7226ff" : "transparent",
                color: attendanceView === "All" ? "#fff" : "#333",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.2s",
                outline: "none",
                fontSize: 15,
              }}
            >
              Show All Records
            </button>
          </div>
        </div>
        <div className="GHGb-MMIn-DDahs-Top">
          <div className="olikk-IOkiks">
            <h3>Attendance - {formatDate(attendanceDate)}</h3>
          </div>
          <div className="olikk-IOkiks olkk-Hnn">
            <h3>{branchView}</h3>
            <select
              value={branchView}
              onChange={(e) => setBranchView(e.target.value)}
              className="BranchSelectDropdown"
            >
              <option value="All Branches">All Branches</option>
              <option value="Main Branch">Main Branch</option>
            </select>
            <ul className="period-controls">
              <li
                style={{ position: "relative" }}
                onClick={() =>
                  setShowAttendanceCalendar(!showAttendanceCalendar)
                }
              >
                <CalendarDaysIcon /> Calendar
                {showAttendanceCalendar && (
                  <div
                    className="OOcalendar-container"
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      zIndex: 100,
                    }}
                  >
                    <CalendarDropdown
                      selectedDate={attendanceDate}
                      onSelect={handleAttendanceDateSelect}
                      onClose={() => setShowAttendanceCalendar(false)}
                    />
                  </div>
                )}
              </li>
            </ul>
          </div>
        </div>

        <h2>Live Attendance Today</h2>
        <br />
        <div className="table-container">
          <table className="Gen-Sys-table OIk-TTTatgs">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.length === paginatedData.length &&
                      paginatedData.length > 0
                    }
                    onChange={() => {
                      if (selectedRows.length === paginatedData.length) {
                        setSelectedRows([]);
                      } else {
                        setSelectedRows(
                          paginatedData.map((employee) => employee.id)
                        );
                      }
                    }}
                  />
                </th>
                <th>S/N</th>
                <th>ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>Clock In Time</th>
                <th>Clock Out Time</th>
                <th>Remark</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {attendanceLoading ? (
                <tr>
                  <td
                    colSpan={10}
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    Loading attendance data...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    No attendance records found
                  </td>
                </tr>
              ) : (
                paginatedData.map((employee, index) => (
                  <tr key={employee.attendanceId}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(employee.id)}
                        onChange={() => handleRowSelection(employee.id)}
                      />
                    </td>
                    <td>{startIndex + index + 1}</td>
                    <td>{employee.id}</td>
                    <td>
                      <div
                        className="Proliks-Seec"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setShowEmployeeModal(true);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="Proliks-1">
                          <span>
                            <img src={employee.image} alt={employee.name} />
                            <i
                              className={
                                employee.active
                                  ? "active-AttDnc"
                                  : "In-active-AttDnc"
                              }
                              aria-label={
                                employee.active
                                  ? "Active employee"
                                  : "Inactive employee"
                              }
                            ></i>
                          </span>
                        </div>
                        <div className="Proliks-2">
                          <div>
                            <h4>{employee.name}</h4>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{employee.role}</td>
                    <td>{employee.department}</td>
                    <td>
                      <div className="DDa-Statuss">
                        <p>{employee.clockIn}</p>
                        <span className={employee.clockInStatus}>
                          {employee.clockInStatus.replace("-", " ")}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="DDa-Statuss">
                        <p>{employee.clockOut}</p>
                        <span className={employee.clockOutStatus}>
                          {employee.clockOutStatus.replace("-", " ")}
                        </span>
                      </div>
                    </td>
                    <td className="remack-SmmmnRy">
                      <span>{employee.remark}</span>
                    </td>
                    <td>
                      <ActionDropdown
                        employeeId={employee.id}
                        isLastRow={index === paginatedData.length - 1}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* <div className="pagination-section">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleRowsPerPageChange}
              selectedCount={selectedRows.length}
              onBulkDelete={handleBulkDelete}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
            />
          </div> */}
        </div>
      </div>

      {/* Employee Details Modal */}

      {showEmployeeModal && selectedEmployee && (
        <div
          className="modal-overlay"
          onClick={() => setShowEmployeeModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="employee-header-info">
                <img
                  src={selectedEmployee.image}
                  alt={selectedEmployee.name}
                  className="modal-employee-image"
                />
                <div>
                  <h3>{selectedEmployee.name}</h3>
                  <p>
                    {selectedEmployee.role} - {selectedEmployee.department}
                  </p>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setShowEmployeeModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="attendance-info">
                <h4>Today's Attendance</h4>
                <div className="time-info">
                  <div className="time-block">
                    <span className="time-label">Clock In</span>
                    <span className="time-value">
                      {selectedEmployee.clockIn}
                    </span>
                    <small
                      className={`status ${selectedEmployee.clockInStatus}`}
                    >
                      {selectedEmployee.clockInStatus.replace("-", " ")}
                    </small>
                  </div>
                  <div className="time-block">
                    <span className="time-label">Clock Out</span>
                    <span className="time-value">
                      {selectedEmployee.clockOut}
                    </span>
                    <span
                      className={`status ${selectedEmployee.clockOutStatus}`}
                    >
                      {selectedEmployee.clockOutStatus.replace("-", " ")}
                    </span>
                  </div>
                </div>

                <div className="employee-stats">
                  <div className="stat-item">
                    <span className="stat-label">Status</span>
                    <span
                      className={`stat-value ${
                        selectedEmployee.active ? "active" : "inactive"
                      }`}
                    >
                      {selectedEmployee.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Remark</span>
                    <span className="stat-value">
                      {selectedEmployee.remark}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// PaginationControls Component
// const PaginationControls = ({
//   currentPage,
//   totalPages,
//   rowsPerPage,
//   onRowsPerPageChange,
//   selectedCount,
//   onBulkDelete,
//   onPrevPage,
//   onNextPage,
// }) => (
//   <div className="pagination-controls">
//     <div className="Dash-OO-Boas-foot">
//       <div className="Dash-OO-Boas-foot-1">
//         <div className="items-per-page">
//           <p>Number of rows:</p>
//           <select
//             className="form-select"
//             value={rowsPerPage}
//             onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
//           >
//             <option value={5}>5</option>
//             <option value={10}>10</option>
//             <option value={20}>20</option>
//             <option value={50}>50</option>
//           </select>
//         </div>
//       </div>
//     </div>

//     <div className="page-navigation">
//       <span className="page-info">
//         Page {currentPage} of {totalPages}
//       </span>

//       <div className="page-navigation-Btns">
//         <button
//           className="page-button"
//           onClick={onPrevPage}
//           disabled={currentPage === 1}
//         >
//           <ChevronLeftIcon className="h-5 w-5" />
//         </button>
//         <button
//           className="page-button"
//           onClick={onNextPage}
//           disabled={currentPage === totalPages}
//         >
//           <ChevronRightIcon className="h-5 w-5" />
//         </button>
//       </div>
//     </div>
//   </div>
// );

export default Home;
