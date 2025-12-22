import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  LockClosedIcon,
  LockOpenIcon,
  CheckCircleIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import CountUp from "react-countup";
import { fetchAllRequisitions, bulkDeleteRequisitions } from "./ApiService";
import StatusBadge from "../../../components/StatusBadge";
import AlertModal from "../../../components/Modal/AlertModal";

// Modal component for confirmation dialogs
const Modal = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 z-40"
      onClick={onCancel}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      exit={{ opacity: 0 }}
    />
    <motion.div
      className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg"
      initial={{ opacity: 0, scale: 0.75 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.75 }}
      role="dialog"
      aria-modal="true"
    >
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      <p className="mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded bg-gray-300 px-4 py-2 font-semibold hover:bg-gray-400"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className="rounded bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
          autoFocus
        >
          {confirmText}
        </button>
      </div>
    </motion.div>
  </AnimatePresence>
);

// Mapping for job_type and location_type
const reverseJobTypeMap = {
  full_time: "Full-Time",
  part_time: "Part-Time",
  contract: "Contract",
  freelance: "Freelance",
  internship: "Internship",
};

const reverseLocationTypeMap = {
  on_site: "On-site",
  remote: "Remote",
  hybrid: "Hybrid",
};

// Main JobApplication component
const JobApplication = () => {
  // State declarations
  const [jobData, setJobData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isVisible, setIsVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showNoSelectionAlert, setShowNoSelectionAlert] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [alertModal, setAlertModal] = useState(null);
  const [trigger, setTrigger] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    closed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const masterCheckboxRef = useRef(null);

  const statuses = ["All", "Open", "Closed"];

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("/")
      .join("-");
  };

  // Format time for last update
  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // Fetch all jobs from API across all pages
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        let apiStatusFilter = null;
        if (statusFilter !== "All") {
          apiStatusFilter = statusFilter.toLowerCase();
        }
        let allPublishedJobs = [];
        let currentUrl = null;
        do {
          const response = await fetchAllRequisitions(
            currentUrl,
            searchTerm,
            apiStatusFilter
          );
          let pagePublishedJobs = response.results
            .filter((job) => job.publish_status === true)
            .map((job) => ({
              id: job.id,
              title: job.title,
              numApplications: job.num_of_applications || 0,
              company_name: job.company_name || "",
              job_type: reverseJobTypeMap[job.job_type] || job.job_type,
              location_type:
                reverseLocationTypeMap[job.location_type] || job.location_type,
              salary_range: job.salary_range || "",
              requested_by: job.requested_by || [],
              documents_required: job.documents_required || "",
              job_description: job.job_description || "",
              company_address: job.company_address || "",
              start_date: formatDate(job.start_date),
              deadline: formatDate(job.deadline_date),
              lastModified: formatDate(job.updated_at),
              status: job.status.charAt(0).toUpperCase() + job.status.slice(1),
              created_at: job.created_at || null,
            }));
          if (statusFilter === "All") {
            pagePublishedJobs = pagePublishedJobs.filter(
              (job) => job.status === "Open" || job.status === "Closed"
            );
          }
          allPublishedJobs = [...allPublishedJobs, ...pagePublishedJobs];
          currentUrl = response.next;
        } while (currentUrl);

        setJobData(allPublishedJobs);
        setTotalCount(allPublishedJobs.length);

        setStats({
          total: allPublishedJobs.length,
          open: allPublishedJobs.filter((job) => job.status === "Open").length,
          closed: allPublishedJobs.filter((job) => job.status === "Closed")
            .length,
        });
      } catch (error) {
        setAlertModal({
          title: "Error",
          message: error.message || "Failed to fetch job requisitions.",
        });
        console.error("Error fetching job requisitions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [trigger, searchTerm, statusFilter]);

  // Polling for updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTrigger((prev) => prev + 1);
      setLastUpdateTime(new Date());
    }, 50000);
    return () => clearInterval(interval);
  }, []);

  const filteredJobs = jobData;

  // Sort filtered jobs by created_at descending (most recent first)
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
    const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
    return dateB - dateA;
  });

  // Client-side pagination for display
  const totalPages = Math.ceil(sortedJobs.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentJobs = sortedJobs.slice(startIndex, startIndex + rowsPerPage);

  // Handle checkbox selection for individual jobs
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((jobId) => jobId !== id) : [...prev, id]
    );
  };

  // Handle select all visible jobs
  const handleSelectAllVisible = () => {
    const allVisibleIds = currentJobs.map((job) => job.id);
    const areAllVisibleSelected = allVisibleIds.every((id) =>
      selectedIds.includes(id)
    );
    if (areAllVisibleSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !allVisibleIds.includes(id))
      );
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...allVisibleIds])]);
    }
  };

  // Handle delete marked jobs
  const handleDeleteMarked = () => {
    if (selectedIds.length === 0) {
      setShowNoSelectionAlert(true);
      return;
    }
    setShowConfirmDelete(true);
  };

  // Confirm deletion of selected jobs
  const confirmDelete = async () => {
    try {
      await bulkDeleteRequisitions(selectedIds);
      setTrigger((prev) => prev + 1); // Refresh data after deletion
      setSelectedIds([]);
      setCurrentPage((prev) => Math.max(prev - 1, 1));
      setShowConfirmDelete(false);
    } catch (error) {
      setShowConfirmDelete(false);
      setAlertModal({
        title: "Error",
        message: error.message || "Failed to delete job requisitions.",
      });
      console.error("Error deleting job requisitions:", error);
    }
  };

  // Update master checkbox state
  useEffect(() => {
    const allVisibleSelected = currentJobs.every((job) =>
      selectedIds.includes(job.id)
    );
    const someSelected = currentJobs.some((job) =>
      selectedIds.includes(job.id)
    );
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate =
        !allVisibleSelected && someSelected;
    }
  }, [selectedIds, currentJobs]);

  // Adjust page if rowsPerPage or filters change
  useEffect(() => {
    const maxPage = Math.ceil(sortedJobs.length / rowsPerPage);
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(maxPage);
    } else if (maxPage === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [rowsPerPage, sortedJobs.length, currentPage]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, rowsPerPage]);

  // Toggle filter dropdown visibility
  const toggleSection = () => {
    setIsVisible((prev) => !prev);
  };

  return (
    <div className="JobApplication-sec">
      <div className="Dash-OO-Boas TTTo-POkay">
        <div className="glo-Top-Cards">
          {[
            {
              icon: BriefcaseIcon,
              label: "Total Applications",
              value: stats.total,
            },
            {
              icon: LockOpenIcon,
              label: "Open Applications",
              value: stats.open,
            },
            {
              icon: LockClosedIcon,
              label: "Closed Applications",
              value: stats.closed,
            },
          ].map((item, idx) => (
            <div key={idx} className={`glo-Top-Card card-${idx + 1}`}>
              <div className="ffl-TOp">
                <span>
                  <item.icon />
                </span>
                <p>{item.label}</p>
              </div>
              <h3>
                <CountUp
                  key={trigger + `-${idx}`}
                  end={item.value}
                  duration={2}
                />{" "}
                <span className="ai-check-span">
                  Last checked - {formatTime(lastUpdateTime)}
                </span>
              </h3>
            </div>
          ))}
        </div>
      </div>

      <div className="Dash-OO-Boas Gen-Boxshadow">
        <div className="Dash-OO-Boas-Top">
          <div className="Dash-OO-Boas-Top-1">
            <span onClick={toggleSection} title="Filter">
              <AdjustmentsHorizontalIcon className="h-6 w-6" />
            </span>
            <h3>Job Applications</h3>
          </div>
          <div className="Dash-OO-Boas-Top-2">
            <div className="genn-Drop-Search">
              <span>
                <MagnifyingGlassIcon className="h-6 w-6" />
              </span>
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isVisible && (
            <motion.div
              className="filter-dropdowns"
              initial={{ height: 0, opacity: 0, overflow: "hidden" }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "All" ? "All Statuses" : status}
                  </option>
                ))}
              </select>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="table-container">
          <table className="Gen-Sys-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    ref={masterCheckboxRef}
                    onChange={handleSelectAllVisible}
                    checked={
                      currentJobs.length > 0 &&
                      currentJobs.every((job) => selectedIds.includes(job.id))
                    }
                    disabled={isLoading}
                  />
                </th>
                <th>
                  <span className="flex items-center gap-1">Job ID</span>
                </th>
                <th>
                  <span className="flex items-center gap-1">Job Title</span>
                </th>
                <th>
                  <span className="flex items-center gap-1">
                    No. of Applications
                  </span>
                </th>
                <th>
                  <span className="flex items-center gap-1">
                    Deadline for Applications
                  </span>
                </th>
                <th>
                  <span className="flex items-center gap-1">Last Modified</span>
                </th>
                <th>
                  <span className="flex items-center gap-1">Status</span>
                </th>
                <th>
                  <span className="flex items-center gap-1">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      fontStyle: "italic",
                    }}
                  >
                    <ul className="tab-Loadding-AniMMA">
                      <li></li>
                      <li></li>
                      <li></li>
                      <li></li>
                      <li></li>
                      <li></li>
                      <li></li>
                      <li></li>
                    </ul>
                  </td>
                </tr>
              ) : currentJobs.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      fontStyle: "italic",
                    }}
                  >
                    No job requisitions found
                  </td>
                </tr>
              ) : (
                currentJobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(job.id)}
                        onChange={() => handleCheckboxChange(job.id)}
                      />
                    </td>
                    <td>{job.id}</td>
                    <td>{job.title}</td>
                    <td>{job.numApplications}</td>
                    <td>{job.deadline}</td>
                    <td>{job.lastModified}</td>
                    <td>
                      <StatusBadge
                        status={
                          job.status.toLowerCase() === "open"
                            ? "accepted"
                            : job.status.toLowerCase()
                        }
                      />
                    </td>
                    <td>
                      <div className="gen-td-btns">
                        <Link
                          to={`/company/recruitment/view-applications/`}
                          state={{ job }} // Pass the entire job object
                          className="view-btn"
                        >
                          View Applicants
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && totalCount > 0 && (
          <div className="pagination-controls">
            <div className="Dash-OO-Boas-foot">
              <div className="Dash-OO-Boas-foot-1">
                <div className="items-per-page">
                  <p>Number of rows:</p>
                  <select
                    className="form-select"
                    value={rowsPerPage}
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="Dash-OO-Boas-foot-2">
                <button
                  onClick={handleSelectAllVisible}
                  className="mark-all-btn"
                >
                  <CheckCircleIcon className="h-6 w-6" />
                  {currentJobs.every((job) => selectedIds.includes(job.id))
                    ? "Unmark All"
                    : "Mark All"}
                </button>
                <button
                  onClick={handleDeleteMarked}
                  className="delete-marked-btn"
                >
                  <TrashIcon className="h-6 w-6" />
                  Delete Marked
                </button>
              </div>
            </div>

            <div className="page-navigation">
              <span className="page-info">
                Page {currentPage} of {totalPages}
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
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showNoSelectionAlert && (
          <AlertModal
            title="No Selection"
            message="You have not selected any requisitions to delete."
            onClose={() => setShowNoSelectionAlert(false)}
          />
        )}
        {showConfirmDelete && (
          <Modal
            title="Confirm Delete"
            message={`Are you sure you want to delete ${selectedIds.length} selected requisition(s)? This action cannot be undone.`}
            onConfirm={confirmDelete}
            onCancel={() => setShowConfirmDelete(false)}
            confirmText="Delete"
            cancelText="Cancel"
          />
        )}
        {alertModal && (
          <AlertModal
            title={alertModal.title}
            message={alertModal.message}
            onClose={() => setAlertModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobApplication;
