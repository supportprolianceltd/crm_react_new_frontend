import React, { useState } from "react";
import { motion } from "framer-motion";
import Modal from "../../../components/Modal";
import SelectField from "../../../components/Input/SelectField";
import InputField from "../../../components/Input/InputField";
import FileUploader from "../../../components/FileUploader/FileUploader";
import ToggleButton from "../../../components/ToggleButton";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { API_BASE_URL } from "../../../config";

import { disableFutureDates } from "../../../utils/helpers";

const DBSCertificateFormModal = ({
  formData,
  handleChange,
  handleDbsCertificateChange,
  removeDbsCertificate,
  dbsCertificateRef,
  handleDbsUpdateServiceChange,
  removeDbsUpdateService,
  dbsUpdateServiceRef,
  handleToggleChange,
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
    console.error("DBSCertificateForm Error:", {
      error,
      timestamp: new Date().toISOString(),
      jobApplicationId,
      uniqueLink,
      ...context,
    });
  };

  // Function to handle API errors specifically
  const handleApiError = (error, defaultMessage) => {
    let errorMessage = defaultMessage;
    let errorDetails = {};

    if (error.response) {
      const { status, data } = error.response;

      logError(error, { status, responseData: data });

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
      logError(error, { noResponse: true });
      errorMessage =
        "Network error. Please check your connection and try again.";
    } else {
      logError(error);
    }

    return { errorMessage, errorDetails };
  };

  // Function to validate form data
  const validateForm = () => {
    const newErrors = {};

    if (!formData.dbsCertificate) {
      newErrors.dbsCertificate = "Please upload DBS certificate";
    }

    if (!formData.dbsType?.trim()) {
      newErrors.dbsType = "Please select type of DBS";
    }

    // Validate issue dates
    if (formData.dbsIssueDate) {
      const issueDate = new Date(formData.dbsIssueDate);
      const today = new Date();

      if (issueDate > today) {
        newErrors.dbsIssueDate = "Issue date cannot be in the future";
      }
    }

    if (formData.dbsUpdateIssueDate) {
      const updateIssueDate = new Date(formData.dbsUpdateIssueDate);
      const today = new Date();

      if (updateIssueDate > today) {
        newErrors.dbsUpdateIssueDate = "Issue date cannot be in the future";
      }
    }

    if (!uniqueLink) {
      newErrors.general =
        "Unique link is missing. Please refresh the page and try again.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to prepare common form data fields
  const prepareCommonFormData = () => {
    const commonData = new FormData();
    commonData.append("email", email);
    commonData.append("unique_link", uniqueLink);
    commonData.append("submit", "true");

    // Add other form fields (excluding file-specific ones)
    Object.entries(formData).forEach(([key, value]) => {
      if (
        value &&
        typeof value === "string" &&
        !key.includes("Preview") &&
        !key.includes("dbsCertificate") &&
        !key.includes("dbsUpdateService")
      ) {
        commonData.append(key, value);
      }
    });

    return commonData;
  };

  const handleSubmit = async () => {
    setErrors({});

    if (!validateForm()) {
      const firstErrorKey = Object.keys(errors)[0];
      showAlert(errors[firstErrorKey], "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare a single FormData for all documents
      const formDataToSend = prepareCommonFormData();

      // Always append DBS Certificate
      if (formData.dbsCertificate) {
        formDataToSend.append("documents", formData.dbsCertificate);
        formDataToSend.append(
          "names",
          selectedComplianceItem?.title || "DBS Certificate"
        );
      }

      // Append DBS Update Service if present
      if (formData.dbsUpdateService) {
        formDataToSend.append("documents", formData.dbsUpdateService);
        formDataToSend.append(
          "names",
          selectedComplianceItem?.title || "DBS Certificate"
        );
      }

      // Append specific fields
      if (formData.dbsType) {
        formDataToSend.append("dbsType", formData.dbsType);
      }
      if (formData.dbsCertificateNumber) {
        formDataToSend.append(
          "dbsCertificateNumber",
          formData.dbsCertificateNumber
        );
      }
      if (formData.dbsIssueDate) {
        formDataToSend.append("dbsIssueDate", formData.dbsIssueDate);
      }
      if (formData.dbsUpdateCertificateNumber) {
        formDataToSend.append(
          "dbsUpdateCertificateNumber",
          formData.dbsUpdateCertificateNumber
        );
      }
      if (formData.dbsUpdateIssueDate) {
        formDataToSend.append(
          "dbsUpdateIssueDate",
          formData.dbsUpdateIssueDate
        );
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/applications-engine/applications/applicant/upload/${jobApplicationId}/compliance-update/`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (onComplianceUpdate) {
        onComplianceUpdate();
      }

      setShowModal(false);
      showAlert("DBS certificate submitted successfully!", "success");
      // window.location.reload();
    } catch (error) {
      const { errorMessage, errorDetails } = handleApiError(
        error,
        "Failed to submit DBS certificate. Please try again."
      );

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
    setErrors({});
  };

  return (
    <Modal
      isOpen={showModal}
      onClose={handleModalClose}
      title="DBS Certificate Upload"
      message="Please provide the required DBS certificate information and upload the supporting documents."
    >
      <div className="document-form">
        <SelectField
          label="Type of DBS *"
          name="dbsType"
          options={["Basic", "Standard", "Enhanced"]}
          value={formData.dbsType || ""}
          onChange={handleChange}
          error={errors.dbsType}
          required
        />

        <div className="section-title">1. DBS Certificate</div>

        <FileUploader
          title="Upload DBS Certificate *"
          preview={formData.dbsCertificatePreview || ""}
          currentFile={formData.dbsCertificate}
          onFileChange={handleDbsCertificateChange}
          onRemove={removeDbsCertificate}
          ref={dbsCertificateRef}
          acceptedFileTypes="all"
          uploadText="Click to upload DBS certificate"
          required
          error={errors.dbsCertificate}
        />

        <InputField
          label="Certificate Number"
          name="dbsCertificateNumber"
          value={formData.dbsCertificateNumber || ""}
          onChange={handleChange}
          error={errors.dbsCertificateNumber}
        />

        <InputField
          type="date"
          label="Issue Date"
          name="dbsIssueDate"
          value={formData.dbsIssueDate || ""}
          onChange={handleChange}
          error={errors.dbsIssueDate}
          max={disableFutureDates()} // Prevent future dates
        />

        {/* DBS UPDATE SERVICE SECTION */}
        <div className="section-title">
          2. DBS Update Service Registration (if applicable)
        </div>

        <FileUploader
          title="Upload DBS Update Service Document"
          preview={formData.dbsUpdateServicePreview || ""}
          currentFile={formData.dbsUpdateService}
          onFileChange={handleDbsUpdateServiceChange}
          onRemove={removeDbsUpdateService}
          ref={dbsUpdateServiceRef}
          acceptedFileTypes="all"
          uploadText="Click to upload DBS update service document"
          error={errors.dbsUpdateService}
        />

        <InputField
          label="Certificate Number"
          name="dbsUpdateCertificateNumber"
          value={formData.dbsUpdateCertificateNumber || ""}
          onChange={handleChange}
          error={errors.dbsUpdateCertificateNumber}
        />

        <InputField
          type="date"
          label="Issue Date"
          name="dbsUpdateIssueDate"
          value={formData.dbsUpdateIssueDate || ""}
          onChange={handleChange}
          error={errors.dbsUpdateIssueDate}
          max={disableFutureDates()} // Prevent future dates
        />

        {/* COMPLIANCE SECTION */}
        <h4 className="section-title" style={{ color: "#0A0C11" }}>
          System Compliance Actions
        </h4>
        <div className="compliance-item">
          <ToggleButton
            isOn={formData.realTimeStatusChecks || false}
            onToggle={(value) =>
              handleToggleChange("realTimeStatusChecks", value)
            }
          />
          <div className="compliance-content">
            <h4>Enable real time status checks</h4>
            <p>Next re check, in 11 months</p>
          </div>
        </div>
      </div>

      {errors.general && (
        <div className="alert-box error" style={{ marginTop: "1rem" }}>
          <ExclamationTriangleIcon className="h-4 w-4 inline mr-2" />
          {errors.general}
        </div>
      )}

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
          disabled={
            isSubmitting || !formData.dbsType || !formData.dbsCertificate
          }
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            opacity:
              isSubmitting || !formData.dbsType || !formData.dbsCertificate
                ? 0.6
                : 1,
            cursor:
              isSubmitting || !formData.dbsType || !formData.dbsCertificate
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
    </Modal>
  );
};

export default DBSCertificateFormModal;
