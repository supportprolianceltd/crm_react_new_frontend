import React, { useState } from "react";
import { motion } from "framer-motion";
import Modal from "../../../components/Modal";
import InputField from "../../../components/Input/InputField";
import FileUploader from "../../../components/FileUploader/FileUploader";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { API_BASE_URL } from "../../../config";

const ProfessionalQualificationsFormModal = ({
  formData,
  handleChange,
  handleProfessionalQualificationChange,
  removeProfessionalQualification,
  professionalQualificationRef,
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
    console.error("ProfessionalQualificationsForm Error:", {
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

    if (!formData.professionalQualification?.trim()) {
      newErrors.professionalQualification = "Qualification name is required";
    }

    if (!formData.professionalQualificationFile) {
      newErrors.professionalQualificationFile =
        "Please upload qualification certificate";
    }

    if (!uniqueLink) {
      newErrors.general =
        "Unique link is missing. Please refresh the page and try again.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      const formDataToSend = new FormData();
      formDataToSend.append("email", email);
      formDataToSend.append("unique_link", uniqueLink);
      formDataToSend.append(
        "documents",
        formData.professionalQualificationFile
      );
      formDataToSend.append(
        "names",
        selectedComplianceItem?.title || "Professional Qualifications"
      );

      // Add other form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (
          value &&
          typeof value === "string" &&
          !key.includes("Preview") &&
          key !== "professionalQualificationFile"
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

      if (onComplianceUpdate) {
        onComplianceUpdate(response.data);
      }

      setShowModal(false);
      showAlert(
        "Professional qualification submitted successfully!",
        "success"
      );
      // window.location.reload();
    } catch (error) {
      const { errorMessage, errorDetails } = handleApiError(
        error,
        "Failed to submit professional qualification. Please try again."
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
      title="Professional Qualifications Upload"
      message="Please provide the professional qualification details and upload the certificate."
    >
      <div className="document-form">
        <InputField
          label="Qualification Name *"
          name="professionalQualification"
          value={formData.professionalQualification || ""}
          onChange={handleChange}
          error={errors.professionalQualification}
          required
        />

        <div style={{ marginTop: "1rem" }}>
          <FileUploader
            title="Upload Qualification Certificate *"
            preview={formData.professionalQualificationPreview || ""}
            currentFile={formData.professionalQualificationFile}
            onFileChange={handleProfessionalQualificationChange}
            onRemove={removeProfessionalQualification}
            ref={professionalQualificationRef}
            acceptedFileTypes="all"
            uploadText="Click to upload qualification certificate"
            required
            error={errors.professionalQualificationFile}
          />
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
              isSubmitting ||
              !formData.professionalQualification ||
              !formData.professionalQualificationFile
            }
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity:
                isSubmitting ||
                !formData.professionalQualification ||
                !formData.professionalQualificationFile
                  ? 0.6
                  : 1,
              cursor:
                isSubmitting ||
                !formData.professionalQualification ||
                !formData.professionalQualificationFile
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

export default ProfessionalQualificationsFormModal;
