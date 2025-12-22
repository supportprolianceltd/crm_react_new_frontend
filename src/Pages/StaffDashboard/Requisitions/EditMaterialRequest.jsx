// EditMaterialRequest.jsx
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
import AlertModal from "../../../components/Modal/AlertModal";
import { apiClient } from "../../../config";
import { updateInternalRequest } from "../../CompanyDashboard/Requests/config/apiConfig";

const EditMaterialRequest = ({ request, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // Prefilled form state
  const [formData, setFormData] = useState({
    requestItem: "",
    materialType: "",
    requestId: "",
    specification: "",
    quantity: "",
    priority: "",
    reason: "",
    neededDate: "",
  });

  // Original data for comparison
  const [originalData, setOriginalData] = useState(null);

  // File states
  const [initialDocumentUrl, setInitialDocumentUrl] = useState(null);
  const [newFile, setNewFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [removed, setRemoved] = useState(false);

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

  // Load request data from props
  useEffect(() => {
    if (!request) {
      setError("No request data provided");
      setShowErrorModal(true);
      setLoading(false);
      return;
    }

    const loadData = () => {
      try {
        setLoading(true);
        // Map API fields to form fields
        const mappedData = {
          requestItem: getField(request, "item_name") || "",
          materialType: titleCase(getField(request, "material_type")) || "",
          requestId: getField(request, "request_id") || "",
          specification: getField(request, "item_specification") || "",
          quantity: getField(request, "quantity_needed")?.toString() || "",
          priority: titleCase(getField(request, "priority")) || "",
          reason: getField(request, "reason_for_request") || "",
          neededDate: getField(request, "needed_date")
            ? new Date(getField(request, "needed_date"))
                .toISOString()
                .split("T")[0]
            : "",
        };
        setFormData(mappedData);
        setOriginalData(mappedData);

        // Handle existing file preview
        const url = getField(request, "supporting_document_url");
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
    if (new Date(formData.neededDate) < new Date(today)) {
      alert("Needed date cannot be in the past.");
      return;
    }

    const payload = {
      item_name: formData.requestItem,
      material_type: formData.materialType.toLowerCase(),
      item_specification: formData.specification,
      quantity_needed: parseInt(formData.quantity) || 0,
      priority: formData.priority.toLowerCase(),
      reason_for_request: formData.reason,
      needed_date: formData.neededDate,
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
          fd.append("supporting_document", newFile);
        } else if (removed) {
          fd.append("supporting_document", null);
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
      setModalMessage("Your material request has been updated successfully.");
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

  const requestId = getField(request, "request_id") || "";

  return (
    <div className="GenForm-Page">
      <div className="form-header">
        <h2>
          <span onClick={onClose} style={{ cursor: "pointer" }}>
            <ArrowLeftIcon className="h-6 w-6 inline" />
          </span>
          Edit Request
        </h2>
        <p>Edit request - (Request ID: {requestId})</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="Davv-Pils">
          <div className="Davv-Pils-Box">
            <div className="form-section">
              <h3>Fill in your request details</h3>

              <div className="input-row">
                <InputField
                  label="Request Item"
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

              <InputField
                label="Request ID (Auto Generated)"
                name="requestId"
                value={formData.requestId}
                readOnly
              />

              <InputField
                label="Item Specification"
                name="specification"
                value={formData.specification}
                onChange={handleChange}
              />

              <InputField
                label="Quantity Needed"
                type="number"
                name="quantity"
                value={formData.quantity}
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
              />

              {renderSupportingDocument()}

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
        name="Material Request"
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

export default EditMaterialRequest;
