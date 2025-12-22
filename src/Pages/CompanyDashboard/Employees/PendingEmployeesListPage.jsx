import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { FiMoreVertical } from "react-icons/fi";
import { TbMoodEmpty } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import StatusBadge from "../../../components/StatusBadge";
import Table from "../../../components/Table/Table";
import FilterOptions from "../../../components/FilterOptions/FilterOptions";
import SortOptions from "../../../components/SortOptions/SortOptions";
import SideNavBar from "../Home/SideNavBar";
import { fetchPublishedRequisitionsWithShortlisted } from "../Recruitment/ApiService";
import "../../CompanyDashboard/Employees/styles/styles.css";
import { normalizeText } from "../../../utils/helpers";

const PendingEmployeesListPage = () => {
  const navigate = useNavigate();
  const [pendingApplications, setPendingApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [activePopup, setActivePopup] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [shrinkNav, setShrinkNav] = useState(false);

  const isHRApp = window.location.pathname.includes("hr");

  // Fetch pending applications (compliance_completed)
  const fetchPendingApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchPublishedRequisitionsWithShortlisted();
      if (!response) {
        setPendingApplications([]);
        setFilteredApplications([]);
        setTotalCount(0);
        setIsLoading(false);
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
      console.log(flatPending);
      setPendingApplications(flatPending);
      setFilteredApplications(flatPending);
      setTotalCount(flatPending.length);
    } catch (error) {
      console.error("Error fetching pending applications:", error);
      setPendingApplications([]);
      setFilteredApplications([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingApplications();
  }, [fetchPendingApplications]);

  const tableColumns = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
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
        key: "compliance_status",
        header: "Compliance Status",
        render: (app) => (
          <StatusBadge
            status={
              app.status === "compliance_completed" ? "completed" : "pending"
            }
          />
        ),
      },
      {
        key: "approval_date",
        header: "Approval Date",
        render: (app) =>
          app.updated_at
            ? new Date(app.updated_at).toLocaleDateString()
            : "N/A",
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
                        handleActionClick("continue-creation", app, e)
                      }
                      whileHover={{ x: 5 }}
                    >
                      Continue Creation
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
        value: "role",
        label: "Role",
        subOptions: Array.from(
          new Set(pendingApplications.map((app) => app.role || "N/A"))
        ).map((role) => ({ value: role, label: role })),
        isCheckbox: true,
      },
    ],
    [pendingApplications]
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
      let filtered = [...pendingApplications];
      if (filterType === "role" && selectedValues.length > 0) {
        filtered = filtered.filter((app) =>
          selectedValues.includes(app.role || "N/A")
        );
      }
      setFilteredApplications(filtered);
      setCurrentPage(1);
    },
    [pendingApplications]
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
      const filtered = pendingApplications.filter(
        (app) =>
          `${app.applicant?.first_name} ${app.applicant?.last_name}`
            ?.toLowerCase()
            .includes(term.toLowerCase()) ||
          app.role?.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredApplications(filtered);
      setCurrentPage(1);
    },
    [pendingApplications]
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
        case "continue-creation":
          // Navigate to create employee page with comprehensive applicant data
          navigate(
            isHRApp
              ? `/company/hr/employees/create/${app.id}`
              : `/company/employees/create/${app.id}`,
            {
              state: {
                applicant: {
                  first_name: app.applicant.first_name,
                  last_name: app.applicant.last_name,
                  full_name: app.full_name,
                  job_role: app.role,
                  application_id: app.id,
                  email: app.email,
                  phone: app.phone,
                  date_of_birth: app.date_of_birth,
                  qualification: app.qualification,
                  knowledge_skill: app.knowledge_skill,
                  documents: app.documents,
                  compliance_status: app.compliance_status,
                  job_requisition_id: app.job_requisition_id,
                  source: app.source,
                  application_date: app.application_date,
                  current_stage: app.current_stage,
                  status: app.status,
                  screening_score: app.screening_score,
                },
              },
            }
          );
          break;
        default:
          break;
      }
    },
    [navigate, closePopups, isHRApp]
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredApplications.slice(
    indexOfFirstItem,
    indexOfFirstItem + itemsPerPage
  );

  return !isHRApp ? (
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
            className="compliance-list-page"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="compliance-list-header">
              <div>
                <h1 className="compliance-list-title">Pending Employees</h1>
                <p className="compliance-list-description">
                  View and manage applicants ready for employee creation
                </p>
              </div>
            </div>

            <div className="compliance-list-options">
              <div className="search-input-container">
                <CiSearch />
                <input
                  id="search"
                  name="search"
                  type="search"
                  placeholder="Search pending employees"
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
              <SortOptions
                options={sortOptions}
                onSortChange={handleSortChange}
              />
            </div>

            <div className="compliance-list-table">
              <Table
                columns={tableColumns}
                data={currentItems}
                isLoading={isLoading}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                onRowClick={(id) => {}}
                emptyStateIcon={<TbMoodEmpty />}
                emptyStateMessage="No pending employees found"
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
        </div>
      </div>
    </motion.div>
  ) : (
    <>
      <motion.div
        className="compliance-list-page"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        onClick={closePopups}
      >
        <div className="compliance-list-header">
          <div>
            <h1 className="compliance-list-title">Pending Employees</h1>
            <p className="compliance-list-description">
              View and manage applicants ready for employee creation
            </p>
          </div>
        </div>

        <div className="compliance-list-options">
          <div className="search-input-container">
            <CiSearch />
            <input
              id="search"
              name="search"
              type="search"
              placeholder="Search pending employees"
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
            onRowClick={(id) => {}}
            emptyStateIcon={<TbMoodEmpty />}
            emptyStateMessage="No pending employees found"
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
    </>
  );
};

export default PendingEmployeesListPage;
