import React from "react";
import { IoMdClose } from "react-icons/io";
import { FiDownload } from "react-icons/fi";
import "./styles.css";

const FilePreviewModal = ({
  showPreview,
  previewFile,
  previewType,
  onClose,
  fileName = "Document",
}) => {
  if (!showPreview) return null;
  console.log(previewType);

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div
        className="preview-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="preview-modal-header">
          <h3>File Preview - {fileName}</h3>
          <button className="close-button" onClick={onClose}>
            <IoMdClose />
          </button>
        </div>
        <div className="preview-modal-body">
          {previewType === "image" && (
            <img
              src={previewFile}
              alt="Document preview"
              className="preview-image"
            />
          )}
          {previewType === "pdf" && (
            <iframe
              src={previewFile}
              title="PDF preview"
              className="preview-pdf"
              width="100%"
              height="500px"
            />
          )}
          {previewType === "other" && (
            <div className="preview-other">
              <div className="file-icon">
                <FiDownload size={48} />
              </div>
              <p>This file type cannot be previewed.</p>
              <a
                href={previewFile}
                target="_blank"
                rel="noopener noreferrer"
                className="download-button"
                download
              >
                <FiDownload /> Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
