import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  CheckIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import PDFICON from "../../../assets/Img/pdf-icon.png";
import ApplicantDetails from "./ApplicantDetails";
import { Link, useLocation } from "react-router-dom";
import "./ViewApplications.css";
import {
  fetchJobApplicationsByRequisition,
  updateJobApplicationStatus,
  bulkDeleteJobApplications,
  screenResumes,
  fetchRequisition,
  checkScreeningTaskStatus,
} from "./ApiService";
import StatusBadge from "../../../components/StatusBadge";
import { normalizeText } from "../../../utils/helpers";

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
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
          className="rounded bg-gray-300 px-4 py-2 font-semibold hover:bg-gray-400"
          onClick={onCancel}
        >
          {cancelText}
        </button>
        <button
          className="rounded bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
          onClick={onConfirm}
          autoFocus
        >
          {confirmText}
        </button>
      </div>
    </motion.div>
  </AnimatePresence>
);

const AlertModal = ({ title, message, onClose }) => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
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
          className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          onClick={onClose}
          autoFocus
        >
          OK
        </button>
      </div>
    </motion.div>
  </AnimatePresence>
);

const DocumentSelectionModal = ({ documentsRequired, onConfirm, onCancel }) => {
  const [selectedDocumentType, setSelectedDocumentType] = useState(
    documentsRequired[0] || ""
  );

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      />
      <motion.div
        className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg"
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.75 }}
        role="dialog"
        aria-modal="true"
      >
        <h3 className="mb-4 text-lg font-semibold">
          Select Document for Screening
        </h3>
        <p className="mb-4">
          Choose the document type to use for resume screening:
        </p>
        <div className="GHuh-Form-Input">
          <select
            value={selectedDocumentType}
            onChange={(e) => setSelectedDocumentType(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          >
            {documentsRequired.map((doc, index) => (
              <option key={`${doc}-${index}`} value={doc}>
                {doc}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-3">
          <button
            className="rounded bg-gray-300 px-4 py-2 font-semibold hover:bg-gray-400"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            onClick={() => onConfirm(selectedDocumentType)}
            autoFocus
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const CountUpNumber = ({ target, duration = 1 }) => {
  const count = useMotionValue(0);
  const [current, setCurrent] = useState(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, target, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setCurrent(Math.round(latest)),
    });
    return () => controls.stop();
  }, [count, target, duration]);

  return <motion.span>{current}</motion.span>;
};

const CircularProgress = ({ percentage, color }) => {
  const radius = 30;
  const stroke = 5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.svg
      height={radius * 2}
      width={radius * 2}
      className="circular-progress"
    >
      <circle
        stroke="#f0f0f0"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <motion.circle
        stroke={color}
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1 }}
        style={{
          transform: "rotate(-90deg)",
          transformOrigin: "50% 50%",
        }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fontSize="8"
        fill="#333"
        fontWeight="500"
      >
        {percentage}%
      </text>
    </motion.svg>
  );
};

