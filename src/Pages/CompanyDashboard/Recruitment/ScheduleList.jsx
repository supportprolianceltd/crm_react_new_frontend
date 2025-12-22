import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CalendarDaysIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { FiMoreVertical } from "react-icons/fi";
import { DateTime } from "luxon";
import DatePicker from "react-datepicker";
import StatusBadge from "../../../components/StatusBadge";
import CountUp from "react-countup";
import { WEB_PAGE__URL } from "../../../config";
import {
  fetchSchedules,
  updateSchedule,
  completeSchedule,
  cancelSchedule,
  bulkDeleteSchedules,
  fetchTimezoneChoices,
  updateJobApplicationStatus,
  // fetchJobApplicationById,
  resetSchedule,
} from "./ApiService";

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

const SuccessModal = ({ title, message, onClose }) => (
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
      <h3 className="mb-4 text-lg font-semibold text-green-600">{title}</h3>
      <p className="mb-6">{message}</p>
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="rounded bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700"
          autoFocus
        >
          OK
        </button>
      </div>
    </motion.div>
  </AnimatePresence>
);

const CancelConfirmModal = ({ onClose, onSubmit }) => {
  const [reason, setReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setErrorMessage("Please provide a reason for cancellation.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    setIsSubmitting(true);
    setErrorMessage("");
    await onSubmit(reason);
    setIsSubmitting(false);
    onClose();
  };

  return (
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
        role="dialog"
        aria-modal="true"
        style={{ width: "400px" }}
      >
        <h3 className="mb-4 text-lg font-semibold">Cancel Interview</h3>
        <div
          className="mb-4"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <label
            htmlFor="cancelReason"
            className="block text-sm font-medium mb-2"
            style={{ marginTop: "10px" }}
          >
            Reason for Cancellation:
          </label>
          <textarea
            id="cancelReason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter the reason for cancelling the interview..."
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={4}
            style={{
              border: "1px solid #eee",
              padding: "10px",
              marginTop: "10px",
            }}
          />
        </div>
        {errorMessage && (
          <p className="text-red-600 text-sm mb-4">{errorMessage}</p>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded bg-gray-300 px-4 py-2 font-semibold hover:bg-gray-400"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
            className="rounded bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const EditScheduleModal = ({
  schedule,
  onClose,
  onSave,
  timezoneChoices,
  setShowAlertModal,
  setAlertMessage,
  fetchSchedulesData,
  allSchedules, // New prop for conflict checking
}) => {
  const [meetingMode, setMeetingMode] = useState(
    schedule.meeting_mode || "Virtual"
  );
  const [meetingLink, setMeetingLink] = useState(schedule.meeting_link || "");
  const [interviewAddress, setInterviewAddress] = useState(
    schedule.interview_address || ""
  );
  const [tempSelectedDate, setTempSelectedDate] = useState(
    new Date(schedule.interview_start_date_time)
  );
  const [tempStartTime, setTempStartTime] = useState(
    new Date(schedule.interview_start_date_time)
  );
  const [tempEndTime, setTempEndTime] = useState(
    new Date(new Date(schedule.interview_end_date_time).getTime() + 30 * 60000)
  );
  const [message, setMessage] = useState(schedule.message || "");
  const [timezone, setTimezone] = useState(schedule.timezone || "UTC");
  const [timeSelectionMode, setTimeSelectionMode] = useState("start");
  const [modalShowTimeDropdown, setModalShowTimeDropdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(schedule.status);
  const [showCancelReasonSection, setShowCancelReasonSection] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmittingReason, setIsSubmittingReason] = useState(false);
  const [conflictingTimes, setConflictingTimes] = useState([]);
  const [hasConflict, setHasConflict] = useState(false);
  const modalTimeDropdownRef = useRef(null);
  const modalContentRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalTimeDropdownRef.current &&
        !modalTimeDropdownRef.current.contains(event.target)
      ) {
        setModalShowTimeDropdown(false);
      }
      if (
        modalContentRef.current &&
        !modalContentRef.current.contains(event.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const formatFullDate = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const monthShort = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${monthShort} ${year}`;
  };

  const formatTime = (date) => {
    if (!date) return "Not selected";
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${minutes} ${ampm}`;
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        times.push(time);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const checkScheduleConflict = (
    selectedDate,
    startTime,
    endTime,
    timezone
  ) => {
    if (!startTime || !selectedDate) return false;

    const interviewStartDateTime = new Date(selectedDate);
    interviewStartDateTime.setHours(
      startTime.getHours(),
      startTime.getMinutes()
    );
    const interviewEndDateTime = endTime ? new Date(selectedDate) : null;
    if (endTime) {
      interviewEndDateTime.setHours(endTime.getHours(), endTime.getMinutes());
    }

    // Exclude the current schedule being edited and filter out completed/cancelled schedules
    const otherSchedules = allSchedules.filter(
      (s) =>
        s.id !== schedule.id &&
        s.status !== "completed" &&
        s.status !== "cancelled"
    );

    for (const existingSchedule of otherSchedules) {
      const existingStart = new Date(
        existingSchedule.interview_start_date_time
      );
      const existingEnd = new Date(existingSchedule.interview_end_date_time);

      if (
        (!endTime || !interviewEndDateTime) &&
        interviewStartDateTime.getTime() === existingStart.getTime()
      ) {
        return true;
      }

      if (endTime && interviewEndDateTime) {
        if (
          (interviewStartDateTime <= existingEnd &&
            interviewEndDateTime >= existingStart) ||
          (existingStart <= interviewEndDateTime &&
            existingEnd >= interviewStartDateTime)
        ) {
          return true;
        }
      }
    }
    return false;
  };

  const getConflictingDates = () => {
    const conflictingDates = new Set();
    // Filter out completed and cancelled schedules
    const otherSchedules = allSchedules.filter(
      (s) =>
        s.id !== schedule.id &&
        s.status !== "completed" &&
        s.status !== "cancelled"
    );

    otherSchedules.forEach((sched) => {
      const scheduleDate = new Date(sched.interview_start_date_time);
      const dateString = scheduleDate.toISOString().split("T")[0];
      conflictingDates.add(dateString);
    });

    return conflictingDates;
  };

  const handleModalTimeButtonClick = () => {
    if (tempStartTime && tempEndTime) {
      setTempStartTime(null);
      setTempEndTime(null);
      setTimeSelectionMode("start");
    }
    setModalShowTimeDropdown(!modalShowTimeDropdown);
  };

  const handleTimeSelect = (time) => {
    if (timeSelectionMode === "start") {
      if (checkScheduleConflict(tempSelectedDate, time, null, timezone)) {
        setErrorMessage("This start time conflicts with an existing schedule.");
        setTimeout(() => setErrorMessage(""), 5000);
        return;
      }
      setTempStartTime(time);
      setTimeSelectionMode("end");
    } else {
      if (tempStartTime && time <= tempStartTime) {
        setErrorMessage("End time must be after start time.");
        setTimeout(() => setErrorMessage(""), 3000);
        return;
      }
      if (
        checkScheduleConflict(tempSelectedDate, tempStartTime, time, timezone)
      ) {
        setErrorMessage("This time slot conflicts with an existing schedule.");
        setTimeout(() => setErrorMessage(""), 5000);
        return;
      }
      setTempEndTime(time);
      setTimeSelectionMode("start");
      setModalShowTimeDropdown(false);
    }
    setHasConflict(false);
    setErrorMessage("");
  };

  const handleDateChange = (date) => {
    setTempSelectedDate(date);
    setTempStartTime(null);
    setTempEndTime(null);
    setTimeSelectionMode("start");
    setModalShowTimeDropdown(false);

    const conflicts = timeOptions.filter((time) =>
      checkScheduleConflict(date, time, null, timezone)
    );
    setConflictingTimes(conflicts);
    const hasConflictNow = checkScheduleConflict(
      date,
      tempStartTime,
      tempEndTime,
      timezone
    );
    setHasConflict(hasConflictNow);

    if (hasConflictNow) {
      setErrorMessage(
        "The selected date and time may conflict with an existing schedule."
      );
      setTimeout(() => setErrorMessage(""), 5000);
    } else {
      setErrorMessage("");
    }
  };

  const isValidUrl = (url) => {
    const urlPattern = /^(https?:\/\/)([\w-]+(\.[\w-]+)+)(\/[\w- ./?%&=]*)?$/;
    return urlPattern.test(url);
  };

  const handleSaveChanges = async () => {
    if (!tempStartTime) {
      setErrorMessage("Please select a start time for the interview.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    if (!tempEndTime) {
      setErrorMessage("Please select an end time for the interview.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    if (tempEndTime <= tempStartTime) {
      setErrorMessage("End time must be after the start time.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    if (meetingMode === "Virtual" && !meetingLink.trim()) {
      setErrorMessage(
        "Please provide a meeting link for the virtual interview."
      );
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    if (meetingMode === "Virtual" && !isValidUrl(meetingLink.trim())) {
      setErrorMessage(
        "Please provide a valid URL for the meeting link (e.g., https://zoom.us/j/123456789)."
      );
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    if (meetingMode === "Physical" && !interviewAddress.trim()) {
      setErrorMessage("Please provide an address for the physical interview.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    if (!timezone) {
      setErrorMessage("Please select a timezone.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    if (
      checkScheduleConflict(
        tempSelectedDate,
        tempStartTime,
        tempEndTime,
        timezone
      )
    ) {
      setErrorMessage(
        "The selected time slot conflicts with an existing schedule. Please choose a different time."
      );
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }

    setIsSaving(true);

    try {
      const interviewStartDateTime = new Date(tempSelectedDate);
      interviewStartDateTime.setHours(
        tempStartTime.getHours(),
        tempStartTime.getMinutes()
      );
      const interviewEndDateTime = tempEndTime
        ? new Date(tempSelectedDate)
        : null;
      if (tempEndTime) {
        interviewEndDateTime.setHours(
          tempEndTime.getHours(),
          tempEndTime.getMinutes()
        );
      }
      if (interviewStartDateTime <= new Date()) {
        throw new Error("Interview start date and time must be in the future.");
      }
      const scheduleData = {
        interview_start_date_time: interviewStartDateTime.toISOString(),
        interview_end_date_time: interviewEndDateTime
          ? interviewEndDateTime.toISOString()
          : null,
        meeting_mode: meetingMode,
        meeting_link: meetingMode === "Virtual" ? meetingLink : "",
        interview_address: meetingMode === "Physical" ? interviewAddress : "",
        message,
        timezone,
      };
      await onSave(schedule.id, scheduleData);
      setIsSaving(false);
      onClose();
    } catch (error) {
      setErrorMessage(error.message || "Failed to save schedule.");
      setIsSaving(false);
      setTimeout(() => setErrorMessage(""), 3000);
      console.error("Error saving schedule:", error);
    }
  };

  const handleCancelInitiate = () => {
    setShowCancelReasonSection(true);
  };

  const handleGoBack = () => {
    setShowCancelReasonSection(false);
    setCancelReason("");
  };

  const handleSubmitCancelReason = async () => {
    if (!cancelReason.trim()) {
      setErrorMessage("Please provide a reason for cancellation.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    setIsCancelling(true);
    setIsSubmittingReason(true);

    try {
      await cancelSchedule(schedule.id, cancelReason);
      await fetchSchedulesData();
      setAlertMessage("Schedule has been canceled.");
      setShowAlertModal(true);
      setIsSubmittingReason(false);
      onClose();
    } catch (error) {
      setErrorMessage(error.message || "Failed to cancel interview.");
      setIsSubmittingReason(false);
      setTimeout(() => setErrorMessage(""), 3000);
      console.error("Error cancelling schedule:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  const isEditable = schedule.status === "scheduled";
  const canJoin =
    meetingMode === "Virtual" &&
    meetingLink.trim() &&
    isValidUrl(meetingLink.trim());
  const isCompletedOrCancelled =
    schedule.status === "completed" || schedule.status === "cancelled";

  return (
    <div>
      <style>
        {`
          .time-item:hover {
            background-color: #f0f0f0;
          }
          .time-item.conflicting {
            filter: blur(2px);
            opacity: 0.5;
            pointer-events: none;
          }
          .conflicting-date {
            filter: blur(2px);
            opacity: 0.5;
            pointer-events: none;
          }
          .btn-join-bg {
            background-color: #4169E1; /* Royal blue */
            color: #ffffff; /* White text for contrast */
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 4px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .btn-join-bg:hover {
            background-color: #5A7BEA; /* Lighter royal blue for hover */
          }
          .btn-join-bg:disabled {
            background-color: #6b7280; /* Gray for disabled state */
            cursor: not-allowed;
          }
        `}
      </style>
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            className="error-notification"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#fee2e2",
              padding: "1rem",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              zIndex: 4001,
              maxWidth: "500px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              style={{
                width: "20px",
                height: "20px",
                marginRight: "0.5rem",
                fill: "#fff",
              }}
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <span style={{ color: "#fff" }}>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
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
          ref={modalContentRef}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          style={{
            background: "#fff",
            padding: "1.5rem",
            maxWidth: "600px",
            width: "90%",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          {!showCancelReasonSection ? (
            <>
              <h3>
                {isEditable ? "Edit Schedule Details" : "View Schedule Details"}
              </h3>

              {/* <div className="modal-top-buttons-OlaD">
                {isEditable ? (
                  <>
                    <button
                      onClick={handleCancelInitiate}
                      disabled={isCancelling || isSaving}
                      className="btn-cancel-bg"
                    >
                      {isCancelling ? (
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
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              border: "3px solid #fff",
                              borderTopColor: "#d32e2e",
                              marginRight: "5px",
                              display: "inline-block",
                            }}
                          />
                          Processing...
                        </>
                      ) : (
                        "Cancel Interview"
                      )}
                    </button>
                    {canJoin && (
                      <button
                        onClick={() => window.open(meetingLink, "_blank")}
                        disabled={isSaving || isCancelling}
                        className="btn-join-bg"
                      >
                        Join Meeting
                      </button>
                    )}
                  </>
                ) : null}
              </div> */}

              <div className="GGtg-DDDVa">
                <h4>Timezone:</h4>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="oujka-Inpuauy"
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                  disabled={!isEditable}
                >
                  {timezoneChoices.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="GGtg-DDDVa">
                <h4>Meeting Mode:</h4>
                <select
                  value={meetingMode}
                  onChange={(e) => {
                    setMeetingMode(e.target.value);
                    setMeetingLink("");
                    setInterviewAddress("");
                  }}
                  className="oujka-Inpuauy"
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                  disabled={!isEditable}
                >
                  <option value="Virtual">Virtual</option>
                  <option value="Physical">Physical</option>
                </select>

                {meetingMode === "Virtual" && (
                  <div className="GGtg-DDDVa">
                    <label>Meeting Link:</label>
                    <input
                      type="text"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="Enter meeting link (e.g., https://zoom.us/j/123456789)"
                      className="oujka-Inpuauy"
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        borderRadius: "0px",
                        border: "1px solid #ccc",
                      }}
                      disabled={!isEditable}
                    />
                  </div>
                )}

                {meetingMode === "Physical" && (
                  <div className="GGtg-DDDVa" style={{ marginTop: "1rem" }}>
                    <label htmlFor="interviewAddress">Interview Address:</label>
                    <input
                      id="interviewAddress"
                      type="text"
                      value={interviewAddress}
                      onChange={(e) => setInterviewAddress(e.target.value)}
                      placeholder="Enter interview address"
                      className="oujka-Inpuauy"
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                      }}
                      disabled={!isEditable}
                    />
                  </div>
                )}
              </div>

              <div className="GGtg-DDDVa">
                <label htmlFor="message">Message:</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="oujka-Inpuauy OIUja-Tettxa"
                  placeholder="Enter any additional message"
                  disabled={!isEditable}
                />
              </div>

              <div className="GGtg-DDDVa">
                <h4>Candidate:</h4>
                <p>{schedule.candidate_name}</p>
              </div>

              <div className="GGtg-DDDVa">
                <h4>Application Status:</h4>
                <p>
                  <StatusBadge status={schedule.application_status} />
                </p>
              </div>

              <div className="ouksks-pola">
                <h4>Schedule Details:</h4>
                <p>
                  <span>
                    <CalendarDaysIcon className="inline-block w-5 h-5 mr-2" />
                    Date:
                  </span>{" "}
                  <span style={{ color: hasConflict ? "red" : "inherit" }}>
                    {formatFullDate(tempSelectedDate)}
                  </span>
                </p>
                <p>
                  <span>
                    <ClockIcon className="inline-block w-5 h-5 mr-2" />
                    Time:
                  </span>{" "}
                  <span style={{ color: hasConflict ? "red" : "inherit" }}>
                    {formatTime(tempStartTime)} - {formatTime(tempEndTime)} (
                    {timezoneChoices.find((tz) => tz.value === timezone)
                      ?.label || timezone}
                    )
                  </span>
                  {hasConflict && (
                    <span style={{ color: "red", marginLeft: "0.5rem" }}>
                      (Conflicts with existing schedule)
                    </span>
                  )}
                </p>

                {currentStatus === "rejected" &&
                  schedule.cancellation_reason && (
                    <div className="GGtg-DDDVa">
                      <h4>Cancellation Reason:</h4>
                      <p className="aoiiksjs-OKka">
                        {schedule.cancellation_reason}
                      </p>
                    </div>
                  )}

                {isEditable && (
                  <div className="ppol-Btns" style={{ marginTop: "1rem" }}>
                    <div
                      className="time-select-container"
                      ref={modalTimeDropdownRef}
                    >
                      <button
                        onClick={handleModalTimeButtonClick}
                        style={{
                          padding: "0.5rem 1rem",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                          background: "#fff",
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        {timeSelectionMode === "start"
                          ? "Start Time"
                          : "End Time"}
                        <ChevronDownIcon
                          className={`icon ${
                            modalShowTimeDropdown ? "rotate-180" : ""
                          }`}
                          style={{ width: "20px", marginLeft: "0.5rem" }}
                        />
                      </button>

                      {modalShowTimeDropdown && (
                        <div
                          className="time-dropdown custom-scroll-bar"
                          style={{
                            maxHeight: "150px",
                            overflowY: "auto",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            background: "#fff",
                            position: "absolute",
                            zIndex: 10,
                            width: "150px",
                          }}
                        >
                          {timeOptions.map((time, index) => (
                            <div
                              key={index}
                              className={`time-item ${
                                conflictingTimes.includes(time)
                                  ? "conflicting"
                                  : ""
                              }`}
                              onClick={() =>
                                !conflictingTimes.includes(time) &&
                                handleTimeSelect(time)
                              }
                              style={{
                                padding: "0.5rem",
                                cursor: conflictingTimes.includes(time)
                                  ? "not-allowed"
                                  : "pointer",
                              }}
                            >
                              {formatTime(time)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {isEditable && (
                  <div
                    className="realTime-Calendar-wrapper"
                    style={{ marginTop: "1rem" }}
                  >
                    <DatePicker
                      selected={tempSelectedDate}
                      onChange={(date) => handleDateChange(date)}
                      inline
                      minDate={new Date()}
                      dayClassName={(date) => {
                        const dateString = date.toISOString().split("T")[0];
                        return getConflictingDates().has(dateString)
                          ? "conflicting-date"
                          : "";
                      }}
                    />
                  </div>
                )}
              </div>

              <div
                className="oioak-POldj-BTn"
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <button onClick={onClose} className="CLCLCjm-BNtn">
                  Close
                </button>
                {isEditable && (
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving || hasConflict}
                    className="btn-primary-bg"
                    style={{
                      cursor:
                        isSaving || hasConflict ? "not-allowed" : "pointer",
                    }}
                  >
                    {isSaving ? (
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
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            border: "3px solid rgba(255,255,255,0.3)",
                            borderTopColor: "#fff",
                            marginRight: "8px",
                            display: "inline-block",
                          }}
                        />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <h3>Cancel Interview</h3>
              <div className="GGtg-DDDVa">
                <label htmlFor="cancelReason">Reason for Cancellation:</label>
                <textarea
                  id="cancelReason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter the reason for cancelling the interview..."
                  className="oujka-Inpuauy OIUja-Tettxa"
                />
              </div>
              <div
                className="oioak-POldj-BTn"
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <button onClick={handleGoBack} className="CLCLCjm-BNtn">
                  Go Back
                </button>
                <button
                  onClick={handleSubmitCancelReason}
                  disabled={isSubmittingReason}
                  className="btn-primary-bg"
                >
                  {isSubmittingReason ? (
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
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTopColor: "#fff",
                          marginRight: "8px",
                          display: "inline-block",
                        }}
                      />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

const ScheduleList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isVisible, setIsVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const [showNoSelectionAlert, setShowNoSelectionAlert] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [allSchedules, setAllSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [userTimezone, setUserTimezone] = useState(
    DateTime.local().zoneName || "UTC"
  );
  const [timezoneChoices, setTimezoneChoices] = useState([]);
  const [activePopup, setActivePopup] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedScheduleForCancel, setSelectedScheduleForCancel] =
    useState(null);
  const masterCheckboxRef = useRef(null);
  const navigate = useNavigate();

  const statuses = ["All", "scheduled", "completed", "cancelled"];

  const applicationStatuses = {
    shortlisted: "Shortlisted",
    interviewing: "Interviewing",
    interviewed: "Interviewed",
    hired: "Hired",
    rejected: "Rejected",
  };

  const isValidUrl = (url) => {
    const urlPattern = /^(https?:\/\/)([\w-]+(\.[\w-]+)+)(\/[\w- ./?%&=]*)?$/;
    return urlPattern.test(url);
  };

  const handleCardClick = (filter) => {
    setStatusFilter(filter);
    setIsVisible(false);
  };

  // Fetch data on mount only
  useEffect(() => {
    fetchSchedulesData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm, rowsPerPage]);

  const fetchSchedulesData = async () => {
    try {
      setIsLoading(true);
      const params = {
        page_size: 10000,
      };

      const [scheduleData, timezoneData] = await Promise.all([
        fetchSchedules(params),
        fetchTimezoneChoices(),
      ]);

      let schedulesWithStatus = scheduleData.results || [];
      // if (
      //   schedulesWithStatus.length > 0 &&
      //   !schedulesWithStatus[0].application_status
      // ) {
      //   const applicationPromises = schedulesWithStatus.map((schedule) =>
      //     schedule.job_application_id
      //       ? fetchJobApplicationById(schedule.job_application_id)
      //       : Promise.resolve({
      //           status: "shortlisted",
      //           job_requisition_id: null,
      //           email: null,
      //           job_requisition_title: null,
      //         })
      //   );
      //   const applicationData = await Promise.all(applicationPromises);
      //   schedulesWithStatus = schedulesWithStatus.map((schedule, index) => ({
      //     ...schedule,
      //     application_status: applicationData[index].status || "shortlisted",
      //     job_requisition_id: applicationData[index].job_requisition_id || null,
      //     email: applicationData[index].email || null,
      //     job_requisition_title:
      //       applicationData[index].job_requisition_title || null,
      //   }));
      // }

      setAllSchedules(schedulesWithStatus);
      setTimezoneChoices(timezoneData);
      setIsLoading(false);
    } catch (error) {
      setErrorMessage(error.message || "Failed to load data.");
      setIsLoading(false);
      setTimeout(() => setErrorMessage(""), 3000);
      console.error("Error fetching data:", error);
    }
  };

  const filteredSchedules = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return allSchedules.filter(
      (schedule) =>
        (statusFilter === "All" || schedule.status === statusFilter) &&
        (searchTerm === "" ||
          schedule.candidate_name.toLowerCase().includes(lowerSearchTerm) ||
          (schedule.job_requisition_title &&
            schedule.job_requisition_title
              .toLowerCase()
              .includes(lowerSearchTerm)))
    );
  }, [allSchedules, statusFilter, searchTerm]);

  const getPriority = useCallback((item) => {
    if (
      item.status === "scheduled" &&
      item.application_status === "shortlisted"
    ) {
      return 0;
    }
    if (item.status === "completed" || item.status === "cancelled") {
      return 2;
    }
    return 1;
  }, []);

  const sortedSchedules = useMemo(() => {
    return [...filteredSchedules].sort((a, b) => {
      const prioA = getPriority(a);
      const prioB = getPriority(b);
      if (prioA !== prioB) return prioA - prioB;
      const timeA = new Date(a.interview_start_date_time).getTime();
      const timeB = new Date(b.interview_start_date_time).getTime();
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });
  }, [filteredSchedules, sortOrder]);

  const paginatedSchedules = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedSchedules.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedSchedules, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredSchedules.length / rowsPerPage) || 1;

  const stats = useMemo(
    () => ({
      total: allSchedules.length,
      scheduled: allSchedules.filter((s) => s.status === "scheduled").length,
      completed: allSchedules.filter((s) => s.status === "completed").length,
      cancelled: allSchedules.filter((s) => s.status === "cancelled").length,
    }),
    [allSchedules]
  );

  const handleJoinMeeting = (schedule) => {
    if (
      schedule.meeting_mode === "Virtual" &&
      schedule.meeting_link &&
      isValidUrl(schedule.meeting_link)
    ) {
      window.open(schedule.meeting_link, "_blank");
    }
  };

  const handleCompleteScheduleList = async (schedule) => {
    try {
      setIsLoading(true);
      await completeSchedule(schedule.id);
      if (
        schedule.job_application_id &&
        schedule.application_status !== "interviewed"
      ) {
        const payload = {
          status: "interviewed",
          job_requisition_id: schedule.job_requisition_id,
          email: schedule.email,
        };
        await updateJobApplicationStatus(schedule.job_application_id, payload);
      }
      await fetchSchedulesData();
      setAlertMessage(
        "Schedule marked as completed and application status updated to 'Interviewed'."
      );
      setShowAlertModal(true);
    } catch (error) {
      setErrorMessage(
        error.message ||
          "Failed to complete interview or update application status."
      );
      setTimeout(() => setErrorMessage(""), 3000);
      console.error("Error completing schedule:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetScheduleList = async (schedule) => {
    try {
      setIsLoading(true);
      await resetSchedule(schedule.id);
      await fetchSchedulesData();
      setAlertMessage("Schedule status reset to 'Scheduled'.");
      setShowAlertModal(true);
    } catch (error) {
      setErrorMessage(error.message || "Failed to reset schedule status.");
      setTimeout(() => setErrorMessage(""), 3000);
      console.error("Error resetting schedule:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubmit = async (reason) => {
    try {
      setIsLoading(true);
      await cancelSchedule(selectedScheduleForCancel.id, reason);
      await fetchSchedulesData();
      setAlertMessage("Schedule has been canceled.");
      setShowAlertModal(true);
    } catch (error) {
      setErrorMessage(error.message || "Failed to cancel interview.");
      setTimeout(() => setErrorMessage(""), 3000);
      console.error("Error cancelling schedule:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const toggleSection = () => {
    setIsVisible((prev) => !prev);
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    if (paginatedSchedules.every((item) => selectedIds.includes(item.id))) {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedSchedules.some((item) => item.id === id))
      );
    } else {
      setSelectedIds((prev) => [
        ...prev,
        ...paginatedSchedules
          .filter((item) => !prev.includes(item.id))
          .map((item) => item.id),
      ]);
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
      setIsLoading(true);
      const response = await bulkDeleteSchedules(selectedIds);
      await fetchSchedulesData();
      setSelectedIds([]);
      setShowConfirmDelete(false);
      setSuccessMessage(
        response.detail ||
          `Successfully deleted ${selectedIds.length} schedule(s).`
      );
      setShowSuccessModal(true);
      setIsLoading(false);
    } catch (error) {
      setErrorMessage(error.message || "Failed to delete schedules.");
      setIsLoading(false);
      setTimeout(() => setErrorMessage(""), 3000);
      console.error("Error deleting schedules:", error);
    }
  };

  const handleViewSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setShowEditModal(true);
  };

  const handleSaveSchedule = async (id, updatedSchedule) => {
    try {
      const response = await updateSchedule(id, updatedSchedule);
      await fetchSchedulesData();
      setAlertMessage("Schedule updated successfully.");
      setShowAlertModal(true);
    } catch (error) {
      throw new Error(error.message || "Failed to update schedule.");
    }
  };

  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.checked = false;
    }
    setSelectedIds([]);
  }, [currentPage, rowsPerPage]);

  const formatInterviewDateTime = (
    interviewStartDateTime,
    interviewEndDateTime,
    scheduleTimezone
  ) => {
    const startDt = DateTime.fromISO(interviewStartDateTime, {
      zone: scheduleTimezone || "UTC",
    });
    const endDt = interviewEndDateTime
      ? DateTime.fromISO(interviewEndDateTime, {
          zone: scheduleTimezone || "UTC",
        })
      : null;
    const localStartDt = startDt.setZone(userTimezone);
    const localEndDt = endDt ? endDt.setZone(userTimezone) : null;
    const scheduleTzLabel =
      timezoneChoices.find((tz) => tz.value === scheduleTimezone)?.label ||
      scheduleTimezone ||
      "UTC";
    const formattedStart = localStartDt.toFormat("dd LLL yyyy, h:mm a");
    const formattedEnd = localEndDt
      ? ` - ${localEndDt.toFormat("h:mm a")}`
      : "";
    return `${formattedStart}${formattedEnd} (${scheduleTzLabel})`;
  };

  const isEditableForSchedule = (schedule) => schedule.status === "scheduled";
  const canJoinForSchedule = (schedule) =>
    schedule.meeting_mode === "Virtual" &&
    schedule.meeting_link &&
    isValidUrl(schedule.meeting_link.trim());
  const isCompletedOrCancelledForSchedule = (schedule) =>
    schedule.status === "interviewed" || schedule.status === "rejected";

  // Get action buttons based on interview status
  const getActionButtons = (schedule) => {
    const actions = [];

    // Always show View Schedule
    actions.push(
      <motion.button
        key="view-schedule"
        onClick={(e) => {
          e.stopPropagation();
          handleViewSchedule(schedule);
          setActivePopup(null);
        }}
        whileHover={{ x: 5 }}
      >
        View Schedule
      </motion.button>
    );

    // For completed interviews
    if (schedule.status === "completed") {
      actions.push(
        <motion.button
          key="reset-schedule"
          onClick={(e) => {
            e.stopPropagation();
            handleResetScheduleList(schedule);
            setActivePopup(null);
          }}
          whileHover={{ x: 5 }}
        >
          Reset Schedule Status
        </motion.button>
      );
    }

    // For cancelled interviews
    if (schedule.status === "cancelled") {
      actions.push(
        <motion.button
          key="reset-schedule"
          onClick={(e) => {
            e.stopPropagation();
            handleResetScheduleList(schedule);
            setActivePopup(null);
          }}
          whileHover={{ x: 5 }}
        >
          Reset Schedule Status
        </motion.button>
      );
    }

    // For scheduled interviews (existing logic)
    if (schedule.status === "scheduled") {
      if (canJoinForSchedule(schedule)) {
        actions.push(
          <motion.button
            key="join-meeting"
            onClick={(e) => {
              e.stopPropagation();
              handleJoinMeeting(schedule);
              setActivePopup(null);
            }}
            whileHover={{ x: 5 }}
          >
            Join Meeting
          </motion.button>
        );
      }

      actions.push(
        <motion.button
          key="complete-schedule"
          onClick={(e) => {
            e.stopPropagation();
            handleCompleteScheduleList(schedule);
            setActivePopup(null);
          }}
          whileHover={{ x: 5 }}
        >
          Complete Interview
        </motion.button>
      );

      actions.push(
        <motion.button
          key="cancel-schedule"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedScheduleForCancel(schedule);
            setShowCancelConfirm(true);
            setActivePopup(null);
          }}
          whileHover={{ x: 5 }}
          style={{ color: "#e53e3e" }}
        >
          Cancel Interview
        </motion.button>
      );
    }

    return actions;
  };

  return (
    <div className="ScheduleList-sec" onClick={closePopups}>
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            className="error-notification"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#fee2e2",
              padding: "1rem",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              zIndex: 4001,
              maxWidth: "500px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              style={{
                width: "20px",
                height: "20px",
                marginRight: "0.5rem",
                fill: "#fff",
              }}
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <span style={{ color: "#fff" }}>{errorMessage}</span>
          </motion.div>
        )}
        {showSuccessModal && (
          <SuccessModal
            title="Success"
            message={successMessage}
            onClose={() => setShowSuccessModal(false)}
          />
        )}
        {showAlertModal && (
          <AlertModal
            title="Success"
            message={alertMessage}
            onClose={() => setShowAlertModal(false)}
          />
        )}
        {showCancelConfirm && (
          <CancelConfirmModal
            onClose={() => setShowCancelConfirm(false)}
            onSubmit={handleCancelSubmit}
          />
        )}
      </AnimatePresence>

      <div className="Dash-OO-Boas TTTo-POkay">
        <div className="glo-Top-Cards">
          {[
            {
              icon: CalendarDaysIcon,
              label: "Total Interviews",
              value: stats.total,
              filter: "All",
            },
            {
              icon: ClockIcon,
              label: "Scheduled Interviews",
              value: stats.scheduled,
              filter: "scheduled",
            },
            {
              icon: CheckCircleIcon,
              label: "Completed Interviews",
              value: stats.completed,
              filter: "completed",
            },
            {
              icon: TrashIcon,
              label: "Cancelled Interviews",
              value: stats.cancelled,
              filter: "cancelled",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`glo-Top-Card card-${idx + 1}`}
              onClick={() => handleCardClick(item.filter)}
              style={{ cursor: "pointer" }}
            >
              <div className="ffl-TOp">
                <span>
                  <item.icon className="h-6 w-6" />
                </span>
                <p>{item.label}</p>
              </div>
              <h3>
                <CountUp end={item.value} duration={2} />{" "}
              </h3>
            </div>
          ))}
        </div>
      </div>

      <div className="Dash-OO-Boas OOOP-LOa">
        <div className="Dash-OO-Boas-Top">
          <div className="Dash-OO-Boas-Top-1">
            <h3>Scheduled Interviews</h3>
          </div>
          <div className="Dash-OO-Boas-Top-2">
            <div className="genn-Drop-Search">
              <span>
                <MagnifyingGlassIcon className="h-6 w-6" />
              </span>
              <input
                type="text"
                placeholder="Search scheduled interviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isVisible && (
            <motion.div
              className="filter-dropdown"
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
                    {status === "All"
                      ? "All Interviews"
                      : status.charAt(0).toUpperCase() +
                        status.slice(1) +
                        " Interviews"}
                  </option>
                ))}
              </select>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="Dash-OO-Boas Gen-Boxshadow">
        <div className="table-container" style={{ paddingBottom: "12rem" }}>
          <table className="Gen-Sys-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    ref={masterCheckboxRef}
                    onChange={handleSelectAllVisible}
                    checked={
                      paginatedSchedules.length > 0 &&
                      paginatedSchedules.every((item) =>
                        selectedIds.includes(item.id)
                      )
                    }
                    disabled={isLoading}
                  />
                </th>
                <th>Schedule ID</th>
                <th>Candidate</th>
                <th>Job Title</th>
                <th>Interview Date/Time</th>
                <th>Last Modified</th>
                <th>Interview Status</th>
                {/* <th>Application Status</th> */}
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
                    </ul>
                  </td>
                </tr>
              ) : paginatedSchedules.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      fontStyle: "italic",
                    }}
                  >
                    No matching scheduled interviews found
                  </td>
                </tr>
              ) : (
                paginatedSchedules.map((item, index) => {
                  const editable = isEditableForSchedule(item);
                  const canJoin = editable && canJoinForSchedule(item);
                  const isCompletedOrCancelled =
                    isCompletedOrCancelledForSchedule(item);
                  return (
                    <tr key={item.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => handleCheckboxChange(item.id)}
                          disabled={isLoading}
                        />
                      </td>
                      <td>{index + 1}</td>
                      <td>{item.candidate_name}</td>
                      <td>{item.job_requisition_title || "N/A"}</td>
                      <td>
                        {formatInterviewDateTime(
                          item.interview_start_date_time,
                          item.interview_end_date_time,
                          item.timezone
                        )}
                      </td>
                      <td>
                        {DateTime.fromISO(item.updated_at, { zone: "UTC" })
                          .setZone(userTimezone)
                          .toFormat("dd LLL yyyy, h:mm a")}
                      </td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      {/* <td>
                        <StatusBadge
                          status={applicationStatuses[item.application_status]}
                        />
                      </td> */}
                      <td>
                        <div className="actions-cell">
                          <div className="actions-container">
                            <motion.button
                              className="actions-button"
                              onClick={(e) => togglePopup(item.id, e)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              disabled={isLoading}
                            >
                              <FiMoreVertical />
                            </motion.button>
                            <AnimatePresence>
                              {activePopup === item.id && (
                                <motion.div
                                  className="actions-popup"
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.2 }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {getActionButtons(item)}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && filteredSchedules.length > 0 && (
          <div className="pagination-controls">
            <div className="Dash-OO-Boas-foot">
              <div className="Dash-OO-Boas-foot-1">
                <div className="items-per-page">
                  <p>Number of rows:</p>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                    disabled={isLoading}
                    style={{
                      padding: "0.5rem",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                    }}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>
              </div>

              <div className="Dash-OO-Boas-foot-2">
                <button
                  onClick={handleSelectAllVisible}
                  className="mark-all-btn"
                  disabled={isLoading}
                  style={{ padding: "0.5rem 1rem" }}
                >
                  <CheckCircleIcon className="h-6 w-6" />
                  {paginatedSchedules.every((item) =>
                    selectedIds.includes(item.id)
                  )
                    ? "Unmark All"
                    : "Mark All"}
                </button>
                <button
                  onClick={handleDeleteMarked}
                  className="delete-marked-btn"
                  disabled={isLoading}
                  style={{ padding: "0.5rem 1rem" }}
                >
                  <TrashIcon className="h-6 w-6" />
                  Delete Marked
                </button>
                <button
                  onClick={() =>
                    setSortOrder((prev) =>
                      prev === "newest" ? "oldest" : "newest"
                    )
                  }
                  className="sort-toggle-btn"
                  style={{ padding: "0.5rem 1rem" }}
                >
                  Sort by:&nbsp;
                  {sortOrder === "newest" ? "Newest First" : "Oldest First"}
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
                  disabled={currentPage === 1 || isLoading}
                  style={{ padding: "0.5rem" }}
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  className="page-button"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage >= totalPages || isLoading}
                  style={{ padding: "0.5rem" }}
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
            message="You have not selected any scheduled interviews to delete."
            onClose={() => setShowNoSelectionAlert(false)}
          />
        )}
        {showConfirmDelete && (
          <Modal
            title="Confirm Delete"
            message={`Are you sure you want to soft delete ${selectedIds.length} selected schedule(s)? They will be moved to the recycle bin.`}
            onConfirm={confirmDelete}
            onCancel={() => setShowConfirmDelete(false)}
            confirmText="Delete"
            cancelText="Cancel"
          />
        )}
        {showEditModal && selectedSchedule && (
          <EditScheduleModal
            schedule={selectedSchedule}
            onClose={() => setShowEditModal(false)}
            onSave={handleSaveSchedule}
            timezoneChoices={timezoneChoices}
            setShowAlertModal={setShowAlertModal}
            setAlertMessage={setAlertMessage}
            fetchSchedulesData={fetchSchedulesData}
            allSchedules={allSchedules} // Pass all schedules for conflict checking
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScheduleList;
