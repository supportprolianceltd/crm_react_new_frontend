import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { FiMoreVertical, FiArrowLeft } from "react-icons/fi";
import { TbMoodEmpty } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/solid";
import SideNavBar from "../Home/SideNavBar";
import "../../CompanyDashboard/Employees/styles/styles.css";
import FilterOptions from "../../../components/FilterOptions/FilterOptions";
import SortOptions from "../../../components/SortOptions/SortOptions";
import "../../../components/Table/styles.css";
import { fetchUsersNoPagination } from "./config/apiService";
import { fetchPublishedRequisitionsWithShortlisted } from "../Recruitment/ApiService";
import StatusBadge from "../../../components/StatusBadge";
import AnimatedCounter from "../../../components/AnimatedCounter";
import Table from "../../../components/Table/Table";
import DeleteUserModal from "./modals/DeleteUserModal";
import ManageUserAppPermissionsModal from "./modals/ManageUserAppPermissionsModal";
import ResetPasswordModal from "./modals/ResetPasswordModal";
import ChangeStatusModal from "./modals/ChangeStatusModal";
import { normalizeText } from "../../../utils/helpers";
import PendingEmployeesListView from "./views/PendingEmployeesListView";
import EmployeeDetailsView from "./views/EmployeeDetailsView";
import BulkUploadEmployees from "./components/steps/BulkUploadEmployees";

