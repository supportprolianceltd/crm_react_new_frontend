// DeleteRequestModal.jsx
import React, { useState } from "react";
import Modal from "../../../../components/Modal";
import { deleteInternalRequest } from "../../../CompanyDashboard/Requests/config/apiConfig";

const DeleteRequestModal = ({ isOpen, onClose, request, onDeleteSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!request) return;

    setLoading(true);
    setError(null);

    try {
      await deleteInternalRequest(request.id);

      // Assuming success; you can check response if needed
      onDeleteSuccess();
      onClose();
    } catch (err) {
      console.error("Error deleting request:", err);
      setError(
        err.response?.data?.message ||
          "An error occurred while deleting the request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Delete Request"
      message={`Are you sure you want to delete this request ${
        request?.request_id || ""
      }? This action cannot be undone.`}
    >
      {error && (
        <div
          style={{
            color: "red",
            marginBottom: "1rem",
            padding: "0.5rem",
            background: "#fee",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "1rem",
          paddingTop: "1rem",
        }}
      >
        <button
          type="button"
          className="modal-button modal-button-cancel" // Adjust class for secondary button styling
          onClick={handleClose}
          disabled={loading}
          style={{ background: "#6b7280", color: "white" }} // Gray button
        >
          No, Keep It
        </button>
        <button
          type="button"
          className="modal-button"
          onClick={handleDelete}
          disabled={loading}
          style={{ background: "#dc2626", color: "white" }} // Red button for delete
        >
          {loading ? "Deleting..." : "Yes, Delete"}
        </button>
      </div>
    </Modal>
  );
};

export default DeleteRequestModal;
