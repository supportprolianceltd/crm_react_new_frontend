import React, { useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import InputField from "../../../components/Input/InputField";
import SelectField from "../../../components/Input/SelectField";
import FileUploader from "../../../components/FileUploader/FileUploader";
import SuccessOrErrorModal from "../../../components/Modal/SuccessOrErrorModal";
import { createInternalRequest } from "../../CompanyDashboard/Requests/config/apiConfig";
import { apiClient } from "../../../config";

const NewMaterialRequest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    requestItem: "",
    materialType: "",
    requestId: "",
    specification: "",
    quantityNeeded: "",
    priority: "",
    reason: "",
    neededDate: "",
    supportingFile: null,
    supportingFilePreview: null,
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSupportingFileChange = (file) => {
    if (file) {
      const preview = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null;
      setFormData((prev) => ({
        ...prev,
        supportingFile: file,
        supportingFilePreview: preview,
      }));
    }
  };

  const removeSupportingFile = () => {
    setFormData((prev) => ({
      ...prev,
      supportingFile: null,
      supportingFilePreview: null,
    }));
  };

  const resetForm = () => {
    setFormData({
      requestItem: "",
      materialType: "",
      specification: "",
      quantityNeeded: "",
      priority: "",
      reason: "",
      neededDate: "",
      supportingFile: null,
      supportingFilePreview: null,
    });
  };

  const isFormComplete = () => {
    const quantity = parseInt(formData.quantityNeeded);
    return (
      formData.requestItem &&
      formData.materialType &&
      formData.specification &&
      quantity > 0 &&
      formData.priority &&
      formData.reason &&
      formData.neededDate
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormComplete()) return;

    const payload = {
      request_type: "material",
      title: `Request for ${formData.requestItem}`,
      status: "pending",
      item_name: formData.requestItem,
      material_type: formData.materialType.toLowerCase(),
      item_specification: formData.specification,
      quantity_needed: parseInt(formData.quantityNeeded),
      priority: formData.priority.toLowerCase(),
      reason_for_request: formData.reason,
      needed_date: formData.neededDate,
    };

    setLoading(true);

    try {
      let response;
      if (formData.supportingFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          fd.append(key, value);
        });
        fd.append("supporting_document", formData.supportingFile);
        response = await apiClient.post("/api/talent-engine/requests/", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await createInternalRequest(payload);
      }
      // Handle success
      setModalType("success");
      setModalTitle("Request Created Successfully");
      setModalMessage("Your material request has been submitted successfully.");
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
          Material Request
        </h2>
        <p>Create a new request</p>
      </div>

      <div className="Davv-Pils">
        <div className="Davv-Pils-Box">
          <div className="form-section">
            <h3>Fill in your request details</h3>

            <form onSubmit={handleSubmit}>
              <div className="input-row">
                <InputField
                  label="Item Name"
                  name="requestItem"
                  value={formData.requestItem}
                  onChange={handleChange}
                />
                <SelectField
                  label="Material Type"
                  name="materialType"
                  value={formData.materialType}
                  options={["PPE", "Consumables", "Equipment", "Others"]}
                  onChange={handleChange}
                />
              </div>

              {/* <SelectField
                label="Request ID"
                name="requestId"
                value={formData.requestId}
                options={["876566"]}
                onChange={handleChange}
              /> */}

              <InputField
                label="Item Specification"
                name="specification"
                value={formData.specification}
                onChange={handleChange}
              />

              <InputField
                label="Quantity Needed"
                type="number"
                name="quantityNeeded"
                value={formData.quantityNeeded}
                onChange={handleChange}
                min="1"
              />

              <SelectField
                label="Priority"
                name="priority"
                value={formData.priority}
                options={["Low", "Medium", "High"]}
                onChange={handleChange}
              />

              <InputField
                label="Reason for request"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
              />

              <InputField
                label="Needed Date"
                type="date"
                name="neededDate"
                value={formData.neededDate}
                onChange={handleChange}
                min={today}
              />

              <div className="GHuh-Form-Input">
                <label>Upload Supporting File (Optional)</label>
              </div>
              <FileUploader
                preview={formData.supportingFilePreview || ""}
                currentFile={formData.supportingFile}
                onFileChange={handleSupportingFileChange}
                onRemove={removeSupportingFile}
                acceptedFileTypes="all"
                uploadText="Click or drag and drop to upload"
              />

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
        name="Material Request"
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

export default NewMaterialRequest;
