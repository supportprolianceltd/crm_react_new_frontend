import Modal from "../../../../../components/Modal";
import { TrashIcon } from "@heroicons/react/24/outline";

const DeleteClusterModal = ({
  isOpen,
  onClose,
  clusterName,
  onDelete,
  isDeleting,
}) => {
  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Cluster"
      message={`Are you sure you want to delete the cluster "${clusterName}"? This action cannot be undone.`}
    >
      <div
        className="modal-actions"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          marginTop: "20px",
        }}
      >
        <button
          type="button"
          className="modal-button modal-button-cancel" // Reuse existing class or add btn-secondary
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="modal-button btn-primary-bg" // Reuse for danger styling, or add btn-danger
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </Modal>
  );
};

export default DeleteClusterModal;
