import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftIcon, PencilIcon } from "@heroicons/react/24/outline";
import { apiClient } from "../../../../config.js";

const TaskList = ({ tasks: propTasks = [], onTaskUpdate, onTasksChange }) => {
  const [selectedTask, setSelectedTask] = useState(null);

  // Note modal states (adapted from CareLog flag modal)
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [noteReason, setNoteReason] = useState("Completion Note");
  const [noteComments, setNoteComments] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [successAlert, setSuccessAlert] = useState({
    show: false,
    title: "",
    updated: false,
  });

  const handleTaskClick = async (task) => {
    try {
      const response = await apiClient.get(`/api/rostering/tasks/${task.id}`);
      setSelectedTask(response.data);
    } catch (error) {
      console.error("Error fetching task details:", error);
      // Fallback to local data
      setSelectedTask(task);
    }
  };

  const handleBack = () => {
    setSelectedTask(null);
  };

  const handleEditNote = () => {
    if (!selectedTask?.notes) return;
    setIsEditing(true);
    setNoteReason(selectedTask.notes.reason);
    setNoteComments(selectedTask.notes.comments || "");
    setShowNoteModal(true);
  };

  // Modified to show note modal before completing
  const handleCompleteToggle = (id) => {
    // Only show modal if task is Pending or Ongoing (not already Completed)
    const task = propTasks.find(t => t.id === id);
    if (task && task.status?.toUpperCase() !== "COMPLETED") {
      setShowNoteModal(true);
      // Store the task ID temporarily for completion after modal
      setSelectedTask(prev => prev ? { ...prev, tempIdForCompletion: id } : { tempIdForCompletion: id });
      // Reset for new note
      setIsEditing(false);
      setNoteReason("Completion Note");
      setNoteComments("");
    }
    // If already completed, do nothing
  };

  // Handle note submission (adapted from CareLog)
  const handleSubmitNote = async (e) => {
    e.preventDefault();
    if (!noteReason) {
      alert("Please select a Reason for note");
      return;
    }
    setSavingNote(true);
    const taskId = selectedTask?.tempIdForCompletion || selectedTask?.id;
    const isCompleting = !!selectedTask?.tempIdForCompletion;

    try {
      if (isCompleting) {
        // Make API call to update task status and notes
        const response = await apiClient.patch(`/api/rostering/tasks/${taskId}`, {
          status: "COMPLETED",
          additionalNotes: noteComments || "",
        });
      }

      const newNote = {
        id: Date.now(), // Simple ID generation
        reason: noteReason,
        comments: noteComments,
        date: new Date().toLocaleDateString('en-GB'), // e.g., 13/11/2025
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), // e.g., 14:30
      };

      // Set single note for the task
      const updatedTasks = propTasks.map((task) =>
        task.id === taskId
          ? { ...task, notes: newNote, ...(isCompleting ? { status: "COMPLETED" } : {}) }
          : task
      );
      onTasksChange(updatedTasks);

      // Update selectedTask if it's the current one
      setSelectedTask((prev) =>
        prev && prev.id === taskId
          ? { ...prev, notes: newNote, ...(isCompleting ? { status: "COMPLETED" } : {}) }
          : prev
      );

      // Notify parent of the update
      if (onTaskUpdate) {
        const updatedTask = updatedTasks.find(t => t.id === taskId);
        if (updatedTask) {
          onTaskUpdate(taskId, updatedTask);
        }
      }

      setShowNoteModal(false);
      setIsEditing(false);
      // Reset form
      setNoteReason("Completion Note");
      setNoteComments("");
      // Clear temp ID
      setSelectedTask((prev) => ({ ...prev, tempIdForCompletion: null }));
      setSavingNote(false);
      setSuccessAlert({
        show: true,
        title: selectedTask?.title || "Task",
        updated: isCompleting,
      });
      setTimeout(
        () => setSuccessAlert({ show: false, title: "", updated: false }),
        2200
      );
    } catch (error) {
      console.error("Error submitting note:", error);
      setSavingNote(false);
      if (error.response?.data?.error?.includes("Cannot start task before the related visit has been clocked in")) {
        alert("Cannot complete task: The related visit must be clocked in first.");
      } else {
        alert("Failed to submit note. Please try again.");
      }
    }
  };

  const handleCancelNote = () => {
    setShowNoteModal(false);
    setIsEditing(false);
    // Reset form
    setNoteReason("Completion Note");
    setNoteComments("");
    // Reset temp ID without completing
    setSelectedTask(prev => prev ? { ...prev, tempIdForCompletion: null } : prev);
  };

  // Framer Motion animation variants
  const contentVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 10, transition: { duration: 0.2 } },
  };

  return (
    <div className="Ggen-BDa custom-scroll-bar">
      <AnimatePresence mode="wait">
        {!selectedTask ? (
          <motion.div
            key="task-list"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="LLsi-Header">
              <span></span>
              <span>Task</span>
              <span>Risk Category</span>
              <span>Sessions</span>
              <span>Frequency</span>
              <span>Status</span>
            </div>

            <ul className="LLsi-Ul">
              {propTasks.map((task) => (
                <li key={task.id} onClick={() => handleTaskClick(task)}>
                  <span>
                    <input
                      type="checkbox"
                      checked={task.status?.toUpperCase() === "COMPLETED"}
                      readOnly
                    />
                  </span>
                  <span>{task.title}</span>
                  <span>
                    <span>{Array.isArray(task.riskCategory) ? task.riskCategory.join(', ') : task.riskCategory}</span>
                  </span>
                  <span>
                    {task.session} <b>{task.time}</b>
                  </span>
                  <span>{task.frequency}</span>
                  <span>{task.status}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : (
          <motion.div
            key="task-details"
            className="HyaTask-Details"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <button className="OO-BackBtn" onClick={handleBack}>
              <ArrowLeftIcon /> Back
            </button>

            <div className="Gthstg-Top">
              <h2>{selectedTask.title}</h2>
              <label>
                <input
                  type="checkbox"
                  checked={selectedTask.status?.toUpperCase() === "COMPLETED"}
                  onChange={() => handleCompleteToggle(selectedTask.id)}
                  disabled={selectedTask.status?.toUpperCase() === "COMPLETED"}
                />
                {selectedTask.status?.toUpperCase() === "COMPLETED" ? "Completed" : "Complete"}
              </label>
            </div>

            <div className="Gthstg-Bddy">
              <p>
                <b>Risk Category:</b> <span>{Array.isArray(selectedTask.riskCategory) ? selectedTask.riskCategory.join(', ') : selectedTask.riskCategory}</span>
              </p>
              <p>
                <b>Session:</b>{" "}
                <span>
                  {(() => {
                    const utcHour = selectedTask.startDate ? new Date(selectedTask.startDate).getUTCHours() : 0;
                    let session = "Night";
                    if (utcHour >= 6 && utcHour < 12) session = "Morning";
                    else if (utcHour >= 12 && utcHour < 18) session = "Afternoon";
                    else if (utcHour >= 18 && utcHour < 22) session = "Evening";
                    return session;
                  })()} ({selectedTask.startDate ? (() => {
                    const date = new Date(selectedTask.startDate);
                    const utcHours = date.getUTCHours();
                    const utcMinutes = date.getUTCMinutes();
                    const period = utcHours < 12 ? 'am' : 'pm';
                    const displayHour = utcHours % 12 === 0 ? 12 : utcHours % 12;
                    return `${displayHour}:${utcMinutes.toString().padStart(2, '0')} ${period}`;
                  })() : 'N/A'})
                </span>
              </p>
              <p>
                <b>Frequency:</b> <span>{selectedTask.riskFrequency}</span>
              </p>
              <p>
                <b>Start Time → End Time:</b>{" "}
                <span>
                  {selectedTask.startDate ? (() => {
                    const startDate = new Date(selectedTask.startDate);
                    const startUtcHours = startDate.getUTCHours();
                    const startUtcMinutes = startDate.getUTCMinutes();
                    const startPeriod = startUtcHours < 12 ? 'am' : 'pm';
                    const startDisplayHour = startUtcHours % 12 === 0 ? 12 : startUtcHours % 12;
                    return `${startDisplayHour}:${startUtcMinutes.toString().padStart(2, '0')} ${startPeriod}`;
                  })() : 'N/A'} → {selectedTask.dueDate ? (() => {
                    const dueDate = new Date(selectedTask.dueDate);
                    const dueUtcHours = dueDate.getUTCHours();
                    const dueUtcMinutes = dueDate.getUTCMinutes();
                    const duePeriod = dueUtcHours < 12 ? 'am' : 'pm';
                    const dueDisplayHour = dueUtcHours % 12 === 0 ? 12 : dueUtcHours % 12;
                    return `${dueDisplayHour}:${dueUtcMinutes.toString().padStart(2, '0')} ${duePeriod}`;
                  })() : 'N/A'}
                </span>
              </p>
              <p>
                <b>Status:</b>{" "}
                <span>
                    <span
                    className={`GthStatus ${
                        selectedTask.status?.toUpperCase() === "COMPLETED"
                        ? "completed"
                        : selectedTask.status?.toUpperCase() === "PENDING"
                        ? "pending"
                        : "ongoing"
                    }`}
                    >
                    {selectedTask.status}
                    </span>
                </span>
                </p>

              <p>
                <b>Description:</b> <span>{selectedTask.description}</span>
              </p>
            </div>
            
              {/* Added Notes Section with matching structure */}
              {selectedTask.notes && (
                <div className="OOks-Note">
                  <h4>
                    Notes
                    <span onClick={handleEditNote} style={{cursor: 'pointer'}}><PencilIcon /> Edit</span>
                  </h4>
                  <div className="Gthstg-Bddy">
                    <p>
                      <b>Reason:</b> <span>{selectedTask.notes.reason}</span>
                    </p>
                    {selectedTask.notes.comments && (
                      <p>
                        <b>Comments:</b> <span>{selectedTask.notes.comments}</span>
                      </p>
                    )}
                    <p>
                      <b>Date/Time:</b> <span>{selectedTask.notes.date} at {selectedTask.notes.time}</span>
                    </p>
                  </div>
                </div>
              )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Alert - Adapted from CareLog */}
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
                : "Successfully noted:"}{" "}
              <strong>{successAlert.title}</strong>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Note Modal - Adapted from CareLog */}
      <AnimatePresence>
        {showNoteModal && (
          <>
            <motion.div
              className="add-task-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancelNote}
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
                  <h4>{isEditing ? "Edit Note" : "Drop a Note"}</h4>
                  <p>
                    {isEditing 
                      ? "Edit the note for this task to ensure it is reviewed by the care coordinator." 
                      : "Drop a note for this task completion to ensure it is reviewed by the care coordinator."
                    }
                  </p>
                </div>
                <div className="TTas-Boxxs-Body">
                  <form onSubmit={handleSubmitNote} className="add-task-form">
                    <div className="TTtata-Input">
                      <label>Reason for note *</label>
                      <select
                        value={noteReason}
                        onChange={(e) => setNoteReason(e.target.value)}
                        required
                      >
                        <option value="Completion Note">Completion Note</option>
                        <option value="Client behaviour change">Client behaviour change</option>
                        <option value="Health deterioration">Health deterioration</option>
                        <option value="Medication issue">Medication issue</option>
                        <option value="Scheduling conflict">Scheduling conflict</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="TTtata-Input">
                      <label>Comments</label>
                      <textarea
                        value={noteComments}
                        onChange={(e) => setNoteComments(e.target.value)}
                        placeholder="Provide additional details about the note..."
                      />
                    </div>
                    <div className="add-task-actions">
                      <button
                        type="button"
                        className="close-task"
                        onClick={handleCancelNote}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="proceed-tast-btn btn-primary-bg"
                      >
                        {savingNote ? (
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

export default TaskList;