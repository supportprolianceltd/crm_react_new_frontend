import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { FiMoreVertical } from "react-icons/fi";
import { TbMoodEmpty } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import {
  fetchEmployees,
  fetchUsersNoPagination,
} from "../../Employees/config/apiService";
import StatusBadge from "../../../../components/StatusBadge";
import Table from "../../../../components/Table/Table";
import FilterOptions from "../../../../components/FilterOptions/FilterOptions";
import SortOptions from "../../../../components/SortOptions/SortOptions";
import AnimatedCounter from "../../../../components/AnimatedCounter";

import "../styles/RecruitmentComplianceCheckPage.css";
import "../../Employees/styles/styles.css";

// Helper function to calculate percentage change
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const ExistingStaffComplianceCheckPage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [activePopup, setActivePopup] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const isComplianceApp = window.location.pathname.includes("audit-compliance");

  // Track previous counts for calculating percentage changes
  const [previousStats, setPreviousStats] = useState({
    total: 0,
    compliant: 0,
    pending: 0,
    rejected: 0,
  });

  // Fetch all employees without pagination for search and stats
  const fetchAllEmployees = useCallback(async () => {
    try {
      const response = await fetchUsersNoPagination();
      const sortedEmployees = response.sort((a, b) => a.id - b.id);
      setAllEmployees(sortedEmployees || []);
    } catch (error) {
      console.error("Error fetching all employees for stats:", error);
      setAllEmployees([]);
    }
  }, []);

  // Calculate statistics from all employees data
  const statistics = useMemo(() => {
    const totalEmployees = allEmployees.length;
    const compliantEmployees = allEmployees.filter(
      (emp) => emp.compliance_status === "Compliant"
    ).length;
    const pendingEmployees = allEmployees.filter(
      (emp) => emp.compliance_status === "Pending"
    ).length;
    const rejectedEmployees = allEmployees.filter(
      (emp) => emp.compliance_status === "Rejected"
    ).length;

    return {
      total: totalEmployees,
      compliant: compliantEmployees,
      pending: pendingEmployees,
      rejected: rejectedEmployees,
    };
  }, [allEmployees]);

  // Calculate percentage changes
  const percentageChanges = useMemo(() => {
    return {
      total: calculatePercentageChange(statistics.total, previousStats.total),
      compliant: calculatePercentageChange(
        statistics.compliant,
        previousStats.compliant
      ),
      pending: calculatePercentageChange(
        statistics.pending,
        previousStats.pending
      ),
      rejected: calculatePercentageChange(
        statistics.rejected,
        previousStats.rejected
      ),
    };
  }, [statistics, previousStats]);


  const capitalizeRole = useCallback((role) => {
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : "";
  }, []);

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

  const handleActionClick = useCallback(
    (action, employee, e) => {
      e.stopPropagation();
      closePopups();
      switch (action) {
        case "check-staff-compliance":
          navigate(
            isComplianceApp
              ? `/company/audit-compliance/recruitment/existing-staff/${employee.id}`
              : `/company/recruitment/compliance/existing-staff/${employee.id}`
          );
          break;
        default:
          break;
      }
    },
    [navigate, closePopups, isComplianceApp]
  );

  const handleSearch = useCallback(
    (term) => {
      setSearchTerm(term);
      if (!term.trim()) {
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      const lowerTerm = term.toLowerCase();
      const filtered = employees.filter(
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
    [employees]
  );

  const handleFilterChange = useCallback(
    (filterType, selectedValues) => {
      const baseEmployees = isSearching ? filteredEmployees : employees;
      let filtered = [...baseEmployees];

      if (filterType === "status" && selectedValues.length > 0) {
        filtered = filtered.filter((emp) => {
          if (selectedValues.includes("active") && emp.is_active === true) {
            return true;
          }
          if (selectedValues.includes("inactive") && emp.is_active !== true) {
            return true;
          }
          return false;
        });
      }

      if (filterType === "compliance" && selectedValues.length > 0) {
        filtered = filtered.filter((emp) =>
          selectedValues.includes(emp.compliance_status)
        );
      }

      setFilteredEmployees(filtered);
      setCurrentPage(1);
    },
    [employees, filteredEmployees, isSearching]
  );

  const handleSortChange = useCallback(
    (value) => {
      const base = isSearching ? [...filteredEmployees] : [...employees];
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
    [filteredEmployees, employees, isSearching]
  );

  // Pagination logic
  const totalPages = useMemo(
    () =>
      Math.ceil(
        (isSearching ? filteredEmployees.length : totalCount) / itemsPerPage
      ),
    [isSearching, filteredEmployees.length, totalCount, itemsPerPage]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (page) => {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
    },
    [totalPages]
  );

  useEffect(() => {
    fetchAllEmployees();
  }, [fetchAllEmployees]);

  useEffect(() => {
    if (allEmployees.length > 0) {
      setEmployees(allEmployees);
      setTotalCount(allEmployees.length);
      setIsLoading(false);
    }
  }, [allEmployees]);

  // Store previous stats when component unmounts or before refresh
  useEffect(() => {
    return () => {
      localStorage.setItem(
        "previousExistingStaffStats",
        JSON.stringify(statistics)
      );
    };
  }, [statistics]);

  const tableColumns = useMemo(
    () => [
      {
        key: "id",
        header: "ID",
        render: (employee) => employee.profile?.employee_id || employee.id,
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
      { key: "email", header: "Email" },
      {
        key: "role",
        header: "Role",
        render: (employee) => capitalizeRole(employee.role),
      },
      { key: "job_role", header: "Job Role" },
      {
        key: "employee_status",
        header: "Employee Status",
        render: (employee) => <StatusBadge status={employee.status} />,
      },
      // {
      //   key: "compliance_status",
      //   header: "Compliance Status",
      //   render: (employee) => (
      //     <StatusBadge status={employee.compliance_status} />
      //   ),
      // },
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
                      onClick={(e) =>
                        handleActionClick("check-staff-compliance", employee, e)
                      }
                      whileHover={{ x: 5 }}
                    >
                      Check Compliance
                    </motion.button>
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
      {
        value: "compliance",
        label: "Compliance",
        subOptions: [
          { value: "Compliant", label: "Compliant" },
          { value: "Non-Compliant", label: "Non-Compliant" },
          { value: "Pending", label: "Pending" },
          { value: "Rejected", label: "Rejected" },
        ],
        isCheckbox: true,
      },
    ],
    []
  );

  const sortOptions = useMemo(
    () => [
      { value: "name-asc", label: "Name (A-Z)" },
      { value: "name-desc", label: "Name (Z-A)" },
      { value: "role-asc", label: "Role (A-Z)" },
      { value: "role-desc", label: "Role (Z-A)" },
    ],
    []
  );

  const currentItems = useMemo(() => {
    const base = isSearching ? filteredEmployees : employees;
    const startIdx = (currentPage - 1) * itemsPerPage;
    return base.slice(startIdx, startIdx + itemsPerPage);
  }, [isSearching, currentPage, itemsPerPage, filteredEmployees, employees]);

  // Format percentage for display
  const formatPercentage = useCallback((value) => {
    if (value === 0) return "0% this week";
    const direction = value > 0 ? "up" : "down";
    const absValue = Math.abs(value).toFixed(1);
    return `${absValue}% ${direction} this week`;
  }, []);

  // Memoized statistics cards
  const statisticsCards = useMemo(() => {
    return [
      {
        title: "Total Staff",
        count: statistics.total,
        className: "total",
        percentage: percentageChanges.total,
      },
      {
        title: "Compliant",
        count: statistics.compliant,
        className: "compliant",
        percentage: percentageChanges.compliant,
      },
      {
        title: "Pending Compliance",
        count: statistics.pending,
        className: "pending",
        percentage: percentageChanges.pending,
      },
      {
        title: "Rejected",
        count: statistics.rejected,
        className: "rejected",
        percentage: percentageChanges.rejected,
      },
    ].map((card, idx) => (
      <motion.div
        key={idx}
        className={`employees-list-statistics-card ${card.className}`}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
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

  return (
    <motion.div
      className="compliance-list-page"
      onClick={closePopups}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="compliance-list-header">
        <div>
          <h1 className="compliance-list-title">
            Existing Staff Compliance Check
          </h1>
        </div>
      </div>

      <div className="compliance-list-statistics-cards-container">
        {statisticsCards}
      </div>

      <div className="compliance-list-options">
        <div className="search-input-container">
          <CiSearch />
          <input
            id="search"
            name="search"
            type="search"
            placeholder="Search existing staff/employee"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handleSearch(e.target.value);
            }}
          />
        </div>
        <FilterOptions
          options={filterOptions}
          onFilterChange={handleFilterChange}
        />
        <SortOptions options={sortOptions} onSortChange={handleSortChange} />
      </div>

      <div className="compliance-list-table">
        <Table
          columns={tableColumns}
          data={currentItems}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          emptyStateIcon={<TbMoodEmpty />}
          emptyStateMessage="No employees found"
          emptyStateDescription="Try adjusting your search or filter criteria"
          onRowClick={(id) =>
            navigate(
              isComplianceApp
                ? `/company/audit-compliance/recruitment/existing-staff/${id}`
                : `/company/recruitment/compliance/existing-staff/${id}`
            )
          }
        />
      </div>
    </motion.div>
  );
};

export default ExistingStaffComplianceCheckPage;