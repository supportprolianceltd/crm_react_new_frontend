import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IoArrowBack } from "react-icons/io5";
import InputField from "../../../../../components/Input/InputField";
import {
  updateInternalRequest,
} from "../../config/apiConfig";
import "../../../../../components/Input/form.css";
import "./RequestDetailsPage.css";
import StatusBadge from "../../../../../components/StatusBadge";
import SuccessOrErrorModal from "../../../../../components/Modal/SuccessOrErrorModal";
import ApproveRejectRequestModal from "../../modals/ApproveRejectRequestModal";
import ToastNotification from "../../../../../components/ToastNotification";

const titleCase = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const formatLabel = (str) => {
  if (!str) return "";
  return str
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const getTitle = (type) => {
  switch (type) {
    case "leave":
      return "Leave Request Details";
    case "material":
      return "Material Request Details";
    case "service":
      return "Service Request Details";
    default:
      return "Request Details";
  }
};

const getDescription = (type) => {
  switch (type) {
    case "leave":
      return "Review the leave request and take appropriate action.";
    case "material":
      return "Review the requested materials and take appropriate action.";
    case "service":
      return "Review the service request and take appropriate action.";
    default:
      return "Review the request and take appropriate action.";
  }
};

export default function RequestDetails({ requestData, onClose, onRefresh }) {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [actionType, setActionType] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (!requestData) return;

    setLoading(true);
    try {
      const data = { ...requestData };
      // console.log(data);

      // Add computed fields
      data.title = getTitle(data.request_type);
      data.description = getDescription(data.request_type);
      data.requestDate = data.created_at
        ? new Date(data.created_at).toLocaleDateString("en-GB")
        : "";
      data.status = data.status
        ? data.status.charAt(0).toUpperCase() + data.status.slice(1)
        : "Pending";

      data.requesterFirstName = data.requested_by?.first_name || "Unknown";
      data.requesterLastName = data.requested_by?.last_name || "Unknown";
      data.requesterEmail = data.requested_by?.email || "";
      data.requesterJobRole = data.requested_by?.job_role || "";

      console.log(data.request_type);

      if (data.request_type === "leave") {
        data.leaveType = titleCase(data.leave_category);
        data.numberOfDays = data.number_of_days?.toString() || "";
        data.startDate = data.start_date
          ? new Date(data.start_date).toLocaleDateString("en-GB")
          : "";
        data.resumptionDate = data.resumption_date
          ? new Date(data.resumption_date).toLocaleDateString("en-GB")
          : "";
        data.additionalInformation = data.additional_information || "";
        data.regionOfStay = titleCase(data.region_of_stay);
        data.addressDuringLeave = data.address_during_leave || "";
        data.contactPhoneNumber = data.contact_phone_number || "";
      } else if (data.request_type === "material") {
        data.requestItem = data.item_name || "";
        data.materialType = titleCase(data.material_type);
        data.requestId = data.request_id || "";
        data.specification = data.item_specification || "";
        data.quantity = data.quantity_needed?.toString() || "";
        data.priority = titleCase(data.priority);
        data.reason = data.reason_for_request || "";
        data.neededDate = data.needed_date
          ? new Date(data.needed_date).toLocaleDateString("en-GB")
          : "";
      } else if (data.request_type === "service") {
        data.serviceType = formatLabel(data.service_type);
        data.serviceDescription = data.service_description || "";
        data.priority = titleCase(data.priority_level);
        data.desiredCompletionDate = data.desired_completion_date
          ? new Date(data.desired_completion_date).toLocaleDateString("en-GB")
          : "";
        data.specialInstructions = data.special_instructions || "";
      }

      setFormData(data);
    } catch (error) {
      console.error("Error processing request details:", error);
    } finally {
      setLoading(false);
    }
  }, [requestData]);

  const handleApproveClick = () => {
    setActionType("approved");
    setShowCommentForm(true);
  };

  const handleRejectClick = () => {
    setActionType("rejected");
    setShowCommentForm(true);
  };

  const handleCommentSubmit = async (submittedComment) => {
    if (!submittedComment?.trim()) {
      setErrorMessage("Please enter a comment.");
      return;
    }
    try {
      await updateInternalRequest(requestData.id, {
        status: actionType,
        comment: submittedComment,
      });
      setModalType("success");
      setModalTitle(`Request ${actionType} Successfully`);
      setModalMessage(`The request has been ${actionType} successfully.`);
      setShowCommentForm(false);
      setActionType("");
    } catch (error) {
      console.error(`Error ${actionType} request:`, error);
      setModalType("error");
      setModalTitle(
        `Error ${
          actionType.charAt(0).toUpperCase() + actionType.slice(1)
        } Request`
      );
      setModalMessage(
        error?.response?.data?.message ||
          `An error occurred while ${actionType} the request. Please try again.`
      );
    }
    setShowModal(true);
  };

  const handleCommentCancel = () => {
    setShowCommentForm(false);
    setActionType("");
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (modalType === "success") {
      onClose();
      onRefresh?.();
    }
  };

  const handleViewList = () => {
    setShowModal(false);
    if (modalType === "success") {
      onClose();
      onRefresh?.();
    }
  };

  const isPending = formData.status?.toLowerCase() === "pending";

  return (
    <motion.div
      className="form-page"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="leave-header">
        <div
          className="header-left"
          onClick={onClose}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <IoArrowBack size={22} style={{ marginRight: "8px" }} />
          <h2>{formData.title}</h2>
        </div>
        <StatusBadge status={formData.status} />
      </div>
      <p>{formData.description}</p>

      {/* Requester Information Section */}
      <div className="form-section contact" style={{ marginBottom: "1rem" }}>
        <h3>Requester Information</h3>
        <div className="input-row" style={{ flexWrap: "nowrap" }}>
          {/* <InputField
            label="First Name"
            value={formData.requesterFirstName}
            readOnly
          />
          <InputField
            label="Last Name"
            value={formData.requesterLastName}
            readOnly
          /> */}
        </div>
        <div className="input-row" style={{ flexWrap: "nowrap" }}>
          <InputField label="Email" value={formData.requesterEmail} readOnly />
          <InputField
            label="Job Role"
            value={formData.requesterJobRole}
            readOnly
          />
        </div>
      </div>

      {/* Leave Details Section */}
      {formData.request_type === "leave" && (
        <div className="form-section contact">
          <h3>Leave Details</h3>
          <div className="input-row" style={{ flexWrap: "nowrap" }}>
            <InputField
              label="Leave Type"
              value={formData.leaveType}
              readOnly
            />
            <InputField
              label="Request Date"
              value={formData.requestDate}
              readOnly
            />
          </div>
          <div className="input-row" style={{ flexWrap: "nowrap" }}>
            <InputField
              label="Start Date"
              value={formData.startDate}
              readOnly
            />
            <InputField
              label="Resumption Date"
              value={formData.resumptionDate}
              readOnly
            />
          </div>
          <div className="input-row" style={{ flexWrap: "nowrap" }}>
            <InputField
              label="Region of Stay During Leave"
              value={formData.regionOfStay}
              readOnly
            />
            <InputField
              label="Address During Leave"
              value={formData.addressDuringLeave}
              readOnly
            />
          </div>
          <div className="input-row" style={{ flexWrap: "nowrap" }}>
            <InputField
              label="Number of Days"
              value={formData.numberOfDays}
              readOnly
            />
            <InputField
              label="Contact Phone Number While on Leave"
              value={formData.contactPhoneNumber}
              readOnly
            />
          </div>

          <div className="GHuh-Form-Input">
            <label>Additional Information (Optional)</label>
            <textarea
              value={formData.additionalInformation}
              readOnly
              rows={3}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                resize: "vertical",
              }}
            />
          </div>
          {formData.additional_attachment_url && (
            <div className="GHuh-Form-Input">
              <label>Supporting Document</label>
              <a
                href={formData.additional_attachment_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Document
              </a>
            </div>
          )}
        </div>
      )}

      {/* Material Requested Section */}
      {formData.request_type === "material" && (
        <div className="form-section contact">
          <h3>Material Requested</h3>
          <div className="input-row" style={{ flexWrap: "nowrap" }}>
            <InputField
              label="Request Item"
              value={formData.requestItem}
              readOnly
            />
            <InputField
              label="Material Type"
              value={formData.materialType}
              readOnly
            />
          </div>
          <InputField
            label="Request ID (Auto Generated)"
            value={formData.requestId}
            readOnly
          />
          <InputField
            label="Item Specification"
            value={formData.specification}
            readOnly
          />
          <div className="input-row" style={{ flexWrap: "nowrap" }}>
            <InputField
              label="Quantity Needed"
              value={formData.quantity}
              readOnly
            />
            <InputField label="Priority" value={formData.priority} readOnly />
          </div>
          <InputField
            label="Reason for Request"
            value={formData.reason}
            readOnly
          />
          <InputField
            label="Needed Date"
            value={formData.neededDate}
            readOnly
          />
          {formData.supporting_document_url && (
            <div className="GHuh-Form-Input">
              <label>Supporting Document</label>
              <a
                href={formData.supporting_document_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Document
              </a>
            </div>
          )}
        </div>
      )}

      {/* Service Request Section */}
      {formData.request_type === "service" && (
        <div className="form-section contact">
          <h3>Service Request Details</h3>
          <InputField
            label="Service Type"
            value={formData.serviceType}
            readOnly
          />
          <div className="GHuh-Form-Input">
            <label>Detailed Service Description</label>
            <textarea
              value={formData.serviceDescription}
              readOnly
              rows={4}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                resize: "vertical",
              }}
            />
          </div>
          <div className="input-row" style={{ flexWrap: "nowrap" }}>
            <InputField
              label="Priority Level"
              value={formData.priority}
              readOnly
            />
            <InputField
              label="Desired Completion Date"
              value={formData.desiredCompletionDate}
              readOnly
            />
          </div>
          <div className="GHuh-Form-Input">
            <label>Special Instructions or Notes (Optional)</label>
            <textarea
              value={formData.specialInstructions}
              readOnly
              rows={3}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                resize: "vertical",
              }}
            />
          </div>
          {formData.additional_attachment_url && (
            <div className="GHuh-Form-Input">
              <label>Supporting Document</label>
              <a
                href={formData.additional_attachment_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Document
              </a>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        {isPending && (
        <>
          <button className="btn-approve" onClick={handleApproveClick}>
            Approve
          </button>
          <button className="btn-decline" onClick={handleRejectClick}>
            Reject
          </button>
        </>
        )}
      </div>

      {/* Comment Form */}
      {showCommentForm && (
        <ApproveRejectRequestModal
          isOpen={showCommentForm}
          onClose={handleCommentCancel}
          actionType={actionType}
          onSubmit={handleCommentSubmit}
        />
      )}

      <SuccessOrErrorModal
        isOpen={showModal}
        onClose={handleModalClose}
        type={modalType}
        name="Request"
        title={modalTitle}
        message={modalMessage}
        showAddAnother={false}
        isFinalStep={true}
        onViewList={handleViewList}
      />

      <ToastNotification errorMessage={errorMessage} successMessage={null} />
    </motion.div>
  );
}
