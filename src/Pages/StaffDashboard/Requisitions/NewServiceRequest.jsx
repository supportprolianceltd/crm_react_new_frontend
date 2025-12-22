// NewServiceRequest.jsx
import React, { useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import InputField from "../../../components/Input/InputField";
import SelectField from "../../../components/Input/SelectField";
import FileUploader from "../../../components/FileUploader/FileUploader";
import SuccessOrErrorModal from "../../../components/Modal/SuccessOrErrorModal";
import { apiClient } from "../../../config";
import { createInternalRequest } from "../../CompanyDashboard/Requests/config/apiConfig";

const NewServiceRequest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    serviceType: "",
    serviceDescription: "",
    priorityLevel: "",
    desiredCompletionDate: "",
    requesterName: "",
    requesterDepartment: "",
    requesterContactInfo: "",
    specialInstructions: "",
    additionalAttachment: null,
    additionalAttachmentPreview: "",
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const serviceTypeOptions = [
    { value: "logistics", label: "Logistics (e.g., transportation, storage)" },
    { value: "training", label: "Training (e.g., workshops, courses)" },
    {
      value: "maintenance",
      label: "Maintenance (e.g., equipment, facilities)",
    },
    { value: "it_support", label: "IT Support (e.g., hardware, software)" },
    {
      value: "administrative_support",
      label: "Administrative Support (e.g., documentation, supplies)",
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleadditionalAttachmentChange = (file) => {
    if (file) {
      setFormData((prev) => ({ ...prev, additionalAttachment: file }));
      if (file.type.startsWith("image/")) {
        const preview = URL.createObjectURL(file);
        setFormData((prev) => ({
          ...prev,
          additionalAttachmentPreview: preview,
        }));
      } else {
        setFormData((prev) => ({ ...prev, additionalAttachmentPreview: "" }));
      }
    }
  };

  const removeadditionalAttachment = () => {
    setFormData((prev) => ({
      ...prev,
      additionalAttachment: null,
      additionalAttachmentPreview: "",
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      serviceType: "",
      serviceDescription: "",
      priorityLevel: "",
      desiredCompletionDate: "",
      requesterName: "",
      requesterDepartment: "",
      requesterContactInfo: "",
      specialInstructions: "",
      additionalAttachment: null,
      additionalAttachmentPreview: "",
    });
  };

  const isFormComplete = () => {
    return (
      formData.title &&
      formData.serviceType &&
      formData.serviceDescription.trim() !== "" &&
      formData.priorityLevel &&
      formData.desiredCompletionDate &&
      formData.requesterName.trim() !== "" &&
      formData.requesterDepartment.trim() !== "" &&
      formData.requesterContactInfo.trim() !== ""
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormComplete()) return;

    const today = new Date().toISOString().split("T")[0];
    if (new Date(formData.desiredCompletionDate) < new Date(today)) {
      alert("Desired completion date cannot be in the past.");
      return;
    }

    const payload = {
      request_type: "service",
      title: formData.title,
      service_type: formData.serviceType,
      service_description: formData.serviceDescription,
      priority_level: formData.priorityLevel.toLowerCase(),
      desired_completion_date: formData.desiredCompletionDate,
      requester_name: formData.requesterName,
      requester_department: formData.requesterDepartment,
      requester_contact_info: formData.requesterContactInfo,
      special_instructions: formData.specialInstructions,
    };

    setLoading(true);

    try {
      let response;
      if (formData.additionalAttachment) {
        const fd = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          fd.append(key, value);
        });
        fd.append("additional_attachment", formData.additionalAttachment);
        response = await apiClient.post("/api/talent-engine/requests/", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await createInternalRequest(payload);
      }

      // Handle success
      setModalType("success");
      setModalTitle("Request Created Successfully");
      setModalMessage("Your service request has been submitted successfully.");
      setShowModal(true);
    } catch (error) {
      // Error handling is managed in handleApiErrorWithValidation
      setModalType("error");
      setModalTitle("Error Creating Request");
      setModalMessage(
        error.response?.data?.message ||
          "An error occurred while creating the request. Please try again."
      );
      setShowModal(true);
      console.error("Failed to create request:", error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const handleModalClose = () => {
    setShowModal(false);
    navigate(-1);
  };

  const handleAddAnother = () => {
    setShowModal(false);
    resetForm();
  };

  const handleViewList = () => {
    setShowModal(false);
    navigate(-1);
  };

  return (
    <div className="GenForm-Page">
      <div className="form-header">
        <h2>
          <span onClick={() => navigate(-1)} style={{ cursor: "pointer" }}>
            <ArrowLeftIcon className="h-6 w-6 inline" />
          </span>
          Service Request
        </h2>
        <p>Create a new request</p>
      </div>

      <div className="Davv-Pils">
        <div className="Davv-Pils-Box">
          <div className="form-section">
            <h3>Fill in your service request details</h3>

            <form onSubmit={handleSubmit}>
              <InputField
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., IT Support for Laptop Repair"
              />

              <SelectField
                label="Service Type"
                name="serviceType"
                value={formData.serviceType}
                options={serviceTypeOptions}
                onChange={handleChange}
              />

              <div className="GHuh-Form-Input">
                <h6>Request Details</h6>
                {/* <label>Description of request</label>
                <div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Brief description of the request..."
                  />
                </div> */}
              </div>

              <div className="GHuh-Form-Input">
                <label>Detailed Service Description</label>
                <div>
                  <textarea
                    name="serviceDescription"
                    value={formData.serviceDescription}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Provide detailed information about the service needed..."
                  />
                </div>
              </div>

              <div className="input-row">
                <SelectField
                  label="Priority level"
                  name="priorityLevel"
                  value={formData.priorityLevel}
                  options={["Low", "Medium", "High"]}
                  onChange={handleChange}
                />
                <InputField
                  label="Desired completion date"
                  type="date"
                  name="desiredCompletionDate"
                  value={formData.desiredCompletionDate}
                  onChange={handleChange}
                  min={today}
                />
              </div>

              <h6>Requester Information</h6>
              <InputField
                label="Name"
                name="requesterName"
                value={formData.requesterName}
                onChange={handleChange}
                placeholder="Your full name"
              />

              <InputField
                label="Department"
                name="requesterDepartment"
                value={formData.requesterDepartment}
                onChange={handleChange}
                placeholder="Your department"
              />

              <InputField
                label="Contact information (email, phone)"
                name="requesterContactInfo"
                value={formData.requesterContactInfo}
                onChange={handleChange}
                placeholder="e.g., email@example.com, +2348012345678"
              />

              <div className="GHuh-Form-Input">
                <label>Upload Supporting File (Optional)</label>
              </div>
              <FileUploader
                preview={formData.additionalAttachmentPreview || ""}
                currentFile={formData.additionalAttachment}
                onFileChange={handleadditionalAttachmentChange}
                onRemove={removeadditionalAttachment}
                acceptedFileTypes="all"
                uploadText="Click or drag and drop to upload"
              />

              <div className="GHuh-Form-Input">
                <label>Special instructions or notes (Optional)</label>
                <div>
                  <textarea
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>

              <div className="GHuh-Form-Input">
                <button
                  type="submit"
                  className="GenFlt-BTn btn-primary-bg"
                  disabled={!isFormComplete() || loading}
                >
                  {loading ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <SuccessOrErrorModal
        isOpen={showModal}
        onClose={handleModalClose}
        type={modalType}
        name="Service Request"
        title={modalTitle}
        message={modalMessage}
        onAddAnother={handleAddAnother}
        onViewList={handleViewList}
        showAddAnother={true}
        isFinalStep={true}
      />
    </div>
  );
};

export default NewServiceRequest;
