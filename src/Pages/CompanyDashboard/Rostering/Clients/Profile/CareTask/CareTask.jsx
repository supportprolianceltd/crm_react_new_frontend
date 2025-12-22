import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchClientTaskByClient,
  createClientTask,
  updateClientTask,
  fetchCarePlanByClient,
  fetchClientVisits,
  deleteClientTask,
} from "../../../config/apiConfig";
import LoadingState from "../../../../../../components/LoadingState";

const CareTask = ({ clientData }) => {
  const clientId = clientData?.id;
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [carePlan, setCarePlan] = useState("");
  const [description, setDescription] = useState("");
  const [riskCategory, setRiskCategory] = useState("");
  const [frequency, setFrequency] = useState("");
  const [endTimeType, setEndTimeType] = useState("");
  const [otherRiskText, setOtherRiskText] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [tasks, setTasks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successAlert, setSuccessAlert] = useState({
    show: false,
    title: "",
    updated: false,
  });
  const [editIndex, setEditIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [preferredTiming, setPreferredTiming] = useState("Anytime");
  const [selectedSession, setSelectedSession] = useState("");
  const [pushToVisit, setPushToVisit] = useState(true);
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "" });
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [taskDate, setTaskDate] = useState("");
  const [clientCarePlanId, setClientCarePlanId] = useState(null);
  const [clientAgreedSchedule, setClientAgreedSchedule] = useState({});
  const [allowedVisitDates, setAllowedVisitDates] = useState([]);
  const [showAllDates, setShowAllDates] = useState(false);

  const CARE_PLANS = [
    { value: "Care Essentials", label: "Care Essentials" },
    { value: "Routine", label: "Routine" },
    { value: "Nutrition & Hydration", label: "Nutrition & Hydration" },
    { value: "Medication", label: "Medication" },
  ];

  // dynamic plans derived from fetched care plan sections
  const [availablePlans, setAvailablePlans] = useState([]);
  const [selectedRelatedTable, setSelectedRelatedTable] = useState("");
  const [selectedRelatedId, setSelectedRelatedId] = useState("");

  const filteredPlans = availablePlans.length > 0 ? availablePlans : CARE_PLANS;

  // Reverse mappings for normalization
  const REVERSE_RISK_MAP = {
    "fall risk": "falls",
    "choking risk": "choking",
    medication: "medication",
    mobility: "safety",
    cognitive: "others",
    behavioral: "others",
  };

  const handleDelete = async (taskId, index) => {
    if (!taskId) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await deleteClientTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setSuccessAlert({ show: true, title: "Task deleted", updated: true });
      setTimeout(
        () => setSuccessAlert({ show: false, title: "", updated: false }),
        2200
      );
      // close panel if editing the deleted task
      setOpen(false);
      setEditIndex(null);
    } catch (err) {
      console.error("Delete task error:", err);
      const msg =
        err?.response?.data?.detail || err?.message || "Failed to delete task";
      setErrorAlert({ show: true, message: msg });
    } finally {
      setDeleting(false);
    }
  };

  const REVERSE_FREQ_MAP = {
    Once: "once",
    Daily: "daily",
    Weekly: "weekly",
    Monthly: "monthly",
    Custom: "custom",
  };

  const RELATED_TABLE_MAP = {
    PersonalCare: "Care Essentials",
    PsychologicalInformation: "Psychological Wellbeing",
    RiskAssessment: "Risk Assessments",
    RoutinePreference: "Routine",
    CultureValues: "Social Support",
    MovingHandling: "Moving and Handling",
    MedicalInformation: "Medical Information",
    LegalRequirement: "Legal Requirements",
    // Add more as needed
  };

  const REVERSE_RELATED_TABLE = Object.fromEntries(
    Object.entries(RELATED_TABLE_MAP).map(([k, v]) => [v, k])
  );

  const RISK_LABELS = {
    falls: "Falls",
    choking: "Choking",
    medication: "Medication Safety",
    safety: "Safety",
    others: "Others",
  };

  const FREQ_LABELS = {
    once: "Once",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    custom: "Custom",
  };

  const sessionRanges = {
    morning: "6:00 AM → 11:59 AM",
    afternoon: "12:00 PM → 4:59 PM",
    evening: "5:00 PM → 8:59 PM",
    night: "9:00 PM → 5:59 AM",
  };

  // Normalize API task to local format
  const normalizeTask = (apiTask) => {
    let riskCategory = "";
    let otherRiskText = "";
    if (apiTask.riskCategory && apiTask.riskCategory.length > 0) {
      const firstCat = apiTask.riskCategory[0];
      riskCategory = REVERSE_RISK_MAP[firstCat] || "others";
      if (riskCategory === "others") {
        otherRiskText = firstCat;
      }
    }

    const frequency =
      REVERSE_FREQ_MAP[apiTask.riskFrequency] ||
      apiTask.riskFrequency.toLowerCase();

    const taskStartDate = apiTask.startDate
      ? apiTask.startDate.split("T")[0]
      : "";
    const taskEndDate = apiTask.dueDate ? apiTask.dueDate.split("T")[0] : "";
    const uploadTime = apiTask.createdAt
      ? new Date(apiTask.createdAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "";

    const date = taskStartDate;

    const carePlan =
      RELATED_TABLE_MAP[apiTask.relatedTable] || apiTask.relatedTable || "";

    // Parse session from startDate time (approximate)
    let session = "";
    let parsedStartTime = "";
    let parsedEndTime = "";
    if (apiTask.startDate) {
      const start = new Date(apiTask.startDate);
      const hour = start.getHours();
      if (hour >= 6 && hour < 12) session = "morning";
      else if (hour >= 12 && hour < 17) session = "afternoon";
      else if (hour >= 17 && hour < 21) session = "evening";
      else session = "night";
      parsedStartTime = start.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
    if (apiTask.dueDate) {
      const end = new Date(apiTask.dueDate);
      parsedEndTime = end.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    const isCustom = apiTask.riskFrequency === "Custom";

    return {
      ...apiTask,
      title: apiTask.title,
      description: apiTask.description,
      carePlan,
      riskCategory,
      otherRiskText,
      frequency,
      taskStartDate,
      taskEndDate,
      date,
      uploadTime,
      session,
      startTime: parsedStartTime,
      endTime: parsedEndTime,
      isCustom,
    };
  };

  // Fetch tasks on mount
  useEffect(() => {
    const loadTasks = async () => {
      if (!clientId) return;
      try {
        setIsLoadingTasks(true);
        const apiResponse = await fetchClientTaskByClient(clientId);
        const apiTasks = Array.isArray(apiResponse) ? apiResponse : [];
        const normalizedTasks = Array.isArray(apiTasks)
          ? apiTasks.map(normalizeTask)
          : [];
        setTasks(normalizedTasks);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        setTasks([]);
      } finally {
        setIsLoadingTasks(false);
      }
    };
    loadTasks();
  }, [clientId]);

  // Fetch the client's care plan id so we can attach carePlanId to tasks
  useEffect(() => {
    let mounted = true;
    const loadCarePlan = async () => {
      if (!clientId) return;
      try {
        const data = await fetchCarePlanByClient(clientId);
        // handle different shapes: array, { items }, { results }
        let plans = [];
        if (Array.isArray(data)) plans = data;
        else if (Array.isArray(data.items)) plans = data.items;
        else if (Array.isArray(data.results)) plans = data.results;
        else if (data) plans = [data];

        const plan = plans?.[0] || null;
        if (mounted) {
          setClientCarePlanId(plan?.id || null);

          // Backend shape: careRequirements.schedules = [{ day: 'MONDAY', enabled: true, slots: [{ startTime, endTime }] }, ...]
          const schedules = plan?.careRequirements?.schedules;
          if (Array.isArray(schedules) && schedules.length > 0) {
            const mapped = {};
            schedules.forEach((s) => {
              const key = (s.day || "").toLowerCase();
              mapped[key] = {
                enabled: !!s.enabled,
                lunchStart: s.lunchStart || "",
                lunchEnd: s.lunchEnd || "",
                slots: Array.isArray(s.slots)
                  ? s.slots.map((slot) => ({
                      startTime: slot.startTime,
                      endTime: slot.endTime,
                    }))
                  : [],
              };
            });
            setClientAgreedSchedule(mapped);
          } else {
            // fall back to previous shapes
            const agreed =
              plan?.careRequirements?.agreedCareVisits ||
              plan?.agreedCareVisits ||
              {};
            setClientAgreedSchedule(agreed || {});
          }

          // Build available plan sections from care plan object
          const SECTION_MAP = {
            riskAssessment: {
              label: "Risk Assessments",
              tableKey: "RiskAssessment",
            },
            personalCare: {
              label: "Care Essentials",
              tableKey: "PersonalCare",
            },
            everydayActivityPlan: {
              label: "Everyday Activity Plan",
              tableKey: "EverydayActivityPlan",
            },
            fallsAndMobility: {
              label: "Falls & Mobility",
              tableKey: "FallsAndMobility",
            },
            medicalInfo: {
              label: "Medical Information",
              tableKey: "MedicalInformation",
            },
            psychologicalInfo: {
              label: "Psychological Wellbeing",
              tableKey: "PsychologicalInformation",
            },
            foodHydration: {
              label: "Nutrition & Hydration",
              tableKey: "FoodNutritionHydration",
            },
            routine: { label: "Routine", tableKey: "RoutinePreference" },
            cultureValues: {
              label: "Social Support",
              tableKey: "CultureValues",
            },
            bodyMap: { label: "Body Map", tableKey: "BodyMap" },
            movingHandling: {
              label: "Moving & Handling",
              tableKey: "MovingHandling",
            },
            legalRequirement: {
              label: "Legal Requirements",
              tableKey: "LegalRequirement",
            },
            careRequirements: {
              label: "Care Requirements",
              tableKey: "CareRequirements",
            },
          };

          const plans = [];
          Object.keys(SECTION_MAP).forEach((sectionKey) => {
            const meta = SECTION_MAP[sectionKey];
            const section = plan?.[sectionKey];
            if (section) {
              plans.push({
                value: meta.label,
                label: meta.label,
                tableKey: meta.tableKey,
                sectionId: section.id || "",
              });
            }
          });

          if (plans.length > 0) {
            setAvailablePlans(plans);
            // preselect first if none selected
            if (!selectedRelatedTable) {
              setCarePlan(plans[0].value);
              setSelectedRelatedTable(plans[0].tableKey);
              setSelectedRelatedId(plans[0].sectionId);
            }
          }
        }
      } catch (err) {
        if (mounted) {
          setClientCarePlanId(null);
          setClientAgreedSchedule({});
        }
      }
    };
    loadCarePlan();
    return () => {
      mounted = false;
    };
  }, [clientId]);

  // Fetch actual scheduled visit dates for this client+carePlan so we can show allowed dates
  useEffect(() => {
    let mounted = true;
    const loadVisits = async () => {
      if (!clientId || !clientCarePlanId) return;
      try {
        // fetchClientVisits accepts filters; pass carePlanId as query param
        const data = await fetchClientVisits(clientId, {
          carePlanId: clientCarePlanId,
          pageSize: 200,
        });
        // handle shapes: { items: [...] } or array
        const items = Array.isArray(data)
          ? data
          : data?.items || data?.results || [];
        const dates = (items || [])
          .map((v) => (v.startDate ? v.startDate.split("T")[0] : null))
          .filter(Boolean);
        // unique
        const uniqueDates = [...new Set(dates)];
        if (mounted) setAllowedVisitDates(uniqueDates.sort());
      } catch (err) {
        if (mounted) setAllowedVisitDates([]);
      }
    };
    loadVisits();
    return () => (mounted = false);
  }, [clientId, clientCarePlanId]);

  const dayLabels = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    try {
      // If it's an ISO datetime
      if (timeStr.includes("T")) {
        const d = new Date(timeStr);
        if (isNaN(d.getTime())) return timeStr;
        return d.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }

      // If it's a simple time like "09:00" or "09:00:00"
      if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) {
        const normalized = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
        const d = new Date(`1970-01-01T${normalized}`);
        return d.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }

      return timeStr;
    } catch (e) {
      return timeStr;
    }
  };

  const hhmmToMinutes = (hhmm) => {
    if (!hhmm) return null;
    const m = hhmm.match(/^(\d{2}):(\d{2})/);
    if (!m) return null;
    return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  };

  const slotIsoToMinutes = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    // Use UTC hours/minutes because slots are anchored to 1970-01-01T..Z
    return d.getUTCHours() * 60 + d.getUTCMinutes();
  };

  const isWithinAgreedWindows = (dateStr, startHHMM, endHHMM) => {
    if (!dateStr || !startHHMM) return false;
    const dt = new Date(`${dateStr}T00:00`);
    if (isNaN(dt.getTime())) return false;
    const dowMap = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayKey = dowMap[dt.getDay()];
    const daySchedule = clientAgreedSchedule?.[dayKey];
    if (!daySchedule || !daySchedule.enabled) return false;

    const taskStartMin = hhmmToMinutes(startHHMM);
    const taskEndMin = endHHMM ? hhmmToMinutes(endHHMM) : taskStartMin + 15;
    if (taskStartMin === null || taskEndMin === null) return false;

    // Check if any slot fully contains the task window
    for (const slot of daySchedule.slots || []) {
      const slotStart = slotIsoToMinutes(slot.startTime);
      const slotEnd = slotIsoToMinutes(slot.endTime);
      if (slotStart === null || slotEnd === null) continue;
      if (taskStartMin >= slotStart && taskEndMin <= slotEnd) return true;
    }
    return false;
  };

  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.carePlan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSessionChange = (session) => {
    setSelectedSession(session);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (saving) return; // prevent double-submit
    setSaving(true);

    if (!carePlan) {
      setErrorAlert({ show: true, message: "Please select a Care Plan" });
      setSaving(false);
      return;
    }

    const buildISO = (dateStr, timeStr, defaultHour = "08:00") => {
      if (!dateStr) return null;
      // if time provided, combine, else use default hour
      const timePart = timeStr || defaultHour;
      // dateStr is YYYY-MM-DD
      const iso = new Date(`${dateStr}T${timePart}`);
      return iso.toISOString();
    };

    const apiRisk = (uiRisk) => {
      switch (uiRisk) {
        case "falls":
          return "fall risk";
        case "choking":
          return "choking risk";
        case "medication":
          return "medication";
        case "safety":
          return "mobility";
        case "others":
          return otherRiskText || "others";
        default:
          return uiRisk;
      }
    };

    const FREQ_API_MAP = {
      once: "Once",
      daily: "Day",
      weekly: "Week",
      monthly: "Month",
      custom: "Custom",
    };

    const payload = {
      carePlanId: clientCarePlanId ? String(clientCarePlanId) : "",
      relatedTable:
        selectedRelatedTable || REVERSE_RELATED_TABLE[carePlan] || "",
      relatedId: selectedRelatedId
        ? String(selectedRelatedId)
        : clientId
        ? String(clientId)
        : "",
      title: title || "",
      description: description || "",
      riskFrequency: FREQ_API_MAP[frequency] || frequency || "",
      status: "PENDING",
      riskCategory: riskCategory ? [apiRisk(riskCategory)] : [],
      pushToVisit: !!pushToVisit,
      startDate: null,
      dueDate: null,
      additionalNotes: description || "",
      createdBy: "",
    };

    // Validate required identifiers before sending
    if (!payload.relatedId) {
      setErrorAlert({
        show: true,
        message:
          "Client ID (relatedId) is missing. Please reload and try again.",
      });
      setSaving(false);
      return;
    }

    // Determine start/due ISO datetimes from single date + times
    if (taskDate) {
      payload.startDate = buildISO(taskDate, startTime);
      payload.dueDate = buildISO(taskDate, endTime || startTime || "08:30");
    } else {
      payload.startDate = null;
      payload.dueDate = null;
    }

    // If user requested to push to visit, validate against agreed windows and scheduled visit dates
    if (payload.pushToVisit) {
      if (!taskDate || !startTime) {
        setErrorAlert({
          show: true,
          message:
            "Please select a date and start time before adding to Care Visit.",
        });
        setSaving(false);
        return;
      }

      // If we have concrete scheduled visit dates, require an exact match
      if (Array.isArray(allowedVisitDates) && allowedVisitDates.length > 0) {
        if (!allowedVisitDates.includes(taskDate)) {
          setErrorAlert({
            show: true,
            message: `No matching visit found for ${taskDate}. Please choose one of the allowed visit dates (shown) or create visits via the care plan schedules or admin.`,
          });
          setSaving(false);
          return;
        }
      } else {
        // Fallback: allow if the time falls within the weekly agreed windows
        const ok = isWithinAgreedWindows(
          taskDate,
          startTime,
          endTime || startTime
        );
        if (!ok) {
          setErrorAlert({
            show: true,
            message:
              "Selected date/time is outside the client's agreed visit windows. Please choose a time within the agreed slots or uncheck Add to Care Visit.",
          });
          setSaving(false);
          return;
        }
      }
    }

    const doSave = async () => {
      setErrorAlert({ show: false, message: "" });
      try {
        let res;
        if (editIndex !== null && editIndex >= 0 && tasks[editIndex]?.id) {
          const taskId = tasks[editIndex].id;
          res = await updateClientTask(taskId, payload);
        } else {
          res = await createClientTask(payload);
        }

        if (!res) throw new Error("No response from server");

        // normalize response and update list
        const normalized = normalizeTask(res);
        setTasks((prev) => {
          if (editIndex !== null && editIndex >= 0) {
            const updated = [...prev];
            updated[editIndex] = normalized;
            return updated;
          }
          return [...prev, normalized];
        });

        setSuccessAlert({
          show: true,
          title: normalized.title || "Untitled task",
          updated: editIndex !== null,
        });
        setTimeout(
          () => setSuccessAlert({ show: false, title: "", updated: false }),
          2200
        );

        // reset form
        setOpen(false);
        setTitle("");
        setCarePlan("");
        setDescription("");
        setSearchTerm("");
        setTaskDate("");
        setOtherRiskText("");
        setRiskCategory("");
        setFrequency("");
        setEndTimeType("");
        setPreferredTiming("Anytime");
        setSelectedSession("");
        setStartTime("");
        setEndTime("");
        setEditIndex(null);
      } catch (err) {
        console.error("Save task error:", err);
        const msg =
          err?.response?.data?.detail || err?.message || "Failed to save task";
        setErrorAlert({ show: true, message: msg });
      } finally {
        setSaving(false);
      }
    };

    doSave();
  };

  const handleFrequencyChange = (val) => {
    setFrequency(val);
    if (val !== "custom") {
      setTaskDate("");
      setEndTimeType("");
    }
  };

  const handleEdit = (index) => {
    const t = tasks[index];
    if (!t) return;
    setTitle(t.title || "");
    setCarePlan(t.carePlan || "");
    setDescription(t.description || "");
    setTaskDate(t.taskStartDate || "");
    setRiskCategory(t.riskCategory || "");
    setOtherRiskText(t.otherRiskText || "");
    setFrequency(t.frequency || "");
    setEndTimeType(t.endTimeType || "");
    setSearchTerm("");
    setPreferredTiming(t.session ? "Sessions" : "Anytime");
    setSelectedSession(t.session || "");
    setStartTime(t.startTime || "");
    setEndTime(t.endTime || "");
    setEditIndex(index);
    setTimeout(() => setOpen(true), 0);
  };

  const openNewTask = () => {
    setEditIndex(null);
    setTitle("");
    setCarePlan("");
    setDescription("");
    setSearchTerm("");
    setTaskDate("");
    setRiskCategory("");
    setFrequency("");
    setEndTimeType("");
    setPreferredTiming("Anytime");
    setSelectedSession("");
    setStartTime("");
    setEndTime("");
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const getRiskDisplay = (cat, text) =>
    cat === "others" ? text || "Others" : RISK_LABELS[cat] || cat || "—";

  const getFrequencyDisplay = (t) => {
    if (t.isCustom) {
      const end = t.taskEndDate ? ` - ${t.taskEndDate}` : " - Recurring";
      return `Custom (Start time:${t.taskStartDate}${end})`;
    }
    return FREQ_LABELS[t.frequency] || t.frequency || "—";
  };

  const getDateDisplay = (t) => {
    const period = t.taskEndDate
      ? `${t.taskStartDate} to ${t.taskEndDate}`
      : t.taskStartDate;
    return `${period} - ${t.uploadTime}`;
  };

  const getSessionDisplay = (t) => {
    if (t.session && sessionRanges[t.session]) {
      return `${
        t.session.charAt(0).toUpperCase() + t.session.slice(1)
      } (Start time: ${t.startTime} - End time: ${t.endTime})`;
    }
    return "Anytime";
  };

  const handlePlanSelect = (plan) => {
    setCarePlan(plan.value);
    setSearchTerm("");
    // if plan object contains the tableKey/sectionId (from availablePlans), set them
    if (plan.tableKey) setSelectedRelatedTable(plan.tableKey);
    if (plan.sectionId) setSelectedRelatedId(plan.sectionId);
  };

  const handleTableSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (isLoadingTasks) return <LoadingState text="Loading care tasks..." />;

  return (
    <div className="GenReq-Page Meddi-Ppage">
      <div className="GHGb-MMIn-DDahs-Top KKm-Hheaders">
        <h3>List of Care Tasks</h3>
        <button className="GenFlt-BTn btn-primary-bg" onClick={openNewTask}>
          <PlusIcon /> Add Task
        </button>
      </div>

      <div className="PPOl-COnt">
        <div className="PPOlaj-SSde-TopSSUB">
          <div className="oIK-Search">
            <span>
              <MagnifyingGlassIcon />
            </span>
            <input
              type="text"
              placeholder="Search item"
              value={searchTerm}
              onChange={handleTableSearchChange}
            />
          </div>

          <div className="oIK-Btns">
            <div className="dropdown-container">
              <button>
                Sort by: Frequency
                <ArrowDownIcon />
              </button>
            </div>

            <h3 className="okl-HHHE">
              {filteredTasks.length} Care Tasks added
            </h3>
          </div>
        </div>

        <div
          className="table-container Absoluted-Tbd"
          style={{ overflowX: "auto" }}
        >
          <table className="KLk-TTabsg" style={{ minWidth: "100%" }}>
            <thead>
              <tr>
                <th>Care Plan</th>
                <th>Task</th>
                <th>Risk Category</th>
                <th>Frequency</th>
                <th>Preferred Timing</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr className="monn-Ntga">
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    {tasks.length === 0
                      ? "No care tasks added yet."
                      : "No matching tasks found."}
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t, index) => (
                  <tr
                    key={t.id || index}
                    onClick={() => handleEdit(tasks.indexOf(t))}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      <span className="caare-pllans">{t.carePlan}</span>
                    </td>
                    <td>
                      <div className="ookal-PLla">
                        <h4>{t.title}</h4>
                        <p>{t.description}</p>
                      </div>
                    </td>
                    <td>{getRiskDisplay(t.riskCategory, t.otherRiskText)}</td>
                    <td>{getFrequencyDisplay(t)}</td>
                    <td>{getSessionDisplay(t)}</td>
                    <td>{getDateDisplay(t)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {successAlert.show && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className="global-task-success-alert"
          >
            <div>
              {successAlert.updated
                ? "Successfully updated:"
                : "Successfully added:"}{" "}
              <strong>{successAlert.title}</strong>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {errorAlert.show && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className="global-task-error-alert"
          >
            <div>{errorAlert.message}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="add-task-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
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
                  <h4
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>{editIndex !== null ? "Edit Task" : "Add Task"}</span>
                    {editIndex !== null && (
                      <button
                        type="button"
                        onClick={async () => {
                          // delegate to handler below
                          const idx = editIndex;
                          if (idx === null) return;
                          const t = tasks[idx];
                          if (!t || !t.id) return;
                          // call handler
                          handleDelete(t.id, idx);
                        }}
                        title="Delete task"
                        disabled={deleting}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                          <path d="M10 11v6"></path>
                          <path d="M14 11v6"></path>
                          <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    )}
                  </h4>
                  <p>
                    Define and assign a task to ensure the client’s risks are
                    properly managed and addressed.
                  </p>
                </div>

                <div className="TTas-Boxxs-Body">
                  <form onSubmit={handleSave} className="add-task-form">
                    <div className="TTtata-Inputcc">
                      <label className="carr-labbel">Care Plan *</label>
                      {/* search removed: care plan is selected automatically from care plan fetched */}
                      <div className="TTtata-Selltss-LInBt plan-list-container">
                        {filteredPlans.length > 0
                          ? filteredPlans.map((plan) => (
                              <label
                                key={plan.value}
                                className={`plan-list-item ${
                                  carePlan === plan.value ? "selected" : ""
                                }`}
                                onClick={() => handlePlanSelect(plan)}
                              >
                                <span>{plan.label}</span>
                                {carePlan === plan.value && <span>✓</span>}
                              </label>
                            ))
                          : searchTerm && (
                              <p className="nno-pakjs">
                                No matching plans found.
                              </p>
                            )}
                      </div>
                    </div>

                    <div className="TTtata-Input">
                      <label>Task Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="TTtata-Input">
                      <label>Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                      <p>
                        The carer would see this note in the app each time they
                        complete this task
                      </p>
                    </div>

                    <div className="TTtata-Selltss">
                      <h4>Risk Category</h4>
                      <div className="TTtata-Selltss-LInBt">
                        <label>
                          <input
                            type="radio"
                            name="riskCategory"
                            value="falls"
                            checked={riskCategory === "falls"}
                            onChange={() => setRiskCategory("falls")}
                          />
                          Falls
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="riskCategory"
                            value="choking"
                            checked={riskCategory === "choking"}
                            onChange={() => setRiskCategory("choking")}
                          />
                          Choking
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="riskCategory"
                            value="medication"
                            checked={riskCategory === "medication"}
                            onChange={() => setRiskCategory("medication")}
                          />
                          Medication Safety
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="riskCategory"
                            value="safety"
                            checked={riskCategory === "safety"}
                            onChange={() => setRiskCategory("safety")}
                          />
                          Safety
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="riskCategory"
                            value="others"
                            checked={riskCategory === "others"}
                            onChange={() => setRiskCategory("others")}
                          />
                          Others
                        </label>
                      </div>
                    </div>

                    <AnimatePresence>
                      {riskCategory === "others" && (
                        <motion.div
                          className="TTtata-Input"
                          initial={{ opacity: 0, height: 0, y: -6 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -6 }}
                          transition={{ type: "tween", duration: 0.22 }}
                        >
                          <input
                            type="text"
                            value={otherRiskText}
                            placeholder="Specify"
                            onChange={(e) => setOtherRiskText(e.target.value)}
                            required
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="TTtata-Selltss">
                      <h4>Select Frequency</h4>
                      <div className="TTtata-Selltss-LInBt">
                        <label>
                          <input
                            type="radio"
                            name="frequency"
                            value="once"
                            checked={frequency === "once"}
                            onChange={() => handleFrequencyChange("once")}
                          />
                          Once
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="frequency"
                            value="daily"
                            checked={frequency === "daily"}
                            onChange={() => handleFrequencyChange("daily")}
                          />
                          Daily
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="frequency"
                            value="weekly"
                            checked={frequency === "weekly"}
                            onChange={() => handleFrequencyChange("weekly")}
                          />
                          Weekly
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="frequency"
                            value="monthly"
                            checked={frequency === "monthly"}
                            onChange={() => handleFrequencyChange("monthly")}
                          />
                          Monthly
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="frequency"
                            value="custom"
                            checked={frequency === "custom"}
                            onChange={() => handleFrequencyChange("custom")}
                          />
                          Custom
                        </label>
                      </div>
                    </div>

                    <AnimatePresence>
                      {frequency === "custom" && (
                        <motion.div
                          className="cusTom-Sec"
                          initial={{ opacity: 0, height: 0, y: -6 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -6 }}
                          transition={{ type: "tween", duration: 0.22 }}
                        >
                          <h3>Duration</h3>
                          <div className="cusTom-Sec-Main">
                            <div className="TTtata-Input">
                              <label>Date*</label>
                              <input
                                type="date"
                                value={taskDate}
                                onChange={(e) => setTaskDate(e.target.value)}
                                required
                              />
                            </div>
                            <div className="TTtata-Selltss">
                              <h4>End Time* (select times that suit)</h4>
                              <div className="TTtata-Selltss-LInBt KKjm-OLks">
                                <label>
                                  <input
                                    type="radio"
                                    name="endTimeType"
                                    value="recurring"
                                    checked={endTimeType === "recurring"}
                                    onChange={() => {
                                      setEndTimeType("recurring");
                                    }}
                                  />
                                  Recurring
                                </label>
                                {/* endDate removed per new UX */}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* <div className="TTtata-Selltss OOksl-Pls">
                      <h4>Select Preferred Timing</h4>
                      <div className="Info-TTb-BS-HYH">
                        <div className="TTtata-Input">
                          <select
                            value={preferredTiming}
                            onChange={(e) => setPreferredTiming(e.target.value)}
                          >
                            <option>Anytime</option>
                            <option>Sessions</option>
                          </select>
                        </div>
                      </div>

                      <AnimatePresence>
                        {preferredTiming === "Sessions" && (
                          <motion.div
                            className="Info-TTb-BS-HYH"
                            initial={{ opacity: 0, height: 0, y: -6 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -6 }}
                            transition={{ type: "tween", duration: 0.22 }}
                          >
                            <div className="TTtata-Selltss-LInBt">
                              <label>
                                <input
                                  type="radio"
                                  name="session"
                                  value="morning"
                                  checked={selectedSession === "morning"}
                                  onChange={() =>
                                    handleSessionChange("morning")
                                  }
                                />
                                Morning
                              </label>
                              <label>
                                <input
                                  type="radio"
                                  name="session"
                                  value="afternoon"
                                  checked={selectedSession === "afternoon"}
                                  onChange={() =>
                                    handleSessionChange("afternoon")
                                  }
                                />
                                Afternoon
                              </label>
                              <label>
                                <input
                                  type="radio"
                                  name="session"
                                  value="evening"
                                  checked={selectedSession === "evening"}
                                  onChange={() =>
                                    handleSessionChange("evening")
                                  }
                                />
                                Evening
                              </label>
                              <label>
                                <input
                                  type="radio"
                                  name="session"
                                  value="night"
                                  checked={selectedSession === "night"}
                                  onChange={() => handleSessionChange("night")}
                                />
                                Night
                              </label>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {preferredTiming === "Sessions" && selectedSession && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, y: -6 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -6 }}
                            transition={{ type: "tween", duration: 0.22 }}
                          >
                            <div className="Info-TTb-BS-HYH">
                              <h5 className="RRagbs-Plsa">
                                {selectedSession.charAt(0).toUpperCase() +
                                  selectedSession.slice(1)}
                                : {sessionRanges[selectedSession]}
                              </h5>
                            </div>
                            <div className="ggllak-Ppaths">
                              <div className="Info-TTb-BS-HYH">
                                <h5>Start Time</h5>
                                <div className="TTtata-Input">
                                  <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) =>
                                      setStartTime(e.target.value)
                                    }
                                  />
                                </div>
                              </div>
                              <div className="Info-TTb-BS-HYH">
                                <h5>End Time</h5>
                                <div className="TTtata-Input">
                                  <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div> */}

                    <div className="ggllak-Ppaths">
                      <div className="Info-TTb-BS-HYH ddsaqq">
                        <h5>Date</h5>
                        <div className="TTtata-Input">
                          <input
                            type="date"
                            value={taskDate}
                            onChange={(e) => setTaskDate(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="Info-TTb-BS-HYH ddsaqq">
                        <h5>Start Time</h5>
                        <div className="TTtata-Input">
                          <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="Info-TTb-BS-HYH ddsaqq">
                        <h5>End Time</h5>
                        <div className="TTtata-Input">
                          <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="TTtata-Selltss OOksl-Pls">
                      <h4>Care Visit</h4>

                      <div className="TTtata-Selltss-LInBt">
                        <label>
                          <input
                            type="checkbox"
                            checked={pushToVisit}
                            onChange={(e) => setPushToVisit(e.target.checked)}
                          />
                          Add to Care Visit
                        </label>
                      </div>
                      {pushToVisit && (
                        <div
                          className="agreed-visit-summary"
                          style={{ marginTop: 12 }}
                        >
                          <h5 style={{ marginBottom: 8 }}>
                            Agreed Visit Windows
                          </h5>
                          {Object.keys(dayLabels).map((dayKey) => {
                            const info = clientAgreedSchedule[dayKey];
                            const hasSlots =
                              info &&
                              info.enabled &&
                              Array.isArray(info.slots) &&
                              info.slots.length > 0;
                            return (
                              <div key={dayKey} style={{ marginBottom: 6 }}>
                                <strong
                                  style={{
                                    display: "inline-block",
                                    width: 110,
                                  }}
                                >
                                  {dayLabels[dayKey]}:
                                </strong>
                                {hasSlots ? (
                                  <span>
                                    {info.slots
                                      .map(
                                        (s) =>
                                          `${formatTime(
                                            s.startTime
                                          )} - ${formatTime(s.endTime)}`
                                      )
                                      .join(", ")}
                                  </span>
                                ) : (
                                  <span style={{ color: "#777" }}>
                                    No agreed windows
                                  </span>
                                )}
                              </div>
                            );
                          })}
                          <p
                            style={{
                              marginTop: 8,
                              color: "#666",
                              fontSize: 12,
                            }}
                          >
                            If the selected task time is outside these windows
                            the server will reject adding it to visits.
                          </p>

                          {allowedVisitDates &&
                            allowedVisitDates.length > 0 && (
                              <div style={{ marginTop: 10 }}>
                                <h6 style={{ marginBottom: 6 }}>
                                  Allowed Visit Dates (from care plan)
                                </h6>
                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 6,
                                  }}
                                >
                                  {(showAllDates
                                    ? allowedVisitDates
                                    : allowedVisitDates.slice(0, 12)
                                  ).map((d) => (
                                    <span
                                      key={d}
                                      style={{
                                        padding: "6px 8px",
                                        background: "#f3f4f6",
                                        borderRadius: 6,
                                        fontSize: 12,
                                      }}
                                    >
                                      {d}
                                    </span>
                                  ))}
                                  {allowedVisitDates.length > 12 && (
                                    <button
                                      type="button"
                                      onClick={() => setShowAllDates((s) => !s)}
                                      style={{
                                        padding: "6px 8px",
                                        background: "#fff",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: 6,
                                        fontSize: 12,
                                        cursor: "pointer",
                                      }}
                                    >
                                      {showAllDates
                                        ? "Show less"
                                        : `+${
                                            allowedVisitDates.length - 12
                                          } more`}
                                    </button>
                                  )}
                                </div>
                                <p
                                  style={{
                                    marginTop: 8,
                                    color: "#666",
                                    fontSize: 12,
                                  }}
                                >
                                  Tasks pushed to visits must match one of these
                                  scheduled visit dates. Choose one of the dates
                                  above or create visits via the care plan
                                  schedules or admin.
                                </p>
                              </div>
                            )}
                        </div>
                      )}
                    </div>

                    <div className="add-task-actions">
                      <button
                        type="button"
                        className="close-task"
                        onClick={handleCancel}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="proceed-tast-btn btn-primary-bg"
                        disabled={saving}
                      >
                        {saving ? (
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
                            Saving...
                          </>
                        ) : editIndex !== null ? (
                          "Save changes"
                        ) : (
                          "Save task"
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

export default CareTask;
