// modals/ViewOnboardingDocumentModal.jsx
import { useState, useEffect } from "react";
import Modal from "../../../../components/Modal";
import {
  fetchDocumentDetails,
  fetchUsersNoPagination,
} from "../config/apiConfig";
import { UserIcon } from "@heroicons/react/24/outline";
import "../styles/style.css";
import LoadingState from "../../../../components/LoadingState";

const getReadablePermission = (level) => {
  if (level === "view") return "View";
  if (level === "view_download") return "View & Download";
  return level;
};

const ViewOnboardingDocumentModal = ({
  isOpen,
  onClose,
  documentId,
  onAddUsers,
  refetchTrigger,
}) => {
  const [docDetails, setDocDetails] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && documentId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const [docRes, usersRes] = await Promise.all([
            fetchDocumentDetails(documentId),
            fetchUsersNoPagination(),
          ]);
          setDocDetails(docRes);
          setUsers(usersRes || []);
        } catch (err) {
          setError("Failed to load document details");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, documentId, refetchTrigger]);

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Viewing Document">
        <LoadingState />
      </Modal>
    );
  }

  if (error || !docDetails) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Error">
        <div>{error || "Document not found"}</div>
      </Modal>
    );
  }

  const permissionUsers = docDetails.permissions
    ? docDetails.permissions
        .map((p) => {
          const user = users.find((u) => u.id === parseInt(p.user_id));
          return user
            ? { ...user, permission_level: p.permission_level }
            : null;
        })
        .filter(Boolean)
    : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={docDetails.title || "Document"}
    >
      <div className="view-modal-container">
        <div className="document-viewer">
          {docDetails.file_url ? (
            <iframe
              src={docDetails.file_url}
              className="document-iframe"
              title="Document Viewer"
            />
          ) : (
            <p className="no-file-message">File not available for viewing.</p>
          )}
        </div>
        <div className="users-section">
          <h4 className="users-title">
            Users with Access ({permissionUsers.length})
          </h4>
          <div className="users-list-container">
            {permissionUsers.length > 0 ? (
              permissionUsers.map((pu) => (
                <div key={pu.id} className="user-item">
                  <div className="user-info">
                    <span className="user-name">
                      {pu.first_name} {pu.last_name}
                    </span>
                    <span className="user-details">{pu.email}</span>
                  </div>
                  <span className="permission-badge">
                    {getReadablePermission(pu.permission_level)}
                  </span>
                </div>
              ))
            ) : (
              <p className="no-users-message">No users have access yet.</p>
            )}
          </div>
          <button
            onClick={() => onAddUsers(documentId)}
            className="add-user-button"
          >
            <UserIcon className="user-icon" />
            Add More Users
          </button>
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

export default ViewOnboardingDocumentModal;
