import React, { useState, useEffect } from "react";
import Modal from "../../../../../components/Modal";
import LoadingState from "../../../../../components/LoadingState";
import ToastNotification from "../../../../../components/ToastNotification";
import {
  checkForEligibleCarers,
  updateExternalRequest,
} from "../../config/apiConfig";
import { validateEndDateAfterStart } from "../../../../../utils/helpers";
import "./RequestDetailsModal.css";
import StatusBadge from "../../../../../components/StatusBadge";
import CheckboxGroup from "../../../../../components/CheckboxGroup";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const RequestDetailsModal = ({
  request,
  isOpen,
  onClose,
  onApprove,
  onDecline,
  onUpdate,
}) => {
  const navigate = useNavigate();
  const [eligibleCarers, setEligibleCarers] = useState([]);
  const [ineligibleCarers, setInEligibleCarers] = useState([]);
  const [totalCarers, setTotalCarers] = useState([]);
  const [hasChecked, setHasChecked] = useState(false);
  const [view, setView] = useState("details");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [displayedRequest, setDisplayedRequest] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [sendToRostering, setSendToRostering] = useState(false);
  const id = request?.id;
  const status = request?.status;
  const isPending = status === "pending";
  const requestTypeOptions = [
    { value: "Care Services", label: "Care Services" },
    { value: "Logistics Services", label: "Logistics Services" },
    { value: "Engineering Services", label: "Engineering Services" },
    { value: "others", label: "Others" },
  ];
  const sendToRosteringOption = [{ value: true, label: "Send to Rostering" }];
  const editableFields = [
    "subject",
    "content",
    "urgency",
    "requestorName",
    "address",
    "postcode",
    "notes",
    "scheduledStartTime",
    "scheduledEndTime",
  ];
  useEffect(() => {
    if (request) {
      setDisplayedRequest(request);
    }
  }, [request]);
  useEffect(() => {
    if (!isOpen) {
      setEligibleCarers([]);
      setHasChecked(false);
      setView("details");
      setLoading(false);
      setIsEditing(false);
      setFormData({});
      setDisplayedRequest({});
      setSuccessMsg("");
      setErrorMsg("");
      setSendToRostering(true);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (successMsg || errorMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg("");
        setErrorMsg("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, errorMsg]);
  const formatForLocalInput = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  const getCurrentDateTimeLocal = () => {
    return formatForLocalInput(new Date().toISOString());
  };
  const calculateDuration = (startStr, endStr) => {
    if (!startStr || !endStr) return 0;
    const s = new Date(startStr);
    const e = new Date(endStr);
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || e <= s) return 0;
    const diffMs = e.getTime() - s.getTime();
    return Math.floor(diffMs / (1000 * 60));
  };
  const formatDuration = (totalMinutes) => {
    if (totalMinutes === 0) return "Not specified";
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;
    const parts = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    if (minutes > 0 || parts.length === 0)
      parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
    return parts.join(", ");
  };

  const handleCheckEligible = async () => {
    if (!id || !isPending) return;
    setLoading(true);
    try {
      const data = await checkForEligibleCarers(id);
      const foundCarers = data?.eligibleCarers || [];
      // console.log(foundCarers);
      setEligibleCarers(foundCarers);
      setHasChecked(true);
      setSuccessMsg(
        foundCarers.length > 0
          ? `Found ${foundCarers.length} eligible carer(s).`
          : "No eligible carers found."
      );
    } catch (error) {
      console.error("Error loading eligible carers:", error);
      setEligibleCarers([]);
      setErrorMsg("Failed to check for eligible carers.");
    } finally {
      setLoading(false);
    }
  };
  const enterEditMode = () => {
    const fd = { ...displayedRequest };
    const mins = calculateDuration(fd.scheduledStartTime, fd.scheduledEndTime);
    fd.estimatedDuration = mins;
    // Handle requestTypes
    const storedType = displayedRequest.requestTypes;
    const normalizedStoredType = storedType?.toLowerCase().trim();
    const typeOption = requestTypeOptions.find(
      (opt) => opt.value.toLowerCase().trim() === normalizedStoredType
    );
    if (typeOption) {
      fd.requestTypes = typeOption.value;
      fd.customRequestType = "";
    } else {
      fd.requestTypes = "others";
      fd.customRequestType = storedType || "";
    }
    setFormData(fd);
    setIsEditing(true);
    setView("details");
  };
  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({});
  };
  const validateScheduleDates = () => {
    if (formData.scheduledStartTime && formData.scheduledEndTime) {
      if (
        !validateEndDateAfterStart(
          formData.scheduledStartTime,
          formData.scheduledEndTime
        )
      ) {
        setErrorMsg("Scheduled end time must be after start time.");
        return false;
      }
    }
    if (formData.scheduledStartTime) {
      const startDate = new Date(formData.scheduledStartTime);
      const now = new Date();
      if (startDate < now) {
        setErrorMsg("Scheduled start time cannot be in the past.");
        return false;
      }
    }
    return true;
  };
  const handleSaveEdit = async () => {
    if (!validateScheduleDates()) {
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const payload = {};
      editableFields.forEach((field) => {
        const originalValue = displayedRequest[field];
        const newValue = formData[field];
        if (newValue !== originalValue && newValue !== undefined) {
          payload[field] = newValue;
        }
      });
      const newDuration = calculateDuration(
        formData.scheduledStartTime,
        formData.scheduledEndTime
      );
      const originalDuration = displayedRequest.estimatedDuration || 0;
      if (newDuration !== originalDuration) {
        payload.estimatedDuration = newDuration;
      }
      // Handle requestTypes
      const currentActual =
        formData.requestTypes === "others"
          ? formData.customRequestType
          : formData.requestTypes;
      const originalActual = displayedRequest.requestTypes;
      const normalizedCurrent = currentActual?.toLowerCase().trim();
      const normalizedOriginal = originalActual?.toLowerCase().trim();
      if (
        normalizedCurrent !== normalizedOriginal &&
        currentActual !== undefined
      ) {
        payload.requestTypes = currentActual;
      }
      if (Object.keys(payload).length === 0) {
        setSuccessMsg("No changes made.");
        setIsEditing(false);
        setLoading(false);
        return;
      }
      await updateExternalRequest(id, payload);
      setDisplayedRequest((prev) => ({ ...prev, ...payload }));
      setSuccessMsg("Request updated successfully.");
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      setErrorMsg(error.message || "Failed to update request.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      // If sendToRostering is checked, update it first
      if (sendToRostering) {
        await updateExternalRequest(id, { sendToRostering: true });
        setDisplayedRequest((prev) => ({ ...prev, sendToRostering: true }));
      }
    } catch (error) {
      setErrorMsg(error.message || "Failed to update send to rostering.");
      setLoading(false);
      return;
    } finally {
      setLoading(false);
    }

    // Pass updated request state to parent with sendToRostering flag
    onApprove?.({ ...request, sendToRostering });
    setSuccessMsg("Request approved successfully.");
  };

  const handleDecline = () => {
    onDecline?.(request);
    setSuccessMsg("Request declined successfully.");
  };
  const getValue = (field) => {
    let val = isEditing ? formData[field] ?? "" : displayedRequest[field] ?? "";
    if (
      isEditing &&
      (field === "scheduledStartTime" || field === "scheduledEndTime") &&
      val
    ) {
      val = formatForLocalInput(val);
    }
    return val;
  };
  if (!request) return null;
  const { dateRequested, requester = {}, attachment } = request;
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  const currentDateTime = getCurrentDateTimeLocal();
  const startMin = isEditing ? currentDateTime : undefined;
  const endMin = isEditing
    ? formatForLocalInput(formData.scheduledStartTime) || currentDateTime
    : undefined;
  const currentStart = isEditing
    ? formData.scheduledStartTime
    : displayedRequest.scheduledStartTime;
  const currentEnd = isEditing
    ? formData.scheduledEndTime
    : displayedRequest.scheduledEndTime;
  const currentDuration = calculateDuration(currentStart, currentEnd);
  const handleFieldChange = (field) => (e) => {
    let value = e.target.value;
    if (field === "scheduledStartTime" || field === "scheduledEndTime") {
      if (value) {
        const localDate = new Date(value + ":00");
        value = localDate.toISOString();
      } else {
        value = null;
      }
    }
    setFormData((prev) => {
      const newForm = { ...prev, [field]: value };
      if (field === "scheduledStartTime" || field === "scheduledEndTime") {
        const start =
          field === "scheduledStartTime" ? value : newForm.scheduledStartTime;
        const end =
          field === "scheduledEndTime" ? value : newForm.scheduledEndTime;
        const mins = calculateDuration(start, end);
        newForm.estimatedDuration = mins;
      }
      return newForm;
    });
  };
  const renderEditableField = (
    label,
    field,
    type = "text",
    rows = 1,
    isTextarea = false,
    options = null
  ) => (
    <div>
      <p>{label}</p>
      {isEditing ? (
        isTextarea ? (
          <textarea
            className="edit-textarea"
            rows={rows}
            value={getValue(field)}
            onChange={handleFieldChange(field)}
          />
        ) : type === "select" && options ? (
          <select
            className="edit-input"
            value={getValue(field)}
            onChange={handleFieldChange(field)}
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            className="edit-input"
            type={type}
            value={getValue(field)}
            onChange={handleFieldChange(field)}
            min={
              type === "datetime-local"
                ? field === "scheduledStartTime"
                  ? startMin
                  : endMin
                : undefined
            }
          />
        )
      ) : field === "urgency" ? (
        <StatusBadge status={getValue(field).toLowerCase()} />
      ) : (
        <p className="summary-value">
          {field.includes("scheduled") && getValue(field)
            ? new Date(getValue(field)).toLocaleString()
            : getValue(field) || "Not specified"}
        </p>
      )}
    </div>
  );
  const renderContent = () => (
    <div className="request-details-section">
      <h4>Request Content</h4>
      {isEditing ? (
        <textarea
          className="edit-textarea"
          rows={4}
          value={getValue("content")}
          onChange={handleFieldChange("content")}
        />
      ) : (
        <p>{getValue("content") || "Not specified"}</p>
      )}
    </div>
  );
  const renderRequestTypeField = () => (
    <div>
      <p>Service Requirements:</p>
      {isEditing ? (
        <>
          <select
            className="edit-input"
            value={getValue("requestTypes")}
            onChange={handleFieldChange("requestTypes")}
          >
            {requestTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {formData.requestTypes === "others" && (
            <input
              className="edit-input"
              type="text"
              value={getValue("customRequestType")}
              onChange={handleFieldChange("customRequestType")}
              placeholder="e.g., I need help with a dead man"
            />
          )}
        </>
      ) : (
        <p className="summary-value">
          {displayedRequest.requestTypes || "Not specified"}
        </p>
      )}
    </div>
  );

  const handleViewEligibilityReport = () => {
    const reportData = {
      requestId: displayedRequest.id || id,
      requestDetails: displayedRequest,

      eligibleCarers: eligibleCarers,
      ineligibleCarers: ineligibleCarers,
      totalCarers: totalCarers,

      summary: {
        totalCarers: totalCarers.length,
        eligibleCarers: eligibleCarers.length,
        ineligibleCarers: ineligibleCarers.length,
      },
    };

    navigate(`/company/requests/external-requests/${id}/eligibility-report`, {
      state: {
        reportData,
        eligibleCarers,
        ineligibleCarers,
        totalCarers,
        requestDetails: displayedRequest,
      },
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Details" message="">
      <div className="request-details-modal">
        <div className="request-details-header">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
            }}
          >
            <p className="request-details-meta">
              Requested on: {formatDate(dateRequested)}
            </p>
            <p className="request-details-meta">
              <strong>Request ID:</strong> {id}
            </p>
            <p className="request-details-meta">
              <strong>Subject:</strong> {getValue("subject") || "Not specified"}
            </p>
          </div>
          <StatusBadge status={status} />
        </div>
        {view === "details" && (
          <>
            <div className="request-details-section">
              <h4>Requester Information </h4>
              <div className="requester-details-info">
                <div className="requester-details-left">
                  <p>
                    <strong>{requester.name}</strong>
                  </p>
                  <p>{requester.email}</p>
                  <p>{requester.phone}</p>
                </div>
                <div className="requester-details-right">
                  <p>
                    <strong>Client:</strong>{" "}
                    {isEditing ? (
                      <input
                        className="edit-input"
                        type="text"
                        value={getValue("requestorName")}
                        onChange={handleFieldChange("requestorName")}
                      />
                    ) : (
                      getValue("requestorName")
                    )}
                  </p>
                </div>
              </div>
            </div>
            {getValue("content") && renderContent()}
            <div className="request-details-section">
              <h4>Request Summary</h4>
              <div className="summary-grid">
                {renderRequestTypeField()}
                {renderEditableField(
                  "Urgency:",
                  "urgency",
                  "select",
                  1,
                  false,
                  ["LOW", "MEDIUM", "HIGH"]
                )}
                <div>
                  <p>Estimated Duration:</p>
                  <p className="summary-value">
                    {formatDuration(currentDuration)}
                  </p>
                </div>
                {renderEditableField(
                  "Scheduled Start Time:",
                  "scheduledStartTime",
                  "datetime-local"
                )}
                {renderEditableField(
                  "Scheduled End Time:",
                  "scheduledEndTime",
                  "datetime-local"
                )}
                {renderEditableField("Address:", "address")}
                {renderEditableField("Postcode:", "postcode")}
                {renderEditableField(
                  "Additional Notes:",
                  "notes",
                  "text",
                  3,
                  true
                )}
              </div>
            </div>
            <div className="request-details-section">
              <h4>Attached Documents</h4>
              {attachment ? (
                <a
                  href={attachment}
                  target="_blank"
                  rel="noreferrer"
                  className="attachment-link"
                >
                  📄 {attachment.split("/").pop()}
                </a>
              ) : (
                <p className="attachment-link">No documents attached.</p>
              )}
            </div>

            <CheckboxGroup
              label=""
              options={sendToRosteringOption}
              value={sendToRostering === true}
              onChange={(checked) => setSendToRostering(checked === true)}
              multiple={false}
              row={true}
            />
          </>
        )}

        {isPending && (
          <div className="modal-details-actions" style={{ flexWrap: "nowrap" }}>
            {isEditing ? (
              <>
                <button
                  className="save-btn"
                  onClick={handleSaveEdit}
                  disabled={loading}
                >
                  {loading ? <LoadingState /> : "Save Changes"}
                </button>
                <button className="cancel-btn" onClick={handleCancelEdit}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  className="approve-btn"
                  onClick={handleApprove}
                  disabled={loading}
                >
                  {loading ? <LoadingState /> : "Approve"}
                </button>

                <button className="decline-btn" onClick={handleDecline}>
                  Decline
                </button>
                <button className="edit-btn" onClick={enterEditMode}>
                  Edit Request
                </button>

                {/* {!hasChecked && (
                  <button
                    className="check-btn"
                    onClick={handleCheckEligible}
                    disabled={loading}
                  >
                    {loading ? <LoadingState /> : "Check Eligibility"}
                  </button>
                )}

                {hasChecked && (
                  <button
                    className="check-btn view-report-btn"
                    onClick={handleViewEligibilityReport}
                    disabled={loading}
                  >
                    View Eligibility Report
                  </button>
                )} */}
              </>
            )}
          </div>
        )}
      </div>
      <ToastNotification successMessage={successMsg} errorMessage={errorMsg} />
    </Modal>
  );
};
export default RequestDetailsModal;
