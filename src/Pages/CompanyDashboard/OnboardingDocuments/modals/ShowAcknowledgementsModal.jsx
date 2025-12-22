// modals/ShowAcknowledgementsModal.jsx (updated)
import { useState, useEffect } from "react";
import Modal from "../../../../components/Modal";
import { fetchAcknowledgements } from "../config/apiConfig";
import { UserIcon } from "@heroicons/react/24/outline";
import LoadingState from "../../../../components/LoadingState";

const ShowAcknowledgementsModal = ({ isOpen, onClose, documentId }) => {
  const [acknowledgements, setAcknowledgements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && documentId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const data = await fetchAcknowledgements(documentId);
          setAcknowledgements(data || []);
        } catch (err) {
          setError("Failed to load acknowledgements");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, documentId]);

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Acknowledgements">
        <LoadingState />
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Error">
        <div>{error}</div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Document Acknowledgements">
      <div className="view-modal-container">
        <div className="users-section">
          <h4 className="users-title">
            Acknowledgements ({acknowledgements.length})
          </h4>
          <div className="users-list-container">
            {acknowledgements.length > 0 ? (
              acknowledgements.map((ack) => (
                <div key={ack.id} className="user-item">
                  <div className="user-info">
                    <span className="user-name">
                      {ack.first_name} {ack.last_name}
                    </span>
                    <span className="user-details">
                      {ack.email} | {ack.role} | Acknowledged:{" "}
                      {new Date(ack.acknowledged_at).toLocaleString()}
                    </span>
                  </div>
                  <span className="permission-badge">Acknowledged</span>
                </div>
              ))
            ) : (
              <p className="no-users-message">No acknowledgements yet.</p>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="modal-button modal-button-cancel"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ShowAcknowledgementsModal;
