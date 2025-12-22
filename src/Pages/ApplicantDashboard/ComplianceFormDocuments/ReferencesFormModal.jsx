import React, { useState } from "react";
import { motion } from "framer-motion";
import Modal from "../../../components/Modal";
import InputField from "../../../components/Input/InputField";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const ReferencesFormModal = ({
  formData,
  handleChange,
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
    console.error("ReferencesForm Error:", {
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

    // Validate referee 1
    if (!formData.referee1Name?.trim()) {
      newErrors.referee1Name = "Referee 1 name is required";
    }
    if (!formData.referee1Email?.trim()) {
      newErrors.referee1Email = "Referee 1 email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.referee1Email)) {
      newErrors.referee1Email = "Referee 1 email is invalid";
    }
    if (!formData.referee1Phone?.trim()) {
      newErrors.referee1Phone = "Referee 1 phone number is required";
    }

    // Validate referee 2
    if (!formData.referee2Name?.trim()) {
      newErrors.referee2Name = "Referee 2 name is required";
    }
    if (!formData.referee2Email?.trim()) {
      newErrors.referee2Email = "Referee 2 email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.referee2Email)) {
      newErrors.referee2Email = "Referee 2 email is invalid";
    }
    if (!formData.referee2Phone?.trim()) {
      newErrors.referee2Phone = "Referee 2 phone number is required";
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
        "names",
        selectedComplianceItem?.title || "References"
      );

      // Add all referee fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value && typeof value === "string" && key.includes("referee")) {
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
      showAlert("References submitted successfully!", "success");
      // window.location.reload();
    } catch (error) {
      const { errorMessage, errorDetails } = handleApiError(
        error,
        "Failed to submit references. Please try again."
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
      title="Reference Checks"
      message="Please provide contact details for your professional references."
    >
      <div className="document-form">
        {/* Referee 1 */}
        <h4 style={{ marginTop: "1rem", color: "#0A0C11" }}>Referee 1</h4>
        <InputField
          label="Name of Referee 1 *"
          name="referee1Name"
          value={formData.referee1Name || ""}
          onChange={handleChange}
          error={errors.referee1Name}
          required
        />

        <InputField label="Phone Number *">
          <div className="phone-wrapper">
            <select
              name="referee1PhoneCode"
              value={formData.referee1PhoneCode || "+44"}
              onChange={handleChange}
            >
              <option value="+1">+1</option>
              <option value="+44">+44</option>
              <option value="+234">+234</option>
            </select>
            <input
              type="tel"
              name="referee1Phone"
              value={formData.referee1Phone || ""}
              onChange={handleChange}
              placeholder="Phone number"
            />
          </div>
          {errors.referee1Phone && (
            <span className="error-message">{errors.referee1Phone}</span>
          )}
        </InputField>

        <InputField
          label="Email *"
          type="email"
          name="referee1Email"
          value={formData.referee1Email || ""}
          onChange={handleChange}
          error={errors.referee1Email}
          required
        />

        <InputField
          label="Relationship to Applicant"
          name="referee1Relationship"
          value={formData.referee1Relationship || ""}
          onChange={handleChange}
          error={errors.referee1Relationship}
        />

        {/* Referee 2 */}
        <h4 style={{ marginTop: "1rem", color: "#0A0C11" }}>Referee 2</h4>
        <InputField
          label="Name of Referee 2 *"
          name="referee2Name"
          value={formData.referee2Name || ""}
          onChange={handleChange}
          error={errors.referee2Name}
          required
        />

        <InputField label="Phone Number *">
          <div className="phone-wrapper">
            <select
              name="referee2PhoneCode"
              value={formData.referee2PhoneCode || "+44"}
              onChange={handleChange}
            >
              <option value="+1">+1</option>
              <option value="+44">+44</option>
              <option value="+234">+234</option>
            </select>
            <input
              type="tel"
              name="referee2Phone"
              value={formData.referee2Phone || ""}
              onChange={handleChange}
              placeholder="Phone number"
            />
          </div>
          {errors.referee2Phone && (
            <span className="error-message">{errors.referee2Phone}</span>
          )}
        </InputField>

        <InputField
          label="Email *"
          type="email"
          name="referee2Email"
          value={formData.referee2Email || ""}
          onChange={handleChange}
          error={errors.referee2Email}
          required
        />

        <InputField
          label="Relationship to Applicant"
          name="referee2Relationship"
          value={formData.referee2Relationship || ""}
          onChange={handleChange}
          error={errors.referee2Relationship}
        />

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
            disabled={isSubmitting}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? "not-allowed" : "pointer",
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

export default ReferencesFormModal;
