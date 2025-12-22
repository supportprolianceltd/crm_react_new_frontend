import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  ArrowLeftIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import TaskImg from "../../Img/TaskImg.png";
import MedicationDetails from "./PlansDetails/MedicationDetails";
import {
  createClientTask,
  fetchClientTaskByClientAndRelatedTable,
} from "../../../../config/apiConfig";

const Medication = ({ carePlanSection, clientData, carePlanId }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [riskCategory, setRiskCategory] = useState("");
  const [frequency, setFrequency] = useState("");
  const [frequencyStartDate, setFrequencyStartDate] = useState("");
  const [frequencyEndDate, setFrequencyEndDate] = useState("");
  const [frequencyEndType, setFrequencyEndType] = useState("");
  const [taskStartDate, setTaskStartDate] = useState("");
  const [taskEndDate, setTaskEndDate] = useState("");
  const [otherRiskText, setOtherRiskText] = useState("");
  const [preferredTiming, setPreferredTiming] = useState("Anytime");
  const [selectedSession, setSelectedSession] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [addToCareVisit, setAddToCareVisit] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [successAlert, setSuccessAlert] = useState({
    show: false,
    title: "",
    updated: false,
  });
  const [viewOpen, setViewOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  // Assume carePlanId and relatedId are available from props
  // e.g., carePlanId = clientData.carePlanId || carePlanSection.carePlan;
  // relatedId = carePlanSection.id;
  const clientId = clientData?.id;
  const relatedId = carePlanSection?.id;
  const relatedTable = "MedicalInformation"; // As specified
  const createdBy = "Tega Okorare"; // Replace with actual user context, e.g., from auth

  // Friendly labels for display in the tasks list
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

  // Mapping for risk categories to payload array
  const RISK_CATEGORY_MAP = {
    falls: ["fall risk"],
    choking: ["choking risk"],
    medication: ["medication"],
    safety: ["mobility"], // Adjust mapping as needed, e.g., to "skin integrity" or add "safety"
    others: ["cognitive"], // Or dynamically based on otherRiskText, e.g., push custom
  };

  // Mapping for frequency to payload riskFrequency
  const FREQUENCY_MAP = {
    once: "Once",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    custom: "Custom",
  };

  // Reverse mappings for normalization
  const REVERSE_RISK_MAP = {
    "fall risk": "falls",
    "choking risk": "choking",
    medication: "medication",
    mobility: "safety",
    cognitive: "others",
    behavioral: "others",
    // Add more as needed
  };

  const REVERSE_FREQ_MAP = {
    Once: "once",
    Daily: "daily",
    Weekly: "weekly",
    Monthly: "monthly",
    Custom: "custom",
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

    const frequency = REVERSE_FREQ_MAP[apiTask.riskFrequency] || "once";

    const taskStartDate = apiTask.startDate
      ? apiTask.startDate.split("T")[0]
      : "";
    const taskEndDate = apiTask.dueDate ? apiTask.dueDate.split("T")[0] : "";

    return {
      ...apiTask,
      riskCategory,
      otherRiskText,
      frequency,
      taskStartDate,
      taskEndDate,
      frequencyStartDate: "",
      frequencyEndDate: "",
      frequencyEndType: "",
      session: "",
      startTime: "",
      endTime: "",
      addToCareVisit: false,
    };
  };

  // Fetch tasks on mount
  useEffect(() => {
    const loadTasks = async () => {
      if (!clientId || !relatedTable) return;
      try {
        const apiResponse = await fetchClientTaskByClientAndRelatedTable(
          clientId,
          relatedTable
        );
        const apiTasks = apiResponse?.tasks || [];
        const normalizedTasks = Array.isArray(apiTasks)
          ? apiTasks.map(normalizeTask)
          : [];
        setTasks(normalizedTasks);
        console.log(normalizedTasks);
      } catch (error) {
        setTasks([]);
      }
    };
    loadTasks();
  }, [clientId, relatedTable]);

  const handleSessionChange = (session) => {
    setSelectedSession(session);
  };

  // Helper to convert date string to ISO with time
  const toISODateTime = (dateStr, timeStr = null) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-"); // YYYY-MM-DD format
    const date = new Date(
      `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    );
    if (timeStr) {
      const [hours, minutes] = timeStr.split(":");
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
      date.setHours(9, 0, 0, 0); // Default to 9AM if no time
    }
    return date.toISOString();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title) {
      alert("Please enter a Task Title");
      return;
    }
    setSaving(true);
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const saveFreqStart =
      frequency === "custom" ? frequencyStartDate : currentDate;
    const saveFreqEnd = frequency === "custom" ? frequencyEndDate : "";
    const saveFreqEndType = frequency === "custom" ? frequencyEndType : "";
    const saveTaskStart = taskStartDate || currentDate;
    const saveTaskEnd = taskEndDate || "";

    // Map to payload
    const riskCategories = RISK_CATEGORY_MAP[riskCategory] || [];
    if (riskCategory === "others" && otherRiskText) {
      riskCategories.push(
        otherRiskText.toLowerCase().includes("cognitive")
          ? "cognitive"
          : "behavioral"
      ); // Example dynamic mapping; adjust as needed
    }
    const startDateISO = toISODateTime(
      saveTaskStart,
      preferredTiming === "Sessions" && selectedSession ? startTime : null
    );
    const dueDateISO = saveTaskEnd
      ? toISODateTime(
          saveTaskEnd,
          preferredTiming === "Sessions" && selectedSession ? endTime : null
        )
      : startDateISO; // Default due to start if no end
    const taskPayload = {
      carePlanId,
      relatedTable,
      relatedId,
      title,
      description,
      riskFrequency: FREQUENCY_MAP[frequency] || frequency,
      status: "PENDING",
      riskCategory: riskCategories,
      startDate: startDateISO,
      dueDate: dueDateISO,
      additionalNotes: description, // Or separate if needed
      createdBy,
    };

    try {
      const response = await createClientTask(taskPayload);
      // Refetch to sync with server
      const apiResponse = await fetchClientTaskByClientAndRelatedTable(
        clientId,
        relatedTable
      );
      const apiTasks = apiResponse?.tasks || [];
      const normalizedTasks = Array.isArray(apiTasks)
        ? apiTasks.map(normalizeTask)
        : [];
      setTasks(normalizedTasks);

      setOpen(false);
      setTitle("");
      setDescription("");
      setFrequencyStartDate("");
      setFrequencyEndDate("");
      setFrequencyEndType("");
      setTaskStartDate("");
      setTaskEndDate("");
      setOtherRiskText("");
      setRiskCategory("");
      setFrequency("");
      setPreferredTiming("Anytime");
      setSelectedSession("");
      setStartTime("");
      setEndTime("");
      setAddToCareVisit(false);
      const wasUpdate = editIndex !== null && editIndex >= 0;
      setEditIndex(null);
      setSuccessAlert({
        show: true,
        title: title || "Untitled task",
        updated: !!wasUpdate,
      });
      setTimeout(
        () => setSuccessAlert({ show: false, title: "", updated: false }),
        2200
      );
    } catch (error) {
      alert("Failed to save task. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleFrequencyChange = (val) => {
    setFrequency(val);
    if (val !== "custom") {
      setFrequencyStartDate("");
      setFrequencyEndDate("");
      setFrequencyEndType("");
    }
  };

  const handleEdit = (index) => {
    const t = tasks[index];
    if (!t) return;
    setTitle(t.title || "");
    setDescription(t.description || "");
    setTaskStartDate(t.taskStartDate || "");
    setTaskEndDate(t.taskEndDate || "");
    setFrequencyStartDate(t.frequencyStartDate || "");
    setFrequencyEndDate(t.frequencyEndDate || "");
    setFrequencyEndType(t.frequencyEndType || "");
    setRiskCategory(t.riskCategory || "");
    setOtherRiskText(t.otherRiskText || "");
    setFrequency(t.frequency || "");
    setPreferredTiming(t.session ? "Sessions" : "Anytime");
    setSelectedSession(t.session || "");
    setStartTime(t.startTime || "");
    setEndTime(t.endTime || "");
    setAddToCareVisit(t.addToCareVisit || false);
    setEditIndex(index);
    setViewOpen(false);
    setTimeout(() => setOpen(true), 0);
  };

  const navigate = useNavigate();

  const goBack = () => navigate(-1);

  const openNewTask = () => {
    setEditIndex(null);
    setTitle("");
    setDescription("");
    setFrequencyStartDate("");
    setFrequencyEndDate("");
    setFrequencyEndType("");
    setTaskStartDate("");
    setTaskEndDate("");
    setRiskCategory("");
    setFrequency("");
    setPreferredTiming("Anytime");
    setSelectedSession("");
    setStartTime("");
    setEndTime("");
    setAddToCareVisit(false);
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
    if (editIndex !== null) {
      setViewOpen(true);
    }
  };

  return (
    <div className="DDD-PPLso-Sec">
      <div className="DDD-PPLso-Sec-Main">
        <div className="DDD-PPLso-1">
          <div className="DDD-PPLso-1-Top">
            <span
              role="button"
              tabIndex={0}
              onClick={goBack}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") goBack();
              }}
            >
              <ArrowLeftIcon /> Go Back
            </span>
          </div>
          <MedicationDetails
            carePlanSection={carePlanSection}
            clientData={clientData}
          />
        </div>

        <div className="DDD-PPLso-2">
          <div className="Tassk-Sug-Box">
            <div className="Tassk-Sug-BBans">
              <img src={TaskImg} alt="task" />
            </div>
            <div className="Tassk-Sug-Dlt">
              <p>
                {tasks.length === 0
                  ? "No task have been added yet!"
                  : tasks.length === 1
                  ? "A task is added — click to view the task"
                  : `There are ${tasks.length} task${
                      tasks.length > 1 ? "s" : ""
                    } added`}
              </p>
              <div className="Tassk-Sug-Dlt-Btn">
                {tasks.length === 0 ? (
                  <button className="btn-primary-bg no-task" type="button">
                    <ExclamationTriangleIcon /> No task
                  </button>
                ) : (
                  <button
                    className="btn-primary-bg view-task"
                    type="button"
                    onClick={() => setViewOpen(true)}
                  >
                    <BriefcaseIcon /> View task&nbsp;
                    {tasks.length > 1 ? "s" : ""}
                  </button>
                )}
                <span className="add-task-trigger" onClick={openNewTask}>
                  <PlusIcon />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global success alert */}
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

      {/* Tasks list modal */}
      <AnimatePresence>
        {viewOpen && (
          <>
            <motion.div
              className="add-task-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewOpen(false)}
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
                  <h4>Tasks List</h4>
                  <p>All added tasks are shown below. This is read-only.</p>
                </div>
                <div className="TTas-Boxxs-Body">
                  <div style={{ display: "grid", gap: 12 }}>
                    {tasks.length === 0 ? (
                      <div style={{ padding: 16 }}>No tasks yet.</div>
                    ) : (
                      tasks.map((t, i) => (
                        <div key={i} className="task-list-item">
                          <div className="task-list-item-Top">
                            <h3>{t.title || "Untitled"}</h3>
                            <div className="task-list-item-Top-Btn">
                              <button
                                type="button"
                                className="btn-edit-task btn-primary-bg"
                                onClick={() => handleEdit(i)}
                              >
                                <PencilIcon /> Edit
                              </button>
                            </div>
                          </div>
                          <div className="task-list-item-Body">
                            {t.description && <p>{t.description}</p>}
                          </div>
                          <div className="task-list-item-LSts">
                            <div className="task-list-item-LSts-Main">
                              <h4>Risk Category</h4>
                              <p>
                                {t.riskCategory === "others"
                                  ? t.otherRiskText || "Others"
                                  : RISK_LABELS[t.riskCategory] ||
                                    t.riskCategory ||
                                    "—"}
                              </p>
                            </div>
                            <div className="task-list-item-LSts-Main">
                              <h4>Frequency</h4>
                              <p>
                                {t.frequency === "custom"
                                  ? `Custom (Start time:${
                                      t.frequencyStartDate
                                    } - ${
                                      t.frequencyEndDate ||
                                      (t.frequencyEndType === "recurring"
                                        ? "Recurring"
                                        : "—")
                                    })`
                                  : FREQ_LABELS[t.frequency] ||
                                    t.frequency ||
                                    "—"}
                              </p>
                            </div>
                            {t.taskStartDate && (
                              <div className="task-list-item-LSts-Main">
                                <h4>Task Period</h4>
                                <p>
                                  {t.taskStartDate}{" "}
                                  {t.taskEndDate ? `to ${t.taskEndDate}` : ""}
                                </p>
                              </div>
                            )}
                            {t.session && (
                              <div className="task-list-item-LSts-Main">
                                <h4>Preferred Timing</h4>
                                <p>{`${
                                  t.session.charAt(0).toUpperCase() +
                                  t.session.slice(1)
                                } (Start time: ${t.startTime} - End time: ${
                                  t.endTime
                                })`}</p>
                              </div>
                            )}
                            {t.addToCareVisit && (
                              <div className="task-list-item-LSts-Main">
                                <h4>Care Visit</h4>
                                <p>Added to Care Visit</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="add-task-actions" style={{ marginTop: 14 }}>
                    <button
                      type="button"
                      className="close-task"
                      onClick={() => setViewOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add/Edit Task Modal */}
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
                  <h4>{editIndex !== null ? "Edit Task" : "Add Task"}</h4>
                  <p>
                    Define and assign a task to ensure the client’s risks are
                    properly managed and addressed.
                  </p>
                </div>
                <div className="TTas-Boxxs-Body">
                  <form onSubmit={handleSave} className="add-task-form">
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
                              <label>Start Date*</label>
                              <input
                                type="date"
                                value={frequencyStartDate}
                                onChange={(e) =>
                                  setFrequencyStartDate(e.target.value)
                                }
                                required
                              />
                            </div>
                            <div className="TTtata-Selltss">
                              <h4>End Date* (select dates that suit)</h4>
                              <div className="TTtata-Selltss-LInBt KKjm-OLks">
                                <label>
                                  <input
                                    type="radio"
                                    name="endTimeType"
                                    value="recurring"
                                    checked={frequencyEndType === "recurring"}
                                    onChange={() => {
                                      setFrequencyEndType("recurring");
                                      setFrequencyEndDate("");
                                    }}
                                  />
                                  Recurring
                                </label>
                                <input
                                  type="date"
                                  value={frequencyEndDate}
                                  onChange={(e) => {
                                    setFrequencyEndDate(e.target.value);
                                    setFrequencyEndType("");
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="TTtata-Selltss OOksl-Pls">
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
                    </div>

                    <div className="TTtata-Selltss OOksl-Pls">
                      <h4>Care Visit</h4>

                      <div className="TTtata-Selltss-LInBt">
                        <label>
                          <input
                            type="checkbox"
                            checked={addToCareVisit}
                            onChange={(e) =>
                              setAddToCareVisit(e.target.checked)
                            }
                          />
                          Add to Care Visit
                        </label>
                      </div>
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

export default Medication;
