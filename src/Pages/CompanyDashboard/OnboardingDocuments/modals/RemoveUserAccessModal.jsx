// modals/RemoveUserAccessModal.jsx
import { useState, useEffect } from "react";
import Modal from "../../../../components/Modal";
import InputField from "../../../../components/Input/InputField";
import ToastNotification from "../../../../components/ToastNotification";
import CheckboxGroup from "../../../../components/CheckboxGroup";
import {
  fetchUsersNoPagination,
  updateDocumentPermissions,
  fetchDocumentDetails,
} from "../config/apiConfig";
import LoadingState from "../../../../components/LoadingState";

const getReadablePermission = (level) => {
  if (level === "view") return "View";
  if (level === "view_download") return "View & Download";
  return level;
};

const RemoveUserAccessModal = ({ isOpen, onClose, documentId, onSuccess }) => {
  const [users, setUsers] = useState([]);
  const [currentUsers, setCurrentUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && documentId) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const [usersRes, docRes] = await Promise.all([
            fetchUsersNoPagination(),
            fetchDocumentDetails(documentId),
          ]);
          setUsers(usersRes || []);
          const permUserIds = docRes.permissions
            ? docRes.permissions.map((p) => parseInt(p.user_id))
            : [];
          const currentPermUsers = usersRes
            .filter((u) => permUserIds.includes(u.id))
            .map((u) => {
              const perm = docRes.permissions.find(
                (p) => parseInt(p.user_id) === u.id
              );
              return { ...u, permission_level: perm?.permission_level };
            });
          setCurrentUsers(currentPermUsers);
          setSelectedUserIds(permUserIds);
          setUserSearchQuery("");
        } catch (error) {
          setErrorMessage("Failed to fetch data");
          setTimeout(() => setErrorMessage(null), 4000);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, documentId]);

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Remove User Access">
        <LoadingState text="Loading users..." />
      </Modal>
    );
  }

  const filteredUsers = currentUsers.filter(
    (user) =>
      (user.username || "")
        .toLowerCase()
        .includes(userSearchQuery.toLowerCase()) ||
      (user.email || "")
        .toLowerCase()
        .includes(userSearchQuery.toLowerCase()) ||
      (user.first_name || "")
        .toLowerCase()
        .includes(userSearchQuery.toLowerCase()) ||
      (user.last_name || "")
        .toLowerCase()
        .includes(userSearchQuery.toLowerCase())
  );

  const handleUserSearchChange = (e) => {
    setUserSearchQuery(e.target.value);
  };

  const handleConfirmRemove = async () => {
    if (selectedUserIds.length === 0) {
      setErrorMessage("Please select at least one user to remove");
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    const payload = {
      permissions_write: selectedUserIds.map((userId) => ({
        user_id: userId.toString(),
      })),
      permission_action: "remove",
    };

    try {
      setIsUpdating(true);
      const response = await updateDocumentPermissions(documentId, payload);
      setSuccessMessage(`Removed access for ${selectedUserIds.length} user(s)`);
      setErrorMessage(null);
      onSuccess(response);
      setTimeout(() => {
        onClose();
        setSelectedUserIds([]);
      }, 1500);
    } catch (error) {
      setErrorMessage("Failed to remove user access");
      setSuccessMessage(null);
    } finally {
      setIsUpdating(false);
      setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 3000);
    }
  };

  const userOptions = filteredUsers.map((user) => ({
    value: user.id,
    label: `${user.first_name || ""} ${user.last_name || ""} (${
      user.email || user.username || "N/A"
    }) - ${getReadablePermission(user.permission_level)}`,
  }));

  const isButtonDisabled = isUpdating || selectedUserIds.length === 0;

  return (
    <>
      <ToastNotification
        successMessage={successMessage}
        errorMessage={errorMessage}
      />
      <Modal isOpen={isOpen} onClose={onClose} title="Remove User Access">
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h3
            style={{
              fontWeight: "bold",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            Select users to remove access from this document
          </h3>
          <div className="oIK-Search" style={{ marginBottom: "1rem" }}>
            <InputField
              label=""
              name="userSearch"
              value={userSearchQuery}
              onChange={handleUserSearchChange}
              placeholder="Search by username, email, first name, or last name..."
              style={{ margin: 0 }}
            />
          </div>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {filteredUsers.length > 0 ? (
              <CheckboxGroup
                multiple={true}
                options={userOptions}
                value={selectedUserIds}
                onChange={setSelectedUserIds}
              />
            ) : (
              <p
                style={{
                  padding: "1rem",
                  textAlign: "center",
                  color: "gray",
                }}
              >
                No users with access
              </p>
            )}
          </div>
          <div
            className="modal-footer"
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "flex-end",
              marginTop: "1rem",
            }}
          >
            <button
              className="modal-button modal-button-cancel"
              onClick={onClose}
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              className="modal-button modal-button-confirm"
              onClick={handleConfirmRemove}
              disabled={isButtonDisabled}
            >
              {isUpdating
                ? "Removing..."
                : `Remove Access (${selectedUserIds.length} selected)`}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RemoveUserAccessModal;