const ApplicationStatsChart = ({ data }) => (
  <div style={{ width: "100%", height: 180 }}>
    <h3>Applications Overview</h3>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
      >
        <XAxis
          dataKey="title"
          tick={{ fontSize: 7 }}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={30}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 7 }} width={30} />
        <Tooltip wrapperStyle={{ fontSize: "0.85rem" }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={20}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const ViewApplications = () => {
  // State declarations in logical order
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
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showApplicantDetails, setShowApplicantDetails] = useState(false);
  const [applicantData, setApplicantData] = useState([]);
  const [jobTitle, setJobTitle] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [screeningResults, setScreeningResults] = useState(null);
  const [showScreeningAlert, setShowScreeningAlert] = useState(false);
  const [showDocumentSelectionModal, setShowDocumentSelectionModal] =
    useState(false);
  const [documentsRequired, setDocumentsRequired] = useState([]);
  const [numberOfShortlistedCandidates, setNumberOfShortlistedCandidates] =
    useState("0");

  // Tooltip states for manual evaluation hover
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipDetails, setTooltipDetails] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Screening polling states
  const [pollingTaskId, setPollingTaskId] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [screeningProgress, setScreeningProgress] = useState(null);

  const location = useLocation();
  const job = location.state?.job;
  const masterCheckboxRef = useRef(null);

  const API_PAGE_SIZE = 20; // Fixed server-side page size
  const STORAGE_KEY = `screening_task_${job?.id}`;

  // Main data fetching function
  const fetchApplications = useCallback(async () => {
    if (!job) {
      setError("No job ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const url =
        currentPage === 1
          ? null
          : currentPage > 1 &&
            previousPageUrl &&
            currentPage < Math.ceil(totalCount / API_PAGE_SIZE)
          ? nextPageUrl
          : previousPageUrl;
      const response = await fetchJobApplicationsByRequisition(job.id, url);

      const validStatuses = ["new", "shortlisted", "hired", "rejected"];

      // In your fetchApplications function, add safety checks:
      const transformedData = response.results
        ? response.results
            .filter(
              (app) => app && validStatuses.includes(app.status?.toLowerCase())
            )
            .map((app) => {
              // Compute evaluation mode from status_history
              let statusHistory = app.status_history || [];
              let latestStatus = null;
              if (statusHistory.length > 0) {
                latestStatus = statusHistory.sort(
                  (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                )[0];
              }
              const evaluationMode = latestStatus
                ? latestStatus.automated
                  ? "Auto"
                  : "Manual"
                : "None";

              return {
                id: app.id,
                name: app.full_name || "Unknown",
                jobRequisition: app.job_requisition || "Unknown",
                jobRequisitionId: app.job_requisition_id || job.id,
                jobTitle: app.job_requisition_title || "Unknown",
                dateApplied: app.applied_at
                  ? new Date(app.applied_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Unknown",
                dateOfBirth: app.date_of_birth || "Unknown",
                status: app.status
                  ? app.status.charAt(0).toUpperCase() + app.status.slice(1)
                  : "Unknown",
                source: app.source || "Unknown",
                resumeUrl: app.documents
                  ? app.documents.find((doc) => doc.document_type === "CV")
                      ?.file_url || "#"
                  : "#",
                email: app.email || "Not provided",
                phone: app.phone || "Not provided",
                qualification: app.qualification || "Not provided",
                experience: app.experience || "Not provided",
                knowledge_skill: app.knowledge_skill || "Not provided",
                cover_letter: app.cover_letter || "No cover letter provided",
                documents: app.documents
                  ? app.documents.map((doc) => ({
                      name: doc.document_type,
                      type: doc.document_type,
                      document_type: doc.document_type,
                      file: doc?.file_url,
                      file_url: doc?.file_url,
                      size: doc.size || "Unknown",
                    }))
                  : [],
                jobType: app.job_type || "Not provided",
                location: app.location || "Not provided",
                address: app.address || "Not provided",
                salary: app.salary || "Not provided",
                company: job.company_name || "Not provided",
                screening_score: app.screening_score || 0,
                employment_gaps: app.employment_gaps || [],
                screening_status: app.screening_status || "pending",
                evaluationMode,
                latestStatus, // For manual details
              };
            })
        : [];

      setApplicantData(transformedData);
      setTotalCount(response.count);
      setNextPageUrl(response.next);
      setPreviousPageUrl(response.previous);
      setJobTitle(transformedData[0]?.jobTitle || "Job Applications");
      setDocumentsRequired(job.documents_required || []);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to fetch applications");
      setLoading(false);
    }
  }, [job, currentPage, nextPageUrl, previousPageUrl, totalCount]);

  // Screening task completion handler
  const handleTaskCompletion = (result) => {
    localStorage.removeItem(STORAGE_KEY);
    setPollingInterval(null);
    setPollingTaskId(null);
    setScreeningResults(result);
    setScreeningProgress({
      status: "COMPLETED",
      message: "Screening completed successfully!",
    });
    fetchApplications();
  };

  // Screening task failure handler
  const handleTaskFailure = (error) => {
    localStorage.removeItem(STORAGE_KEY);
    setPollingInterval(null);
    setPollingTaskId(null);
    setScreeningProgress({
      status: "FAILED",
      message: `Screening failed: ${error}`,
    });
    setError(error);
  };

  // Modified polling function with storage
  const startPollingTaskStatus = (taskId) => {
    setPollingTaskId(taskId);
    setScreeningProgress({
      status: "PENDING",
      message: "Resuming screening process...",
    });

    // Store task info
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        taskId,
        jobId: job.id,
        timestamp: Date.now(),
      })
    );

    const interval = setInterval(async () => {
      try {
        const statusResponse = await checkScreeningTaskStatus(taskId);

        switch (statusResponse.status) {
          case "SUCCESS":
            clearInterval(interval);
            handleTaskCompletion(statusResponse.result);
            break;

          case "FAILURE":
            clearInterval(interval);
            handleTaskFailure(statusResponse.error);
            break;

          case "PENDING":
          case "STARTED":
            setScreeningProgress({
              status: "PENDING",
              message: "Screening in progress...",
            });
            // Update timestamp to keep task fresh
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({
                taskId,
                jobId: job.id,
                timestamp: Date.now(),
              })
            );
            break;

          default:
            setScreeningProgress({
              status: "PENDING",
              message: "Processing...",
            });
        }
      } catch (error) {
        console.error("Error checking task status:", error);
        // If task not found, clear storage and stop polling
        if (error.response?.status === 404) {
          clearInterval(interval);
          localStorage.removeItem(STORAGE_KEY);
          setPollingInterval(null);
          setPollingTaskId(null);
          setScreeningProgress({
            status: "FAILED",
            message: "Screening task no longer exists on server.",
          });
        }
      }
    }, 5000);

    setPollingInterval(interval);
  };

  // Manual cleanup function (optional)
  const cancelScreening = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setPollingTaskId(null);
    setScreeningProgress(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Resume screening on component mount
  useEffect(() => {
    const resumeScreeningIfNeeded = async () => {
      if (!job?.id) return;

      // First check localStorage
      const storedTask = localStorage.getItem(STORAGE_KEY);
      if (storedTask) {
        const taskData = JSON.parse(storedTask);
        const taskAge = Date.now() - taskData.timestamp;
        const MAX_TASK_AGE = 30 * 60 * 1000; // 30 minutes

        if (taskAge < MAX_TASK_AGE) {
          // Verify task is still active on server
          try {
            const taskStatus = await checkScreeningTaskStatus(taskData.taskId);
            if (
              taskStatus.status === "PENDING" ||
              taskStatus.status === "STARTED"
            ) {
              setPollingTaskId(taskData.taskId);
              startPollingTaskStatus(taskData.taskId);
              return;
            }
          } catch (error) {
            console.warn("Stored task no longer valid:", error);
          }
        }
        // Clean up invalid/expired task
        localStorage.removeItem(STORAGE_KEY);
      }

      // If no valid stored task, check server for active tasks
      // Note: You'll need to implement getActiveScreeningTasks in your ApiService
      try {
        // This is commented out since getActiveScreeningTasks doesn't exist yet
        // const activeTasks = await getActiveScreeningTasks(job.id);
        // if (activeTasks.length > 0) {
        //   const latestTask = activeTasks[0];
        //   setPollingTaskId(latestTask.task_id);
        //   startPollingTaskStatus(latestTask.task_id);
        // }
      } catch (error) {
        console.error("Error checking active tasks:", error);
      }
    };

    resumeScreeningIfNeeded();
  }, [job?.id]);

  // Clean up interval on component unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Fetch applications on mount and when dependencies change
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Fetch requisition data for number of candidates
  useEffect(() => {
    if (job?.id) {
      const fetchData = async () => {
        try {
          const data = await fetchRequisition(job.id);
          setNumberOfShortlistedCandidates(
            data.number_of_candidates ? String(data.number_of_candidates) : "0"
          );
        } catch (error) {
          setError(error.message);
        }
      };
      fetchData();
    }
  }, [job?.id]);

  // Screening functions
  const initiateScreening = () => {
    if (documentsRequired.length === 0) {
      setDocumentsRequired(["Curriculum Vitae (CV)"]);
      handleScreenResumes("Curriculum Vitae (CV)");
      return;
    }
    setShowDocumentSelectionModal(true);
  };

  const handleScreenResumes = async (documentType) => {
    try {
      setLoading(true);
      const applications = applicantData
        .filter((app) =>
          app.documents?.some(
            (doc) => doc.type?.toLowerCase() === documentType.toLowerCase()
          )
        )
        .map((app) => ({
          application_id: app.id,
          file_url: app.documents?.find(
            (doc) => doc.type?.toLowerCase() === documentType.toLowerCase()
          )?.file_url,
        }));

      if (applications.length === 0) {
        throw new Error(`No applications with ${documentType} found.`);
      }

      const payload = {
        document_type: documentType.toLowerCase(),
        applications: applications,
        number_of_candidates: numberOfShortlistedCandidates,
      };

      const response = await screenResumes(job.id, payload);

      // Check if it's an async response with task_id
      if (response.task_id) {
        // Start polling for results
        startPollingTaskStatus(response.task_id);
        setShowScreeningAlert(true);
        setShowDocumentSelectionModal(false);
      } else {
        // Handle synchronous response (for small batches)
        setScreeningResults(response);
        setShowScreeningAlert(true);
        await fetchApplications(); // Refresh the applications list
        setShowDocumentSelectionModal(false);
      }
    } catch (err) {
      let errorMessage = "Failed to screen resumes.";
      if (err.response?.data) {
        const { detail, failed_applications, error_type } = err.response.data;
        errorMessage = detail || errorMessage;
        if (failed_applications?.length) {
          errorMessage += ` Failed applications: ${failed_applications
            .map((app) => `${app.full_name} (${app.error})`)
            .join(", ")}`;
        }
        if (error_type) {
          errorMessage += ` (Error type: ${error_type})`;
        }
      } else {
        errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
      setShowScreeningAlert(true);
      setShowDocumentSelectionModal(false);
    } finally {
      setLoading(false);
    }
  };

  // Stats calculation
  const calculateStats = useCallback(() => {
    const total = totalCount; // Use totalCount for stats to reflect all applications
    const shortlisted = applicantData.filter(
      (a) => a.status === "Shortlisted"
    ).length;
    const hired = applicantData.filter((a) => a.status === "Hired").length;
    const rejected = applicantData.filter(
      (a) => a.status === "Rejected"
    ).length;

    return [
      {
        title: "Total Applications",
        count: total,
        percentage: 100,
        color: "#6DD5FA",
      },
      {
        title: "Shortlisted",
        count: shortlisted,
        percentage: total ? (shortlisted / total) * 100 : 0,
        color: "#FF9770",
      },
      {
        title: "Hired",
        count: hired,
        percentage: total ? (hired / total) * 100 : 0,
        color: "#2DD4BF",
      },
      {
        title: "Rejected",
        count: rejected,
        percentage: total ? (rejected / total) * 100 : 0,
        color: "#E54BFF",
      },
    ];
  }, [applicantData, totalCount]);

  const stats = calculateStats();
  const statuses = [
    "All",
    ...new Set(applicantData.map((applicant) => applicant.status)),
  ];

  // Filter and pagination logic
  const filteredApplicants = applicantData.filter((applicant) => {
    const matchesSearch =
      applicant.id
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.dateApplied.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.source.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || applicant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(totalCount / API_PAGE_SIZE);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const currentApplicants = filteredApplicants.slice(
    startIdx,
    startIdx + rowsPerPage
  );

  // Check if all visible applicants are selected
  useEffect(() => {
    const allVisibleSelected = currentApplicants.every((applicant) =>
      selectedIds.includes(applicant.id)
    );
    const someSelected = currentApplicants.some((applicant) =>
      selectedIds.includes(applicant.id)
    );
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate =
        !allVisibleSelected && someSelected;
    }
  }, [selectedIds, currentApplicants]);

  // Adjust current page if needed when rows per page changes
  useEffect(() => {
    const maxPage = Math.ceil(filteredApplicants.length / rowsPerPage);
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(maxPage);
    } else if (maxPage === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [rowsPerPage, filteredApplicants.length, currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, rowsPerPage]);

  // Event handlers
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    const allVisibleIds = currentApplicants.map((applicant) => applicant.id);
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

  const handleDeleteMarked = async () => {
    if (selectedIds.length === 0) {
      setShowNoSelectionAlert(true);
      return;
    }
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    try {
      await bulkDeleteJobApplications(selectedIds);
      setSelectedIds([]);
      if (
        currentApplicants.length === selectedIds.length &&
        currentPage > 1 &&
        !nextPageUrl
      ) {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
      }
      await fetchApplications();
      setShowConfirmDelete(false);
    } catch (err) {
      setError(err.message || "Failed to delete applications");
      setShowConfirmDelete(false);
    }
  };

  const toggleSection = () => {
    setIsVisible((prev) => !prev);
  };

  const handleViewClick = (applicant) => {
    setSelectedApplicant(applicant);
    setShowApplicantDetails(true);
  };

  const handleCloseDetails = () => {
    setShowApplicantDetails(false);
    setSelectedApplicant(null);
  };

  const handleStatusChange = async (id, jobRequisitionId, newStatus, email) => {
    try {
      await updateJobApplicationStatus(id, {
        status: newStatus,
        job_requisition_id: jobRequisitionId,
        email,
      });
      await fetchApplications();
    } catch (err) {
      setError(err.message || "Failed to update status");
    }
  };

  const handleCardClick = (title) => {
    const filterMap = {
      "Total Applications": "All",
      Shortlisted: "Shortlisted",
      Hired: "Hired",
      Rejected: "Rejected",
    };
    setStatusFilter(filterMap[title] || "All");
    setCurrentPage(1);
  };

  const allPending =
    applicantData.length > 0 &&
    applicantData.every(
      (applicant) => applicant.screening_status === "pending"
    );

  // Updated Tooltip mouse handlers for right-side positioning
  const handleMouseEnter = useCallback((e, applicant) => {
    if (applicant.evaluationMode === "Manual" && applicant.latestStatus) {
      const rect = e.currentTarget.getBoundingClientRect();
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;

      // Position tooltip to the right of the "Manual" text
      setTooltipPosition({
        x: rect.right + scrollX + 10, // 10px gap from the right edge
        y: rect.top + scrollY - 10, // Align with top of the element
      });

      setTooltipDetails({
        name: applicant.latestStatus.changed_by?.name || "Unknown",
        email: applicant.latestStatus.changed_by?.email || "",
        timestamp: applicant.latestStatus.timestamp,
        reason: applicant.latestStatus.reason || "No reason provided",
      });
      setShowTooltip(true);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  return (
    <div className="YUa-Opal-sec ViewApplications-PPGA">
      <div className="YUa-Opal-Part-1">
        <div className="Gtah-Cardaa">
          {stats.map((item, index) => (
            <div
              className="glo-Top-Card Gen-Boxshadow uayh-AccraD"
              key={index}
              onClick={() => handleCardClick(item.title)}
              style={{ cursor: "pointer" }}
            >
              <p>{item.title}</p>
              <div className="Gllla-SUboopaCard">
                <div className="Gllla-SUboopaCard-1">
                  <h3>
                    <CountUpNumber target={item.count} />
                  </h3>
                  <h4>
                    <span>
                      <ArrowTrendingUpIcon className="w-4 h-4 inline" />
                    </span>
                    {item.percentage.toFixed(1)}% from Start
                  </h4>
                </div>
                <div className="Gllla-SUboopaCard-2">
                  <div className="circular-section">
                    <CircularProgress
                      percentage={item.percentage.toFixed(1)}
                      color={item.color}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="Gllla-Toopa">
          <h3>{job?.title}</h3>
        </div>

        {/* Add this near your other status displays */}
        {screeningProgress && (
          <div
            className={`screening-progress Gen-Boxshadow ${screeningProgress.status.toLowerCase()}`}
          >
            <div className="progress-header">
              <h3>Resume Screening Progress</h3>
              <div
                className={`status-badge ${screeningProgress.status.toLowerCase()}`}
              >
                {screeningProgress.status}
              </div>
            </div>
            <p>{screeningProgress.message}</p>
            {screeningProgress.status === "PENDING" && (
              <div className="progress-loader">
                <div className="spinner"></div>
                <span>Processing... This may take several minutes.</span>
              </div>
            )}
            {pollingTaskId && (
              <div className="task-info">
                <small>Task ID: {pollingTaskId}</small>
              </div>
            )}
          </div>
        )}

        {screeningResults && screeningResults.shortlisted_candidates && (
          <div className="screening-results Gen-Boxshadow">
            <div className="oo-Header">
              <h3>Screening Results</h3>
              <p>{screeningResults.detail}</p>
            </div>
            <table className="Gen-Sys-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Screening Score</th>
                  <th>Employment Gaps</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {screeningResults.shortlisted_candidates.map((candidate) => (
                  <tr key={candidate.application_id}>
                    <td>{candidate.full_name}</td>
                    <td>{candidate.email}</td>
                    <td>{candidate.score}%</td>
                    <td>
                      {candidate.employment_gaps &&
                      candidate.employment_gaps.length > 0
                        ? candidate.employment_gaps.map((gap, index) => (
                            <span key={index}>
                              {gap.gap_start} to {gap.gap_end} (
                              {gap.duration_months} months)
                              {index < candidate.employment_gaps.length - 1
                                ? ", "
                                : ""}
                            </span>
                          ))
                        : "None"}
                    </td>
                    <td>{candidate.screening_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="Dash-OO-Boas Gen-Boxshadow">
          <div className="Dash-OO-Boas-Top">
            <div className="Dash-OO-Boas-Top-1">
              <span onClick={toggleSection} title="Filter">
                <AdjustmentsHorizontalIcon />
              </span>
              <h3>Applicant List</h3>
            </div>
            <div className="Dash-OO-Boas-Top-2">
              <div className="genn-Drop-Search">
                <span>
                  <MagnifyingGlassIcon />
                </span>
                <input
                  type="text"
                  placeholder="Search applicants..."
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
                        currentApplicants.length > 0 &&
                        currentApplicants.every((applicant) =>
                          selectedIds.includes(applicant.id)
                        )
                      }
                      disabled={loading}
                    />
                  </th>
                  <th>Applicant Name</th>
                  <th>Date Applied</th>
                  <th>Status</th>
                  <th>Evaluation Mode</th>
                  <th>Source</th>
                  <th>Resume</th>
                  <th>AI Job Match (%)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
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
                        <li></li>
                      </ul>
                    </td>
                  </tr>
                ) : currentApplicants.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        fontStyle: "italic",
                      }}
                    >
                      No matching applicants found
                    </td>
                  </tr>
                ) : (
                  currentApplicants.map((applicant) => (
                    <tr key={applicant.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(applicant.id)}
                          onChange={() => handleCheckboxChange(applicant.id)}
                        />
                      </td>
                      <td>
                        {applicant.name}
                        {applicant.employment_gaps.length > 0 && (
                          <span
                            className="gap-badge"
                            title="Employment gap detected"
                          >
                            <svg
                              className="w-4 h-4 inline ml-1 text-yellow-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            GAP
                          </span>
                        )}
                      </td>
                      <td>{applicant.dateApplied}</td>
                      <td>
                        <span>
                          <StatusBadge status={applicant.status} />
                        </span>
                      </td>
                      <td>
                        {applicant.evaluationMode === "Auto" ? (
                          "Auto"
                        ) : applicant.evaluationMode === "Manual" ? (
                          <span
                            onMouseEnter={(e) => handleMouseEnter(e, applicant)}
                            onMouseLeave={handleMouseLeave}
                            style={{
                              textDecoration: "underline dotted",
                              position: "relative",
                            }}
                          >
                            Manual
                          </span>
                        ) : (
                          "None"
                        )}
                      </td>
                      <td>{normalizeText(applicant.source)}</td>
                      <td>
                        <a
                          href={
                            applicant.documents &&
                            applicant.documents[0]?.file_url
                              ? `${applicant.documents[0].file_url}`
                              : "#"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="resume-link"
                          onClick={(e) => {
                            if (
                              !applicant.documents ||
                              !applicant.documents[0]?.file_url
                            ) {
                              e.preventDefault();
                              alert("No resume available");
                            }
                          }}
                        >
                          <img
                            src={PDFICON}
                            alt="PDF Resume"
                            className="pdf-icon"
                          />
                          View
                        </a>
                      </td>

                      <td>
                        {applicant.screening_score != null
                          ? `${applicant.screening_score}%`
                          : "Not Screened"}
                      </td>
                      <td>
                        <div className="gen-td-btns">
                          <button
                            className="view-btn"
                            onClick={() => handleViewClick(applicant)}
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && totalCount > 0 && (
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
                    </select>
                  </div>
                </div>
                <div className="Dash-OO-Boas-foot-2">
                  <button
                    onClick={handleSelectAllVisible}
                    className="mark-all-btn"
                  >
                    <CheckCircleIcon className="h-6 w-6" />
                    {currentApplicants.every((applicant) =>
                      selectedIds.includes(applicant.id)
                    )
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

          <AnimatePresence>
            {error && (
              <AlertModal
                title="Error"
                message={error}
                onClose={() => setError(null)}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showConfirmDelete && (
              <Modal
                title="Confirm Delete"
                message={`Are you sure you want to delete ${selectedIds.length} applicant(s)? This action cannot be undone.`}
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
                message="You have not selected any applicants to delete."
                onClose={() => setShowNoSelectionAlert(false)}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showScreeningAlert && (
              <AlertModal
                title={
                  screeningProgress?.status === "COMPLETED"
                    ? "Screening Completed"
                    : screeningProgress?.status === "FAILED"
                    ? "Screening Failed"
                    : "Screening Started"
                }
                message={
                  screeningProgress?.status === "COMPLETED"
                    ? screeningResults?.detail ||
                      "Resume screening completed successfully!"
                    : screeningProgress?.status === "FAILED"
                    ? screeningProgress.message
                    : "Resume screening has started. This process may take several minutes. You'll see the results when it's complete."
                }
                onClose={() => {
                  setShowScreeningAlert(false);
                  // Only reset screening progress if it's completed or failed
                  if (
                    screeningProgress?.status === "COMPLETED" ||
                    screeningProgress?.status === "FAILED"
                  ) {
                    setScreeningProgress(null);
                  }
                }}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showDocumentSelectionModal && (
              <DocumentSelectionModal
                documentsRequired={documentsRequired}
                onConfirm={handleScreenResumes}
                onCancel={() => setShowDocumentSelectionModal(false)}
              />
            )}
          </AnimatePresence>

          {/* Updated Manual Evaluation Tooltip Popup - Positioned to the Right */}
          <AnimatePresence>
            {showTooltip && tooltipDetails && (
              <motion.div
                className="manual-evaluation-tooltip"
                style={{
                  position: "absolute",
                  left: `${tooltipPosition.x - 280}px`,
                  top: `${tooltipPosition.y - 350}px`,
                  zIndex: 1000,
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                  fontSize: "14px",
                  maxWidth: "300px",
                  minWidth: "250px",
                  whiteSpace: "normal",
                  wordWrap: "break-word",
                  lineHeight: "1.4",
                }}
                initial={{ opacity: 0, scale: 0.9, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="tooltip-content">
                  <div
                    className="tooltip-header"
                    style={{ marginBottom: "8px" }}
                  >
                    <h4
                      style={{
                        margin: "0 0 4px 0",
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "#1e293b",
                      }}
                    >
                      Manual Evaluation Details
                    </h4>
                  </div>

                  <div className="tooltip-details">
                    <div className="detail-row" style={{ marginBottom: "6px" }}>
                      <strong style={{ color: "#475569" }}>
                        Evaluated by:
                      </strong>
                      <span style={{ marginLeft: "8px", color: "#0f172a" }}>
                        {tooltipDetails.name}
                      </span>
                    </div>

                    <div className="detail-row" style={{ marginBottom: "6px" }}>
                      <strong style={{ color: "#475569" }}>Email:</strong>
                      <span style={{ marginLeft: "8px", color: "#0f172a" }}>
                        {tooltipDetails.email}
                      </span>
                    </div>

                    <div className="detail-row" style={{ marginBottom: "6px" }}>
                      <strong style={{ color: "#475569" }}>Date:</strong>
                      <span style={{ marginLeft: "8px", color: "#0f172a" }}>
                        {new Date(tooltipDetails.timestamp).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>

                    {tooltipDetails.reason && (
                      <div
                        className="detail-row"
                        style={{
                          marginTop: "8px",
                          paddingTop: "8px",
                          borderTop: "1px solid #f1f5f9",
                        }}
                      >
                        <strong style={{ color: "#475569" }}>Reason:</strong>
                        <div
                          style={{
                            marginLeft: "8px",
                            color: "#0f172a",
                            fontStyle:
                              tooltipDetails.reason === "No reason provided"
                                ? "italic"
                                : "normal",
                            fontSize:
                              tooltipDetails.reason === "No reason provided"
                                ? "13px"
                                : "14px",
                          }}
                        >
                          {tooltipDetails.reason}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tooltip arrow pointing to the left */}
                <div
                  style={{
                    position: "absolute",
                    left: "-6px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "0",
                    height: "0",
                    borderTop: "6px solid transparent",
                    borderBottom: "6px solid transparent",
                    borderRight: "6px solid white",
                    filter: "drop-shadow(-1px 0 1px rgba(0,0,0,0.1))",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="YUa-Opal-Part-2">
        <div className="Top-GHY-s">
          <button
            className="link-btn btn-primary-bg"
            onClick={initiateScreening}
            disabled={pollingTaskId !== null || loading} // Disable during processing
          >
            <DocumentCheckIcon />
            {pollingTaskId ? "Screening in Progress..." : "Screen Resumes"}
          </button>
          <p>
            Created on <span>2025-06-02 ✦ 9:21 AM</span>
          </p>
        </div>
        <div className="yyess-sec">
          <ApplicationStatsChart data={stats} />
        </div>
      </div>

      {showApplicantDetails && selectedApplicant && (
        <ApplicantDetails
          job={{ job }}
          applicant={selectedApplicant}
          onClose={handleCloseDetails}
          onStatusChange={(newStatus) =>
            handleStatusChange(
              selectedApplicant.id,
              selectedApplicant?.jobRequisitionId,
              newStatus,
              selectedApplicant?.email
            )
          }
        />
      )}
    </div>
  );
};

export default ViewApplications;
