import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  TrashIcon,
  BriefcaseIcon,
  MegaphoneIcon,
  LockClosedIcon,
  ClipboardDocumentIcon,
  GlobeAltIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import StatusBadge from "../../../components/StatusBadge";
import JobDetails from "./JobDetails";
import EditRequisition from "./EditRequisition";
import CountUp from "react-countup";
import { fetchAllRequisitions, bulkDeleteRequisitions } from "./ApiService";
import { WEB_PAGE__URL } from "../../../config";

// Modal component
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

// AlertModal component
const AlertModal = ({ title, message, onClose }) => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 z-40"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      exit={{ opacity: 0 }}
    />
    <motion.div
      className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg"
      initial={{ opacity: 0, scale: 0.75 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.75 }}
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

const JobAdvert = () => {
  const [jobData, setJobData] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [previousPageUrl, setPreviousPageUrl] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isVisible, setIsVisible] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showNoSelectionAlert, setShowNoSelectionAlert] = useState(false);
  const [showViewRequisition, setShowViewRequisition] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showEditRequisition, setShowEditRequisition] = useState(false);
  const [alertModal, setAlertModal] = useState(null);
  const [trigger, setTrigger] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    closed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [copiedUniqueLink, setCopiedUniqueLink] = useState(null);

  const masterCheckboxRef = useRef(null);
  const API_PAGE_SIZE = 20; // Fixed server-side page size

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

  // Copy link to clipboard using unique_link
  const handleCopyLink = (uniqueLink) => {
    const link = `${WEB_PAGE__URL}/jobs/${uniqueLink}`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        setCopiedUniqueLink(uniqueLink);
        setTimeout(() => setCopiedUniqueLink(null), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
        setAlertModal({
          title: "Error",
          message: "Failed to copy the link to clipboard.",
        });
      });
  };


  // console.log("qwertyuioiuytrewertyuio")

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        let apiStatusFilter = null;
        if (statusFilter !== "All") {
          apiStatusFilter = statusFilter.toLowerCase();
        }
        // For "All", pass null to fetch all statuses, then filter client-side to open/closed
        const url =
          currentPage === 1
            ? null
            : currentPage > 1 &&
              previousPageUrl &&
              currentPage < Math.ceil(totalCount / API_PAGE_SIZE)
            ? nextPageUrl
            : previousPageUrl;
        const response = await fetchAllRequisitions(
          url,
          searchTerm,
          apiStatusFilter
        );
        let publishedJobs = response.results
          .filter((job) => job.publish_status === true)
          .map((job) => ({
            id: job.id,
            title: job.title,
            unique_link: job.unique_link,
            jobType: reverseJobTypeMap[job.job_type] || job.job_type,
            location:
              reverseLocationTypeMap[job.location_type] || job.location_type,
            deadline: formatDate(job.deadline_date),
            status: job.status.charAt(0).toUpperCase() + job.status.slice(1),
            company: job.company_name || "N/A",
            requested_by: job.requested_by || "N/A",
            role: job.role || "N/A",
            location_type: job.location_type || "N/A",
            company_address: job.company_address || "N/A",
            job_location: job.job_location || "N/A",
            salary_range: job.salary_range || "N/A",
            job_description: job.job_description || "N/A",
            number_of_candidates: job.number_of_candidates || "N/A",
            qualification_requirement: job.qualification_requirement || "N/A",
            experience_requirement: job.experience_requirement || "N/A",
            knowledge_requirement: job.knowledge_requirement || "N/A",
            reason: job.reason || "N/A",
            job_application_code: job.job_application_code || "N/A",
            responsibilities: job.responsibilities || "N/A",
            start_date: job.start_date || "N/A",
            documents_required: job.documents_required || [],
            compliance_checklist: job.compliance_checklist || [],
            advert_banner: job.advert_banner || [],
            created_at: job.created_at || null,
          }));

        // Filter to only open and closed for "All"; otherwise, use as-is (which should already be filtered by API)
        if (statusFilter === "All") {
          publishedJobs = publishedJobs.filter(
            (job) => job.status === "Open" || job.status === "Closed"
          );
        }

        setJobData(publishedJobs);
        setTotalCount(publishedJobs?.length);
        setNextPageUrl(response.next);
        setPreviousPageUrl(response.previous);

        setStats({
          total: publishedJobs?.length,
          open: publishedJobs.filter((job) => job.status === "Open").length,
          closed: publishedJobs.filter((job) => job.status === "Closed").length,
        });
      } catch (error) {
        setAlertModal({
          title: "Error",
          message: error.message || "Failed to fetch jobs.",
        });
        console.error("Error fetching jobs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [trigger, currentPage, searchTerm, statusFilter]);

  // Polling for updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTrigger((prev) => prev + 1);
      setLastUpdateTime(new Date());
    }, 50000);
    return () => clearInterval(interval);
  }, []);

  // Filter jobs based on search and status
  const filteredJobs = jobData.filter((job) => {
    const matchesSearch =
      job.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jobType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.deadline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.status.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort filtered jobs by created_at descending (most recent first)
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
    const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
    return dateB - dateA;
  });

  // Apply client-side pagination for display
  const totalPages = Math.ceil(sortedJobs.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const currentJobs = sortedJobs.slice(startIdx, startIdx + rowsPerPage);

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

  // Adjust page if rowsPerPage changes
  useEffect(() => {
    const maxPage = Math.ceil(sortedJobs.length / rowsPerPage);
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(maxPage);
    } else if (maxPage === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [rowsPerPage, sortedJobs.length, currentPage]);

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

  const handleDeleteMarked = () => {
    if (selectedIds.length === 0) {
      setShowNoSelectionAlert(true);
      return;
    }
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    try {
      await bulkDeleteRequisitions(selectedIds);
      setTrigger((prev) => prev + 1); // Refresh data after deletion
      setSelectedIds([]);
      if (
        currentJobs.length === selectedIds.length &&
        currentPage > 1 &&
        !nextPageUrl
      ) {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
      }
      setShowConfirmDelete(false);
    } catch (error) {
      setShowConfirmDelete(false);
      setAlertModal({
        title: "Error",
        message: error.message || "Failed to delete jobs.",
      });
      console.error("Error deleting jobs:", error);
    }
  };

  const toggleSection = () => {
    setIsVisible((prev) => !prev);
  };

  const handleViewClick = (job) => {
    setSelectedJob(job);
    setShowViewRequisition(true);
  };

  const handleCloseViewRequisition = () => {
    setShowViewRequisition(false);
    setSelectedJob(null);
  };

  const handleShowEditRequisition = () => {
    setShowEditRequisition(true);
  };

  const handleHideEditRequisition = () => {
    setShowEditRequisition(false);
  };

  const closeAlert = () => {
    setAlertModal(null);
  };

  const statuses = ["All", "Open", "Closed"];

  return (
    <div className="JobAdvert-sec">
      <div className="Dash-OO-Boas TTTo-POkay">
        <div className="glo-Top-Cards">
          {[
            {
              icon: BriefcaseIcon,
              label: "Total Job Advertisements",
              value: stats.total,
            },
            {
              icon: MegaphoneIcon,
              label: "Open Advertisements",
              value: stats.open,
            },
            {
              icon: LockClosedIcon,
              label: "Closed Advertisements",
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
              <AdjustmentsHorizontalIcon />
            </span>
            <h3>Job Advertisements</h3>
          </div>
          <div className="Dash-OO-Boas-Top-2">
            <div className="genn-Drop-Search">
              <span>
                <MagnifyingGlassIcon />
              </span>
              <input
                type="text"
                placeholder="Search advertisements..."
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
                <th>Job ID</th>
                <th>Job Title</th>
                <th>Job Type</th>
                <th>Location</th>
                <th>Deadline for Applications</th>
                <th>Status</th>
                <th>Application Link</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={9}
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
                    colSpan={9}
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      fontStyle: "italic",
                    }}
                  >
                    No Job Advertisements found
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
                    <td>{job.job_application_code}</td>
                    <td>{job.title}</td>
                    <td>{job.jobType}</td>
                    <td>{job.location}</td>
                    <td>{job.deadline}</td>
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
                      <div
                        className="oooi-Cuup-LinkD"
                        onClick={() => handleCopyLink(job.unique_link)}
                      >
                        <p style={{ marginRight: "8px" }}>
                          {`${WEB_PAGE__URL}/jobs/${job.unique_link}`}
                        </p>
                        <span>
                          {copiedUniqueLink === job.unique_link ? (
                            <span className="coppied-Stattsu">Copied!</span>
                          ) : (
                            <ClipboardDocumentIcon className="h-5 w-5" />
                          )}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="gen-td-btns">
                        <button
                          className="view-btn"
                          onClick={() => handleViewClick(job)}
                        >
                          Details
                        </button>
                        <Link
                          to={`/jobs/${job.unique_link}`}
                          className="link-btn btn-primary-bg"
                          target="_blank"
                        >
                          <GlobeAltIcon />
                          Site
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
                  disabled={!previousPageUrl}
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  className="page-button"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={!nextPageUrl}
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showConfirmDelete && (
          <Modal
            title="Confirm Delete"
            message={`Are you sure you want to delete ${selectedIds.length} marked advertisement(s)? This action cannot be undone.`}
            onConfirm={confirmDelete}
            onCancel={() => setShowConfirmDelete(false)}
            confirmText="Delete"
            cancelText="Cancel"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNoSelectionAlert && (
          <AlertModal
            title="No Selection"
            message="You have not selected any advertisements to delete."
            onClose={() => setShowNoSelectionAlert(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {alertModal && (
          <AlertModal
            title={alertModal.title}
            message={alertModal.message}
            onClose={closeAlert}
          />
        )}
      </AnimatePresence>

      {showViewRequisition && (
        <JobDetails
          job={selectedJob}
          onClose={handleCloseViewRequisition}
          onShowEditRequisition={handleShowEditRequisition}
        />
      )}

      {showEditRequisition && (
        <EditRequisition
          job={selectedJob}
          onHideEditRequisition={handleHideEditRequisition}
        />
      )}
    </div>
  );
};

export default JobAdvert;
