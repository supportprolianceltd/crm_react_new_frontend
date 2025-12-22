// modals/AddUserAccessModal.jsx (updated)
import { useState, useEffect, useMemo } from "react";
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

const AddUserAccessModal = ({
  isOpen,
  onClose,
  documentId,
  documentTitle,
  onSuccess,
}) => {
  const [users, setUsers] = useState([]);
  const [docDetails, setDocDetails] = useState(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [permissionLevel, setPermissionLevel] = useState("view_download");
  const [selectAll, setSelectAll] = useState(false);
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
          setDocDetails(docRes);
          const permUserIds = docRes.permissions
            ? docRes.permissions.map((p) => parseInt(p.user_id))
            : [];
          setSelectedUserIds(permUserIds);
          setUserSearchQuery("");
          setSelectAll(false);
          // Default to view_download, or could set based on most common, but keep simple
          setPermissionLevel("view_download");
        } catch (error) {
          setErrorMessage("Failed to fetch data");
          setSelectedUserIds([]);
          setTimeout(() => setErrorMessage(null), 4000);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, documentId]);

  const filteredUsers = users.filter(
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

  const sortedFilteredUsers = useMemo(() => {
    const selected = filteredUsers.filter((u) =>
      selectedUserIds.includes(u.id)
    );
    const nonSelected = filteredUsers.filter(
      (u) => !selectedUserIds.includes(u.id)
    );
    return [...selected, ...nonSelected];
  }, [filteredUsers, selectedUserIds]);

  useEffect(() => {
    const allSelected =
      filteredUsers.length > 0 &&
      filteredUsers.every((u) => selectedUserIds.includes(u.id));
    setSelectAll(allSelected);
  }, [filteredUsers, selectedUserIds]);

  const handleUserSearchChange = (e) => {
    setUserSearchQuery(e.target.value);
  };

  const handleSelectAllChange = (newValue) => {
    setSelectAll(newValue);
    if (newValue) {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handlePermissionLevelChange = (newValue) => {
    setPermissionLevel(newValue);
  };

  const handleConfirmAddUsers = async () => {
    if (selectedUserIds.length === 0) {
      setErrorMessage("Please select at least one user");
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    const currentPerms = docDetails?.permissions || [];
    const currentUserIds = currentPerms.map((p) => parseInt(p.user_id));
    const existingSelectedIds = selectedUserIds.filter((id) =>
      currentUserIds.includes(id)
    );
    const newSelectedIds = selectedUserIds.filter(
      (id) => !currentUserIds.includes(id)
    );
    const hasExistingChanges = existingSelectedIds.some((id) => {
      const perm = currentPerms.find((p) => parseInt(p.user_id) === id);
      return perm && perm.permission_level !== permissionLevel;
    });
    const hasNew = newSelectedIds.length > 0;

    if (!hasNew && !hasExistingChanges) {
      setErrorMessage("No new users or changes to apply");
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    // Build full permissions list
    const keptPermissions = currentPerms
      .filter((p) => !selectedUserIds.includes(parseInt(p.user_id)))
      .map((p) => ({
        user_id: p.user_id.toString(),
        permission_level: p.permission_level,
      }));
    const updatedPermissions = selectedUserIds.map((id) => ({
      user_id: id.toString(),
      permission_level: permissionLevel,
    }));
    const fullPermissions = [...keptPermissions, ...updatedPermissions];

    const payload = {
      permissions_write: fullPermissions,
      permission_action: "replace",
    };

    try {
      setIsUpdating(true);
      const response = await updateDocumentPermissions(documentId, payload);
      const levelText =
        permissionLevel === "view_download" ? "View & Download" : "View Only";
      setSuccessMessage(
        `Updated ${levelText} access for ${selectedUserIds.length} user(s)`
      );
      setErrorMessage(null);
      onSuccess(response);
      setTimeout(() => {
        onClose();
        setSelectedUserIds([]);
        setSelectAll(false);
      }, 1500);
    } catch (error) {
      setErrorMessage("Failed to update user access");
      setSuccessMessage(null);
    } finally {
      setIsUpdating(false);
      setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 3000);
    }
  };

  const userOptions = sortedFilteredUsers.map((user) => ({
    value: user.id,
    label: `${user.first_name || ""} ${user.last_name || ""} (${
      user.email || user.username || "N/A"
    })`,
  }));

  const isButtonDisabled = isUpdating || selectedUserIds.length === 0;

  const permissionOptions = [
    { value: "view", label: "View Only" },
    { value: "view_download", label: "View and Download" },
  ];

  const selectedPermissionLabel =
    permissionOptions.find((opt) => opt.value === permissionLevel)?.label ||
    "View and Download";

  return (
    <>
      <ToastNotification
        successMessage={successMessage}
        errorMessage={errorMessage}
      />
      <Modal isOpen={isOpen} onClose={onClose} title="Add User Access">
        {isLoading ? (
          <LoadingState text="Loading users..." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h3
              style={{
                fontWeight: "bold",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              Select the users you want to grant&nbsp;
              <span style={{ color: "#7226ff" }}>
                {selectedPermissionLabel}
              </span>
              &nbsp;access to&nbsp;
              {documentTitle ?? "this document"}
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
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                  display: "block",
                }}
              >
                Permission Level:
              </label>
              <CheckboxGroup
                multiple={false}
                options={permissionOptions}
                value={permissionLevel}
                onChange={handlePermissionLevelChange}
              />
            </div>
            <CheckboxGroup
              multiple={false}
              options={[
                {
                  value: true,
                  label: `Select All (${filteredUsers.length})`,
                },
              ]}
              value={selectAll}
              onChange={handleSelectAllChange}
            />
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
                  No users found
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
                onClick={handleConfirmAddUsers}
                disabled={isButtonDisabled}
              >
                {isUpdating
                  ? "Updating..."
                  : `Update Access (${selectedUserIds.length} selected)`}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default AddUserAccessModal;
