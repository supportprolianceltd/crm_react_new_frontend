import { useState, useEffect } from "react";
import Modal from "../../../../components/Modal";
import InputField from "../../../../components/Input/InputField";
import FileUploader from "../../../../components/FileUploader/FileUploader";
import ToastNotification from "../../../../components/ToastNotification";
import { uploadOnboardingDocument } from "../config/apiConfig";

const formatFileSize = (bytes) => {
  if (bytes === 0 || !bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const UploadOnboardingDocumentModal = ({
  isOpen,
  onClose,
  onUploadSuccess,
  initialFormData = null,
  documentId = null,
  currentTotalSizeBytes = 0,
  isUpdate = false,
  currentDocSize = 0,
}) => {
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    tags: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (isOpen && initialFormData) {
      setUploadForm({
        title: initialFormData.title || "",
        description: initialFormData.description || "",
        tags: initialFormData.tags || "",
      });
      setSelectedFile(null);
    } else if (isOpen && !initialFormData) {
      setUploadForm({
        title: "",
        description: "",
        tags: "",
      });
      setSelectedFile(null);
    }
  }, [isOpen, initialFormData]);

  const handleConfirmUpload = async () => {
    if (!selectedFile || !uploadForm.title.trim()) {
      setErrorMessage("Title and file are required");
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    // Check total size limit
    const MAX_SIZE = 10 * 1024 * 1024;
    const adjustment = isUpdate ? currentDocSize : 0;
    const projectedTotal =
      currentTotalSizeBytes - adjustment + selectedFile.size;
    if (projectedTotal > MAX_SIZE) {
      setErrorMessage(
        `Upload failed: Total size would exceed 10MB limit. Current total: ${formatFileSize(
          currentTotalSizeBytes - adjustment
        )}, New file: ${formatFileSize(
          selectedFile.size
        )}, Projected: ${formatFileSize(projectedTotal)}.`
      );
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", uploadForm.title.trim());
    formData.append("description", uploadForm.description.trim());
    if (uploadForm.tags.trim()) {
      formData.append("tags", uploadForm.tags.trim());
    }

    try {
      setIsUploading(true);
      const response = await uploadOnboardingDocument(formData, documentId);
      const newDocument = Array.isArray(response) ? response : [response];
      setSuccessMessage("Document uploaded successfully");
      setErrorMessage(null);
      onUploadSuccess(newDocument);
      setTimeout(() => {
        onClose();
        setUploadForm({ title: "", description: "", tags: "" });
        setSelectedFile(null);
      }, 1500);
    } catch (error) {
      setErrorMessage("Failed to upload document");
      setSuccessMessage(null);
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 3000);
    }
  };

  // ✅ Disable button if title or file is missing
  const isButtonDisabled =
    isUploading || !uploadForm.title.trim() || !selectedFile;

  return (
    <>
      <ToastNotification
        successMessage={successMessage}
        errorMessage={errorMessage}
      />
      <Modal isOpen={isOpen} onClose={onClose} title="Upload Document">
        <div style={{ display: "flex", flexDirection: "column" }}>
          <InputField
            label="Title *"
            name="title"
            value={uploadForm.title}
            onChange={(e) =>
              setUploadForm({ ...uploadForm, title: e.target.value })
            }
            placeholder="Enter document title"
          />
          <InputField
            label="Description"
            name="description"
            value={uploadForm.description}
            onChange={(e) =>
              setUploadForm({ ...uploadForm, description: e.target.value })
            }
            placeholder="Enter document description"
            multiline
          />
          <InputField
            label="Tags (comma separated)"
            name="tags"
            value={uploadForm.tags}
            onChange={(e) =>
              setUploadForm({ ...uploadForm, tags: e.target.value })
            }
            placeholder="e.g., onboarding, required, policy"
          />
          <FileUploader
            currentFile={selectedFile}
            onFileChange={(file) => setSelectedFile(file)}
            acceptedFileTypes="all"
            uploadText="Click to upload document"
          />
          <div
            className="modal-footer"
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "flex-end",
              marginTop: "1rem",
            }}
          >
            <button
              className="modal-button modal-button-cancel"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              className="modal-button modal-button-confirm"
              onClick={handleConfirmUpload}
              disabled={isButtonDisabled} // ✅ disable condition applied here
            >
              {isUploading ? "Uploading..." : "Confirm Upload"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UploadOnboardingDocumentModal;
