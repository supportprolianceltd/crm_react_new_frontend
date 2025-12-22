import React, { useState, useMemo, useCallback } from "react";
import { CiSearch } from "react-icons/ci";
import { FiMoreVertical } from "react-icons/fi";
import { TbMoodEmpty } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import StatusBadge from "../../../../components/StatusBadge";
import Table from "../../../../components/Table/Table";
import FilterOptions from "../../../../components/FilterOptions/FilterOptions";
import SortOptions from "../../../../components/SortOptions/SortOptions";

const PendingEmployeesListView = ({ data, navigate, isHRApp }) => {
  const [filteredApplications, setFilteredApplications] = useState(data);
  const [activePopup, setActivePopup] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

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
          new Set(data.map((app) => app.role || "N/A"))
        ).map((role) => ({ value: role, label: role })),
        isCheckbox: true,
      },
    ],
    [data]
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
      let filtered = [...data];
      if (filterType === "role" && selectedValues.length > 0) {
        filtered = filtered.filter((app) =>
          selectedValues.includes(app.role || "N/A")
        );
      }
      setFilteredApplications(filtered);
      setCurrentPage(1);
    },
    [data]
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
      const filtered = data.filter(
        (app) =>
          `${app.applicant?.first_name} ${app.applicant?.last_name}`
            ?.toLowerCase()
            .includes(term.toLowerCase()) ||
          app.role?.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredApplications(filtered);
      setCurrentPage(1);
    },
    [data]
  );

  const togglePopup = useCallback(
    (id, e) => {
      e.stopPropagation();
      setActivePopup(activePopup === id ? null : id);
    },
    [activePopup]
  );

  const closePopupsLocal = useCallback(() => {
    setActivePopup(null);
  }, []);

  const handleActionClick = useCallback(
    (action, app, e) => {
      e.stopPropagation();
      closePopupsLocal();
      switch (action) {
        case "continue-creation":
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
    [navigate, closePopupsLocal, isHRApp]
  );

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredApplications.slice(
    indexOfFirstItem,
    indexOfFirstItem + itemsPerPage
  );

  return (
    <>
      <div className="employees-list-options">
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

      <div className="employees-list-table">
        <Table
          columns={tableColumns}
          data={currentItems}
          isLoading={false}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onRowClick={(id) => {}}
          emptyStateIcon={<TbMoodEmpty />}
          emptyStateMessage="No pending employees found"
          emptyStateDescription="Try adjusting your search or filter criteria"
        />
        {filteredApplications.length > 0 && (
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
    </>
  );
};

export default PendingEmployeesListView;
