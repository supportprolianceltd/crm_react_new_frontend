import React, { useState } from "react";
import { motion } from "framer-motion";
import Modal from "../../../components/Modal";
import InputField from "../../../components/Input/InputField";
import SelectField from "../../../components/Input/SelectField";
import FileUploader from "../../../components/FileUploader/FileUploader";
import {
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import { disablePastDates } from "../../../utils/helpers";

const RightToWorkFormModal = ({
  formData,
  handleChange,
  handleRightToWorkFileChange,
  removeRightToWorkFile,
  rightToWorkFileRef,
  showModal,
  setShowModal,
  uniqueLink,
  jobApplicationId,
  email,
  onComplianceUpdate,
  showAlert,
  selectedComplianceItem,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Function to log errors to console and external service if needed
  const logError = (error, context = {}) => {
    console.error("RightToWorkForm Error:", {
      error,
      timestamp: new Date().toISOString(),
      jobApplicationId,
      uniqueLink,
      ...context,
    });

    // Here you can add additional error logging to external services
    // like Sentry, LogRocket, etc.
    /*
    if (window.Sentry) {
      window.Sentry.captureException(error, { extra: context });
    }
    */
  };

  // Function to handle API errors specifically
  const handleApiError = (error, defaultMessage) => {
    let errorMessage = defaultMessage;
    let errorDetails = {};

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      logError(error, { status, responseData: data });

      // Handle specific error cases
      if (
        status === 401 &&
        data.error === "Tenant schema or ID missing from token"
      ) {
        errorMessage =
          "Authentication error. Please refresh the page and try again.";
        errorDetails = { authError: true };
      } else if (status === 400) {
        errorMessage =
          data.message || "Invalid data provided. Please check your inputs.";
        errorDetails = data.errors || {};
      } else if (status === 403) {
        errorMessage = "You don't have permission to perform this action.";
      } else if (status === 404) {
        errorMessage = "The requested resource was not found.";
      } else if (status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else {
        errorMessage = data.message || defaultMessage;
      }
    } else if (error.request) {
      // Request was made but no response received
      logError(error, { noResponse: true });
      errorMessage =
        "Network error. Please check your connection and try again.";
    } else {
      // Something else happened
      logError(error);
    }

    return { errorMessage, errorDetails };
  };

  // Function to validate form data
  const validateForm = () => {
    const newErrors = {};

    // Email is now pre-filled, so just validate format
    if (!email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.rightToWorkFile) {
      newErrors.rightToWorkFile = "Please upload a document";
    }

    if (!uniqueLink) {
      newErrors.general =
        "Unique link is missing. Please refresh the page and try again.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      // Show the first error as an alert
      const firstErrorKey = Object.keys(errors)[0];
      showAlert(errors[firstErrorKey], "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      // Use the passed email (not from form input)
      formDataToSend.append("email", email);
      formDataToSend.append("unique_link", uniqueLink);
      formDataToSend.append("documents", formData.rightToWorkFile);
      formDataToSend.append(
        "names",
        selectedComplianceItem?.title || "Right to Work Document"
      );
      formDataToSend.append("document_ids", selectedComplianceItem?.id || "");

      // Other form fields (excluding email since it's already added)
      Object.entries(formData).forEach(([key, value]) => {
        if (
          value &&
          typeof value === "string" &&
          !key.includes("Preview") &&
          key !== "rightToWorkFile" &&
          key !== "unique_link"
        ) {
          formDataToSend.append(key, value);
        }
      });

      formDataToSend.append("submit", "true");

      const response = await axios.post(
        `${API_BASE_URL}/api/applications-engine/applications/applicant/upload/${jobApplicationId}/compliance-update/`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update compliance data
      if (onComplianceUpdate) {
        onComplianceUpdate(response.data);
      }

      // Close modal and reset form
      setShowModal(false);
      showAlert("Right to Work document submitted successfully!", "success");
      // window.location.reload();
    } catch (error) {
      const { errorMessage, errorDetails } = handleApiError(
        error,
        "Failed to submit Right to Work document. Please try again."
      );

      // Set field-specific errors if available
      if (errorDetails && typeof errorDetails === "object") {
        setErrors(errorDetails);
      }

      showAlert(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    // Clear errors when modal closes
    setErrors({});
  };

  return (
    <Modal
      isOpen={showModal}
      onClose={handleModalClose}
      title="Right to Work Document Upload"
      message="Please provide the required Right to Work information and upload the supporting document."
    >
      <div className="document-form">
        <SelectField
          label="Right to Work Status"
          name="rightToWorkStatus"
          options={["Citizen", "Visa Holder", "Work Permit", "Other"]}
          value={formData.rightToWorkStatus || ""}
          onChange={handleChange}
          error={errors.rightToWorkStatus}
        />

        <SelectField
          label="Passport Holder"
          name="passportHolder"
          options={["Yes", "No"]}
          value={formData.passportHolder || ""}
          onChange={handleChange}
          error={errors.passportHolder}
        />

        <SelectField
          label="Select Document"
          name="rightToWorkDocumentType"
          options={[
            "Biometric Residence Permit",
            "Passport",
            "National ID",
            "Residence Card",
            "Other",
          ]}
          value={formData.rightToWorkDocumentType || ""}
          onChange={handleChange}
          error={errors.rightToWorkDocumentType}
        />

        <div className="input-row">
          <InputField
            label="Document Number"
            name="rightToWorkDocumentNumber"
            value={formData.rightToWorkDocumentNumber || ""}
            onChange={handleChange}
            error={errors.rightToWorkDocumentNumber}
          />
          <InputField
            label="Document Expiry Date"
            name="rightToWorkDocumentExpiryDate"
            type="date"
            value={formData.rightToWorkDocumentExpiryDate || ""}
            onChange={handleChange}
            error={errors.rightToWorkDocumentExpiryDate}
            min={disablePastDates()}
          />
        </div>

        <InputField
          label="Share Code (if applicable)"
          name="shareCode"
          value={formData.shareCode || ""}
          onChange={handleChange}
          error={errors.shareCode}
        />

        <div style={{ marginTop: "1rem" }}>
          <FileUploader
            title="Upload Supporting Document *"
            currentFile={formData.rightToWorkFile}
            preview={formData.rightToWorkFilePreview}
            onFileChange={handleRightToWorkFileChange}
            onRemove={removeRightToWorkFile}
            ref={rightToWorkFileRef}
            acceptedFileTypes="all"
            uploadText="Click to upload supporting document"
            required
            error={errors.rightToWorkFile}
          />
        </div>

        <SelectField
          label="Country of Issue"
          name="countryOfIssue"
          options={["UK", "USA", "Nigeria", "Other"]}
          value={formData.countryOfIssue || ""}
          onChange={handleChange}
          error={errors.countryOfIssue}
        />

        <InputField
          label="Are there any restrictions on your right to work?"
          name="workRestrictions"
          value={formData.workRestrictions || ""}
          onChange={handleChange}
          placeholder="Describe any restrictions"
          error={errors.workRestrictions}
        />

        {/* Display general errors */}
        {/* {errors.general && (
          <div className="alert-box error" style={{ marginTop: "1rem" }}>
            <ExclamationTriangleIcon className="h-4 w-4 inline mr-2" />
            {errors.general}
          </div>
        )} */}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "1rem",
            width: "100%",
          }}
        >
          <button
            className="submit-btn btn-primary-bg"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.rightToWorkFile}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: isSubmitting || !formData.rightToWorkFile ? 0.6 : 1,
              cursor:
                isSubmitting || !formData.rightToWorkFile
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {isSubmitting ? (
              <>
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border: "3px solid #fff",
                    borderTopColor: "#646669",
                    display: "inline-block",
                  }}
                />
                Please wait while we process your submission...
              </>
            ) : (
              "Submit for Compliance Check"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RightToWorkFormModal;
