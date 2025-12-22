import React, { useState, useEffect, useRef } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import StatusBadge from "../../../components/StatusBadge";
import CreateRequisition from "./CreateRequisition";
import EditRequisitionModal from "./EditRequisitionModal";
import VewRequisition from "./VewRequisition";
import DeleteRequisitionModal from "../../StaffDashboard/DeleteRequisitionModal";

import {
  LockOpenIcon,
  XMarkIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  FolderOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  TrashIcon,
  PencilIcon,
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import CountUp from "react-countup";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchAllRequisitions,
  bulkDeleteRequisitions,
  fetchStaffRequisitions,
} from "./ApiService";
import JobRequisitionStatsCards from "./JobRequisitionsStatsCard";
import EditRequisition from "./EditRequisition";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Date formatting function
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// ISO date formatting
const formatISODate = (isoString) => {
  if (!isoString) return "-";
  const date = new Date(isoString);
  return `${date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })} ${date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })}`;
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.75 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.75 },
};

const Backdrop = ({ onClick }) => (
  <motion.div
    className="fixed inset-0 bg-black bg-opacity-50 z-40"
    onClick={onClick}
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.5 }}
    exit={{ opacity: 0 }}
  />
);

const Modal = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => (
  <>
    <Backdrop onClick={onCancel} />
    <motion.div
      className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg"
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
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
  </>
);

const AlertModal = ({ title, message, onClose }) => (
  <>
    <Backdrop onClick={onClose} />
    <motion.div
      className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg"
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      role="alertdialog"
      aria-modal="true"
    >
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      <p className="mb-6">{message}</p>
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          autoFocus
        >
          OK
        </button>
      </div>
    </motion.div>
  </>
);

const SuccessModal = ({ title, message, onClose }) => (
  <>
    <Backdrop onClick={onClose} />
    <motion.div
      className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg"
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      role="alertdialog"
      aria-modal="true"
    >
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      <p className="mb-6">{message}</p>
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="rounded bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
          autoFocus
        >
          OK
        </button>
      </div>
    </motion.div>
  </>
);

