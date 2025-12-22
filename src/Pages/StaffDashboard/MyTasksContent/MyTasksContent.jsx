// MyTasksContent.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./MyTasksContent.css";
import ModalTask from "./ModalTask/ModalTask";
import ClientProfile from "./ClientProfile/ClientProfile";
import AgreedCareVisit from "./AgreedCareVisit/AgreedCareVisit";
// import History from "./History/History";
import Log from "./Log/Log";
import { clockInVisit, clockOutVisit } from "../config/tasksApiService";
import {
  CheckCircleIcon,
  PhoneIcon,
  ClockIcon,
  CalendarIcon,
  MapPinIcon,
  InformationCircleIcon,
  PlayIcon,
  PauseIcon, // Added PauseIcon for clock out
  UserIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ClockIcon as ClockOutlineIcon,
  BookOpenIcon,
  DocumentTextIcon,
  XCircleIcon, // Added for error/completed status if needed
  PencilIcon,
} from "@heroicons/react/24/outline";
import {
  UserIcon as UserSolidIcon,
  ClipboardDocumentListIcon as ClipboardSolidIcon,
  ClockIcon as ClockSolidFillIcon,
  BookOpenIcon as BookOpenSolidIcon,
  DocumentTextIcon as DocumentTextSolidIcon,
} from "@heroicons/react/24/solid";
// ✅ Reusable animation variants
const tabAnimation = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
  transition: { duration: 0.3 },
};
const tabs = [
  {
    id: "profile",
    label: "Client Profile",
    outline: UserIcon,
    solid: UserSolidIcon,
  },
  {
    id: "task",
    label: "Task",
    outline: ClipboardDocumentListIcon,
    solid: ClipboardSolidIcon,
  },
  {
    id: "visit",
    label: "Visit Time",
    outline: ClockOutlineIcon,
    solid: ClockSolidFillIcon,
  },
  {
    id: "log",
    label: "Log",
    outline: DocumentTextIcon,
    solid: DocumentTextSolidIcon,
  },
  // { id: 'history', label: 'History', outline: BookOpenIcon, solid: BookOpenSolidIcon },
];
const MyTasksContent = ({
  selectedTask,
  isClockedIn = false,
  taskStatus = "Not Started",
  onClockToggle,
  extraTime = "",
  offTime = "",
  hasRunningTask = false,
  runningTaskName = null,
  onShowAlert = () => {},
  history = [],
  actualClockIn = null,
  actualClockOut = null,
  formatDuration = (ms) => "0h 0m 0s",
}) => {
  const [activeTab, setActiveTab] = useState("task");
  const [currentTime, setCurrentTime] = useState(new Date());
  // Clock in modal states
  const [showClockInModal, setShowClockInModal] = useState(false);
  const [clockInType, setClockInType] = useState(""); // 'early' or 'late'
  const [clockInReason, setClockInReason] = useState("");
  const [clockInComments, setClockInComments] = useState("");
  const [savingClockIn, setSavingClockIn] = useState(false);
  const [successClockInAlert, setSuccessClockInAlert] = useState({
    show: false,
    message: "",
  });
  // Clock out modal states
  const [showClockOutModal, setShowClockOutModal] = useState(false);
  const [clockOutReason, setClockOutReason] = useState("");
  const [clockOutComments, setClockOutComments] = useState("");
  const [savingClockOut, setSavingClockOut] = useState(false);
  const [successClockOutAlert, setSuccessClockOutAlert] = useState({
    show: false,
    message: "",
  });
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  // Helper function to format time (copied from MyTasks for independence)
  const formatTime = (hour, minute) => {
    const period = hour < 12 ? "am" : "pm";
    const adjustedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${adjustedHour}:${minute.toString().padStart(2, "0")}${period}`;
  };
  // Helper function to get task duration in "Xhr Ymin Zsec" format
  const getExpectedDurationStr = (task) => {
    if (!task) return "0hr 0min 0sec";
    const totalMinutes =
      task.endHour * 60 + task.endMin - (task.startHour * 60 + task.startMin);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const seconds = 0; // Expected duration has no seconds
    return `${hours}hr ${minutes}min ${seconds}sec`;
  };
  // Helper function to get client initials (copied from MyTasks)
  const getClientInitials = (clientName) => {
    if (!clientName) return "";
    const names = clientName.split(" ");
    return names.map((name) => name.charAt(0).toUpperCase()).join("");
  };
  // Dynamic warning functions (copied from MyTasks for independence, assuming not clocked in/completed for warning display)
  const isTaskTimeStarted = (task) => {
    const taskStart = new Date(task.date);
    taskStart.setHours(task.startHour, task.startMin, 0, 0);
    return currentTime >= taskStart;
  };
  const isTaskTimeElapsed = (task) => {
    const taskEnd = new Date(task.date);
    taskEnd.setHours(task.endHour, task.endMin, 0, 0);
    return currentTime > taskEnd;
  };
  const getLatenessStr = (task) => {
    const taskStart = new Date(task.date);
    taskStart.setHours(task.startHour, task.startMin, 0, 0);
    const diffMs = currentTime - taskStart;
    if (diffMs <= 0) return "";
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    let str = "Late by ";
    if (hours > 0) str += `${hours}h `;
    if (minutes > 0) str += `${minutes}m `;
    if (seconds > 0) str += `${seconds}s `;
    return str.trim();
  };
  // Computed values based on selectedTask
  const visitTasks = selectedTask?.tasks || selectedTask?.rawVisit?.tasks || [];
  const totalTasks = visitTasks.length || selectedTask?.taskCount || 0;
  const completedTasks = visitTasks.filter(
    (task) => task.status === "COMPLETED" || task.completed
  ).length;
  const taskCountStr = `${completedTasks}/${totalTasks}`;
  const callTypeStr =
    selectedTask?.careType || selectedTask?.callType || "Single Call";
  const timeStr = selectedTask
    ? `${formatTime(
        selectedTask.startHour,
        selectedTask.startMin
      )} - ${formatTime(selectedTask.endHour, selectedTask.endMin)}`
    : "N/A";
  const durationStr = getExpectedDurationStr(selectedTask);
  const distanceStr = selectedTask?.distance || "N/A";
  const clientName = selectedTask?.clientName || "Unknown Client";
  const clientInitials = getClientInitials(clientName);
  // Determine button content based on clocked in state and completion
  const isCompleted =
    selectedTask?.clockOutAt || taskStatus.includes("Completed");
  const isClockedOut = taskStatus.includes("Clocked out") || isCompleted;
  const buttonText = isCompleted
    ? "Completed"
    : isClockedIn
    ? "Clock Out"
    : "Clock In";
  const ButtonIcon = isCompleted
    ? CheckCircleIcon
    : isClockedIn
    ? PauseIcon
    : PlayIcon;
  const buttonClass = isCompleted
    ? "completed-btn"
    : isClockedIn
    ? "ClockUOut Clk-btn-danger-bg"
    : "ClockUIn btn-primary-bg";
  const isButtonDisabled = isCompleted;
  const statusClass = isCompleted
    ? "OOStaTus completed"
    : isClockedIn
    ? "OOStaTus in-progress"
    : "OOStaTus pending";
  // Determine overtime display: prefer off time if present, else extra
  const overtimeLabel = offTime
    ? `Off Time: ${offTime}`
    : extraTime
    ? `Extra Time: ${extraTime}`
    : "";
  const handleClockToggle = async () => {
    // Check if visit is completed
    const visitId = selectedTask?.id || selectedTask?.rawVisit?.id;
    if (!visitId) {
      onShowAlert && onShowAlert("No visit ID found");
      return;
    }

    // Check if already completed
    if (selectedTask?.clockOutAt) {
      onShowAlert && onShowAlert("This visit has already been completed");
      return;
    }

    if (isClockedIn) {
      // Check if clock out is early
      const now = currentTime.getTime();
      const taskEnd = new Date(
        selectedTask.date || selectedTask.rawVisit?.endDate
      );
      taskEnd.setHours(selectedTask.endHour, selectedTask.endMin, 0, 0);
      if (now < taskEnd.getTime()) {
        // Early clock out
        setShowClockOutModal(true);
        return;
      } else {
        // On time or late, clock out directly
        await handleDirectClockOut(visitId);
        return;
      }
    }
    // Clock in logic
    if (hasRunningTask) {
      onShowAlert &&
        onShowAlert(`You already have a running visit: ${runningTaskName}`);
      return;
    }
    const now = currentTime.getTime();
    const taskStart = new Date(
      selectedTask.date || selectedTask.rawVisit?.startDate
    );
    taskStart.setHours(selectedTask.startHour, selectedTask.startMin, 0, 0);
    const taskEnd = new Date(
      selectedTask.date || selectedTask.rawVisit?.endDate
    );
    taskEnd.setHours(selectedTask.endHour, selectedTask.endMin, 0, 0);
    if (now < taskStart.getTime()) {
      // Early clock in
      setClockInType("early");
      setShowClockInModal(true);
      return;
    } else if (now > taskEnd.getTime()) {
      // Late clock in (after end time)
      setClockInType("late");
      setShowClockInModal(true);
      return;
    } else {
      // On time, clock in directly
      await handleDirectClockIn(visitId);
      return;
    }
  };

  // Direct clock in handler
  const handleDirectClockIn = async (visitId) => {
    try {
      setSavingClockIn(true);
      const result = await clockInVisit(visitId);

      // Update the parent component if callback exists
      if (onClockToggle) {
        await onClockToggle(selectedTask, { type: "direct", result });
      }

      // Show success message
      if (onShowAlert) {
        onShowAlert("Successfully clocked in to visit");
      }

      setSavingClockIn(false);
    } catch (error) {
      setSavingClockIn(false);
      if (onShowAlert) {
        onShowAlert(`Failed to clock in: ${error.message || "Unknown error"}`);
      }
    }
  };

  // Direct clock out handler
  const handleDirectClockOut = async (visitId) => {
    try {
      setSavingClockIn(true); // Reuse the same loading state
      const result = await clockOutVisit(visitId);

      // Update the parent component if callback exists
      if (onClockToggle) {
        await onClockToggle(selectedTask, { type: "direct", result });
      }

      // Show success message
      if (onShowAlert) {
        onShowAlert("Successfully clocked out from visit");
      }

      setSavingClockIn(false);
    } catch (error) {
      setSavingClockIn(false);
      if (onShowAlert) {
        onShowAlert(`Failed to clock out: ${error.message || "Unknown error"}`);
      }
    }
  };

  // Clock in reason options
  const earlyReasons = [
    { value: "early-arrival", label: "Early arrival" },
    { value: "prev-finished-early", label: "Previous visit finished early" },
    { value: "client-requested", label: "Client requested early" },
    { value: "other", label: "Other" },
  ];
  const lateReasons = [
    { value: "traffic-delay", label: "Traffic delay" },
    { value: "prev-overrun", label: "Previous visit overrun" },
    { value: "emergency", label: "Emergency situation" },
    { value: "client-not-ready", label: "Client not ready" },
    { value: "other", label: "Other" },
  ];
  const currentReasons = clockInType === "early" ? earlyReasons : lateReasons;
  const handleSubmitClockIn = async (e) => {
    e.preventDefault();
    if (!clockInReason) {
      alert(`Please select a reason for ${clockInType} clock in`);
      return;
    }

    const visitId = selectedTask?.id || selectedTask?.rawVisit?.id;
    if (!visitId) {
      alert("No visit ID found");
      return;
    }

    setSavingClockIn(true);
    try {
      const reasonLabel =
        currentReasons.find((r) => r.value === clockInReason)?.label ||
        clockInReason;
      const clockData = {
        type: clockInType,
        reason: reasonLabel,
        comments: clockInComments,
      };

      const result = await clockInVisit(visitId, clockData);

      setShowClockInModal(false);
      setSavingClockIn(false);

      // Update parent component
      if (onClockToggle) {
        await onClockToggle(selectedTask, {
          type: clockInType,
          reason: reasonLabel,
          comments: clockInComments,
          result,
        });
      }

      // Reset states
      setClockInType("");
      setClockInReason("");
      setClockInComments("");

      // Show success alert
      setSuccessClockInAlert({
        show: true,
        message: `Successfully clocked in ${clockInType} with reason`,
      });
      setTimeout(() => {
        setSuccessClockInAlert({ show: false, message: "" });
      }, 2200);
    } catch (error) {
      setSavingClockIn(false);
      alert(`Failed to clock in: ${error.message || "Unknown error"}`);
    }
  };
  const handleCancelClockIn = () => {
    setShowClockInModal(false);
    setClockInType("");
    setClockInReason("");
    setClockInComments("");
  };
  // Clock out early reasons
  const earlyClockOutReasons = [
    { value: "task-completed-early", label: "Task completed early" },
    { value: "client-cancelled", label: "Client cancelled" },
    { value: "emergency", label: "Emergency situation" },
    { value: "other", label: "Other" },
  ];
  const handleSubmitClockOut = async (e) => {
    e.preventDefault();
    if (!clockOutReason) {
      alert("Please select a reason for early clock out");
      return;
    }

    const visitId = selectedTask?.id || selectedTask?.rawVisit?.id;
    if (!visitId) {
      alert("No visit ID found");
      return;
    }

    setSavingClockOut(true);
    try {
      const reasonLabel =
        earlyClockOutReasons.find((r) => r.value === clockOutReason)?.label ||
        clockOutReason;
      const clockData = {
        type: "earlyClockOut",
        reason: reasonLabel,
        comments: clockOutComments,
      };

      const result = await clockOutVisit(visitId, clockData);

      setShowClockOutModal(false);
      setSavingClockOut(false);

      // Update parent component
      if (onClockToggle) {
        await onClockToggle(selectedTask, {
          type: "earlyClockOut",
          reason: reasonLabel,
          comments: clockOutComments,
          result,
        });
      }

      // Reset states
      setClockOutReason("");
      setClockOutComments("");

      // Show success alert
      setSuccessClockOutAlert({
        show: true,
        message: "Successfully clocked out early with reason",
      });
      setTimeout(() => {
        setSuccessClockOutAlert({ show: false, message: "" });
      }, 2200);
    } catch (error) {
      setSavingClockOut(false);
      alert(`Failed to clock out: ${error.message || "Unknown error"}`);
    }
  };
  const handleCancelClockOut = () => {
    setShowClockOutModal(false);
    setClockOutReason("");
    setClockOutComments("");
  };
  const handleTaskUpdate = (taskId, updatedTask) => {
    // Update selectedTask.tasks
    setSelectedTask((prev) => {
      if (!prev) return prev;
      const updatedTasks = prev.tasks
        ? prev.tasks.map((t) => (t.id === taskId ? updatedTask : t))
        : [];
      const updatedRawVisit = prev.rawVisit
        ? {
            ...prev.rawVisit,
            tasks: prev.rawVisit.tasks
              ? prev.rawVisit.tasks.map((t) =>
                  t.id === taskId ? updatedTask : t
                )
              : [],
          }
        : prev.rawVisit;
      return {
        ...prev,
        tasks: updatedTasks,
        rawVisit: updatedRawVisit,
      };
    });
  };
  return (
    <div className="MyTasksContent">
      {/* ===== TOP SUMMARY ===== */}
      <div className="MyTasksContent-Top">
        <ul>
          <li>
            <span>
              <CheckCircleIcon /> Task:
            </span>
            <b>{taskCountStr}</b>
          </li>
          <li>
            <span>
              {selectedTask?.callType === "double" ? (
                <UsersIcon />
              ) : (
                <UserIcon />
              )}{" "}
              Call:
            </span>
            <b>{callTypeStr}</b>
          </li>
          <li>
            <span>
              <ClockOutlineIcon /> Time:
            </span>
            <b>{timeStr}</b>
          </li>
          <li>
            <span>
              <CalendarIcon /> Duration:
            </span>
            <b className="durrad-Bbab">{durationStr}</b>
          </li>
          <li>
            <span>
              <MapPinIcon /> Distance:
            </span>
            <b>{distanceStr}</b>
          </li>
        </ul>
      </div>
      {/* ===== MAIN BODY ===== */}
      <div className="MyTasksContent-Mmain-BDy">
        {!isClockedIn &&
          !isCompleted &&
          ((isTaskTimeElapsed(selectedTask) &&
            (
              selectedTask?.status || selectedTask?.rawVisit?.status
            )?.toLowerCase() === "missed") ||
            (!isTaskTimeStarted(selectedTask) &&
              (
                selectedTask?.status || selectedTask?.rawVisit?.status
              )?.toLowerCase() !== "completed") ||
            (isTaskTimeStarted(selectedTask) &&
              !isTaskTimeElapsed(selectedTask) &&
              (
                selectedTask?.status || selectedTask?.rawVisit?.status
              )?.toLowerCase() !== "completed" &&
              getLatenessStr(selectedTask))) && (
            <div className="TaSt-Modal-COntsn-Main">
              <div className="FG-POLAK">
                {isTaskTimeElapsed(selectedTask) &&
                  (
                    selectedTask?.status || selectedTask?.rawVisit?.status
                  )?.toLowerCase() === "missed" && (
                    <p>The time for this Visit has elapsed.</p>
                  )}
                {!isTaskTimeStarted(selectedTask) &&
                  (
                    selectedTask?.status || selectedTask?.rawVisit?.status
                  )?.toLowerCase() !== "completed" && (
                    <p>The time for this Visit has not started yet.</p>
                  )}
                {isTaskTimeStarted(selectedTask) &&
                  !isTaskTimeElapsed(selectedTask) &&
                  (
                    selectedTask?.status || selectedTask?.rawVisit?.status
                  )?.toLowerCase() !== "completed" &&
                  getLatenessStr(selectedTask) && (
                    <p>{getLatenessStr(selectedTask)}</p>
                  )}
              </div>
            </div>
          )}

        {/* Show visit in progress timer when clocked in */}
        {isClockedIn && (
          <div className="TaSt-Modal-COntsn-Main">
            <div className="FG-POLAK">
              <p>Visit in progress - You are currently clocked in</p>
              {(() => {
                const clockInTime =
                  selectedTask?.clockInAt || selectedTask?.rawVisit?.clockInAt;
                if (clockInTime) {
                  const clockInDate = new Date(clockInTime);
                  const elapsed = currentTime - clockInDate;
                  const hours = Math.floor(elapsed / (1000 * 60 * 60));
                  const minutes = Math.floor(
                    (elapsed % (1000 * 60 * 60)) / (1000 * 60)
                  );
                  const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
                  return (
                    <p>
                      Elapsed time: {hours}h {minutes}m {seconds}s
                    </p>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        )}
        <div className="Mmain-BDy-Top">
          <div className="Oo-ProFt">
            <div className="Oo-ProFt-1">
              {selectedTask?.clientImage ? (
                <img src={selectedTask.clientImage} alt={clientName} />
              ) : (
                <span>{clientInitials}</span>
              )}
            </div>
            <div className="Oo-ProFt-2">
              <p>{clientName}</p>
            </div>
          </div>
          <div className="Mmain-BDy-Top-Btns">
            <button
              className={buttonClass}
              onClick={handleClockToggle}
              disabled={isButtonDisabled}
            >
              <span>
                <ButtonIcon /> {buttonText}
              </span>
            </button>
            <button>
              <span>
                <InformationCircleIcon /> Status:
              </span>
              <b className={statusClass}>
                {(
                  selectedTask?.status ||
                  selectedTask?.rawVisit?.status ||
                  taskStatus
                )
                  ?.toLowerCase()
                  .replace(/^\w/, (c) => c.toUpperCase())}
              </b>
            </button>
            {overtimeLabel && (
              <button>
                <span>
                  <ClockOutlineIcon /> {overtimeLabel.split(":")[0]}:
                </span>
                <b>{overtimeLabel.split(":")[1].trim()}</b>
              </button>
            )}
          </div>
        </div>
        {/* ===== TABS ===== */}
        <div className="GGths-BBsyn">
          <div className="GGths-BBsyn-1">
            <div className="Hhsa-Btns">
              {tabs.map((tab) => {
                const Icon = activeTab === tab.id ? tab.solid : tab.outline;
                return (
                  <button
                    key={tab.id}
                    className={activeTab === tab.id ? "active" : ""}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className="tab-icon" />
                    {tab.label}
                    {tab.id === "task" && (
                      <b className="NumB-Task">{taskCountStr}</b>
                    )}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="underline"
                        className="tab-underline"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          {/* ===== CONTENT ===== */}
          <div className="GGths-BBsyn-2">
            <AnimatePresence mode="wait">
              {activeTab === "profile" && (
                <motion.div key="profile" {...tabAnimation}>
                  <ClientProfile />
                </motion.div>
              )}
              {activeTab === "task" && (
                <motion.div key="task" {...tabAnimation}>
                  <ModalTask
                    tasks={
                      selectedTask?.tasks || selectedTask?.rawVisit?.tasks || []
                    }
                    onTaskUpdate={handleTaskUpdate}
                  />
                </motion.div>
              )}
              {activeTab === "visit" && (
                <motion.div key="visit" {...tabAnimation}>
                  <AgreedCareVisit />
                </motion.div>
              )}
              {activeTab === "log" && (
                <motion.div key="log" {...tabAnimation}>
                  <Log visitData={selectedTask?.rawVisit} />
                </motion.div>
              )}
              {activeTab === "history" && (
                <motion.div key="history" {...tabAnimation}>
                  <History
                    history={history}
                    actualClockIn={actualClockIn}
                    actualClockOut={actualClockOut}
                    formatDuration={formatDuration}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      {/* Success Alert for Clock In */}
      <AnimatePresence>
        {successClockInAlert.show && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className="global-task-success-alert"
          >
            <div>{successClockInAlert.message}</div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Success Alert for Clock Out */}
      <AnimatePresence>
        {successClockOutAlert.show && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className="global-task-success-alert"
          >
            <div>{successClockOutAlert.message}</div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Clock In Reason Modal */}
      <AnimatePresence>
        {showClockInModal && clockInType && (
          <>
            <motion.div
              className="add-task-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancelClockIn}
            />
            <motion.div
              className="add-task-panel"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="TTas-Boxxs custom-scroll-bar">
                <div className="TTas-Boxxs-Top">
                  <h4>
                    {clockInType === "early"
                      ? "Clock In Early"
                      : "Clock In Late"}
                  </h4>
                  <p>
                    Drop a reason for {clockInType} clock in to this visit to
                    ensure it is reviewed by the care coordinator.
                  </p>
                </div>
                <div className="TTas-Boxxs-Body">
                  <form
                    onSubmit={handleSubmitClockIn}
                    className="add-task-form"
                  >
                    <div className="TTtata-Input">
                      <label>Reason for {clockInType} clock in *</label>
                      <select
                        value={clockInReason}
                        onChange={(e) => setClockInReason(e.target.value)}
                        required
                      >
                        <option value="">Select a reason</option>
                        {currentReasons.map((reason) => (
                          <option key={reason.value} value={reason.value}>
                            {reason.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="TTtata-Input">
                      <label>Comments</label>
                      <textarea
                        value={clockInComments}
                        onChange={(e) => setClockInComments(e.target.value)}
                        placeholder="Provide additional details about the reason..."
                      />
                    </div>
                    <div className="add-task-actions">
                      <button
                        type="button"
                        className="close-task"
                        onClick={handleCancelClockIn}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="proceed-tast-btn btn-primary-bg"
                      >
                        {savingClockIn ? (
                          <>
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
                                marginRight: "5px",
                                display: "inline-block",
                              }}
                            />
                            Submit...
                          </>
                        ) : (
                          "Submit"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Clock Out Early Reason Modal */}
      <AnimatePresence>
        {showClockOutModal && (
          <>
            <motion.div
              className="add-task-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancelClockOut}
            />
            <motion.div
              className="add-task-panel"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="TTas-Boxxs custom-scroll-bar">
                <div className="TTas-Boxxs-Top">
                  <h4>Clock Out Early</h4>
                  <p>
                    Drop a reason for early clock out to this visit to ensure it
                    is reviewed by the care coordinator.
                  </p>
                </div>
                <div className="TTas-Boxxs-Body">
                  <form
                    onSubmit={handleSubmitClockOut}
                    className="add-task-form"
                  >
                    <div className="TTtata-Input">
                      <label>Reason for early clock out *</label>
                      <select
                        value={clockOutReason}
                        onChange={(e) => setClockOutReason(e.target.value)}
                        required
                      >
                        <option value="">Select a reason</option>
                        {earlyClockOutReasons.map((reason) => (
                          <option key={reason.value} value={reason.value}>
                            {reason.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="TTtata-Input">
                      <label>Comments</label>
                      <textarea
                        value={clockOutComments}
                        onChange={(e) => setClockOutComments(e.target.value)}
                        placeholder="Provide additional details about the reason..."
                      />
                    </div>
                    <div className="add-task-actions">
                      <button
                        type="button"
                        className="close-task"
                        onClick={handleCancelClockOut}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="proceed-tast-btn btn-primary-bg"
                      >
                        {savingClockOut ? (
                          <>
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
                                marginRight: "5px",
                                display: "inline-block",
                              }}
                            />
                            Submit...
                          </>
                        ) : (
                          "Submit"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
export default MyTasksContent;
