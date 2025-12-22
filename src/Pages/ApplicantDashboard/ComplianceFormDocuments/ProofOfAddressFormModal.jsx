import React, { useState } from "react";
import { motion } from "framer-motion";
import Modal from "../../../components/Modal";
import InputField from "../../../components/Input/InputField";
import SelectField from "../../../components/Input/SelectField";
import FileUploader from "../../../components/FileUploader/FileUploader";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import {
  validateIssueDate,
  getMaxDate,
  getMinDate,
} from "../../../utils/helpers";

const ProofOfAddressFormModal = ({
  formData,
  handleChange,
  handleProofOfAddressFileChange,
  removeProofOfAddressFile,
  proofOfAddressFileRef,
  handleProofOfAddressNinFileChange,
  removeProofOfAddressNinFile,
  proofOfAddressNinRef,
  showModal,
  setShowModal,
  addressProofOptions = [],
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
    console.error("ProofOfAddressForm Error:", {
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

    if (!formData.addressProofType?.trim()) {
      newErrors.addressProofType = "Please select proof of address type";
    }

    if (!formData.utilityBill) {
      newErrors.utilityBill = "Please upload proof of address document";
    }

    // Validate issue date
    if (
      formData.utilityBillDate &&
      !validateIssueDate(formData.utilityBillDate)
    ) {
      newErrors.utilityBillDate = "Issue date cannot be more than 3 months ago";
    }

    if (!uniqueLink) {
      newErrors.general =
        "Unique link is missing. Please refresh the page and try again.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Custom handleChange function that includes date validation
  const handleChangeWithValidation = (e) => {
    const { name, value } = e.target;

    // Clear previous error when user starts typing/selecting
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // If it's the date field, validate immediately
    if (name === "utilityBillDate" && value) {
      if (!validateIssueDate(value)) {
        setErrors((prev) => ({
          ...prev,
          utilityBillDate: "Issue date cannot be more than 3 months ago",
        }));
      }
    }

    handleChange(e);
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
        key !== "utilityBill" &&
        key !== "ninFile"
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

      // Always append Proof of Address document
      if (formData.utilityBill) {
        formDataToSend.append("documents", formData.utilityBill);
        formDataToSend.append(
          "names",
          selectedComplianceItem?.title || "Proof of Address"
        );
      }

      // Append NIN document if present
      if (formData.ninFile) {
        formDataToSend.append("documents", formData.ninFile);
        formDataToSend.append(
          "names",
          selectedComplianceItem?.title || "Proof of Address"
        );
      }

      // Append specific fields
      if (formData.addressProofType) {
        formDataToSend.append("addressProofType", formData.addressProofType);
      }
      if (formData.utilityBillDate) {
        formDataToSend.append("utilityBillDate", formData.utilityBillDate);
      }
      if (formData.nin) {
        formDataToSend.append("nin", formData.nin);
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
      showAlert("Proof of address submitted successfully!", "success");
      // window.location.reload();
    } catch (error) {
      const { errorMessage, errorDetails } = handleApiError(
        error,
        "Failed to submit proof of address. Please try again."
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
      title="Proof of Address Document Upload"
      message="Please provide the required proof of address information and upload the supporting document."
    >
      <div className="document-form">
        <SelectField
          label="Type *"
          name="addressProofType"
          options={addressProofOptions}
          value={formData.addressProofType || ""}
          onChange={handleChangeWithValidation}
          error={errors.addressProofType}
          required
        />
        <p className="note">ⓘ Within the last 3 months</p>

        <FileUploader
          title="Upload Proof of Address *"
          preview={formData.utilityBillPreview || ""}
          currentFile={formData.utilityBill}
          onFileChange={handleProofOfAddressFileChange}
          onRemove={removeProofOfAddressFile}
          ref={proofOfAddressFileRef}
          acceptedFileTypes="all"
          uploadText="Click to upload proof of address"
          required
          error={errors.utilityBill}
        />

        <InputField
          type="date"
          label="Date of Issue"
          name="utilityBillDate"
          value={formData.utilityBillDate || ""}
          onChange={handleChangeWithValidation}
          error={errors.utilityBillDate}
          min={getMinDate()}
          max={getMaxDate()}
        />

        <InputField
          type="text"
          label="National Insurance Number (NIN)"
          name="nin"
          value={formData.nin || ""}
          onChange={handleChangeWithValidation}
          error={errors.nin}
        />

        <div style={{ marginTop: "12px" }}>
          <FileUploader
            title="Upload NIN Document"
            preview={formData.ninPreview || ""}
            currentFile={formData.ninFile}
            onFileChange={handleProofOfAddressNinFileChange}
            onRemove={removeProofOfAddressNinFile}
            ref={proofOfAddressNinRef}
            acceptedFileTypes="all"
            uploadText="Click to upload NIN document"
            error={errors.ninFile}
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
              !formData.addressProofType ||
              !formData.utilityBill ||
              errors.utilityBillDate
            }
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity:
                isSubmitting ||
                !formData.addressProofType ||
                !formData.utilityBill ||
                errors.utilityBillDate
                  ? 0.6
                  : 1,
              cursor:
                isSubmitting ||
                !formData.addressProofType ||
                !formData.utilityBill ||
                errors.utilityBillDate
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

export default ProofOfAddressFormModal;