const renderPieChart = (jobData, isLoading) => {
  if (isLoading) {
    return (
      <div
        className="chart-wrapper"
        style={{ textAlign: "center", padding: "20px", fontStyle: "italic" }}
      >
        <span className="Reee-Splak">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              border: "3px solid #7226FF",
              borderTopColor: "transparent",
              marginRight: "5px",
              display: "inline-block",
            }}
          />
          Loading chart...
        </span>
        <ul className="tab-Loadding-AniMMA upp-Top">
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>
    );
  }

  const counts = {
    Accepted: jobData.filter((job) => job.status === "open").length,
    Pending: jobData.filter((job) => job.status === "pending").length,
    Rejected: jobData.filter((job) => job.status === "rejected").length,
  };

  const total = counts.Accepted + counts.Pending + counts.Rejected;

  const percentages = {
    Accepted: total ? Math.round((counts.Accepted / total) * 100) : 0,
    Pending: total ? Math.round((counts.Pending / total) * 100) : 0,
    Rejected: total ? Math.round((counts.Rejected / total) * 100) : 0,
  };

  const data = {
    labels: ["Accepted", "Pending", "Rejected"],
    datasets: [
      {
        data: [percentages.Accepted, percentages.Pending, percentages.Rejected],
        backgroundColor: [
          "rgba(75, 192, 192, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(255, 99, 132, 0.8)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(255, 99, 132, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: {
            size: 9,
            family: "'Poppins', 'sans-serif'",
          },
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${value}% (${counts[label.toLowerCase()]})`;
          },
        },
      },
    },
    cutout: "50%",
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
    },
  };

  return (
    <div className="chart-wrapper">
      <div className="chart-container">
        <Pie data={data} options={options} />
      </div>
      <div className="chart-summary">
        <div className="summary-item">
          <div className="summary-color">
            <LockOpenIcon className="w-5 h-5" />
            <span style={{ backgroundColor: "rgba(75, 192, 192, 0.8)" }}></span>
          </div>
          <div className="summary-text">
            {counts.Accepted} ({percentages.Accepted}%)
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-color">
            <ClockIcon className="w-5 h-5" />
            <span style={{ backgroundColor: "rgba(255, 206, 86, 0.8)" }}></span>
          </div>
          <div className="summary-text">
            {counts.Pending} ({percentages.Pending}%)
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-color">
            <XMarkIcon className="w-5 h-5" />
            <span style={{ backgroundColor: "rgba(255, 99, 132, 0.8)" }}></span>
          </div>
          <div className="summary-text">
            {counts.Rejected} ({percentages.Rejected}%)
          </div>
        </div>
      </div>
    </div>
  );
};

const RecruitmentHome = ({

  
  staff = false,
  showCreateRequisitionButton = false,
}) => {
  const [trigger, setTrigger] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [jobData, setJobData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showRequisition, setShowRequisition] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [isVisible, setIsVisible] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showNoSelectionAlert, setShowNoSelectionAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showViewRequisition, setShowViewRequisition] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [cardStats, setCardStats] = useState({
    total: 0,
    accepted: 0,
    pending: 0,
    rejected: 0,
  });
  const [showEditRequisition, setShowEditRequisition] = useState(false);
  const [showDeleteRequisition, setShowDeleteRequisition] = useState(false);

  const masterCheckboxRef = useRef(null);



  const filteredJobs = jobData.filter((job) => {
    const matchesSearch =
      !searchTerm ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.job_requisition_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ||
      job.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesRole =
      roleFilter === "All" ||
      job.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesRole;
  });

  const totalPages = Math.ceil(filteredJobs.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const currentJobs = filteredJobs.slice(startIdx, startIdx + rowsPerPage);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      let response;
      if (staff) {
        // Call staff-specific API if staff prop is true
        response = await fetchStaffRequisitions();
      } else {
        // Call regular API otherwise
        response = await fetchAllRequisitions();
      }

      // Ensure response is an array
      let normalizedData = [];
      if (Array.isArray(response)) {
        normalizedData = response;
      } else if (response && Array.isArray(response.results)) {
        normalizedData = response.results;
      } else if (response && response.detail) {
        setErrorMessage(response.detail || "Invalid response format from API");
        normalizedData = [];
      } else if (!response || response === "") {
        normalizedData = [];
      } else {
        setErrorMessage(
          `Unexpected response format: ${typeof response} received`
        );
        normalizedData = [];
      }

      // Map the data if not empty
      if (normalizedData.length > 0) {
        normalizedData = normalizedData.map((job) => ({
          ...job,
          requestedDate: job.requested_date || job.created_at,
          requestedBy: job.requested_by || {
            first_name: "Staff",
            last_name: "Member",
            job_role: job.role || "Staff",
          },
        }));
        normalizedData.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
      }

      setJobData(normalizedData);

      // Update card stats based on the normalized data
      setCardStats({
        total: normalizedData.length,
        accepted: normalizedData.filter((job) => job.status === "open").length,
        pending: normalizedData.filter((job) => job.status === "pending")
          .length,
        rejected: normalizedData.filter((job) => job.status === "rejected")
          .length,
      });

      if (normalizedData.length > 0 && errorMessage) {
        setErrorMessage("");
      }
    } catch (error) {
      const errorMsg = error.message || "Failed to fetch job requisitions";
      setErrorMessage(errorMsg);
      setJobData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [staff]);

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
      masterCheckboxRef.current.checked = allVisibleSelected;
    }
  }, [selectedIds, currentJobs]);

  useEffect(() => {
    const maxPage = Math.ceil(filteredJobs.length / rowsPerPage);
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(maxPage);
    }
  }, [rowsPerPage, filteredJobs.length, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, roleFilter, rowsPerPage]);

  const statuses = [
    "All",
    ...new Set(
      jobData.map(
        (job) => job.status.charAt(0).toUpperCase() + job.status.slice(1)
      )
    ),
  ];
  const roles = [
    "All",
    ...new Set(
      jobData.map((job) => job.role.charAt(0).toUpperCase() + job.role.slice(1))
    ),
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

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

  const handleRequisitionSuccess = async () => {
    await fetchJobs();
    setLastUpdateTime(new Date());
  };

  const handleDeleteMarked = () => {
    if (!selectedIds.length) {
      setShowNoSelectionAlert(true);
      return;
    }
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await bulkDeleteRequisitions(selectedIds);
      await fetchJobs();
      setSelectedIds([]);
      setShowConfirmDelete(false);
      setSuccessMessage(
        response.detail ||
          `${selectedIds.length} requisition(s) have been moved to the recycle bin.`
      );
      setShowSuccessAlert(true);
      setErrorMessage("");
    } catch (error) {
      setShowConfirmDelete(false);
      setErrorMessage(error.message || "Failed to soft delete requisitions");
    }
  };

  const toggleSection = () => {
    setIsVisible(!isVisible);
  };

  const handleViewClick = (job) => {
    setSelectedJob(job);
    setShowViewRequisition(true);
  };

  const handleEditClick = (job) => {
    setSelectedJob(job);
    setShowEditRequisition(true);
  };

  const handleDeleteClick = (job) => {
    setSelectedJob(job);
    setShowDeleteRequisition(true);
  };

  const handleCloseViewRequisition = () => {
    setShowViewRequisition(false);
    setSelectedJob(null);
  };

  const getFullName = (user) => {
    if (!user || typeof user !== "object") return "Unknown";
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.email || "Unknown";
  };

  const getReasonText = (job) => {
    if (job.status === "pending") {
      return "Under review by management";
    }
    return (
      job.comment ||
      (job.status === "open"
        ? "Approved by management"
        : "Rejected by management")
    );
  };

  const getPosition = (user) => {
    if (!user || typeof user !== "object") return "Unknown";
    if (user.job_role) {
      return `${user.job_role}`;
    }
    return "staff";
  };

  const numColumns = staff ? 6 : 7;

  return (
    <div className="YUa-Opal-sec">
      <div className="YUa-Opal-Part-1">
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              key="error-alert"
              className="error-alert mmoah-Dals"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              style={{
                color: "white",
                padding: "10px 15px",
                borderRadius: "6px",
                marginBottom: "15px",
                display: "flex",
                alignItems: "center",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="mmoah-Dals-DDga">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  style={{ minWidth: "20px" }}
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errorMessage}
              </div>
              <button
                onClick={() => setErrorMessage("")}
                className="ml-auto focus:outline-none"
                aria-label="Close error"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showSuccessAlert && (
            <SuccessModal
              key="success-modal"
              title="Success"
              message={successMessage}
              onClose={() => setShowSuccessAlert(false)}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showConfirmDelete && (
            <Modal
              key="confirm-delete-modal"
              title="Confirm Soft Delete"
              message={`Are you sure you want to soft delete ${selectedIds.length} marked requisition(s)? They will be moved to the recycle bin and can be recovered later.`}
              onConfirm={confirmDelete}
              onCancel={() => setShowConfirmDelete(false)}
              confirmText="Soft Delete"
              cancelText="Cancel"
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showNoSelectionAlert && (
            <AlertModal
              key="no-selection-modal"
              title="No Selection"
              message="You have not selected any requisitions to soft delete."
              onClose={() => setShowNoSelectionAlert(false)}
            />
          )}
        </AnimatePresence>

        <JobRequisitionStatsCards
          stats={cardStats}
          lastUpdateTime={lastUpdateTime}
          lastUpdatedDate={jobData.length > 0 ? jobData[0].updated_at : null}
          formatTime={formatTime}
          formatDate={formatDate}
        />

        <div className="Dash-OO-Boas Gen-Boxshadow">
          <div className="Dash-OO-Boas-Top">
            <div className="Dash-OO-Boas-Top-1">
              <span onClick={toggleSection} title="Filter">
                <AdjustmentsHorizontalIcon className="w-6 h-6" />
              </span>
              <h3>Job Requisitions</h3>
            </div>
            <div className="Dash-OO-Boas-Top-2">
              <div className="genn-Drop-Search">
                <span>
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  placeholder="Search requisitions..."
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
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="filter-select"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role === "All" ? "All Roles" : role}
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
                      disabled={isLoading || currentJobs.length === 0}
                    />
                  </th>
                  <th>Request ID </th>
                  <th>Title</th>
                  <th>Status</th>
                  {staff && <th>Reason for Status</th>}
                  <th>Request Date</th>
                  {!staff && <th>Requested By</th>}
                  {!staff && <th>Staff Role</th>}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={numColumns}
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
                        <li></li>
                      </ul>
                    </td>
                  </tr>
                ) : currentJobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={numColumns}
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
                    <tr key={job.id} onClick={() => handleViewClick(job)}>
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(job.id)}
                          onChange={() => handleCheckboxChange(job.id)}
                          onClick={(e) => e.stopPropagation()}
                          disabled={isLoading}
                        />
                      </td>
                      <td>{job.job_requisition_code}</td>
                      <td>{job.title}</td>
                      <td>
                        <StatusBadge
                          status={
                            job.status === "open" ? "accepted" : job.status
                          }
                        />
                      </td>
                      {staff && (
                        <td className="reason-cell">{getReasonText(job)}</td>
                      )}
                      <td>{formatDate(job.requestedDate)}</td>
                      {!staff && <td>{getFullName(job.requestedBy)}</td>}
                      {!staff && (
                        <td>
                          <span
                            className={`role ${getPosition(
                              job.requestedBy
                            ).toLowerCase()}`}
                          >
                            {getPosition(job.requestedBy)}
                          </span>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredJobs.length > 0 && (
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
                    disabled={isLoading || currentJobs.length === 0}
                  >
                    <CheckCircleIcon className="h-6 w-6" />
                    {currentJobs.every((job) => selectedIds.includes(job.id))
                      ? "Unmark All"
                      : "Mark All"}
                  </button>
                  <button
                    onClick={handleDeleteMarked}
                    className="delete-marked-btn"
                    disabled={isLoading || selectedIds.length === 0}
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
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="YUa-Opal-Part-2">
        <div className="Top-GHY-s">
          {showCreateRequisitionButton && (
            <button
              onClick={() => setShowRequisition(true)}
              className="btn-primary-bg"
            >
              <PlusIcon className="w-5 h-5" /> Create Job Requisition
            </button>
          )}
          <p>
            Last Created{" "}
            <span>
              {jobData.length > 0
                ? formatISODate(jobData[0].created_at)
                : "N/A"}
            </span>
          </p>
        </div>

        <div className="chart-container">
          {renderPieChart(jobData, isLoading)}
        </div>
      </div>

      <AnimatePresence>
        {showRequisition && staff && (
          <CreateRequisition
            key="create-requisition"
            onClose={() => setShowRequisition(false)}
            onSuccess={handleRequisitionSuccess}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditRequisition && staff && (
          <EditRequisitionModal
            job={selectedJob}
            onHideEditRequisition={() => setShowEditRequisition(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showViewRequisition && (
          <VewRequisition
            key="view-requisition"
            job={selectedJob}
            onClose={handleCloseViewRequisition}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteRequisition && selectedJob && (
          <DeleteRequisitionModal
            key="delete-requisition-modal"
            isOpen={showDeleteRequisition}
            onClose={() => setShowDeleteRequisition(false)}
            requisition={selectedJob}
            onDeleteSuccess={() => {
              setSuccessMessage(
                `Requisition #${selectedJob.job_requisition_code} has been deleted successfully!`
              );
              setShowSuccessAlert(true);
              fetchJobs();
            }}
          />
        )}
      </AnimatePresence>

      {/* <AnimatePresence>
        {showEditRequisition && staff && (
          <EditRequisition
            job={selectedJob}
            onHideEditRequisition={() => setShowEditRequisition(false)}
          />
        )}
      </AnimatePresence> */}
    </div>
  );
};

export default RecruitmentHome;
