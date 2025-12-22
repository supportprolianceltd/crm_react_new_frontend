import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const TaskList = ({ tasks: propTasks = [] }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState(propTasks);

  useEffect(() => {
    setTasks(propTasks);
  }, [propTasks]);

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

  const handleTaskClick = (task) => {
    setSelectedTask(task);
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
    const task = tasks.find(t => t.id === id);
    if (task && task.status !== "Completed") {
      setShowNoteModal(true);
      // Store the task ID temporarily for completion after modal
      setSelectedTask(prev => prev ? { ...prev, tempIdForCompletion: id } : { tempIdForCompletion: id });
      // Reset for new note
      setIsEditing(false);
      setNoteReason("Completion Note");
      setNoteComments("");
    } else {
      // If already completed, just toggle back to Pending
      performToggle(id);
    }
  };

  // Perform the actual toggle after modal interaction
  const performToggle = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              status: task.status === "Completed" ? "Pending" : "Completed",
              ...(task.status === "Completed" ? { notes: null } : {}),
            }
          : task
      )
    );

    setSelectedTask((prev) =>
      prev && prev.id === id
        ? {
            ...prev,
            status: prev.status === "Completed" ? "Pending" : "Completed",
            ...(prev.status === "Completed" ? { notes: null } : {}),
          }
        : prev
    );
  };

  // Handle note submission (adapted from CareLog)
  const handleSubmitNote = (e) => {
    e.preventDefault();
    if (!noteReason) {
      alert("Please select a Reason for note");
      return;
    }
    setSavingNote(true);
    setTimeout(() => {
      const taskId = selectedTask?.tempIdForCompletion || selectedTask?.id;
      const newNote = {
        id: Date.now(), // Simple ID generation
        reason: noteReason,
        comments: noteComments,
        date: new Date().toLocaleDateString('en-GB'), // e.g., 13/11/2025
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), // e.g., 14:30
      };

      // Set single note for the task
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, notes: newNote }
            : task
        )
      );

      // Update selectedTask if it's the current one
      setSelectedTask((prev) =>
        prev && prev.id === taskId
          ? { ...prev, notes: newNote }
          : prev
      );

      console.log("Note submitted:", { reason: noteReason, comments: noteComments, taskId });
      setShowNoteModal(false);
      setIsEditing(false);
      // Reset form
      setNoteReason("Completion Note");
      setNoteComments("");
      // Clear temp ID
      setSelectedTask((prev) => ({ ...prev, tempIdForCompletion: null }));
      // Now complete the task after noting (only if adding new for completion)
      if (selectedTask?.tempIdForCompletion) {
        performToggle(selectedTask.tempIdForCompletion);
      }
      setSavingNote(false);
      setSuccessAlert({
        show: true,
        title: selectedTask?.task || "Task",
        updated: false,
      });
      setTimeout(
        () => setSuccessAlert({ show: false, title: "", updated: false }),
        2200
      );
    }, 3000);
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
              {tasks.map((task) => (
                <li key={task.id} onClick={() => handleTaskClick(task)}>
                  <span>
                    <input
                      type="checkbox"
                      checked={task.status === "Completed"}
                      readOnly
                    />
                  </span>
                  <span>{task.title}</span>
                  <span>
                    <span>{Array.isArray(task.risk) ? task.risk.join(', ') : task.risk}</span>
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

              <div className="TGas-Dc">
                <button><PencilIcon  /> Edit Task</button>
                <button className="GtgaDelete-Btn"><TrashIcon /></button>
              </div>
            </div>

            <div className="Gthstg-Bddy">
              <p>
                <b>Risk Category:</b> <span>{Array.isArray(selectedTask.risk) ? selectedTask.risk.join(', ') : selectedTask.risk}</span>
              </p>
              <p>
                <b>Session:</b>{" "}
                <span>
                  {selectedTask.session} ({selectedTask.time})
                </span>
              </p>
              <p>
                <b>Frequency:</b> <span>{selectedTask.frequency}</span>
              </p>
              <p>
                <b>From → Until:</b>{" "}
                <span>
                  {selectedTask.from} → {selectedTask.until}
                </span>
              </p>
              <p>
                <b>Status:</b>{" "}
                <span>
                    <span
                    className={`GthStatus ${
                        selectedTask.status === "Completed"
                        ? "completed"
                        : selectedTask.status === "Pending"
                        ? "pending"
                        : "ongoing"
                    }`}
                    >
                    {selectedTask.status}
                    </span>
                </span>
                </p>

              <p>
                <b>Description:</b> <span>{selectedTask.details}</span>
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


    </div>
  );
};

export default TaskList;