import { useState } from "react";
import Modal from "../../../../components/Modal";

const ApproveRejectModal = ({
  isOpen,
  onClose,
  actionType, // "approved" or "rejected"
  onSubmit, // callback to handle submission
}) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit(comment);
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    setComment("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={actionType === "approved" ? "Approve Request" : "Reject Request"}
      message="Please provide a comment for your action:"
    >
      <div className="GHuh-Form-Input" style={{ marginBottom: "1rem" }}>
        <label>Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            resize: "vertical",
          }}
          placeholder="Enter your comment here..."
          disabled={isSubmitting}
        />
      </div>

      <div className="modal-footer" style={{ marginTop: "1rem" }}>
        <button
          type="button"
          className="modal-button modal-button-cancel"
          style={{ backgroundColor: "#6c757d" }}
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="button"
          className="modal-button modal-button-confirm"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Confirm"}
        </button>
      </div>
    </Modal>
  );
};

export default ApproveRejectModal;
