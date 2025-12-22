import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { FiMoreVertical } from "react-icons/fi";
import { TbMoodEmpty } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import StatusBadge from "../../../../components/StatusBadge";
import Table from "../../../../components/Table/Table";
import FilterOptions from "../../../../components/FilterOptions/FilterOptions";
import SortOptions from "../../../../components/SortOptions/SortOptions";
import AnimatedCounter from "../../../../components/AnimatedCounter";
import { fetchPublishedRequisitionsWithShortlisted } from "../../Recruitment/ApiService";

import "../styles/RecruitmentComplianceCheckPage.css";

// Helper function to calculate percentage change
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const NewStaffComplianceCheckPage = () => {
  const navigate = useNavigate();
  const [hiredApplications, setHiredApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [activePopup, setActivePopup] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const isComplianceApp = window.location.pathname.includes("audit-compliance");

  // Track previous counts for calculating percentage changes
  const [previousStats, setPreviousStats] = useState({
    newStaff: 0,
    missingDocuments: 0,
    responded: 0,
    passed: 0,
    rejected: 0,
  });

  const getOverallComplianceStatus = useCallback((app) => {
    if (app.status === "compliance_completed") return "passed";
    if (app.status === "rejected") return "rejected";
    return "pending";
  }, []);

  // Calculate statistics from hiredApplications data
  const statistics = useMemo(() => {
    const totalNewStaff = hiredApplications.length;
    console.log(hiredApplications);
    const missingDocs = hiredApplications.filter((app) => {
      return getOverallComplianceStatus(app) === "pending";
    }).length;
    const respondedCount = hiredApplications.filter(
      (app) =>
        app.compliance_status &&
        typeof app.compliance_status !== "string" &&
        app.compliance_status.length > 0
    ).length;
    const passedCount = hiredApplications.filter(
      (app) => getOverallComplianceStatus(app) === "passed"
    ).length;
    const rejectedCount = hiredApplications.filter(
      (app) => getOverallComplianceStatus(app) === "rejected"
    ).length;

    return {
      newStaff: totalNewStaff,
      missingDocuments: missingDocs,
      responded: respondedCount,
      passed: passedCount,
      rejected: rejectedCount,
    };
  }, [hiredApplications, getOverallComplianceStatus]);

  // Calculate percentage changes
  const percentageChanges = useMemo(() => {
    return {
      newStaff: calculatePercentageChange(
        statistics.newStaff,
        previousStats.newStaff
      ),
      missingDocuments: calculatePercentageChange(
        statistics.missingDocuments,
        previousStats.missingDocuments
      ),
      responded: calculatePercentageChange(
        statistics.responded,
        previousStats.responded
      ),
      passed: calculatePercentageChange(
        statistics.passed,
        previousStats.passed
      ),
      rejected: calculatePercentageChange(
        statistics.rejected,
        previousStats.rejected
      ),
    };
  }, [statistics, previousStats]);

  const fetchAllHiredApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const savedStats = localStorage.getItem("previousNewStaffStats");
      if (savedStats) {
        setPreviousStats(JSON.parse(savedStats));
      }

      const response = await fetchPublishedRequisitionsWithShortlisted();
      if (!response) {
        setHiredApplications([]);
        setFilteredApplications([]);
        setTotalCount(0);
        setIsLoading(false);
        return;
      }

      // Filter requisitions that have hired or compliance_completed applications
      const validReqs = response
        .map((reqItem) => {
          const req = reqItem.job_requisition;
          const eligibleApps =
            reqItem.progressed_applications?.filter(
              (app) =>
                app.status === "hired" || app.status === "compliance_completed"
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
          ...app,
          role: req.title,
          job_location: req.job_location,
          interview_location: req.interview_location,
          application_date: app.applied_at, // Map from applied_at to application_date
          // Parse full_name to first_name and last_name for applicant object
          applicant: {
            first_name: app.full_name
              ? app.full_name.split(" ").slice(0, -1).join(" ")
              : "",
            last_name: app.full_name
              ? app.full_name.split(" ").slice(-1)[0]
              : "",
            profile_picture: null, // No profile_picture in data
          },
          compliance_status: app.compliance_status,
          // interview_date: not in data, will show N/A unless added
          interview_date: null,
        }));
      });
      const flatHired = allApplications.flat();
      console.log(flatHired);
      setHiredApplications(flatHired);
      setFilteredApplications(flatHired);
      setTotalCount(flatHired.length);
    } catch (error) {
      console.error("Error fetching hired applications:", error);
      setHiredApplications([]);
      setFilteredApplications([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllHiredApplications();
  }, [fetchAllHiredApplications]);

  // Store previous stats when component unmounts or before refresh
  useEffect(() => {
    return () => {
      localStorage.setItem("previousNewStaffStats", JSON.stringify(statistics));
    };
  }, [statistics]);

  const tableColumns = useMemo(
    () => [
      {
        key: "application_date",
        header: "Application Date",
        render: (app) =>
          app.application_date
            ? new Date(app.application_date).toLocaleDateString()
            : "N/A",
      },
      {
        key: "applicant_name",
        header: "New Staff Name",
        render: (app) => (
          <div className="applicant-name">
            {app.applicant?.profile_picture && (
              <img
                src={app.applicant?.profile_picture || "/default-pic.png"}
                alt="profile"
                className="profile-pic"
              />
            )}
            {app.applicant?.first_name} {app.applicant?.last_name}
          </div>
        ),
      },
      {
        key: "role",
        header: "Role",
        render: (app) => app.role || "N/A",
      },
      {
        key: "interview_date",
        header: "Interview Date",
        render: (app) =>
          app.interview_date
            ? new Date(app.interview_date).toLocaleDateString()
            : "N/A",
      },
      {
        key: "compliance_status",
        header: "Compliance Status",
        render: (app) => (
          <StatusBadge status={getOverallComplianceStatus(app)} />
        ),
      },
      {
        key: "actions",
        header: "Actions",
        render: (app) => (
          <div className="actions-cell">
            <div className="actions-container">
              <motion.button
                className="actions-button"
                onClick={(e) => togglePopup(app.id, e)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiMoreVertical />
              </motion.button>
              <AnimatePresence>
                {activePopup === app.id && (
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
                        handleActionClick("check-staff-compliance", app, e)
                      }
                      whileHover={{ x: 5 }}
                    >
                      Check Staff Compliance
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ),
      },
    ],
    [activePopup, getOverallComplianceStatus]
  );

  const filterOptions = useMemo(
    () => [
      {
        value: "compliance",
        label: "Compliance Status",
        subOptions: [
          { value: "pending", label: "Pending" },
          { value: "passed", label: "Passed" },
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
      { value: "date-asc", label: "Application Date (Oldest)" },
      { value: "date-desc", label: "Application Date (Newest)" },
    ],
    []
  );

  const handleFilterChange = useCallback(
    (filterType, selectedValues) => {
      let filtered = [...hiredApplications];

      if (filterType === "compliance" && selectedValues.length > 0) {
        filtered = filtered.filter((app) =>
          selectedValues.includes(getOverallComplianceStatus(app).toLowerCase())
        );
      }

      setFilteredApplications(filtered);
      setCurrentPage(1);
    },
    [hiredApplications, getOverallComplianceStatus]
  );

  const handleSortChange = useCallback(
    (value) => {
      let sorted = [...filteredApplications];

      switch (value) {
        case "name-asc":
          sorted.sort((a, b) =>
            `${a.applicant?.first_name} ${a.applicant?.last_name}`.localeCompare(
              `${b.applicant?.first_name} ${b.applicant?.last_name}`
            )
          );
          break;
        case "name-desc":
          sorted.sort((a, b) =>
            `${b.applicant?.first_name} ${b.applicant?.last_name}`.localeCompare(
              `${a.applicant?.first_name} ${a.applicant?.last_name}`
            )
          );
          break;
        case "role-asc":
          sorted.sort((a, b) => (a.role || "").localeCompare(b.role || ""));
          break;
        case "role-desc":
          sorted.sort((a, b) => (b.role || "").localeCompare(a.role || ""));
          break;
        case "date-asc":
          sorted.sort(
            (a, b) =>
              new Date(a.application_date) - new Date(b.application_date)
          );
          break;
        case "date-desc":
          sorted.sort(
            (a, b) =>
              new Date(b.application_date) - new Date(a.application_date)
          );
          break;
        default:
          break;
      }

      setFilteredApplications(sorted);
    },
    [filteredApplications]
  );

  const handleSearch = useCallback(
    (term) => {
      const filtered = hiredApplications.filter(
        (app) =>
          `${app.applicant?.first_name} ${app.applicant?.last_name}`
            ?.toLowerCase()
            .includes(term.toLowerCase()) ||
          app.role?.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredApplications(filtered);
      setCurrentPage(1);
    },
    [hiredApplications]
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
    (action, app, e) => {
      e.stopPropagation();
      closePopups();
      switch (action) {
        case "check-staff-compliance":
          navigate(
            isComplianceApp
              ? `/company/audit-compliance/recruitment/new-staff/${app.id}`
              : `/company/recruitment/compliance/new-staff/${app.id}`
          );
          break;
        default:
          break;
      }
    },
    [navigate, closePopups, isComplianceApp]
  );

  // Pagination logic (client-side since all in one table)
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage); // Use filtered length for accurate pagination
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredApplications.slice(
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
        title: "New Staff",
        count: statistics.newStaff,
        className: "new-staff",
        percentage: percentageChanges.newStaff,
      },
      {
        title: "Missing Documents",
        count: statistics.missingDocuments,
        className: "missing",
        percentage: percentageChanges.missingDocuments,
      },
      {
        title: "Responded",
        count: statistics.responded,
        className: "responded",
        percentage: percentageChanges.responded,
      },
      {
        title: "Passed Compliance",
        count: statistics.passed,
        className: "passed",
        percentage: percentageChanges.passed,
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
        className={`compliance-list-statistics-card ${card.className}`}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <h3 className="compliance-list-statistics-title">{card.title}</h3>
        <p className="compliance-list-statistics-count">
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
        <h1 className="compliance-list-title">New Staff Compliance Check</h1>
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
            placeholder="Search new staff/employee"
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
          onRowClick={(id) =>
            navigate(
              isComplianceApp
                ? `/company/audit-compliance/recruitment/new-staff/${id}`
                : `/company/recruitment/compliance/new-staff/${id}`
            )
          }
          emptyStateIcon={<TbMoodEmpty />}
          emptyStateMessage="No hired staff found"
          emptyStateDescription="Try adjusting your search or filter criteria"
        />
        {!isLoading && filteredApplications.length > 0 && (
          <div className="pagination-controls">
            <div className="items-per-page">
              <p>Number of rows:</p>
              <select
                className="form-select"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            <div className="page-navigation">
              <span className="page-info">
                Page {currentPage} of {totalPages} (
                {filteredApplications.length} total)
              </span>
              <div className="page-navigation-Btns">
                <button
                  className="page-button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  className="page-button"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NewStaffComplianceCheckPage;
