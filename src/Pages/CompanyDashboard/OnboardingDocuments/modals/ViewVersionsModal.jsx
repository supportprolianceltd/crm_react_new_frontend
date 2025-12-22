// modals/ViewVersionsModal.jsx (updated)
import { useState, useEffect } from "react";
import Modal from "../../../../components/Modal";
import { fetchVersions } from "../config/apiConfig";
import { DocumentIcon } from "@heroicons/react/24/outline";
import LoadingState from "../../../../components/LoadingState";
import pdfIcon from "../../../../assets/icons/pdf.png";
import wordIcon from "../../../../assets/icons/word.png";
import excelIcon from "../../../../assets/icons/excel.png";
import txtIcon from "../../../../assets/icons/txt.png";
import imageIcon from "../../../../assets/icons/image.png";
import zipIcon from "../../../../assets/icons/zip.png";
import cadIcon from "../../../../assets/icons/cad.png";
import bimIcon from "../../../../assets/icons/bim.png";
import powerpointIcon from "../../../../assets/icons/powerpoint.png";
import defaultIcon from "../../../../assets/icons/file.png";

const formatFileSize = (bytes) => {
  if (bytes === 0 || !bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const getFileExtension = (fileType) => {
  if (!fileType) return "";
  return fileType.split("/").pop();
};

const getFileIcon = (ext) => {
  if (ext === "pdf") return pdfIcon;
  if (ext === "doc" || ext === "docx") return wordIcon;
  if (ext === "xls" || ext === "xlsx") return excelIcon;
  if (ext === "txt") return txtIcon;
  if (["jpg", "jpeg", "png", "gif"].includes(ext)) return imageIcon;
  if (ext === "zip") return zipIcon;
  if (ext === "dwg") return cadIcon;
  if (ext === "rvt") return bimIcon;
  if (ext === "ppt" || ext === "pptx") return powerpointIcon;
  return defaultIcon;
};

const ViewVersionsModal = ({ isOpen, onClose, documentId }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && documentId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const data = await fetchVersions(documentId);
          setVersions(data || []);
        } catch (err) {
          setError("Failed to load versions");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, documentId]);

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Versions">
        <LoadingState />
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Error">
        <div>{error}</div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Document Versions">
      <div className="view-modal-container">
        <div className="users-section">
          <h4 className="users-title">Versions ({versions.length})</h4>
          <div className="users-list-container">
            {versions.length > 0 ? (
              versions.map((version) => {
                const ext = getFileExtension(version.file_type);
                return (
                  <div key={version.version} className="user-item">
                    <img
                      src={getFileIcon(ext)}
                      alt={ext}
                      className="file-icon"
                      style={{
                        width: "24px",
                        height: "24px",
                        marginRight: "8px",
                      }}
                    />
                    <div className="user-info">
                      <span className="user-name">
                        Version {version.version} - {ext.toUpperCase()}
                      </span>
                      <span className="user-details">
                        Uploaded by: {version.created_by.first_name}&nbsp;
                        {version.created_by.last_name} (
                        {version.created_by.email}) |&nbsp;
                        {new Date(version.created_at).toLocaleString()} |
                        Size:&nbsp;
                        {formatFileSize(version.file_size)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="no-users-message">No versions available.</p>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="modal-button modal-button-cancel"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewVersionsModal;