// Helper function to calculate percentage change
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const EmployeesListPage = () => {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser.id;
  const currentUserRole = currentUser.role;

  const [searchTerm, setSearchTerm] = useState("");
  const [shrinkNav, setShrinkNav] = useState(false);
  const [showPendingView, setShowPendingView] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const navigate = useNavigate();
  const [allEmployees, setAllEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [activePopup, setActivePopup] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedEmployeeForModal, setSelectedEmployeeForModal] =
    useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isManageAppPermissionsModalOpen, setIsManageAppPermissionsModalOpen] =
    useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);
  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);

  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

  // Track previous counts for calculating percentage changes
  const [previousStats, setPreviousStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
  });

  const pageSize = 50;

  const isHRApp = window.location.pathname.includes("hr");
  const isRecruitmentApp = window.location.pathname.includes("recruitment");

  // console.log(isHRApp);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalEmployees = allEmployees.length;
    const activeEmployees =
      allEmployees.length > 0
        ? allEmployees.filter((emp) => emp.status === "active").length
        : 0;
    const inactiveEmployees =
      allEmployees.length > 0
        ? allEmployees.filter((emp) => emp.status === "inactive").length
        : 0;
    const pendingEmployees = pendingApplications.length;

    return {
      total: totalEmployees,
      active: activeEmployees,
      inactive: inactiveEmployees,
      pending: pendingEmployees,
    };
  }, [allEmployees, pendingApplications]);

  // Calculate percentage changes
  const percentageChanges = useMemo(() => {
    return {
      total: calculatePercentageChange(statistics.total, previousStats.total),
      active: calculatePercentageChange(
        statistics.active,
        previousStats.active
      ),
      inactive: calculatePercentageChange(
        statistics.inactive,
        previousStats.inactive
      ),
      pending: calculatePercentageChange(
        statistics.pending,
        previousStats.pending
      ),
    };
  }, [statistics, previousStats]);

  // Fetch pending applications
  const fetchPendingApplications = useCallback(async () => {
    try {
      const savedStats = localStorage.getItem("previousEmployeeStats");
      if (savedStats) {
        setPreviousStats(JSON.parse(savedStats));
      }

      const response = await fetchPublishedRequisitionsWithShortlisted();
      if (!response) {
        setPendingApplications([]);
        return;
      }

      // Filter requisitions that have compliance_completed applications
      const validReqs = response
        .map((reqItem) => {
          const req = reqItem.job_requisition;
          const eligibleApps =
            reqItem.progressed_applications?.filter(
              (app) => app.status === "compliance_completed"
            ) || [];

          return eligibleApps.length > 0
            ? {
                ...req,
                eligible_applications: eligibleApps,
                eligible_count: eligibleApps.length,
              }
            : null;
        })
        .filter(Boolean);

      const allApplications = validReqs.map((req) => {
        return req.eligible_applications.map((app) => ({
          id: app.id,
          full_name: app.full_name,
          email: app.email,
          phone: normalizeText(app.phone),
          date_of_birth: app.date_of_birth,
          qualification: app.qualification,
          knowledge_skill: app.knowledge_skill,
          documents: app.documents,
          compliance_status: app.compliance_status,
          job_requisition_id: app.job_requisition_id,
          source: app.source,
          application_date: app.applied_at,
          current_stage: app.current_stage,
          status: app.status,
          screening_score: app.screening_score,
          role: req.title,
          job_location: req.job_location,
          interview_location: req.interview_location,
          updated_at: app.updated_at,
          applicant: {
            first_name: app.full_name
              ? app.full_name.split(" ").slice(0, -1).join(" ")
              : "",
            last_name: app.full_name
              ? app.full_name.split(" ").slice(-1)[0]
              : "",
            profile_picture: null,
          },
        }));
      });
      const flatPending = allApplications.flat();
      setPendingApplications(flatPending);
    } catch (error) {
      console.error("Error fetching pending applications:", error);
      setPendingApplications([]);
    }
  }, []);

  // Client-side pagination: we'll load the full list into `allEmployees`

  const totalPages = useMemo(() => {
    const count = filteredEmployees.length;
    return Math.max(1, Math.ceil(count / pageSize));
  }, [filteredEmployees.length, pageSize]);

  // Handle page change (client-side)
  const handlePageChange = useCallback(
    (page) => {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
    },
    [totalPages]
  );

  useEffect(() => {
    const initData = async () => {
      // Load full list first so details use it as source-of-truth
      try {
        setIsLoading(true);
        const allResponse = await fetchUsersNoPagination();
        const sortedAll = allResponse.sort(
          (a, b) => new Date(b.created_at || b.id) - new Date(a.created_at || a.id)
        );
        setAllEmployees(sortedAll);
        setFilteredEmployees(sortedAll);
      } catch (error) {
        console.error("Error fetching all employees for stats:", error);
      }
      setIsLoading(false);
    };
    initData();
  }, []);

  // Store previous stats
  useEffect(() => {
    return () => {
      localStorage.setItem("previousEmployeeStats", JSON.stringify(statistics));
    };
  }, [statistics]);

  const togglePopup = useCallback(
    (id, e) => {
      e.stopPropagation();
      setActivePopup(activePopup === id ? null : id);
    },
    [activePopup]
  );

  const closePopups = useCallback(() => {
    setActivePopup(null);
  }, []);

  const handleRowClick = useCallback(
    (employeeId) => {
      const emp = allEmployees.find((e) => e.id === employeeId);
      if (!emp) return;
      setSelectedEmployee(emp);
      setShowDetails(true);
    },
    [allEmployees]
  );

  const handleUpdateSuccess = useCallback(
    (updatedUser) => {
      setAllEmployees((prevAll) => {
        const updatedAll = prevAll.map((emp) =>
          emp.id === updatedUser.id ? updatedUser : emp
        );
        if (isSearching && searchTerm.trim()) {
          const lowerTerm = searchTerm.toLowerCase();
          const filtered = updatedAll.filter(
            (emp) =>
              emp.first_name?.toLowerCase().includes(lowerTerm) ||
              emp.last_name?.toLowerCase().includes(lowerTerm) ||
              emp.email?.toLowerCase().includes(lowerTerm) ||
              emp.role?.toLowerCase().includes(lowerTerm) ||
              emp.job_role?.toLowerCase().includes(lowerTerm)
          );
          setFilteredEmployees(filtered);
        } else {
          setFilteredEmployees(updatedAll);
        }
        return updatedAll;
      });
    },
    [isSearching, searchTerm]
  );

  const handleActionClick = useCallback(
    async (action, employee, e) => {
      e.stopPropagation();
      closePopups();
      switch (action) {
        case "view":
          handleRowClick(employee.id);
          break;
        // case "manage":
        //   setSelectedEmployeeForModal(employee);
        //   setIsManageAppPermissionsModalOpen(true);
        //   break;
        case "status":
          setSelectedEmployeeForModal(employee);
          setIsChangeStatusModalOpen(true);
          break;
        case "delete":
          setSelectedEmployeeForModal(employee);
          setIsDeleteModalOpen(true);
          break;
        case "reset":
          setSelectedEmployeeForModal(employee);
          setIsResetPasswordModalOpen(true);
          break;
        default:
          break;
      }
    },
    [closePopups, handleRowClick]
  );

  const capitalizeRole = useCallback((role) => {
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : "";
  }, []);

  const handleEmployeeUpdate = useCallback(
    (id, updatedEmp) => {
      setAllEmployees((prev) => {
        const updatedAll = prev.map((e) => (e.id === id ? updatedEmp : e));
        setFilteredEmployees((_) => updatedAll);
        return updatedAll;
      });
    },
    []
  );

  const tableData = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    const dataToMap = filteredEmployees.slice(startIdx, startIdx + pageSize);
    const serialStart = startIdx + 1;
    return dataToMap.map((emp, index) => ({
      ...emp,
      serialNumber: serialStart + index,
    }));
  }, [filteredEmployees, currentPage, pageSize]);

  const tableColumnsEmployees = useMemo(
    () => [
      {
        key: "serialNumber",
        header: "S/N",
        render: (employee) => employee.serialNumber,
      },
      {
        key: "employeeId",
        header: "Employee ID",
        render: (employee) => employee?.profile?.employee_id,
      },
      {
        key: "name",
        header: "Name",
        render: (employee) => {
          const initials = `${employee.first_name?.charAt(0) || ""}${
            employee.last_name?.charAt(0) || ""
          }`.toUpperCase();
          return (
            <div className="employee-name-container">
              {employee?.profile?.profile_image_url ? (
                <img
                  src={employee?.profile?.profile_image_url}
                  alt={`${employee.first_name} ${employee.last_name}`}
                  className="employee-profile-image"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="employee-initials"
                style={{
                  display: employee?.profile?.profile_image_url
                    ? "none"
                    : "flex",
                }}
              >
                {initials}
              </div>
              <span>{`${employee.first_name} ${employee.last_name}`}</span>
            </div>
          );
        },
      },
      {
        key: "email",
        header: "Email",
      },
      {
        key: "role",
        header: "Access Role",
        render: (employee) => normalizeText(employee.role),
      },
      {
        key: "job_role",
        header: "Job Role",
        render: (employee) =>
          normalizeText(employee?.profile?.employment_details[0]?.job_role),
      },
      {
        key: "employee_status",
        header: "Employee Status",
        render: (employee) => <StatusBadge status={employee.status} />,
      },
      {
        key: "actions",
        header: "Actions",
        render: (employee) => (
          <div className="actions-cell">
            <div className="actions-container">
              <motion.button
                className="actions-button"
                onClick={(e) => togglePopup(employee.id, e)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiMoreVertical />
              </motion.button>
              <AnimatePresence>
                {activePopup === employee.id && (
                  <motion.div
                    className="actions-popup"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <motion.button
                      onClick={(e) => handleActionClick("view", employee, e)}
                      whileHover={{ x: 5 }}
                    >
                      View User
                    </motion.button>
                    {/* <motion.button
                      onClick={(e) => handleActionClick("manage", employee, e)}
                      whileHover={{ x: 5 }}
                    >
                      Manage App Permissions
                    </motion.button> */}

                    <motion.button
                      onClick={(e) => handleActionClick("status", employee, e)}
                      whileHover={{ x: 5 }}
                      style={{ color: "#e59f3eff" }}
                    >
                      {employee.status === "active" ? "Make Inactive" : "Make Active"}
                    </motion.button>

                    <motion.button
                      onClick={(e) => handleActionClick("reset", employee, e)}
                      whileHover={{ x: 5 }}
                    >
                      Reset Password
                    </motion.button>

                    {currentUserRole === "root-admin" && (
                      <motion.button
                        onClick={(e) =>
                          handleActionClick("delete", employee, e)
                        }
                        whileHover={{ x: 5 }}
                        style={{ color: "#e53e3e" }}
                      >
                        Delete User
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ),
      },
    ],
    [activePopup, togglePopup, handleActionClick, capitalizeRole]
  );

  const filterOptions = useMemo(
    () => [
      {
        value: "status",
        label: "Status",
        subOptions: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ],
        isCheckbox: true,
      },
      // {
      //   value: "role",
      //   label: "Role",
      //   subOptions: [
      //     { value: "admin", label: "Admin" },
      //     { value: "staff", label: "Staff" },
      //   ],
      //   isCheckbox: true,
      // },
    ],
    []
  );

  const sortOptionsEmployees = useMemo(
    () => [
      { value: "name-asc", label: "Name (A-Z)" },
      { value: "name-desc", label: "Name (Z-A)" },
      { value: "role-asc", label: "Role (A-Z)" },
      { value: "role-desc", label: "Role (Z-A)" },
    ],
    []
  );

  const handleSearch = useCallback(
    (term) => {
      setSearchTerm(term);
      if (!term.trim()) {
        setIsSearching(false);
        setFilteredEmployees(allEmployees);
        setCurrentPage(1);
        return;
      }
      if (allEmployees.length === 0) return;
      setIsSearching(true);
      const lowerTerm = term.toLowerCase();
      const filtered = allEmployees.filter(
        (emp) =>
          emp.first_name?.toLowerCase().includes(lowerTerm) ||
          emp.last_name?.toLowerCase().includes(lowerTerm) ||
          emp.email?.toLowerCase().includes(lowerTerm) ||
          emp.role?.toLowerCase().includes(lowerTerm) ||
          emp.job_role?.toLowerCase().includes(lowerTerm)
      );
      setFilteredEmployees(filtered);
      setCurrentPage(1);
    },
    [allEmployees]
  );


  const handleFilterChange = useCallback(
    (filterType, selectedValues) => {
      const baseEmployees = isSearching ? filteredEmployees : allEmployees;
      let filtered = [...baseEmployees];
      if (filterType === "status" && selectedValues.length > 0) {
        filtered = filtered.filter((emp) => {
          if (selectedValues.includes("active") && emp.status === "active") {
            return true;
          }
          if (
            selectedValues.includes("inactive") &&
            emp.status === "inactive"
          ) {
            return true;
          }
          return false;
        });
      }
      if (filterType === "role" && selectedValues.length > 0) {
        filtered = filtered.filter((emp) =>
          selectedValues.includes(emp.role.toLowerCase())
        );
      }
      setFilteredEmployees(filtered);
      setCurrentPage(1);
    },
    [allEmployees, filteredEmployees, isSearching]
  );

  const handleBulkUploadSuccess = (title, message) => {
    setModalType("success");
    setModalTitle(title);
    setModalMessage(message);
    setShowStatusModal(true);
  };
  const handleBulkUploadError = (title, message) => {
    setModalType("error");
    setModalTitle(title);
    setModalMessage(message);
    setShowStatusModal(true);
  };

  const handleSortChange = useCallback(
    (value) => {
      const base = isSearching ? [...filteredEmployees] : [...allEmployees];
      let sorted = base;
      switch (value) {
        case "name-asc":
          sorted.sort((a, b) =>
            `${a.first_name} ${a.last_name}`.localeCompare(
              `${b.first_name} ${b.last_name}`
            )
          );
          break;
        case "name-desc":
          sorted.sort((a, b) =>
            `${b.first_name} ${b.last_name}`.localeCompare(
              `${a.first_name} ${a.last_name}`
            )
          );
          break;
        case "role-asc":
          sorted.sort((a, b) => a.role.localeCompare(b.role));
          break;
        case "role-desc":
          sorted.sort((a, b) => b.role.localeCompare(a.role));
          break;
        default:
          break;
      }
      setFilteredEmployees(sorted);
    },
    [filteredEmployees, allEmployees, isSearching]
  );

  const handleDeleteSuccess = useCallback(() => {
    setAllEmployees((prev) => {
      const updatedAll = prev.filter((emp) => emp.id !== selectedEmployeeForModal?.id);
      if (isSearching && searchTerm.trim()) {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = updatedAll.filter(
          (emp) =>
            emp.first_name?.toLowerCase().includes(lowerTerm) ||
            emp.last_name?.toLowerCase().includes(lowerTerm) ||
            emp.email?.toLowerCase().includes(lowerTerm) ||
            emp.role?.toLowerCase().includes(lowerTerm) ||
            emp.job_role?.toLowerCase().includes(lowerTerm)
        );
        setFilteredEmployees(filtered);
      } else {
        setFilteredEmployees(updatedAll);
      }
      return updatedAll;
    });
    setIsDeleteModalOpen(false);
  }, [selectedEmployeeForModal, isSearching, searchTerm]);

  const formatPercentage = useCallback((value) => {
    if (value === 0) return "0% this week";
    const direction = value > 0 ? "up" : "down";
    const absValue = Math.abs(value).toFixed(1);
    return `${absValue}% ${direction} this week`;
  }, []);

  const statisticsCards = useMemo(() => {
    return [
      {
        title: "Total Employees",
        count: statistics.total,
        className: "total",
        percentage: percentageChanges.total,
        onClick: null,
      },
      {
        title: "Active Employees",
        count: statistics.active,
        className: "active",
        percentage: percentageChanges.active,
        onClick: null,
      },
      {
        title: "Inactive Employees",
        count: statistics.inactive,
        className: "inactive",
        percentage: percentageChanges.inactive,
        onClick: null,
      },
      {
        title: "Pending Employees",
        count: statistics.pending,
        className: "pending",
        percentage: percentageChanges.pending,
        onClick: () => setShowPendingView(true),
      },
    ].map((card, idx) => (
      <motion.div
        key={idx}
        className={`employees-list-statistics-card ${card.className}`}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
        onClick={card.onClick}
        style={card.onClick ? { cursor: "pointer" } : {}}
      >
        <h3 className="employees-list-statistics-title">{card.title}</h3>
        <p className="employees-list-statistics-count">
          <AnimatedCounter value={card.count} />
        </p>
        <div
          className={`requests-status-percentage ${
            card.percentage > 0
              ? "positive"
              : card.percentage < 0
              ? "negative"
              : "neutral"
          }`}
        >
          <span
            className={
              card.percentage > 0
                ? "triangle-up"
                : card.percentage < 0
                ? "triangle-down"
                : ""
            }
          >
            {card.percentage > 0 ? "▲" : card.percentage < 0 ? "▼" : ""}
          </span>
          <span>{formatPercentage(card.percentage)}</span>
        </div>
      </motion.div>
    ));
  }, [statistics, percentageChanges, formatPercentage]);

  // Main JSX
  return !isHRApp && !isRecruitmentApp ? (
    <motion.div
      className={`DB-Envt ${shrinkNav ? "ShrinkNav" : ""}`}
      onClick={closePopups}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SideNavBar setShrinkNav={setShrinkNav} />
      <div className="Main-DB-Envt">
        <div className="DB-Envt-Container">
          <motion.div
            className="employees-list-page"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div
              className="employees-list-header"
              style={{ display: "flex", alignItems: "center" }}
            >
              {showPendingView && (
                <button
                  className="back-button"
                  onClick={() => setShowPendingView(false)}
                >
                  <FiArrowLeft size={16} />
                  Back
                </button>
              )}
              <div style={{ flex: 1 }}>
                <h1 className="employees-list-title">
                  {showPendingView ? "Pending Employees" : "Employees"}
                </h1>
                <p className="employees-list-description">
                  {showPendingView
                    ? "View and manage applicants ready for employee creation"
                    : "View and manage all registered employees and their details"}
                </p>
              </div>
              {!showPendingView && !showDetails && (
                <div className="employees-list-header-action">
                  <span
                    className="add-client-button"
                    onClick={() => setShowBulkUploadModal(true)}
                  >
                    <p>Bulk upload</p>
                  </span>

                  <motion.button
                    className="add-employee-button"
                    onClick={() =>
                      navigate(
                        isHRApp
                          ? "/company/hr/employees/create"
                          : isRecruitmentApp
                          ? "/company/recruitment/employees/create"
                          : "/company/employees/create"
                      )
                    }
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <PlusCircleIcon />
                    <p>Add Employee</p>
                  </motion.button>
                </div>
              )}
            </div>

            {!showPendingView && !showDetails && (
              <div className="employees-list-statistics-cards-container">
                {statisticsCards}
              </div>
            )}

            {showDetails ? (
              <EmployeeDetailsView
                employee={selectedEmployee}
                onBack={() => {
                  setShowDetails(false);
                  setSelectedEmployee(null);
                }}
                onUpdate={handleEmployeeUpdate}
                isHRApp={isHRApp}
                allEmployees={allEmployees}
              />
            ) : showPendingView ? (
              <PendingEmployeesListView
                data={pendingApplications}
                navigate={navigate}
                isHRApp={isHRApp}
                onBack={() => setShowPendingView(false)}
              />
            ) : (
              <>
                <div className="employees-list-options">
                  <div className="search-input-container">
                    <CiSearch />
                    <input
                      id="search"
                      name="search"
                      type="search"
                      placeholder="Search employee"
                      value={searchTerm}
                      onChange={(e) => {
                        handleSearch(e.target.value);
                      }}
                    />
                  </div>

                  <FilterOptions
                    options={filterOptions}
                    onFilterChange={handleFilterChange}
                  />

                  <SortOptions
                    options={sortOptionsEmployees}
                    onSortChange={handleSortChange}
                  />
                </div>

                <div className="employees-list-table">
                  <Table
                    columns={tableColumnsEmployees}
                    data={tableData}
                    isLoading={isLoading}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    onRowClick={handleRowClick}
                    emptyStateIcon={<TbMoodEmpty />}
                    emptyStateMessage="No employees found"
                    emptyStateDescription="Try adjusting your search or filter criteria"
                  />
                </div>
              </>
            )}
          </motion.div>
        </div>
        <DeleteUserModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          employee={selectedEmployeeForModal}
          onDeleteSuccess={handleDeleteSuccess}
          setIsLoading={setIsLoading}
        />
        <ManageUserAppPermissionsModal
          isOpen={isManageAppPermissionsModalOpen}
          onClose={() => setIsManageAppPermissionsModalOpen(false)}
          user={selectedEmployeeForModal}
          onUpdateSuccess={handleUpdateSuccess}
          setIsLoading={setIsLoading}
        />
        <BulkUploadEmployees
          isOpen={showBulkUploadModal}
          onClose={() => setShowBulkUploadModal(false)}
          onSuccess={handleBulkUploadSuccess}
          onError={handleBulkUploadError}
        />
        <ResetPasswordModal
          isOpen={isResetPasswordModalOpen}
          onClose={() => setIsResetPasswordModalOpen(false)}
          employee={selectedEmployeeForModal}
        />
        <ChangeStatusModal
          isOpen={isChangeStatusModalOpen}
          onClose={() => setIsChangeStatusModalOpen(false)}
          employee={selectedEmployeeForModal}
          onUpdateSuccess={handleUpdateSuccess}
          setIsLoading={setIsLoading}
        />
      </div>
    </motion.div>
  ) : (
    <>
      <motion.div
        className="employees-list-page"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div
          className="employees-list-header"
          style={{ display: "flex", alignItems: "center" }}
        >
          {showPendingView && (
            <button
              className="back-button"
              onClick={() => setShowPendingView(false)}
            >
              <FiArrowLeft size={12} />
              Back
            </button>
          )}
          <div style={{ flex: 1 }}>
            <h1 className="employees-list-title">
              {showPendingView ? "Pending Employees" : "Employees"}
            </h1>
            <p className="employees-list-description">
              {showPendingView
                ? "View and manage applicants ready for employee creation"
                : "View and manage all registered employees and their details"}
            </p>
          </div>
          {!showPendingView && !showDetails && (
            <div className="employees-list-header-action">
              <span
                className="add-client-button"
                onClick={() => setShowBulkUploadModal(true)}
              >
                <p>Bulk upload</p>
              </span>
              <motion.button
                className="add-employee-button"
                onClick={() =>
                  navigate(
                    isHRApp
                      ? "/company/hr/employees/create"
                      : isRecruitmentApp
                      ? "/company/recruitment/employees/create"
                      : "/company/employees/create"
                  )
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PlusCircleIcon />
                <p>Add Employee</p>
              </motion.button>
            </div>
          )}
        </div>

        {!showPendingView && !showDetails && (
          <div className="employees-list-statistics-cards-container">
            {statisticsCards}
          </div>
        )}

        {showDetails ? (
          <EmployeeDetailsView
            employee={selectedEmployee}
            onBack={() => {
              setShowDetails(false);
              setSelectedEmployee(null);
            }}
            onUpdate={handleEmployeeUpdate}
            isHRApp={isHRApp}
            allEmployees={allEmployees}
          />
        ) : showPendingView ? (
          <PendingEmployeesListView
            data={pendingApplications}
            navigate={navigate}
            isHRApp={isHRApp}
            onBack={() => setShowPendingView(false)}
          />
        ) : (
          <>
            <div className="employees-list-options">
              <div className="search-input-container">
                <CiSearch />
                <input
                  id="search"
                  name="search"
                  type="search"
                  placeholder="Search employee"
                  value={searchTerm}
                  onChange={(e) => {
                    handleSearch(e.target.value);
                  }}
                />
              </div>
              <FilterOptions
                options={filterOptions}
                onFilterChange={handleFilterChange}
              />
              <SortOptions
                options={sortOptionsEmployees}
                onSortChange={handleSortChange}
              />
            </div>

            <div className="employees-list-table">
              <Table
                columns={tableColumnsEmployees}
                data={tableData}
                isLoading={isLoading}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onRowClick={handleRowClick}
                emptyStateIcon={<TbMoodEmpty />}
                emptyStateMessage="No employees found"
                emptyStateDescription="Try adjusting your search or filter criteria"
              />
            </div>
          </>
        )}
      </motion.div>
      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        employee={selectedEmployeeForModal}
        onDeleteSuccess={handleDeleteSuccess}
        setIsLoading={setIsLoading}
      />
      <ManageUserAppPermissionsModal
        isOpen={isManageAppPermissionsModalOpen}
        onClose={() => setIsManageAppPermissionsModalOpen(false)}
        user={selectedEmployeeForModal}
        onUpdateSuccess={handleUpdateSuccess}
        setIsLoading={setIsLoading}
      />
      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        employee={selectedEmployeeForModal}
      />
      <ChangeStatusModal
        isOpen={isChangeStatusModalOpen}
        onClose={() => setIsChangeStatusModalOpen(false)}
        employee={selectedEmployeeForModal}
        onUpdateSuccess={handleUpdateSuccess}
        setIsLoading={setIsLoading}
      />
  </>
);
};

export default EmployeesListPage;
