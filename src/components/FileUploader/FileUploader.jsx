import { useState, forwardRef } from "react";
import {
  CloudArrowUpIcon,
  XMarkIcon,
  DocumentTextIcon,
  DocumentIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import "./styles.css";
import { FaFilePdf } from "react-icons/fa6";
import { formatFileSize } from "../../utils/helpers";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

const FileUploader = forwardRef(
  (
    {
      title,
      preview,
      onFileChange,
      onRemove,
      acceptedFileTypes = "image",
      uploadText = "Click to upload your file",
      currentFile, // The actual file object
    },
    ref
  ) => {
    const [error, setError] = useState(null);
    const uniqueId = `file-upload-${Math.random().toString(36).substr(2, 9)}`;

    // Define accepted types based on the prop
    const getAcceptedTypes = () => {
      switch (acceptedFileTypes) {
        case "image":
          return {
            types: ["image/jpeg", "image/png", "image/svg+xml", "image/gif"],
            extensions: "image/*",
            displayText: "SVG, PNG, JPG or GIF (max. size: 800x400px, 2MB)",
          };
        case "document":
          return {
            types: [
              "application/pdf",
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ],
            extensions: ".pdf,.doc,.docx",
            displayText: "PDF, DOC, DOCX (Max 2MB)",
          };
        case "all":
        default:
          return {
            types: [
              "image/jpeg",
              "image/png",
              "image/svg+xml",
              "image/gif",
              "application/pdf",
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ],
            extensions: "image/*,.pdf,.doc,.docx",
            displayText: "PNG, JPG, SVG, PDF, DOC (Max 2MB)",
          };
      }
    };

    const { types, extensions, displayText } = getAcceptedTypes();

    const isImageFile = (file) => {
      return file?.type?.startsWith("image/");
    };

    const isPDFFile = (file) => {
      return file?.type === "application/pdf";
    };

    const isWordFile = (file) => {
      return (
        file?.type === "application/msword" ||
        file?.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
    };

    // const formatFileSize = (bytes) => {
    //   if (bytes < 1024) return `${bytes} B`;
    //   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    //   return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    // };

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      setError(null);

      if (!file) return;

      // Validate file type
      if (!types.includes(file.type)) {
        setError(`Only ${displayText.split(" (")[0]} files are allowed`);
        return;
      }

      // Validate file size (2MB)
      if (file.size > MAX_FILE_SIZE) {
        setError("File size exceeds 2MB limit");
        return;
      }

      // For images, validate they're actually images
      if (isImageFile(file)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => onFileChange(file);
          img.onerror = () =>
            setError("The selected file is not a valid image");
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        // For non-image files, create preview URL and proceed
        const preview = URL.createObjectURL(file);
        onFileChange(file, preview);
      }
    };

    const renderPreview = () => {
      if (!preview && !currentFile) return null;

      const file = currentFile || {};
      const fileSize = file.size ? formatFileSize(file.size) : "";

      if (isImageFile(file)) {
        return (
          <div className="preview-content">
            <div className="image-preview-container">
              <img
                src={preview || URL.createObjectURL(file)}
                alt="Preview"
                className="file-preview-image"
              />
            </div>
            <div className="file-info">
              <span className="file-name">{file.name}</span>
              <span className="file-size">{fileSize}</span>
            </div>
          </div>
        );
      }

      if (isPDFFile(file)) {
        return (
          <div className="preview-content">
            <div className="document-icon-container">
              <FaFilePdf style={{ color: "#e53e3e" }} />
            </div>
            <div className="file-info">
              <span className="file-name">{file.name}</span>
              <span className="file-size">{fileSize}</span>
            </div>
          </div>
        );
      }

      if (isWordFile(file)) {
        return (
          <div className="preview-content">
            <div className="document-icon-container">
              <DocumentIcon className="document-icon word-icon" />
            </div>
            <div className="file-info">
              <span className="file-name">{file.name}</span>
              <span className="file-size">{fileSize}</span>
            </div>
          </div>
        );
      }

      // Fallback for unknown types or when only preview URL is available
      return (
        <div className="preview-content">
          <div className="document-icon-container">
            <PhotoIcon className="document-icon" />
          </div>
          <div className="file-info">
            <span className="file-name">{file.name || "Uploaded file"}</span>
            {fileSize && <span className="file-size">{fileSize}</span>}
          </div>
        </div>
      );
    };

    return (
      <div className="upload-area">
        {preview || currentFile ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="file-preview-container"
          >
            {renderPreview()}
            <button
              type="button"
              onClick={onRemove}
              className="remove-file-btn"
              aria-label="Remove file"
            >
              <XMarkIcon className="remove-icon" />
            </button>
          </motion.div>
        ) : (
          <>
            <input
              type="file"
              id={uniqueId}
              accept={extensions}
              onChange={handleFileChange}
              ref={ref}
              className="file-input"
            />
            <label htmlFor={uniqueId} className="upload-label">
              <CloudArrowUpIcon className="upload-icon" />
              <p>{uploadText}</p>
              <p className="file-types">{displayText}</p>
            </label>
            {error && <p className="error-message">{error}</p>}
          </>
        )}
      </div>
    );
  }
);

export default FileUploader;
