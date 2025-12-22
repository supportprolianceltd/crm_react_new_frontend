import Modal from "../../../../../../components/Modal";
import StatusBadge from "../../../../../../components/StatusBadge";
import { normalizeText } from "../../../../../../utils/helpers";

const RewardsPenaltiesDetailsModal = ({ isOpen, onClose, item, activeTab }) => {
  if (!isOpen || !item) return null;
  console.log(item);

  const isReward = activeTab === "rewards";
  const severityOptions = { 1: "Low", 2: "Medium", 3: "High" };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isReward ? "Reward" : "Penalty"} Details`}
    >
      <div className="details-content">
        <div className="detail-row">
          <label>Date</label>
          <span>{item.date}</span>
        </div>
        <div className="detail-row">
          <label>Employee Name</label>
          <span>{item.employee_name}</span>
        </div>
        <div className="detail-row">
          <label>Department</label>
          <span>{item.department}</span>
        </div>
        <div className="detail-row">
          <label>Type</label>
          <span>{normalizeText(item.type)}</span>
        </div>
        <div className="detail-row">
          <label>Reason</label>
          <span>{normalizeText(item.reason)}</span>
        </div>
        <div className="detail-row">
          <label>Status</label>
          <span>
            <StatusBadge status={item.status?.toLowerCase()} />
          </span>
        </div>
        {isReward ? (
          <>
            <div className="detail-row">
              <label>Value</label>
              <span>{item.value || "N/A"}</span>
            </div>
            <div className="detail-row">
              <label>Value Type</label>
              <span>{normalizeText(item.value_type) || "N/A"}</span>
            </div>
          </>
        ) : (
          <>
            <div className="detail-row">
              <label>Severity Level</label>
              <span>
                {severityOptions[item.severity_level] || item.severity_level}
              </span>
            </div>
            {item.type === "suspension" && (
              <div className="detail-row">
                <label>Duration (days)</label>
                <span>{item.duration_days || "N/A"}</span>
              </div>
            )}
          </>
        )}
        <div className="detail-row">
          <label>Issuing Authority</label>
          <span>{item.issuing_authority || "N/A"}</span>
        </div>
      </div>
      <div className="modal-footer">
        <button className="modal-button modal-button-cancel" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
};

export default RewardsPenaltiesDetailsModal;
