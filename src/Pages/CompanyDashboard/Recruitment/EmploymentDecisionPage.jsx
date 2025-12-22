import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  ArrowTrendingUpIcon,
  PencilIcon,
  CheckBadgeIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import { useLocation, useNavigate } from "react-router-dom";
import {
  updateJobApplicationStatus,
  fetchPublishedRequisitionsWithShortlisted,
} from "./ApiService";
import StatusBadge from "../../../components/StatusBadge";
import LoadingState from "../../../components/LoadingState";
import { normalizeText } from "../../../utils/helpers";
import "../Compliance/styles/ComplianceCheckPage.css";

// PerformanceGraph component (updated)
const PerformanceGraph = ({ data }) => {
  const maxScore = 100;
  const height = 250;
  const padding = 40;
  const [width, setWidth] = useState(800);
  const blue = "#3B82F6";
  const green = "#10b981";

  useEffect(() => {
    const updateWidth = () => {
      const container = document.querySelector(".performance-graph-container");
      if (container) setWidth(container.clientWidth);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const averageScore = useMemo(() => {
    if (!data.length) return 0;
    return Math.round(
      data.reduce((acc, cur) => acc + cur.score, 0) / data.length
    );
  }, [data]);

  const isComplianceCompleted = useMemo(() => {
    return data.every((item) => item.score > 0);
  }, [data]);

  const points = useMemo(() => {
    if (!width) return [];
    return data.map((item, i) => {
      const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
      const y =
        height - padding - (item.score / maxScore) * (height - 2 * padding);
      return { ...item, x, y };
    });
  }, [width, data]);

  const linePath = useMemo(
    () =>
      points.reduce(
        (acc, p, i) => (i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`),
        ""
      ),
    [points]
  );

  if (!width) return null;

  return (
    <div className="performance-graph-container" style={{ width: "100%" }}>
      <div className="graph-header">
        <h3>
          Process Metrics <ArrowTrendingUpIcon className="inline h-5 w-5" />
        </h3>
        <div className="graph-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ background: blue }} />
            <span>Performance Score – {averageScore}%</span>
          </div>
          {isComplianceCompleted && (
            <div className="legend-item hired-indicator">
              <div className="legend-color" style={{ background: green }} />
              <span>Hired – Compliance Complete</span>
            </div>
          )}
        </div>
      </div>

      <svg width={width} height={height} className="performance-graph">
        {[0, 25, 50, 75, 100].map((score) => {
          const y =
            height - padding - (score / maxScore) * (height - 2 * padding);
          return (
            <g key={score}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
              <text
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                fill="#5d5677"
                fontSize={12}
              >
                {score}%
              </text>
            </g>
          );
        })}

        {points.map((p) => (
          <text
            key={p.stage}
            x={p.x}
            y={height - padding + 20}
            textAnchor="middle"
            fill="#5d5677"
            fontSize={12}
          >
            {p.stage}
          </text>
        ))}

        <motion.path
          d={linePath}
          fill="none"
          stroke={isComplianceCompleted ? green : blue}
          strokeWidth={3}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        <AnimatePresence>
          {points.map((p, index) => (
            <motion.g key={p.stage}>
              <motion.circle
                cx={p.x}
                cy={p.y}
                r={0}
                fill={isComplianceCompleted ? green : blue}
                initial={{ r: 0 }}
                animate={{ r: 6 }}
                transition={{
                  delay: 0.5 + index * 0.2,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100,
                }}
              />
              {p.stage === "Compliance" && p.score === 100 && (
                <motion.text
                  x={p.x + 8}
                  y={p.y - 8}
                  fill={green}
                  fontSize={10}
                  fontWeight={600}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.2 }}
                >
                  ✓
                </motion.text>
              )}
            </motion.g>
          ))}
        </AnimatePresence>

        {points.map((p, index) => (
          <motion.text
            key={`${p.stage}-score`}
            x={p.x}
            y={p.y - 15}
            textAnchor="middle"
            fill={isComplianceCompleted ? "#ffffff" : "#1e40af"}
            fontWeight={600}
            fontSize={10}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.2 }}
          >
            {p.stage === "Compliance" && p.score === 100
              ? "Complete"
              : `${p.score}%`}
          </motion.text>
        ))}

        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#e2e8f0"
          strokeWidth={1.5}
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#e2e8f0"
          strokeWidth={1.5}
        />
      </svg>
    </div>
  );
};

const EmploymentDecisionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const jobFromState = location.state?.job;

  const [searchValue, setSearchValue] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loadingApplicants, setLoadingApplicants] = useState(true);
  const [loadingRequisitions, setLoadingRequisitions] = useState(true);
  const [allRequisitions, setAllRequisitions] = useState([]);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [showRequisitionSelector, setShowRequisitionSelector] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [modalApplicantId, setModalApplicantId] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [modalError, setModalError] = useState(null);
  const [saving, setSaving] = useState(false);

  const eligibleStatuses = [
    "interviewed",
    "offer_pending",
    "hired",
    "compliance_completed",
  ];

  // Load requisitions with shortlisted applications
  const loadRequisitions = async () => {
    try {
      setLoadingRequisitions(true);
      const response = await fetchPublishedRequisitionsWithShortlisted();
      // console.log("ok");

      if (!response) {
        setAllRequisitions([]);
        setSelectedRequisition(null);
        setShowRequisitionSelector(true);
        return;
      }

      console.log("kay");

      // Filter requisitions that have applicants with eligible statuses
      const validReqs = response
        .map((req) => {
          const eligibleApps =
            req.progressed_applications?.filter((app) =>
              eligibleStatuses.includes(app.status)
            ) || [];

          return eligibleApps.length > 0
            ? {
                ...req.job_requisition,
                progressed_applications: req.progressed_applications,
                eligible_applications: eligibleApps,
                eligible_count: eligibleApps.length,
              }
            : null;
        })
        .filter(Boolean);

      setAllRequisitions(validReqs);

      console.log(validReqs);

      // Auto-select logic (pre-highlight in selector, but always show selector)
      let initialSelected = null;
      if (validReqs.length > 0) {
        if (
          jobFromState &&
          validReqs.some((req) => req.id === jobFromState.id)
        ) {
          initialSelected = validReqs.find((req) => req.id === jobFromState.id);
        } else {
          initialSelected = validReqs[0];
        }
      }
      setSelectedRequisition(initialSelected);
      setShowRequisitionSelector(true); // Always show selector initially
    } catch (error) {
      console.error("Failed to load requisitions:", error);
      setNotification({
        type: "error",
        message: "Failed to load job requisitions",
      });
      setAllRequisitions([]);
      setSelectedRequisition(null);
      setShowRequisitionSelector(true);
    } finally {
      setLoadingRequisitions(false);
    }
  };

  useEffect(() => {
    loadRequisitions();
  }, []);

  // Transform applicants data from eligible_applications
  const transformApplicantsData = useCallback((requisition) => {
    if (!requisition?.eligible_applications) return [];

    return requisition.eligible_applications.map((app) => ({
      id: app.id,
      initials: app.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2),
      name: app.full_name,
      position: requisition.title || "Unknown Position",
      appliedDate: new Date(app.applied_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: app.status,
      decision: "Pending",
      note: app.note || "",
      confirmedBy: app.confirmed_by || "",
      experience: app.experience || "Not provided",
      education: app.qualification || "Not provided",
      resumeUrl:
        app.documents?.find(
          (doc) =>
            doc.document_type?.toLowerCase().includes("cv") ||
            doc.document_type?.toLowerCase().includes("resume")
        )?.file_url || "#",
      email: app.email || "Not provided",
      originalData: app, // Keep original data for API calls
    }));
  }, []);

  // Load applicants when requisition is selected
  useEffect(() => {
    if (selectedRequisition && !showRequisitionSelector) {
      setLoadingApplicants(true);
      const transformedApplicants =
        transformApplicantsData(selectedRequisition);
      setApplicants(transformedApplicants);

      if (transformedApplicants.length > 0) {
        setSelectedId(transformedApplicants[0].id);
      }
      setLoadingApplicants(false);
    } else {
      // Reset when showing selector
      setApplicants([]);
      setSelectedId(null);
    }
  }, [selectedRequisition, showRequisitionSelector, transformApplicantsData]);

  // Requisition Selector Component
  const RequisitionSelector = () => (
    <motion.div
      className="requisition-selector"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3>
        <BriefcaseIcon className="h-6 w-6" aria-hidden="true" />
        Select a Job Requisition
      </h3>
      <div className="requisition-list">
        {loadingRequisitions ? (
          <div className="requisition-loading">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
            <p
              style={{
                marginTop: "1rem",
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              Loading requisitions with eligible candidates...
            </p>
          </div>
        ) : allRequisitions.length === 0 ? (
          <motion.div
            className="requisition-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <ExclamationTriangleIcon className="requisition-empty-icon" />
            <p>No job requisitions with eligible candidates available</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {allRequisitions.map((req) => (
              <motion.div
                key={req.id}
                role="button"
                tabIndex={0}
                className={`requisition-item ${
                  selectedRequisition?.id === req.id ? "selected" : ""
                }`}
                onClick={() => {
                  setSelectedRequisition(req);
                  setShowRequisitionSelector(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedRequisition(req);
                    setShowRequisitionSelector(false);
                  }
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <BriefcaseIcon
                  className="requisition-icon"
                  aria-hidden="true"
                />
                <div className="requisition-info">
                  <h4>{req.title}</h4>
                  <p>
                    {normalizeText(req.company_name)} •{" "}
                    {normalizeText(req.job_type)}
                  </p>
                  <span>
                    {normalizeText(req.status)} • {req.eligible_count} Eligible
                    Applicants
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );

  // Filter applicants based on search
  const filteredApplicants = useMemo(() => {
    if (!searchValue.trim()) return applicants;

    const q = searchValue.toLowerCase();
    return applicants.filter(
      ({ name, initials }) =>
        name.toLowerCase().includes(q) || initials.toLowerCase().includes(q)
    );
  }, [searchValue, applicants]);

  const selectedApplicant = useMemo(
    () => applicants.find((app) => app.id === selectedId),
    [applicants, selectedId]
  );

  const performanceData = useMemo(() => {
    const confirmed = selectedApplicant?.note && selectedApplicant?.confirmedBy;
    const isHired = selectedApplicant?.status === "hired";

    return [
      { stage: "Application", score: 100 },
      { stage: "Interview", score: 100 },
      {
        stage: "Decision",
        score:
          isHired || selectedApplicant?.status === "compliance_completed"
            ? 100
            : confirmed
            ? 100
            : 50,
      },
      {
        stage: "Compliance",
        score: selectedApplicant?.status === "compliance_completed" ? 100 : 0,
      },
    ];
  }, [selectedApplicant]);

  // Change decision locally
  const changeDecision = (id, decision) => {
    setApplicants((prev) =>
      prev.map((app) => (app.id === id ? { ...app, decision } : app))
    );
  };

  // Modal handlers
  const openAddNoteModal = () => {
    if (!selectedApplicant || selectedApplicant.decision === "Pending") return;
    setModalMode("add");
    setModalApplicantId(selectedApplicant.id);
    setIsModalOpen(true);
  };

  const openEditNoteModal = () => {
    if (!selectedApplicant) return;
    setModalMode("edit");
    setModalApplicantId(selectedApplicant.id);
    setIsModalOpen(true);
  };

  // Pre-fill modal when opened
  useEffect(() => {
    if (!isModalOpen) return;
    const current = applicants.find((a) => a.id === modalApplicantId);
    setNoteDraft(current?.note || "");
    setModalError(null);
  }, [isModalOpen, modalApplicantId, applicants]);

  // Confirm decision and call API
  const confirmDecision = async () => {
    setSaving(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const confirmerName =
        `${user.first_name} ${user.last_name}` ||
        user.username ||
        "Unknown User";
      const confirmerEmail = user.email || "Unknown Email";
      const confirmerJobRole = user.job_role || "Unknown Job Role";

      const applicant = applicants.find((app) => app.id === modalApplicantId);
      if (!applicant) {
        throw new Error("Applicant not found");
      }

      // Call API to update status
      await updateJobApplicationStatus(modalApplicantId, {
        status: applicant.decision.toLowerCase(),
        job_requisition_id: selectedRequisition.id,
        email: applicant.email,
        note: noteDraft.trim(),
        hired_by: {
          name: confirmerName,
          email: confirmerEmail,
          job_role: confirmerJobRole,
        },
      });

      // Update local state
      setApplicants((prev) =>
        prev.map((app) =>
          app.id === modalApplicantId
            ? {
                ...app,
                note: noteDraft.trim(),
                confirmedBy: confirmerName,
                status: applicant.decision.toLowerCase(),
              }
            : app
        )
      );

      setSaving(false);
      setIsModalOpen(false);

      const decisionType = applicant.decision.toLowerCase();
      setTimeout(() => {
        setNotification({
          type: "success",
          message: `${
            decisionType.charAt(0).toUpperCase() + decisionType.slice(1)
          } decision confirmed for ${applicant.name}`,
        });
      }, 2000);
    } catch (error) {
      setSaving(false);
      setModalError("Failed to confirm decision. Please try again.");
    }
  };

  const onClose = () => {
    setShowRequisitionSelector(true);
    setSelectedId(null);
    setApplicants([]);
  };

  return (
    <div className="EmploymentDecision" style={{ paddingTop: "1rem" }}>
      {/* Close button */}
      {!showRequisitionSelector && selectedRequisition && (
        <button className="EmploymentDecision-btn" onClick={onClose}>
          <XMarkIcon className="h-6 w-6" />
        </button>
      )}

      {/* Requisition selector */}
      {showRequisitionSelector && <RequisitionSelector />}

      {/* Loading state */}
      {loadingApplicants && !showRequisitionSelector && (
        <LoadingState text="Loading eligible applicants..." />
      )}

      {/* Main content */}
      {!showRequisitionSelector &&
        selectedRequisition &&
        !loadingApplicants && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="EmploymentDecision-Main"
          >
            {/* LEFT SIDEBAR - Applicants List */}
            <div className="DocComplianceCheck-Part">
              <div
                className="DocComplianceCheck-Part-Top"
                style={{ flexDirection: "column", padding: 10 }}
              >
                <h3 className="ool-HHUha">
                  Applicants <span>Total: {filteredApplicants.length}</span>
                </h3>
                {selectedRequisition && (
                  <button
                    className="change-requisition-btn"
                    onClick={() => setShowRequisitionSelector(true)}
                  >
                    Change Job
                  </button>
                )}
              </div>

              <div className="paoli-UJao" style={{ marginTop: "4rem" }}>
                <div className="paoli-UJao-TOp">
                  <div className="genn-Drop-Search">
                    <span>
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
                    </span>
                    <input
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder="Search for applicant"
                    />
                  </div>
                </div>

                <ul className="custom-scroll-bar">
                  {filteredApplicants.map(({ id, initials, name }) => (
                    <motion.li
                      key={id}
                      className={selectedId === id ? "active-LLOK" : undefined}
                      onClick={() => setSelectedId(id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>{initials}</span>
                      <p>{name}</p>
                    </motion.li>
                  ))}

                  {filteredApplicants.length === 0 && (
                    <div className="empty-state-li">
                      <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 10,
                        }}
                      >
                        <ExclamationTriangleIcon className="requisition-empty-icon" />
                      </motion.div>
                      <span>
                        No applicants found{" "}
                        {searchValue
                          ? `matching "${searchValue}"`
                          : "with eligible status"}
                      </span>
                    </div>
                  )}
                </ul>
              </div>
            </div>

            {/* RIGHT PANEL - Applicant Details */}
            <div className="DocComplianceCheck-Part">
              <div
                className="DocComplianceCheck-Part-Top"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3>
                  Employment Decision{" "}
                  {selectedApplicant?.name
                    ? `for ${selectedApplicant?.name}`
                    : ""}
                </h3>
                <h5>Position: {selectedRequisition?.title}</h5>
              </div>

              {selectedApplicant ? (
                <>
                  {/* Applicant card */}
                  <motion.div
                    className="ssen-regs"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="ssen-regs-1">
                      <span>{selectedApplicant.initials}</span>
                    </div>
                    <div className="ssen-regs-2">
                      <div>
                        <h4>{selectedApplicant.name}</h4>
                        <p className="olik-PPO">
                          Status:{" "}
                          <span
                            className={`All-status-badge ${selectedApplicant.status.toLowerCase()}`}
                          >
                            {selectedApplicant.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Main table & graph */}
                  <div className="OOlaols-POpp custom-scroll-bar">
                    <div className="Dash-OO-Boas dOikpO-PPol oluja-PPPl olika-ola">
                      <div className="table-container">
                        <table className="Gen-Sys-table">
                          <thead>
                            <tr>
                              <th>Position</th>
                              <th>Application</th>
                              <th>Interview</th>
                              <th>Status</th>
                              <th>Decision</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr key={selectedApplicant.id}>
                              <td>{selectedRequisition.title}</td>
                              <td>
                                <div className="HHH-DDGha checkedd-ppo">
                                  Checked <CheckIcon />
                                </div>
                              </td>
                              <td>
                                <div className="HHH-DDGha olik-TTTDRF">
                                  Completed <span>100%</span>
                                </div>
                              </td>
                              <td>
                                <StatusBadge
                                  status={selectedApplicant.status}
                                />
                              </td>
                              <td>
                                <select
                                  value={selectedApplicant.decision}
                                  onChange={(e) =>
                                    changeDecision(
                                      selectedApplicant.id,
                                      e.target.value
                                    )
                                  }
                                  className="decision-select"
                                >
                                  <option value="Pending" disabled>
                                    Select
                                  </option>
                                  <option value="Hired">Hired</option>
                                  <option value="Rejected">Rejected</option>
                                </select>
                              </td>
                              <td>
                                <button
                                  className="confirm-btn"
                                  disabled={
                                    selectedApplicant.decision === "Pending"
                                  }
                                  onClick={openAddNoteModal}
                                >
                                  <CheckBadgeIcon className="h-5 w-5" />
                                  Confirm
                                </button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Existing note block */}
                      {selectedApplicant.note && (
                        <motion.div
                          className="applicant-note"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <div className="applicant-note-Box">
                            <h4>
                              Decision Note
                              <button onClick={openEditNoteModal}>
                                <PencilIcon className="inline-block h-5 w-5" />
                                Edit Note
                              </button>
                            </h4>
                            <p>{selectedApplicant.note}</p>
                            {selectedApplicant.confirmedBy && (
                              <p className="coool-Pla">
                                Confirmed by:{" "}
                                <span>{selectedApplicant.confirmedBy}</span>
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* Performance graph */}
                      <div className="performance-Grapph">
                        <PerformanceGraph data={performanceData} />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <motion.div
                  className="no-applicant-selected"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    textAlign: "center",
                    padding: "2rem",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <ExclamationTriangleIcon className="requisition-empty-icon" />
                  <p className="text-gray-600">
                    {filteredApplicants.length > 0
                      ? "Select an applicant from the list to view details"
                      : "No eligible applicants found for this job"}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

      {/* Confirmation Modal */}
      {isModalOpen && (
        <motion.div
          key="noteModal"
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target.classList.contains("modal-overlay"))
              setIsModalOpen(false);
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 3000,
          }}
        >
          <motion.div
            className="modal-content custom-scroll-bar okauj-MOadad"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: "1.5rem",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
              borderRadius: "12px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3 className="oll-paolsl" style={{ marginBottom: "1rem" }}>
              Confirm Employment Decision for&nbsp;
              <span className="oouk-SPOPol">{selectedApplicant?.name}</span>
            </h3>

            {/* Show selected decision */}
            <motion.div
              className="decision-display"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label>Decision:</label>
              <div className="decision-value">
                {selectedApplicant?.decision === "Hired" ? (
                  <span className="decision-hired">Hire</span>
                ) : (
                  <span className="decision-rejected">Reject</span>
                )}
              </div>
            </motion.div>

            {/* Show confirmer name */}
            <motion.div
              className="confirmer-display"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label>Confirmed by:</label>
              <div className="confirmer-value">
                {(() => {
                  const user = JSON.parse(localStorage.getItem("user") || "{}");
                  const fullName =
                    user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : null;
                  return fullName || user.username || "Unknown User";
                })()}
              </div>
            </motion.div>

            {/* Note textarea */}
            <motion.div
              className="GGtg-DDDVa"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label>Add Note (Optional)</label>
              <textarea
                rows={5}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Add your note here..."
                className="oujka-Inpuauy OIUja-Tettxa"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  boxSizing: "border-box",
                }}
              />
            </motion.div>

            {/* Error message */}
            <AnimatePresence>
              {modalError && (
                <motion.div
                  key="modal-error"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    marginBottom: "1rem",
                  }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="modal-error-message oials-ola"
                  style={{
                    color: "#ff4d4f",
                    background: "#fff2f0",
                    padding: "0.5rem",
                    borderRadius: 4,
                    border: "1px solid #ffccc7",
                    overflow: "hidden",
                  }}
                >
                  <div className="olail-PPOla">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 10,
                      }}
                    >
                      <ExclamationTriangleIcon className="requisition-empty-icon" />
                    </motion.div>
                    <span>{modalError}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons */}
            <div
              className="oioak-POldj-BTn"
              style={{
                marginTop: "1rem",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="CLCLCjm-BNtn"
              >
                Cancel
              </button>

              <button
                onClick={confirmDecision}
                className="btn-primary-bg"
                disabled={saving}
                style={{ display: "flex", alignItems: "center" }}
              >
                {saving && (
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      width: 15,
                      height: 15,
                      borderRadius: "50%",
                      border: "3px solid #fff",
                      borderTopColor: "transparent",
                      marginRight: 5,
                    }}
                  />
                )}
                {saving ? "Confirming…" : "Confirm Decision"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default EmploymentDecisionPage;
