import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  ChevronDownIcon,
  ClockIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  fetchPublishedRequisitionsWithShortlisted,
  createSchedule,
  fetchTenantEmailConfig,
} from "./ApiService";
import { WEB_PAGE__URL } from "../../../config";

// import { WEB_PAGE__URL } from "../../config";


import ToastNotification from "../../../components/ToastNotification";

const Schedule = () => {
  const [activeJobId, setActiveJobId] = useState(null);
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [selectedApplicantsInfo, setSelectedApplicantsInfo] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [modalShowTimeDropdown, setModalShowTimeDropdown] = useState(false);
  const [timeSelectionMode, setTimeSelectionMode] = useState("start");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [tempSelectedApplicants, setTempSelectedApplicants] = useState([]);
  const [tempSelectedDate, setTempSelectedDate] = useState(new Date());
  const [tempStartTime, setTempStartTime] = useState(null);
  const [tempEndTime, setTempEndTime] = useState(null);
  const [meetingMode, setMeetingMode] = useState("Virtual");
  const [meetingLink, setMeetingLink] = useState("");
  const [interviewAddress, setInterviewAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [emailTemplate, setEmailTemplate] = useState(null);
  const [emailMessages, setEmailMessages] = useState({});
  const [timezone, setTimezone] = useState("UTC");
  const [conflictingTimes, setConflictingTimes] = useState([]);
  const [hasConflict, setHasConflict] = useState(false);

  const timeDropdownRef = useRef(null);
  const modalTimeDropdownRef = useRef(null);
  const modalContentRef = useRef(null);
  const navigate = useNavigate();

  const timezones = [
    { value: "UTC", label: "UTC" },
    { value: "America/New_York", label: "Eastern Time (US)" },
    { value: "America/Chicago", label: "Central Time (US)" },
    { value: "America/Los_Angeles", label: "Pacific Time (US)" },
    { value: "Europe/London", label: "London" },
    { value: "Asia/Tokyo", label: "Tokyo" },
  ];

  const fetchData = async (retryCount = 3, delay = 1000) => {
    try {
      setIsFetching(true);
      const [jobData, tenantConfig] = await Promise.all([
        fetchPublishedRequisitionsWithShortlisted(),
        fetchTenantEmailConfig(),
      ]);

      // Filter jobData to only include jobs with shortlisted applicants
      const filteredJobData = jobData.filter(
        (item) =>
          item.progressed_applications &&
          item.progressed_applications.length > 0
      );

      // console.log(filteredJobData);

      const transformedJobs = filteredJobData.map((item, index) => {
        const postedDate = new Date(item.job_requisition.created_at);
        const now = new Date();
        const diffTime = Math.abs(now - postedDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const postedText =
          diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;

        // Extract all schedules for conflict checking, excluding completed and cancelled
        const allSchedules =
          item.progressed_applications
            ?.flatMap((app) => app.schedules || [])
            .filter(
              (sched) =>
                sched.status !== "cancelled" && sched.status !== "completed"
            ) || [];

        // Filter out applicants with active schedules for display
        const unscheduledApplicants =
          item?.progressed_applications?.filter((app) => {
            const sched =
              app?.schedules?.find(
                (s) => s.status !== "cancelled" && s.status !== "completed"
              ) || app?.schedules?.[0];
            return !(app?.scheduled && sched);
          }) || [];

        // console.log(unscheduledApplicants);

        return {
          id: index + 1,
          title: item.job_requisition.title || "Untitled Job",
          posted: postedText,
          job_location: item.job_requisition.job_location || "",
          company_address: item.job_requisition.company_address || "",
          job_application_code: item.job_requisition.job_application_code || "",
          unique_link: item.job_requisition.unique_link || "",
          schedules: allSchedules.map((sched) => ({
            id: sched.id,
            startDateTime: new Date(sched.interview_start_date_time),
            endDateTime: new Date(sched.interview_end_date_time),
            meetingMode: sched.meeting_mode,
            meetingLink: sched.meeting_link,
            interviewAddress: sched.interview_address,
            timezone: sched.timezone,
          })),
          applicants: unscheduledApplicants.map((app) => {
            const sched =
              app?.schedules?.find(
                (s) => s.status !== "cancelled" && s.status !== "completed"
              ) || app?.schedules?.[0];

            return {
              id: app.id,
              initials: app.full_name
                ? app.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "NA",
              name: app.full_name || "Unknown Applicant",
              email: app.email || "",
              schedule:
                app?.scheduled && sched
                  ? `${new Date(
                      sched?.interview_start_date_time
                    ).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })} (${new Date(
                      sched?.interview_start_date_time
                    ).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })} - ${new Date(
                      sched?.interview_end_date_time
                    ).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })})`
                  : "",
              hasSchedule: !!app.scheduled && !!sched,
              scheduleId: sched?.id || null,
              startDateTime: sched?.interview_start_date_time,
              endDateTime: sched?.interview_end_date_time,
              meetingMode: sched?.meeting_mode,
              meetingLink: sched?.meeting_link,
              interviewAddress: sched?.interview_address,
              timezone: sched?.timezone,
            };
          }),
        };
      });

      // console.log(transformedJobs);

      setJobs(transformedJobs);
      if (transformedJobs.length > 0) {
        setActiveJobId(transformedJobs[0].id);
      }
      const templateContent =
        tenantConfig.email_templates?.interviewScheduling?.content;
      if (!templateContent) {
        throw new Error(
          "Interview scheduling template not found in TenantConfig"
        );
      }
      setEmailTemplate(templateContent);
      setIsFetching(false);
    } catch (error) {
      if (retryCount > 0) {
        console.warn(`Retrying fetchData (${retryCount} attempts left)...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchData(retryCount - 1, delay * 2);
      }
      setErrorMessage(
        "Failed to load interview scheduling template. Please configure it in Notification Settings."
      );
      setIsFetching(false);
      setTimeout(() => setErrorMessage(""), 5000);
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getConflictingDates = () => {
    const conflictingDates = new Set();
    const allSchedules = jobs.flatMap((job) => job.schedules || []);

    allSchedules.forEach((schedule) => {
      const scheduleDate = new Date(schedule.startDateTime);
      const dateString = scheduleDate.toISOString().split("T")[0];
      conflictingDates.add(dateString);
    });

    return conflictingDates;
  };

  const checkScheduleConflict = (
    selectedDate,
    startTime,
    endTime,
    timezone
  ) => {
    if (!startTime || !selectedDate) return false; // No conflict if no time selected

    const interviewStartDateTime = new Date(selectedDate);
    interviewStartDateTime.setHours(
      startTime.getHours(),
      startTime.getMinutes()
    );
    const interviewEndDateTime = endTime ? new Date(selectedDate) : null;
    if (endTime) {
      interviewEndDateTime.setHours(endTime.getHours(), endTime.getMinutes());
    }

    // Get all schedules for the active job or across all jobs (already filtered to exclude completed/cancelled)
    const allSchedules = jobs.flatMap((job) => job.schedules || []);

    for (const schedule of allSchedules) {
      const existingStart = new Date(schedule.startDateTime);
      const existingEnd = new Date(schedule.endDateTime);

      // Check for overlap
      if (
        (!endTime || !interviewEndDateTime) &&
        interviewStartDateTime.getTime() === existingStart.getTime()
      ) {
        // Single point in time conflict (no end time specified)
        return true;
      }

      if (endTime && interviewEndDateTime) {
        // Check for any overlap between the two time ranges
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

  useEffect(() => {
    const handleTenantConfigUpdate = () => fetchData(1, 500);
    window.addEventListener("tenantConfigUpdated", handleTenantConfigUpdate);
    return () =>
      window.removeEventListener(
        "tenantConfigUpdated",
        handleTenantConfigUpdate
      );
  }, []);

  const activeJob = jobs.find((job) => job.id === activeJobId) || null;
  const currentApplicants = activeJob?.applicants || [];

  // console.log(activeJob?.applicants);

  useEffect(() => {
    if (showModal && tempSelectedApplicants.length > 0 && activeJob) {
      const newMessages = {};
      tempSelectedApplicants.forEach((applicantId) => {
        const applicant = currentApplicants.find(
          (app) => app.id === applicantId
        );
        if (applicant) {
          newMessages[applicantId] = renderEmailTemplate(applicant);
        }
      });
      setEmailMessages(newMessages);
    }
  }, [
    showModal,
    tempSelectedApplicants,
    activeJob,
    timezone,
    tempSelectedDate,
    tempStartTime,
    meetingMode,
    meetingLink,
    interviewAddress,
  ]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        timeDropdownRef.current &&
        !timeDropdownRef.current.contains(event.target)
      ) {
        setShowTimeDropdown(false);
      }
      if (
        modalTimeDropdownRef.current &&
        !modalTimeDropdownRef.current.contains(event.target)
      ) {
        setModalShowTimeDropdown(false);
      }
      if (
        modalContentRef.current &&
        !modalContentRef.current.contains(event.target) &&
        showModal
      ) {
        setShowModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showModal]);

  const handleJobClick = (jobId) => {
    setActiveJobId(jobId);
    setSelectedApplicants([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApplicantClick = (applicant) => {
    setSelectedApplicantsInfo([applicant]);
    setSelectedApplicants((prev) =>
      prev.includes(applicant.id)
        ? prev.filter((id) => id !== applicant.id)
        : [...prev, applicant.id]
    );
  };

  const handleTempApplicantClick = (applicantId) => {
    setTempSelectedApplicants((prev) => {
      const newSelected = prev.includes(applicantId)
        ? prev.filter((id) => id !== applicantId)
        : [...prev, applicantId];
      const newMessages = {};
      newSelected.forEach((id) => {
        const applicant = currentApplicants.find((app) => app.id === id);
        if (applicant && activeJob) {
          newMessages[id] = emailMessages[id] || renderEmailTemplate(applicant);
        }
      });
      setEmailMessages(newMessages);
      return newSelected;
    });
  };

  const formatMonth = (date) =>
    date.toLocaleString("default", { month: "short" });
  const formatDay = (date) => date.getDate();
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

  const handleTimeButtonClick = () => {
    if (startTime && endTime) {
      setStartTime(null);
      setEndTime(null);
      setTimeSelectionMode("start");
    }
    setShowTimeDropdown(!showTimeDropdown);
  };

  const handleModalTimeButtonClick = () => {
    if (tempStartTime && tempEndTime) {
      setTempStartTime(null);
      setTempEndTime(null);
      setTimeSelectionMode("start");
    }
    setModalShowTimeDropdown(!modalShowTimeDropdown);
  };

  const handleDateChange = (date, isModal) => {
    if (isModal) {
      setTempSelectedDate(date);
      setTempStartTime(null);
      setTempEndTime(null);
      setTimeSelectionMode("start");
      setModalShowTimeDropdown(false);
    } else {
      setSelectedDate(date);
      setStartTime(null);
      setEndTime(null);
      setTimeSelectionMode("start");
      setShowTimeDropdown(false);
    }

    // Check for conflicts on the selected date
    const conflicts = timeOptions.filter((time) =>
      checkScheduleConflict(date, time, null, timezone)
    );
    setConflictingTimes(conflicts);
    const hasConflictNow = checkScheduleConflict(
      date,
      isModal ? tempStartTime : startTime,
      isModal ? tempEndTime : endTime,
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

    if (isModal && tempSelectedApplicants.length > 0 && activeJob) {
      const newMessages = {};
      tempSelectedApplicants.forEach((applicantId) => {
        const applicant = currentApplicants.find(
          (app) => app.id === applicantId
        );
        if (applicant) {
          newMessages[applicantId] = renderEmailTemplate(applicant);
        }
      });
      setEmailMessages(newMessages);
    }
  };

  const handleTimeSelect = (time, isModal) => {
    if (isModal) {
      if (timeSelectionMode === "start") {
        if (checkScheduleConflict(tempSelectedDate, time, null, timezone)) {
          setErrorMessage(
            "This start time conflicts with an existing schedule."
          );
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
          setErrorMessage(
            "This time slot conflicts with an existing schedule."
          );
          setTimeout(() => setErrorMessage(""), 5000);
          return;
        }
        setTempEndTime(time);
        setTimeSelectionMode("start");
        setModalShowTimeDropdown(false);
      }
    } else {
      if (timeSelectionMode === "start") {
        if (checkScheduleConflict(selectedDate, time, null, timezone)) {
          setErrorMessage(
            "This start time conflicts with an existing schedule."
          );
          setTimeout(() => setErrorMessage(""), 5000);
          return;
        }
        setStartTime(time);
        setTimeSelectionMode("end");
      } else {
        if (startTime && time <= startTime) {
          setErrorMessage("End time must be after start time.");
          setTimeout(() => setErrorMessage(""), 3000);
          return;
        }
        if (checkScheduleConflict(selectedDate, startTime, time, timezone)) {
          setErrorMessage(
            "This time slot conflicts with an existing schedule."
          );
          setTimeout(() => setErrorMessage(""), 5000);
          return;
        }
        setEndTime(time);
        setTimeSelectionMode("start");
        setShowTimeDropdown(false);
      }
    }
    setHasConflict(false);
    setErrorMessage("");
    if (isModal && tempSelectedApplicants.length > 0 && activeJob) {
      const newMessages = {};
      tempSelectedApplicants.forEach((applicantId) => {
        const applicant = currentApplicants.find(
          (app) => app.id === applicantId
        );
        if (applicant) {
          newMessages[applicantId] = renderEmailTemplate(applicant);
        }
      });
      setEmailMessages(newMessages);
    }
  };

  const renderEmailTemplate = (applicant) => {
    if (!emailTemplate) {
      return "Template not loaded. Please configure in Notification Settings.";
    }
    if (!applicant || !activeJob) {
      return "Applicant or job data not available.";
    }
    const interviewStartDateTime = new Date(tempSelectedDate);
    if (tempStartTime) {
      interviewStartDateTime.setHours(
        tempStartTime.getHours(),
        tempStartTime.getMinutes()
      );
    }
    const interviewEndDateTime = tempEndTime
      ? new Date(tempSelectedDate)
      : null;
    if (tempEndTime) {
      interviewEndDateTime.setHours(
        tempEndTime.getHours(),
        tempEndTime.getMinutes()
      );
    }
    const interviewDate = interviewStartDateTime.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const interviewStartTime = tempStartTime
      ? interviewStartDateTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "TBD";
    const interviewEndTime = tempEndTime
      ? interviewEndDateTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "TBD";
    const location =
      meetingMode === "Virtual"
        ? meetingLink || "TBD"
        : interviewAddress ||
          activeJob.company_address ||
          activeJob.job_location ||
          "TBD";
    const dashboardLink = `${WEB_PAGE__URL}application-dashboard/${
      activeJob.job_application_code
    }/${encodeURIComponent(applicant.email)}/${activeJob.unique_link}`;

    const userData = JSON.parse(localStorage.getItem("user")); // or whatever key you used
    const tenantName = userData?.tenant;


    const placeholders = {
      "\\[Candidate Name\\]": applicant.name,
      "\\[Job Title\\]": activeJob.title,
      "\\[Position\\]": activeJob.title,
      "\\[Company\\]": tenantName,
      "\\[Insert Date\\]": interviewDate,
      "\\[Insert Time\\]": `${interviewStartTime}${
        tempEndTime ? ` - ${interviewEndTime}` : ""
      }`,
      "\\[Meeting Mode\\]":
        meetingMode === "Virtual" ? "Virtual (Zoom)" : "On-site",
      "\\[Zoom / Google Meet / On-site – Insert Address or Link\\]": location,
      "\\[Name\\(s\\) & Position\\(s\\)\\]":
        localStorage.getItem("userName") || "Hiring Team",
      "\\[Your Name\\]": localStorage.getItem("userName") || "Hiring Team",
      "\\[your.email@proliance.com\\]":
        localStorage.getItem("tenantEmail") || "no-reply@proliance.com",
      "\\[Dashboard Link\\]": dashboardLink,
      "\\[Timezone\\]":
        timezones.find((tz) => tz.value === timezone)?.label || timezone,
    };

    let renderedTemplate = emailTemplate;
    for (const [key, value] of Object.entries(placeholders)) {
      renderedTemplate = renderedTemplate.replace(
        new RegExp(key, "g"),
        value || "N/A"
      );
    }
    if (!renderedTemplate.includes(dashboardLink)) {
      renderedTemplate += `\n\nPlease check your application dashboard for further details: ${dashboardLink}`;
    }
    return renderedTemplate;
  };

  const handleMessageChange = (applicantId, value) => {
    setEmailMessages((prev) => ({ ...prev, [applicantId]: value }));
  };

  const applySchedule = () => {
    if (!startTime) {
      setErrorMessage("Please select a start time for the interview.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    if (!emailTemplate) {
      setErrorMessage(
        "Interview scheduling template not loaded. Please configure it in Notification Settings."
      );
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }
    if (!timezone) {
      setErrorMessage("Please select a timezone.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    const applicantsToSchedule =
      selectedApplicants.length > 0
        ? selectedApplicants
        : currentApplicants.map((applicant) => applicant.id);

    setTempSelectedApplicants(applicantsToSchedule);
    setTempSelectedDate(selectedDate);
    setTempStartTime(startTime);
    setTempEndTime(endTime);
    setTimeSelectionMode("start");
    setShowModal(true);
  };

  const handleProceed = async () => {
    await confirmSchedule();
  };

  const confirmSchedule = async () => {
    if (!tempStartTime) {
      setErrorMessage("Please select a start time for the interview.");
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }
    if (tempSelectedApplicants.length === 0) {
      setErrorMessage(
        "Please select at least one candidate for the interview."
      );
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }
    if (meetingMode === "Virtual" && !meetingLink.trim()) {
      setErrorMessage(
        "Please provide a meeting link for the virtual interview."
      );
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }
    if (meetingMode === "Physical" && !interviewAddress.trim()) {
      setErrorMessage("Please provide an address for the physical interview.");
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }
    if (tempSelectedApplicants.some((id) => !emailMessages[id]?.trim())) {
      setErrorMessage(
        "Please provide an email message for each selected candidate."
      );
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }
    if (!timezone) {
      setErrorMessage("Please select a timezone.");
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }
    if (tempEndTime && tempEndTime <= tempStartTime) {
      setErrorMessage("End time must be after start time.");
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }

    // Check for conflicts
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

    setIsLoading(true);
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

      for (const applicantId of tempSelectedApplicants) {
        const applicant = currentApplicants.find(
          (app) => app.id === applicantId
        );
        if (!applicant) continue;
        // Construct dashboardLink for each applicant
        const dashboardLink = `${WEB_PAGE__URL}application-dashboard/${activeJob.job_application_code}/${encodeURIComponent(applicant.email)}/${activeJob.unique_link}`;
        const scheduleData = {
          job_application: applicantId,
          dashboardLink: dashboardLink,
          job_application_id: applicantId,
          job_requisition_title: activeJob.title || "",
          interview_start_date_time: interviewStartDateTime.toISOString(),
          interview_end_date_time: interviewEndDateTime
            ? interviewEndDateTime.toISOString()
            : null,
          meeting_mode: meetingMode,
          meeting_link: meetingMode === "Virtual" ? meetingLink : "",
          interview_address: meetingMode === "Physical" ? interviewAddress : "",
          message: emailMessages[applicantId],
          timezone: timezone,
        };
        await createSchedule(scheduleData);
      }

      setShowModal(false);
      setIsLoading(false);
      setSuccessMessage("Schedules created successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
      navigate("/company/recruitment/schedule-list");
    } catch (error) {
      const errorMessage = error.message || "Failed to create schedules.";
      const suggestion =
        error.suggestion ||
        "Please try again or contact support if the issue persists.";
      setErrorMessage(`${errorMessage} ${suggestion}`);
      setIsLoading(false);
      setTimeout(() => setErrorMessage(""), 8000);
      console.error("Error creating schedules:", error);
    }
  };

  if (isFetching) {
    return (
      <div
        className="Schedule-MMAin-Pais"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "4px solid rgba(114, 38, 255, 0.2)",
            borderTopColor: "#7226FF",
          }}
        />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="Schedule-MMAin-Pais">
        <ToastNotification successMessage={successMessage} />
        <ToastNotification errorMessage={errorMessage} />
        <div className="TTTy-Solka">
          <h3>Interview Scheduler</h3>
        </div>
        <div
          className="empty-state"
          style={{ textAlign: "center", padding: "2rem" }}
        >
          <h4>No job requisitions available.</h4>
          <p>Post a job to start scheduling interviews.</p>
          <div className="oioak-POldj-BTn">
            <button
              onClick={() => navigate("/staff/request/job-requisitions")}
              className="btn-primary-bg"
            >
              Post a Job
            </button>
          </div>
        </div>
      </div>
    );
  }

  // console.log(jobs);

  return (
    <div className="Schedule-MMAin-Pais">
      <ToastNotification successMessage={successMessage} />
      <ToastNotification errorMessage={errorMessage} />

      <div className="TTTy-Solka">
        <h3>Interview Scheduler</h3>
      </div>

      <div className="Schedule-PPao">
        <div className="Schedule-PPao-main">
          <div className="Schedule-PPao-1">
            <div className="Schedule-PPao-1-Boxx">
              <div className="Schedule-PPao-1-Boxx-Top">
                <h3>Posted Jobs</h3>
              </div>
              <div className="Schedule-PPao-1-Boxx-Main Gen-Boxshadow custom-scroll-bar">
                <ul>
                  {jobs.map((job) => (
                    <li
                      key={job.id}
                      className={
                        activeJobId === job.id ? "active-ggarg-Li" : ""
                      }
                      onClick={() => handleJobClick(job.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <div>
                        <h3>{job.title}</h3>
                        <p>{job.applicants?.length} applicants</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="Schedule-PPao-2">
            {activeJob && (
              <>
                <div className="Schedule-PPao-2-header">
                  <h3>
                    {activeJob.title}{" "}
                    <span>
                      <b>Posted:</b> {activeJob.posted}
                    </span>
                  </h3>
                  <p>Date: {formatFullDate(new Date())}</p>
                </div>

                <div className="OOl_AGtg_Sec">
                  <div className="OOl_AGtg_Sec_1">
                    <div className="Schedule-PPao-1-Boxx-Top ooo-Hyha">
                      <h3>
                        Shortlisted Applicants{" "}
                        <span>{currentApplicants.length} total</span>
                      </h3>
                    </div>
                    <div className="OOl_AGtg_Sec_1_main">
                      {currentApplicants.length === 0 ? (
                        <div
                          className="empty-state"
                          style={{ textAlign: "center", padding: "2rem" }}
                        >
                          <h4>No shortlisted applicants.</h4>
                          <p>
                            Shortlist some candidates from the applications to
                            schedule interviews.
                          </p>
                        </div>
                      ) : (
                        <ul>
                          {currentApplicants.map((applicant) => (
                            <li
                              key={`${activeJobId}-${applicant.id}`}
                              className={
                                selectedApplicants.includes(applicant.id)
                                  ? "active-OLI-O"
                                  : ""
                              }
                              onClick={() => handleApplicantClick(applicant)}
                              style={{ cursor: "pointer" }}
                            >
                              <div className="LLia_DV">
                                <div className="LLia_DV_1">
                                  <span>{applicant.initials}</span>
                                </div>
                                <div className="LLia_DV_2">
                                  <div>
                                    <h3>{applicant.name}</h3>
                                    <p>
                                      <span>Schedule:</span>&nbsp;
                                      {applicant.hasSchedule
                                        ? ` ${applicant.schedule}`
                                        : "Not Scheduled"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="OOl_AGtg_Sec_2">
                    <div className="Sheccuc-BosXX Gen-Boxshadow">
                      <div className="Schedule-PPao-1-Boxx-Top ooo-Hyha">
                        <h3>Schedule Interview</h3>
                      </div>
                      <div className="ppol-Btns">
                        <div className="oii-DDDDV">
                          <button onClick={applySchedule}>
                            Apply Schedule
                          </button>
                          <p>
                            Schedule for:
                            <span>
                              {selectedApplicantsInfo.length > 0
                                ? ` ${selectedApplicantsInfo.length} selected`
                                : " all applicants"}
                            </span>
                          </p>
                        </div>
                        <div
                          className="time-select-container"
                          ref={timeDropdownRef}
                        >
                          <button onClick={handleTimeButtonClick}>
                            {timeSelectionMode === "start"
                              ? "Start Time"
                              : "End Time"}
                            <ChevronDownIcon
                              className={`icon ${
                                showTimeDropdown ? "rotate-180" : ""
                              }`}
                              style={{ width: "20px", height: "20px" }}
                            />
                          </button>
                          {showTimeDropdown && (
                            <div className="time-dropdown custom-scroll-bar">
                              {timeOptions.map((time, index) => (
                                <div
                                  key={index}
                                  className={`time-option ${
                                    conflictingTimes.includes(time)
                                      ? "conflicting"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    !conflictingTimes.includes(time) &&
                                    handleTimeSelect(time, false)
                                  }
                                >
                                  {formatTime(time)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="PPOli_Sea">
                        <div className="PPOli_Sea_Card">
                          <div className="PPOli_Sea_Card_1">
                            <span className="DDat-IADf">
                              {formatMonth(selectedDate)}
                            </span>
                            <span>{formatDay(selectedDate)}</span>
                          </div>
                          <div className="PPOli_Sea_Card_2">
                            <div>
                              <h5>{formatFullDate(selectedDate)}</h5>
                              <h6>
                                {formatTime(startTime)} - {formatTime(endTime)}{" "}
                                ({timezone})
                              </h6>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="realTime-Calendar-wrapper">
                        <DatePicker
                          selected={selectedDate}
                          onChange={(date) => handleDateChange(date, false)}
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
                      <div className="GGtg-DDDVa">
                        <h4>Timezone:</h4>
                        <select
                          value={timezone}
                          onChange={(e) => {
                            setTimezone(e.target.value);
                            const newMessages = {};
                            tempSelectedApplicants.forEach((applicantId) => {
                              const applicant = currentApplicants.find(
                                (app) => app.id === applicantId
                              );
                              if (applicant && activeJob) {
                                newMessages[applicantId] =
                                  renderEmailTemplate(applicant);
                              }
                            });
                            setEmailMessages(newMessages);
                          }}
                          className="oujka-Inpuauy"
                        >
                          {timezones.map((tz) => (
                            <option key={tz.value} value={tz.value}>
                              {tz.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Confirmation Modal */}
      <AnimatePresence>
        {showModal && (
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
                maxHeight: "80vh",
                overflowY: "auto",
                maxWidth: "600px",
                width: "100%",
                padding: "20px",
                background: "#fff",
                borderRadius: "8px",
              }}
              role="dialog"
              aria-labelledby="schedule-modal-title"
              aria-describedby="schedule-modal-description"
            >
              <h3 id="schedule-modal-title">Confirm Schedule Details</h3>

              <div className="GGtg-DDDVa">
                <h4>Timezone:</h4>
                <select
                  value={timezone}
                  onChange={(e) => {
                    setTimezone(e.target.value);
                    const newMessages = {};
                    tempSelectedApplicants.forEach((applicantId) => {
                      const applicant = currentApplicants.find(
                        (app) => app.id === applicantId
                      );
                      if (applicant && activeJob) {
                        newMessages[applicantId] =
                          renderEmailTemplate(applicant);
                      }
                    });
                    setEmailMessages(newMessages);
                  }}
                  className="oujka-Inpuauy"
                >
                  {timezones.map((tz) => (
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
                    const newMessages = {};
                    tempSelectedApplicants.forEach((applicantId) => {
                      const applicant = currentApplicants.find(
                        (app) => app.id === applicantId
                      );
                      if (applicant && activeJob) {
                        newMessages[applicantId] =
                          renderEmailTemplate(applicant);
                      }
                    });
                    setEmailMessages(newMessages);
                  }}
                  className="oujka-Inpuauy"
                >
                  <option value="Virtual">Virtual</option>
                  <option value="Physical">Physical</option>
                </select>
              </div>

              {meetingMode === "Virtual" && (
                <div className="GGtg-DDDVa">
                  <label>Meeting Link:</label>
                  <input
                    type="text"
                    value={meetingLink}
                    onChange={(e) => {
                      setMeetingLink(e.target.value);
                      const newMessages = {};
                      tempSelectedApplicants.forEach((applicantId) => {
                        const applicant = currentApplicants.find(
                          (app) => app.id === applicantId
                        );
                        if (applicant && activeJob) {
                          newMessages[applicantId] =
                            renderEmailTemplate(applicant);
                        }
                      });
                      setEmailMessages(newMessages);
                    }}
                    placeholder="Enter meeting link (e.g., Zoom, Teams)"
                    className="oujka-Inpuauy"
                    style={{ width: "100%" }}
                  />
                </div>
              )}

              {meetingMode === "Physical" && (
                <div className="GGtg-DDDVa">
                  <label>Interview Address:</label>
                  <input
                    type="text"
                    value={interviewAddress}
                    onChange={(e) => {
                      setInterviewAddress(e.target.value);
                      const newMessages = {};
                      tempSelectedApplicants.forEach((applicantId) => {
                        const applicant = currentApplicants.find(
                          (app) => app.id === applicantId
                        );
                        if (applicant && activeJob) {
                          newMessages[applicantId] =
                            renderEmailTemplate(applicant);
                        }
                      });
                      setEmailMessages(newMessages);
                    }}
                    placeholder="Enter interview address"
                    className="oujka-Inpuauy"
                    style={{ width: "100%" }}
                  />
                  {activeJob?.company_address || activeJob?.job_location ? (
                    <div
                      className="address-suggestions"
                      style={{ marginTop: "0.5rem" }}
                    >
                      <p>Suggested Addresses:</p>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {activeJob.company_address && (
                          <li
                            style={{
                              cursor: "pointer",
                              padding: "0.5rem",
                              backgroundColor:
                                interviewAddress === activeJob.company_address
                                  ? "#ebe6ff"
                                  : "#f7f5ff",
                              borderRadius: "4px",
                              marginBottom: "0.25rem",
                            }}
                            onClick={() => {
                              setInterviewAddress(activeJob.company_address);
                              const newMessages = {};
                              tempSelectedApplicants.forEach((applicantId) => {
                                const applicant = currentApplicants.find(
                                  (app) => app.id === applicantId
                                );
                                if (applicant && activeJob) {
                                  newMessages[applicantId] =
                                    renderEmailTemplate(applicant);
                                }
                              });
                              setEmailMessages(newMessages);
                            }}
                          >
                            <span style={{ color: "#7226FF" }}>
                              Company Address:
                            </span>{" "}
                            {activeJob.company_address}
                          </li>
                        )}
                        {activeJob.job_location && (
                          <li
                            style={{
                              cursor: "pointer",
                              padding: "0.5rem",
                              backgroundColor:
                                interviewAddress === activeJob.job_location
                                  ? "#ebe6ff"
                                  : "#f7f5ff",
                              borderRadius: "4px",
                            }}
                            onClick={() => {
                              setInterviewAddress(activeJob.job_location);
                              const newMessages = {};
                              tempSelectedApplicants.forEach((applicantId) => {
                                const applicant = currentApplicants.find(
                                  (app) => app.id === applicantId
                                );
                                if (applicant && activeJob) {
                                  newMessages[applicantId] =
                                    renderEmailTemplate(applicant);
                                }
                              });
                              setEmailMessages(newMessages);
                            }}
                          >
                            <span style={{ color: "#7226FF" }}>
                              Job Location:
                            </span>{" "}
                            {activeJob.job_location}
                          </li>
                        )}
                      </ul>
                    </div>
                  ) : (
                    <div
                      className="no-suggestions"
                      style={{ marginTop: "0.5rem" }}
                    >
                      <p
                        style={{ fontSize: "0.9rem", color: "#666", margin: 0 }}
                      >
                        No suggested addresses available. Please enter a custom
                        address.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="GGtg-DDDVa">
                <h4>Messages:</h4>
                {tempSelectedApplicants.length === 0 ? (
                  <p>
                    No candidates selected. Please select at least one
                    candidate.
                  </p>
                ) : (
                  tempSelectedApplicants.map((applicantId) => {
                    const applicant = currentApplicants.find(
                      (app) => app.id === applicantId
                    );
                    if (!applicant) return null;
                    return (
                      <div key={applicantId} style={{ marginBottom: "1rem" }}>
                        <label>
                          {applicant.name} ({applicant.email}):
                        </label>
                        <textarea
                          className="oujka-Inpuauy OIUja-Tettxa"
                          value={emailMessages[applicantId] || ""}
                          onChange={(e) =>
                            handleMessageChange(applicantId, e.target.value)
                          }
                          style={{
                            minHeight: "150px",
                            width: "100%",
                            whiteSpace: "pre-wrap",
                            resize: "vertical",
                          }}
                        />
                      </div>
                    );
                  })
                )}
              </div>

              <div className="GGtg-DDDVa">
                <h4>
                  Select Candidates ({tempSelectedApplicants.length} selected):
                </h4>
                <ul className="UUl-Uuja Gen-Boxshadow">
                  {currentApplicants.map((applicant) => (
                    <li
                      key={`${activeJobId}-${applicant.id}`}
                      className={
                        tempSelectedApplicants.includes(applicant.id)
                          ? "active-OLI-O"
                          : ""
                      }
                      onClick={() => handleTempApplicantClick(applicant.id)}
                      style={{
                        cursor: "pointer",
                        backgroundColor: tempSelectedApplicants.includes(
                          applicant.id
                        )
                          ? "#ebe6ff"
                          : "#f7f5ff",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.5rem",
                      }}
                    >
                      <span>{applicant.name}</span>
                      <span
                        className="oaikks-Ioks"
                        style={{
                          color: tempSelectedApplicants.includes(applicant.id)
                            ? "#7226FF"
                            : "#666",
                        }}
                      >
                        {tempSelectedApplicants.includes(applicant.id)
                          ? "Selected"
                          : "+ Add"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="ouksks-pola">
                <h4>Schedule Details:</h4>
                <p>
                  <span>
                    <CalendarDaysIcon
                      style={{
                        width: "20px",
                        height: "20px",
                        marginRight: "0.5rem",
                        verticalAlign: "middle",
                      }}
                    />
                    Date:
                  </span>{" "}
                  <span style={{ color: hasConflict ? "red" : "inherit" }}>
                    {formatFullDate(tempSelectedDate)}
                  </span>
                </p>
                <p>
                  <span>
                    <ClockIcon
                      style={{
                        width: "20px",
                        height: "20px",
                        marginRight: "0.5rem",
                        verticalAlign: "middle",
                      }}
                    />
                    Time:
                  </span>{" "}
                  <span style={{ color: hasConflict ? "red" : "inherit" }}>
                    {formatTime(tempStartTime)} - {formatTime(tempEndTime)} (
                    {timezone})
                  </span>
                  {hasConflict && (
                    <span style={{ color: "red", marginLeft: "0.5rem" }}>
                      (Conflicts with existing schedule)
                    </span>
                  )}
                </p>
                <div className="ppol-Btns" style={{ marginTop: "1rem" }}>
                  <div
                    className="time-select-container"
                    ref={modalTimeDropdownRef}
                  >
                    <button onClick={handleModalTimeButtonClick}>
                      {timeSelectionMode === "start"
                        ? "Start Time"
                        : "End Time"}
                      <ChevronDownIcon
                        className={`icon ${
                          modalShowTimeDropdown ? "rotate-180" : ""
                        }`}
                        style={{ width: "20px", height: "20px" }}
                      />
                    </button>
                    {modalShowTimeDropdown && (
                      <div className="time-dropdown custom-scroll-bar">
                        {timeOptions.map((time, index) => (
                          <div
                            key={index}
                            className={`time-option ${
                              conflictingTimes.includes(time)
                                ? "conflicting"
                                : ""
                            }`}
                            onClick={() =>
                              !conflictingTimes.includes(time) &&
                              handleTimeSelect(time, true)
                            }
                          >
                            {formatTime(time)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className="realTime-Calendar-wrapper"
                  style={{ marginTop: "1rem" }}
                >
                  <DatePicker
                    selected={tempSelectedDate}
                    onChange={(date) => handleDateChange(date, true)}
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
              </div>

              <div
                className="oioak-POldj-BTn"
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "1rem",
                }}
              >
                <button
                  onClick={() => setShowModal(false)}
                  className="CLCLCjm-BNtn"
                >
                  Close
                </button>
                <button
                  onClick={handleProceed}
                  disabled={isLoading || hasConflict}
                  className="btn-primary-bg"
                >
                  {isLoading ? (
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
                          verticalAlign: "middle",
                        }}
                      />
                      Scheduling...
                    </>
                  ) : (
                    "Proceed"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Schedule;
