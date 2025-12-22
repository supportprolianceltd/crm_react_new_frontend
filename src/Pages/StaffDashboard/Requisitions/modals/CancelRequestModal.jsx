// CancelRequestModal.jsx
import React, { useState } from "react";
import Modal from "../../../../components/Modal";
import { updateInternalRequest } from "../../../CompanyDashboard/Requests/config/apiConfig";

const CancelRequestModal = ({ isOpen, onClose, request, onCancelSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCancel = async () => {
    if (!request) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        status: "cancelled", // Assuming 'cancelled' is the status for cancellation; adjust if needed
      };

      const response = await updateInternalRequest(request.id, payload);

      // Assuming success; you can check response if needed
      onCancelSuccess();
      onClose();
    } catch (err) {
      console.error("Error cancelling request:", err);
      setError(
        err.response?.data?.message ||
          "An error occurred while cancelling the request. Please try again."
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
      title="Cancel Request"
      message={`Are you sure you want to cancel this request ${
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
          onClick={handleCancel}
          disabled={loading}
          style={{ background: "#dc2626", color: "white" }} // Red button for cancel
        >
          {loading ? "Cancelling..." : "Yes, Cancel"}
        </button>
      </div>
    </Modal>
  );
};

export default CancelRequestModal;
