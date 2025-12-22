// EditServiceRequest.jsx
import React, { useState, useEffect } from "react";
import {
  ArrowLeftIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { getField, getFileExtension } from "../../../utils/helpers";
import InputField from "../../../components/Input/InputField";
import SelectField from "../../../components/Input/SelectField";
import FileUploader from "../../../components/FileUploader/FileUploader";
import SuccessOrErrorModal from "../../../components/Modal/SuccessOrErrorModal";
import LoadingState from "../../../components/LoadingState";
import { apiClient } from "../../../config";
import { updateInternalRequest } from "../../CompanyDashboard/Requests/config/apiConfig";
import AlertModal from "../../../components/Modal/AlertModal";

const EditServiceRequest = ({ request, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // Prefilled form state
  const [formData, setFormData] = useState({
    serviceType: "",
    serviceDescription: "",
    priorityLevel: "",
    desiredCompletionDate: "",
    requesterName: "",
    requesterDepartment: "",
    requesterContactInfo: "",
    specialInstructions: "",
  });

  // Original data for comparison
  const [originalData, setOriginalData] = useState(null);

  // File states
  const [initialDocumentUrl, setInitialDocumentUrl] = useState(null);
  const [newFile, setNewFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [removed, setRemoved] = useState(false);

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

  // Helper functions
  const titleCase = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const getFileName = (url) => {
    if (!url) return "document";
    const cleanUrl = url.split("?")[0];
    return cleanUrl.split("/").pop() || "document";
  };

  // Load request data from props
  useEffect(() => {
    if (!request) {
      setError("No request data provided");
      setShowErrorModal(true);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        // Map API fields to form fields
        const mappedData = {
          serviceType: getField(request, "service_type") || "",
          serviceDescription: getField(request, "service_description") || "",
          priorityLevel: titleCase(getField(request, "priority_level")) || "",
          desiredCompletionDate: getField(request, "desired_completion_date")
            ? new Date(getField(request, "desired_completion_date"))
                .toISOString()
                .split("T")[0]
            : "",
          requesterName: getField(request, "requester_name") || "",
          requesterDepartment: getField(request, "requester_department") || "",
          requesterContactInfo:
            getField(request, "requester_contact_info") || "",
          specialInstructions: getField(request, "special_instructions") || "",
        };
        setFormData(mappedData);
        setOriginalData(mappedData);

        // Handle existing file preview
        const url = getField(request, "additional_attachment_url");
        setInitialDocumentUrl(url);
        setRemoved(false);
        setNewFile(null);
        if (url) {
          const ext = getFileExtension(url).toLowerCase();
          const isImage = ["jpg", "jpeg", "png", "gif", "svg"].includes(ext);
          const isPdf = ext === "pdf";
          if (isImage || isPdf) {
            setFilePreview(url);
          } else {
            setFilePreview(null);
          }
        } else {
          setFilePreview(null);
        }
      } catch (err) {
        console.error("Error mapping request data:", err);
        setError("Failed to load request data");
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [request]);

  // Check if form has changes
  const formChanged = JSON.stringify(formData) !== JSON.stringify(originalData);
  const fileChanged = !!newFile || removed;
  const hasChanges = formChanged || fileChanged;

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle supporting file change
  const handleSupportingFileChange = (file) => {
    if (file) {
      setNewFile(file);
      const preview = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null;
      setFilePreview(preview);
      setRemoved(false);
    }
  };

  // Remove file
  const removeSupportingFile = () => {
    setNewFile(null);
    setFilePreview(null);
    if (initialDocumentUrl) {
      setRemoved(true);
    }
  };

  const renderSupportingDocument = () => {
    if (newFile) {
      // For new file, let FileUploader handle preview (image blob or icon)
      return (
        <div style={{ marginTop: "1rem" }}>
          <FileUploader
            preview={filePreview || ""}
            currentFile={newFile}
            onFileChange={handleSupportingFileChange}
            onRemove={removeSupportingFile}
            acceptedFileTypes="all"
            uploadText="Click or drag and drop to change file"
          />
        </div>
      );
    }

    if (initialDocumentUrl && !removed) {
      const ext = getFileExtension(initialDocumentUrl).toLowerCase();
      const fileName = getFileName(initialDocumentUrl);
      const isImage = ["jpg", "jpeg", "png", "gif", "svg"].includes(ext);
      const isPdf = ext === "pdf";

      if (isImage || isPdf) {
        return (
          <>
            <div className="GHuh-Form-Input">
              <label>Current Supporting File</label>
              <div
                style={{
                  marginTop: "1rem",
                  border: "1px solid #ddd",
                  padding: "1rem",
                  borderRadius: "4px",
                }}
              >
                {isImage ? (
                  <img
                    src={initialDocumentUrl}
                    alt={fileName}
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      display: "block",
                      marginBottom: "1rem",
                    }}
                  />
                ) : (
                  <iframe
                    src={initialDocumentUrl}
                    width="100%"
                    height="500px"
                    style={{
                      border: "none",
                      display: "block",
                      marginBottom: "1rem",
                    }}
                    title={fileName}
                  />
                )}
                <p style={{ margin: 0, fontWeight: "bold" }}>{fileName}</p>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <button
                    type="button"
                    className="GenFlt-BTn btn-primary-bg"
                    // style={{ padding: "0.25rem 0.5rem", fontSize: "0.875rem" }}
                    onClick={removeSupportingFile}
                  >
                    Remove File
                  </button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <FileUploader
                preview=""
                currentFile={null}
                onFileChange={handleSupportingFileChange}
                onRemove={() => {}}
                acceptedFileTypes="all"
                uploadText="Click or drag and drop to replace"
              />
            </div>
          </>
        );
      } else {
        // Other file types: show name and buttons
        return (
          <>
            <div className="GHuh-Form-Input">
              <label>Current Supporting File</label>
              <div
                style={{
                  marginTop: "1rem",
                  border: "1px solid #ddd",
                  padding: "1rem",
                  borderRadius: "4px",
                }}
              >
                <DocumentIcon
                  className="h-10 w-10 text-gray-600"
                  style={{ display: "block", marginBottom: "0.5rem" }}
                />
                <p style={{ margin: 0, fontWeight: "bold" }}>{fileName}</p>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <button
                    type="button"
                    className="GenFlt-BTn btn-primary-bg"
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.875rem" }}
                    onClick={removeSupportingFile}
                  >
                    Remove File
                  </button>
                </div>
              </div>
            </div>
            <div style={{ marginTop: "1rem" }}>
              <FileUploader
                preview=""
                currentFile={null}
                onFileChange={handleSupportingFileChange}
                onRemove={() => {}}
                acceptedFileTypes="all"
                uploadText="Click or drag and drop to replace"
              />
            </div>
          </>
        );
      }
    }

    // No file or removed: show uploader
    return (
      <>
        <label>Upload Supporting File (Optional)</label>
        <div style={{ marginTop: "1rem" }}>
          <FileUploader
            preview={filePreview || ""}
            currentFile={newFile || null}
            onFileChange={handleSupportingFileChange}
            onRemove={removeSupportingFile}
            acceptedFileTypes="all"
            uploadText="Click or drag and drop to upload"
          />
        </div>
      </>
    );
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanges) return;

    if (!request) {
      setError("No request data available");
      setShowErrorModal(true);
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (new Date(formData.desiredCompletionDate) < new Date(today)) {
      alert("Desired completion date cannot be in the past.");
      return;
    }

    const payload = {
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
      const id = request.id;
      let response;
      if (fileChanged) {
        const fd = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          fd.append(key, value);
        });
        if (newFile) {
          fd.append("additional_attachment", newFile);
        } else if (removed) {
          fd.append("additional_attachment", null);
        }
        response = await apiClient.patch(
          `/api/talent-engine/requests/${id}/`,
          fd,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        response = await updateInternalRequest(id, payload);
      }
      // Handle success
      setModalType("success");
      setModalTitle("Request Updated Successfully");
      setModalMessage("Your service request has been updated successfully.");
      setShowModal(true);
    } catch (err) {
      console.error("Error updating request:", err);
      setModalType("error");
      setModalTitle("Error Updating Request");
      setModalMessage(
        err.response?.data?.message ||
          "An error occurred while updating the request. Please try again."
      );
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (modalType === "success") {
      onUpdate();
    }
  };

  const handleViewList = () => {
    setShowModal(false);
    onClose();
    if (modalType === "success") {
      onUpdate();
    }
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
    setError(null);
  };

  return (
    <div className="GenForm-Page">
      <div className="form-header">
        <h2>
          <span onClick={onClose} style={{ cursor: "pointer" }}>
            <ArrowLeftIcon className="h-6 w-6 inline" />
          </span>
          Edit Service Request
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="Davv-Pils">
          <div className="Davv-Pils-Box">
            <div className="form-section">
              <h3>Fill in your request details</h3>

              <SelectField
                label="Service Type"
                name="serviceType"
                value={formData.serviceType}
                options={serviceTypeOptions}
                onChange={handleChange}
              />

              <div className="GHuh-Form-Input">
                <label>Detailed Service Description</label>
                <div>
                  <textarea
                    name="serviceDescription"
                    value={formData.serviceDescription}
                    onChange={handleChange}
                    rows={4}
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
                />
              </div>

              <h6>Requester Information</h6>
              <InputField
                label="Name"
                name="requesterName"
                value={formData.requesterName}
                onChange={handleChange}
              />

              <InputField
                label="Department"
                name="requesterDepartment"
                value={formData.requesterDepartment}
                onChange={handleChange}
              />

              <InputField
                label="Contact information (email, phone)"
                name="requesterContactInfo"
                value={formData.requesterContactInfo}
                onChange={handleChange}
              />

              {renderSupportingDocument()}

              <div className="GHuh-Form-Input">
                <label>Special instructions or notes (Optional)</label>
                <div>
                  <textarea
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="GHuh-Form-Input">
                <button
                  type="submit"
                  className="GenFlt-BTn btn-primary-bg"
                  disabled={!hasChanges || loading}
                >
                  {loading ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <SuccessOrErrorModal
        isOpen={showModal}
        onClose={handleModalClose}
        type={modalType}
        name="Service Request"
        title={modalTitle}
        message={modalMessage}
        showAddAnother={false}
        isFinalStep={true}
        onViewList={handleViewList}
      />

      {showErrorModal && (
        <AlertModal
          title="Error"
          message={error}
          onClose={handleErrorModalClose}
        />
      )}
    </div>
  );
};

export default EditServiceRequest;
