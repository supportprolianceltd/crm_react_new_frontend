import React, { useState } from "react";
import { motion } from "framer-motion";
import Modal from "../../../components/Modal";
import CheckboxGroup from "../../../components/CheckboxGroup";
import SelectField from "../../../components/Input/SelectField";
import InputField from "../../../components/Input/InputField";
import FileUploader from "../../../components/FileUploader/FileUploader";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import { disableFutureDates, disablePastDates } from "../../../utils/helpers";

const DrivingStatusFormModal = ({
  formData,
  handleChange,
  handleDrivingLicenseFrontChange,
  drivingLicenseFrontRef,
  removeDrivingLicenseFront,
  handleDrivingLicenseBackChange,
  drivingLicenseBackRef,
  removeDrivingLicenseBack,
  handleVehicleTypeChange,
  showModal,
  setShowModal,
  uniqueLink,
  jobApplicationId,
  email,
  onComplianceUpdate,
  selectedComplianceItem,
  showAlert,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const options = [
    { label: "Personal Vehicle", value: "Personal Vehicle" },
    { label: "Company Vehicle", value: "Company Vehicle" },
    { label: "Both", value: "Both" },
  ];

  const handleVehicleTypeInternalChange = (selectedValue) => {
    if (handleVehicleTypeChange) {
      handleVehicleTypeChange(selectedValue);
    }
  };

  // Function to log errors to console and external service if needed
  const logError = (error, context = {}) => {
    console.error("DrivingStatusForm Error:", {
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

    if (!formData.drivingLicenseFront) {
      newErrors.drivingLicenseFront =
        "Please upload driver's licence front image";
    }

    if (!formData.drivingLicenseBack) {
      newErrors.drivingLicenseBack =
        "Please upload driver's licence back image";
    }

    if (!formData.vehicleType?.length) {
      newErrors.vehicleType = "Please select vehicle type";
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
        !key.includes("drivingLicenseFront") &&
        !key.includes("drivingLicenseBack")
      ) {
        commonData.append(key, value);
      }
    });

    // Handle array fields like vehicleType
    if (formData.vehicleType && Array.isArray(formData.vehicleType)) {
      formData.vehicleType.forEach((item) => {
        commonData.append("vehicleType", item);
      });
    }

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

      // Append Driving License Front
      if (formData.drivingLicenseFront) {
        formDataToSend.append("documents", formData.drivingLicenseFront);
        formDataToSend.append(
          "names",
          selectedComplianceItem?.title || "Driving License"
        );
      }

      // Append Driving License Back
      if (formData.drivingLicenseBack) {
        formDataToSend.append("documents", formData.drivingLicenseBack);
        formDataToSend.append(
          "names",
          selectedComplianceItem?.title || "Driving License"
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
      showAlert("Driving status submitted successfully!", "success");
      // window.location.reload();
    } catch (error) {
      const { errorMessage, errorDetails } = handleApiError(
        error,
        "Failed to submit driving status. Please try again."
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
      title="Driving Status & Permissions"
      message="Please provide driving status information, availability, and system permissions."
    >
      <div className="document-form">
        <>
          <p
            className="vehicle-type-header"
            style={{ color: "#5B616D", fontSize: 13 }}
          >
            Type of Vehicle Used *
          </p>
          <div className="vehicle-type-radio-group">
            <CheckboxGroup
              options={options}
              value={formData.vehicleType}
              onChange={handleVehicleTypeInternalChange}
            />
            {errors.vehicleType && (
              <span className="error-message">{errors.vehicleType}</span>
            )}
          </div>

          <div style={{ marginTop: "12px" }}>
            <FileUploader
              title="Upload Driver's Licence - Front *"
              preview={formData.drivingLicenseFrontPreview || ""}
              currentFile={formData.drivingLicenseFront}
              onFileChange={handleDrivingLicenseFrontChange}
              onRemove={removeDrivingLicenseFront}
              ref={drivingLicenseFrontRef}
              acceptedFileTypes="all"
              uploadText="Click to upload Drivers Licence. Front Image"
              required
              error={errors.drivingLicenseFront}
            />
          </div>

          <div style={{ marginTop: "12px" }}>
            <FileUploader
              title="Upload Driver's Licence - Back *"
              preview={formData.drivingLicenseBackPreview || ""}
              currentFile={formData.drivingLicenseBack}
              onFileChange={handleDrivingLicenseBackChange}
              onRemove={removeDrivingLicenseBack}
              ref={drivingLicenseBackRef}
              acceptedFileTypes="all"
              uploadText="Click to upload Drivers Licence. Back Image"
              required
              error={errors.drivingLicenseBack}
            />
          </div>

          <SelectField
            label="Country of Issue"
            name="countryOfDrivingLicenseIssue"
            options={["UK", "USA", "Nigeria", "Other"]}
            value={formData.countryOfDrivingLicenseIssue || ""}
            onChange={handleChange}
            error={errors.countryOfDrivingLicenseIssue}
          />

          <div className="input-row">
            <InputField
              type="date"
              label="Date Issued"
              name="drivingLicenseIssueDate"
              value={formData.drivingLicenseIssueDate || ""}
              onChange={handleChange}
              error={errors.drivingLicenseIssueDate}
              max={disableFutureDates()}
            />

            <InputField
              type="date"
              label="Expiry Date"
              name="drivingLicenseExpiryDate"
              value={formData.drivingLicenseExpiryDate || ""}
              onChange={handleChange}
              error={errors.drivingLicenseExpiryDate}
              min={disablePastDates()}
            />
          </div>

          <InputField
            label="Insurance Provider"
            name="driversLicenseInsuranceProvider"
            value={formData.driversLicenseInsuranceProvider || ""}
            onChange={handleChange}
            error={errors.driversLicenseInsuranceProvider}
          />

          <InputField
            type="date"
            label="Insurance Expiry Date"
            name="driversLicenseInsuranceExpiryDate"
            value={formData.driversLicenseInsuranceExpiryDate || ""}
            onChange={handleChange}
            error={errors.driversLicenseInsuranceExpiryDate}
            min={disablePastDates()}
          />

          <SelectField
            label="Issuing Authority"
            name="driversLicenseIssuingAuthority"
            options={["DVLA", "DVA", "Other"]}
            value={formData.driversLicenseIssuingAuthority || ""}
            onChange={handleChange}
            error={errors.driversLicenseIssuingAuthority}
          />

          <InputField
            label="Policy Number"
            name="policyNumber"
            value={formData.policyNumber || ""}
            onChange={handleChange}
            error={errors.policyNumber}
          />
        </>

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
              !formData.vehicleType?.length ||
              !formData.drivingLicenseFront ||
              !formData.drivingLicenseBack
            }
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity:
                isSubmitting ||
                !formData.vehicleType?.length ||
                !formData.drivingLicenseFront ||
                !formData.drivingLicenseBack
                  ? 0.6
                  : 1,
              cursor:
                isSubmitting ||
                !formData.vehicleType?.length ||
                !formData.drivingLicenseFront ||
                !formData.drivingLicenseBack
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

export default DrivingStatusFormModal;
