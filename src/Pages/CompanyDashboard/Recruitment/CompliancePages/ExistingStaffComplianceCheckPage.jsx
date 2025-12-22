import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { FiMoreVertical } from "react-icons/fi";
import { TbMoodEmpty } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { fetchEmployees } from "../../Employees/config/apiService";
import StatusBadge from "../../../../components/StatusBadge";
import Table from "../../../../components/Table/Table";
import FilterOptions from "../../../../components/FilterOptions/FilterOptions";
import SortOptions from "../../../../components/SortOptions/SortOptions";
import AnimatedCounter from "../../../../components/AnimatedCounter";

import "../../Compliance/styles/StaffDetailsComplianceCheckPage.css";

// Helper function to calculate percentage change
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const ExistingStaffComplianceCheckPage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [activePopup, setActivePopup] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [previousPageUrl, setPreviousPageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const API_PAGE_SIZE = 20;

  // Track previous counts for calculating percentage changes
  const [previousStats, setPreviousStats] = useState({
    total: 0,
    compliant: 0,
    pending: 0,
    rejected: 0,
  });

  // Calculate statistics from employees data
  const statistics = useMemo(() => {
    const totalEmployees = totalCount;
    const compliantEmployees = employees.filter(
      (emp) => emp.compliance_status === "compliant"
    ).length;
    const pendingEmployees = employees.filter(
      (emp) => emp.compliance_status === "pending"
    ).length;
    const rejectedEmployees = employees.filter(
      (emp) => emp.compliance_status === "rejected"
    ).length;

    return {
      total: totalEmployees,
      compliant: compliantEmployees,
      pending: pendingEmployees,
      rejected: rejectedEmployees,
    };
  }, [employees, totalCount]);

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

  const handleFetchEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const savedStats = localStorage.getItem("previousExistingStaffStats");
      if (savedStats) {
        setPreviousStats(JSON.parse(savedStats));
      }

      const url =
        currentPage === 1
          ? null
          : currentPage > 1 &&
            previousPageUrl &&
            currentPage < Math.ceil(totalCount / API_PAGE_SIZE)
          ? nextPageUrl
          : previousPageUrl;
      const response = await fetchEmployees();

      const sortedEmployees = response?.results.sort(
        (a, b) =>
          new Date(b.created_at || b.id) - new Date(a.created_at || a.id)
      );
      setEmployees(sortedEmployees || []);
      setFilteredEmployees(sortedEmployees || []);
      setTotalCount(response.count);
      setNextPageUrl(response.next);
      setPreviousPageUrl(response.previous);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
      setFilteredEmployees([]);
      setTotalCount(0);
      setNextPageUrl(null);
      setPreviousPageUrl(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, nextPageUrl, previousPageUrl, totalCount]);

  useEffect(() => {
    handleFetchEmployees();
  }, [handleFetchEmployees]);

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
      { key: "id", header: "ID" },
      {
        key: "name",
        header: "Name",
        render: (employee) => `${employee.first_name} ${employee.last_name}`,
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
    [activePopup]
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
          { value: "compliant", label: "Compliant" },
          { value: "non-compliant", label: "Non-Compliant" },
          { value: "pending", label: "Pending" },
          { value: "rejected", label: "Rejected" },
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

  const handleFilterChange = useCallback(
    (filterType, selectedValues) => {
      let filtered = [...employees];

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
          selectedValues.includes(emp.compliance_status?.toLowerCase())
        );
      }

      setFilteredEmployees(filtered);
      setCurrentPage(1);
    },
    [employees]
  );

  const handleSortChange = useCallback(
    (value) => {
      let sorted = [...filteredEmployees];

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
    [filteredEmployees]
  );

  const handleSearch = useCallback(
    (term) => {
      const filtered = employees.filter(
        (emp) =>
          emp.first_name?.toLowerCase().includes(term.toLowerCase()) ||
          emp.last_name?.toLowerCase().includes(term.toLowerCase()) ||
          emp.email?.toLowerCase().includes(term.toLowerCase()) ||
          emp.role?.toLowerCase().includes(term.toLowerCase()) ||
          emp.job_role?.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredEmployees(filtered);
      setCurrentPage(1);
    },
    [employees]
  );

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
            `/company/recruitment/compliance/existing-staff/${employee.id}`
          );
          break;
        default:
          break;
      }
    },
    [navigate, closePopups]
  );

  const capitalizeRole = useCallback((role) => {
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : "";
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(totalCount / API_PAGE_SIZE);
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredEmployees.slice(
    indexOfFirstItem,
    indexOfFirstItem + itemsPerPage
  );

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
          onPageChange={setCurrentPage}
          emptyStateIcon={<TbMoodEmpty />}
          emptyStateMessage="No employees found"
          emptyStateDescription="Try adjusting your search or filter criteria"
          onRowClick={(id) =>
            navigate(`/company/recruitment/compliance/existing-staff/${id}`)
          }
        />
      </div>
    </motion.div>
  );
};

export default ExistingStaffComplianceCheckPage;
