import Modal from "../../../../../components/Modal";

const RequestConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  loading = false,
}) => {
  const title = action === "approve" ? "Confirm Approval" : "Confirm Decline";
  const message =
    action === "approve"
      ? "Are you sure you want to approve this request? This action cannot be undone."
      : "Are you sure you want to decline this request? This action cannot be undone.";
  const confirmText = action === "approve" ? "Approve" : "Decline";
  const confirmClass = action === "approve" ? "approve-btn" : "decline-btn";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} message={message}>
      <div className="modal-footer">
        <button
          className="modal-button modal-button-cancel"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          className="modal-button modal-button-confirm"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Processing..." : confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default RequestConfirmationModal;
