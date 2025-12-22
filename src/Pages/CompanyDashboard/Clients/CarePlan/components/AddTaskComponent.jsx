import React, { useState } from "react";
import AddTaskModal from "../modals/AddTaskModal";

const AddTaskComponent = ({ handleAddTask, sectionName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const onAddSuccess = (taskData) => {
    handleAddTask(taskData); // Call parent's handleAddTask with the added task data
    closeModal();
  };

  return (
    <div
      className="content-section task-section"
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
      }}
    >
      <div>
        <h3>Task</h3>
        <p>Assign and manage client tasks linked directly to their care plan</p>
      </div>
      <button
        className="modal-button continue-btn"
        style={{ whiteSpace: "nowrap", textWrap: "nowrap" }}
        onClick={openModal}
      >
        Add Task
      </button>
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onAddSuccess={onAddSuccess}
        sectionName={sectionName}
      />
    </div>
  );
};

export default AddTaskComponent;
