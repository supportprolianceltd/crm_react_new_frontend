import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const RosterTask = ({ task: visitTask }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Use actual tasks from the visit if available
    if (visitTask?.tasks && Array.isArray(visitTask.tasks)) {
      setTasks(visitTask.tasks);
    } else {
      setTasks([]);
    }
  }, [visitTask]);

  // Note modal states (adapted from CareLog flag modal)
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [noteReason, setNoteReason] = useState("Completion Note");
  const [noteComments, setNoteComments] = useState("");
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
    setSuccessAlert({
      show: true,
      title: selectedTask?.task || "Task",
      updated: false,
    });
    setTimeout(
      () => setSuccessAlert({ show: false, title: "", updated: false }),
      2200
    );
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

  // Note Modal (you'll need to add this JSX if not already present; assuming it's missing from original)
  const renderNoteModal = () => (
    <AnimatePresence>
      {showNoteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCancelNote}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white p-6 rounded-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">
              {isEditing ? "Edit Note" : "Add Completion Note"}
            </h3>
            <form onSubmit={handleSubmitNote}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Reason:</label>
                <select
                  value={noteReason}
                  onChange={(e) => setNoteReason(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="Completion Note">Completion Note</option>
                  <option value="Delay Note">Delay Note</option>
                  <option value="Issue Note">Issue Note</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Comments (Optional):</label>
                <textarea
                  value={noteComments}
                  onChange={(e) => setNoteComments(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={3}
                  placeholder="Add any additional comments..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCancelNote}
                  className="px-4 py-2 text-gray-600 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  {isEditing ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Framer Motion animation variants
  const contentVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 10, transition: { duration: 0.2 } },
  };

  return (
    <div className="TTHtahs-Oaa">
      <AnimatePresence mode="wait">
        {!selectedTask ? (
          <motion.div
            key="task-list"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
         

            {tasks.length > 0 ? (
              <ul className="LLsi-Ul UYjayhs-PPolas">
                {tasks.map((task) => (
                  <li key={task.id} onClick={() => handleTaskClick(task)}>
                    <span>
                      <input
                        type="checkbox"
                        checked={task.status === "Completed"}
                        readOnly
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteToggle(task.id);
                        }}
                      />
                    </span>
                    <span>{task.title}</span>
                  
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
                <p>No tasks assigned to this visit</p>
              </div>
            )}
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

      {/* Note Modal */}
      {renderNoteModal()}
    </div>
  );
};

export default RosterTask;