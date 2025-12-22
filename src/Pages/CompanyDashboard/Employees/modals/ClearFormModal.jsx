import React from "react";
import Modal from "../../../../components/Modal";

const ClearFormModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Clear Form Data"
      message="Are you sure you want to clear all form data? This action cannot be undone. All entered information will be permanently lost."
    >
      <div className="modal-footer">
        <button className="modal-button modal-button-cancel" onClick={onClose}>
          Cancel
        </button>
        <button
          className="modal-button modal-button-confirm"
          onClick={onConfirm}
          style={{ backgroundColor: "#ff4444" }}
        >
          Clear All Data
        </button>
      </div>
    </Modal>
  );
};

export default ClearFormModal;
