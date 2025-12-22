import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, InformationCircleIcon, ClipboardDocumentListIcon, PencilIcon } from '@heroicons/react/24/outline';
import TaskList from './TaskList';
import Info from './Info';

const ModalTask = ({ tasks = [] }) => {
  // Map relatedTable to friendly labels
  const labelMap = {
    'PersonalCare': 'Care Essentials',
    'Medication': 'Medication',
    'EverydayActivityPlan': 'Everyday Activities',
    'FallsAndMobility': 'Falls & Mobility',
    'MedicalInformation': 'Medical Information',
    'PsychologicalInformation': 'Psychological Wellbeing',
    'FoodNutritionHydration': 'Nutrition & Hydration',
    'RoutinePreference': 'Routine Preferences',
    'CultureValues': 'Culture & Values',
    'BodyMap': 'Body Map',
    'MovingHandling': 'Moving & Handling',
    'LegalRequirement': 'Legal Requirements',
    'CareRequirements': 'Care Requirements',
    'RiskAssessment': 'Risk Assessment',
  };

  // Get unique categories from tasks
  const categories = [...new Set(tasks.map(t => t.relatedTable))];
  const checkboxes = categories.map(cat => labelMap[cat] || cat);

  const [activeLabel, setActiveLabel] = useState(checkboxes[0] || '');
  const [activeButton, setActiveButton] = useState('Task'); // 'Task' or 'Info'

  // Group tasks by category (memoized so it doesn't recreate every render)
  const tasksMap = useMemo(() => {
    return categories.reduce((acc, cat) => {
      const label = labelMap[cat] || cat;
      acc[label] = tasks.filter((t) => t.relatedTable === cat);
      return acc;
    }, {});
  }, [tasks]);

  const [tasksState, setTasksState] = useState(tasksMap[activeLabel] || []);

  // Add Task states
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
  const [saving, setSaving] = useState(false);
  const [successAlert, setSuccessAlert] = useState({
    show: false,
    title: "",
    updated: false,
  });
  const [editIndex, setEditIndex] = useState(null);

  // Map activeLabel to relatedTable (for reference, though static now)
  const getRelatedTable = (label) => {
    const tableMap = {
      'Care Essentials': 'PersonalCare',
      'Medication': 'Medication',
      // Add mappings for others
    };
    return tableMap[label] || 'PersonalCare';
  };

  const relatedTable = getRelatedTable(activeLabel);

  // Friendly labels
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

  // Transform API task to TaskList format
  const transformTask = (apiTask) => {
    return {
      id: apiTask.id,
      title: apiTask.title,
      description: apiTask.description,
      risk: apiTask.riskCategory,
      session: 'Anytime', // Default, can be enhanced
      time: '', // Can format startDate if needed
      frequency: apiTask.riskFrequency || 'Once',
      status: apiTask.status,
      from: new Date(apiTask.startDate).toLocaleDateString(),
      until: new Date(apiTask.dueDate).toLocaleDateString(),
      details: apiTask.description,
      notes: apiTask.additionalNotes ? { reason: 'Note', comments: apiTask.additionalNotes } : null,
    };
  };

  // Load tasks when activeLabel changes
  useEffect(() => {
    const currentTasks = (tasksMap[activeLabel] || []).map(transformTask);
    setTasksState(currentTasks);
  }, [activeLabel, tasksMap]);

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
  };

  const handleCheckboxChange = (label) => {
    setActiveLabel(label);
  };

  // Task handlers
  const handleSessionChange = (session) => {
    setSelectedSession(session);
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
    const t = tasksState[index];
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
    setPreferredTiming(t.selectedSession ? "Sessions" : "Anytime");
    setSelectedSession(t.selectedSession || "");
    setStartTime(t.startTime || "");
    setEndTime(t.endTime || "");
    setAddToCareVisit(t.addToCareVisit || false);
    setEditIndex(index);
    setOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title) {
      alert("Please enter a Task Title");
      return;
    }
    setSaving(true);
    const currentDate = new Date().toISOString().split("T")[0];
    const saveTaskStart = taskStartDate || currentDate;
    const saveTaskEnd = taskEndDate || "";

    const newTask = {
      id: editIndex !== null ? tasks[editIndex].id : Date.now(),
      title,
      description,
      riskCategory,
      otherRiskText: riskCategory === "others" ? otherRiskText : "",
      frequency,
      frequencyStartDate: frequency === "custom" ? frequencyStartDate : "",
      frequencyEndDate: frequency === "custom" ? frequencyEndDate : "",
      frequencyEndType: frequency === "custom" ? frequencyEndType : "",
      taskStartDate: saveTaskStart,
      taskEndDate: saveTaskEnd,
      preferredTiming,
      selectedSession,
      startTime: preferredTiming === "Sessions" ? startTime : "",
      endTime: preferredTiming === "Sessions" ? endTime : "",
      addToCareVisit,
      status: "PENDING",
    };

    let updatedTasks;
    if (editIndex !== null) {
      updatedTasks = [...tasksState];
      updatedTasks[editIndex] = { ...updatedTasks[editIndex], ...newTask };
    } else {
      updatedTasks = [...tasksState, newTask];
    }

    setTasksMap((prev) => ({ ...prev, [activeLabel]: updatedTasks }));
    setTasksState(updatedTasks);

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
    const wasUpdate = editIndex !== null;
    setEditIndex(null);
    setSuccessAlert({
      show: true,
      title: title || "Untitled task",
      updated: wasUpdate,
    });
    setTimeout(
      () => setSuccessAlert({ show: false, title: "", updated: false }),
      2200
    );
    setSaving(false);
  };

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
    setEditIndex(null);
  };

  // Framer Motion animation variants
  const contentVariants = {
    hidden: { opacity: 0, x: -5 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 5 },
  };

  const pendingCount = tasksState.filter((t) => t.status === "PENDING").length;

  return (
    <div className='Moduls-SeCC'>
      {/* Left Sidebar */}
      <div className='Moduls-LefNV custom-scroll-bar'>
        {checkboxes.map((label) => (
          <label key={label}>
            <span className={activeLabel === label ? 'active' : ''}>
              <input
                type='checkbox'
                checked={activeLabel === label}
                onChange={() => handleCheckboxChange(label)}
              />
              {label}
            </span>
          </label>
        ))}
      </div>

      {/* Main Content */}
      <div className='Moduls-Mains'>
        <div className='HYhss-Topa'>
          <h3>{activeLabel}</h3>
          <div className='Oujss'>
            <p>Total task: {tasks.length}</p>
            <div className="TGas-Dc">
              <button onClick={openNewTask}>
                <PlusIcon /> Add Task
              </button>
            </div>
          </div>
        </div>

        <div className='Moduls-Top Hyja-PPols'>
          <div className='Moduls-Top-Btns'>
            <button
              className={activeButton === 'Task' ? 'active' : ''}
              onClick={() => handleButtonClick('Task')}
            >
              <span>
                <ClipboardDocumentListIcon className='w-5 h-5' />
                Task
              </span>
              <b>{tasksState.length > 0 ? `${pendingCount}/${tasksState.length}` : '0/0'}</b>
            </button>

            <button
              className={activeButton === 'Info' ? 'active' : ''}
              onClick={() => handleButtonClick('Info')}
            >
              <span>
                <InformationCircleIcon className='w-5 h-5' />
                Info
              </span>
            </button>
          </div>

          {activeButton === 'Info' && (
            <a href='#' className='Eddis-Ingp'><PencilIcon /> Edit Info</a>
          )}
        </div>

        {/* Animated Section */}
        <div className='Moduls-Content'>
          <AnimatePresence mode='wait'>
            {activeButton === 'Task' && (
              <motion.div
                key='task'
                variants={contentVariants}
                initial='hidden'
                animate='visible'
                exit='exit'
                transition={{ duration: 0.3 }}
              >
                <TaskList tasks={tasksState} onEdit={handleEdit} />
              </motion.div>
            )}

            {activeButton === 'Info' && (
              <motion.div
                key='info'
                variants={contentVariants}
                initial='hidden'
                animate='visible'
                exit='exit'
                transition={{ duration: 0.3 }}
              >
                <Info />
              </motion.div>
            )}
          </AnimatePresence>
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

      {/* Add/Edit Task Modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="add-task-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
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

      {/* Missing sessionRanges definition */}
      {/* Add this const outside return if not defined */}
    </div>
  );
};

export default ModalTask;