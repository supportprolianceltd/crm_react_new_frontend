import { useEffect } from "react";
import { PencilIcon } from "../../../../assets/icons/PencilIcon";
import { IoMdClose } from "react-icons/io";
import { FiPlus, FiTrash2, FiEye } from "react-icons/fi";
import FileUploader from "../../../../components/FileUploader/FileUploader";
import FilePreviewModal from "../../../../components/Modal/FilePreviewModal";
import useFilePreview from "../../../../hooks/useFilePreview";

const IDAndDocumentsStep = ({
  formData,
  isEditing,
  handleEditToggle,
  handleInputChange,
  handleIDAndDocumentsFileChange,
  removeIDAndDocumentsFile,
  idAndDocumentsFileRef,
  addIDAndDocumentsRecord,
  removeIDAndDocumentsRecord,
}) => {
  const {
    previewFile,
    previewType,
    showPreview,
    handlePreviewFile,
    closePreview,
    canPreviewFile,
  } = useFilePreview();

  // Automatically add an empty ID record when entering edit mode if none exist
  useEffect(() => {
    if (isEditing.idAndDocuments && formData.idAndDocuments.length === 0) {
      addIDAndDocumentsRecord();
    }
  }, [
    isEditing.idAndDocuments,
    formData.idAndDocuments,
    addIDAndDocumentsRecord,
  ]);

  if (!formData) return null;

  // Helper function to handle file preview for ID documents
  const handleIDDocumentPreview = (document) => {
    handlePreviewFile({
      file: document.idAndDocumentsFile,
      fileUrl: document.idAndDocumentsFileUrl,
      filePreview: document.idAndDocumentsFilePreview,
    });
  };

  // Helper function to check if ID document can be previewed
  const canPreviewIDDocument = (document) => {
    return canPreviewFile({
      file: document.idAndDocumentsFile,
      fileUrl: document.idAndDocumentsFileUrl,
      filePreview: document.idAndDocumentsFilePreview,
    });
  };

  return (
    <div className="step-form">
      {/* File Preview Modal */}
      <FilePreviewModal
        showPreview={showPreview}
        previewFile={previewFile}
        previewType={previewType}
        onClose={closePreview}
      />

      <div className="info-card">
        <div className="card-header">
          <h4>ID & Documents</h4>
          <div>
            <button
              className="edit-button"
              onClick={() => handleEditToggle("idAndDocuments")}
            >
              {isEditing.idAndDocuments ? (
                <>
                  Cancel <IoMdClose />
                </>
              ) : (
                <>
                  Edit <PencilIcon />
                </>
              )}
            </button>
          </div>
        </div>

        {formData.idAndDocuments?.length === 0 && !isEditing.idAndDocuments ? (
          <p>No ID documents available.</p>
        ) : (
          formData.idAndDocuments?.map((document, index) => {
            const isLast = index === formData.idAndDocuments.length - 1;

            return (
              <div
                key={index}
                className="info-grid"
                style={{
                  borderBottom: isLast ? "none" : "1px dashed #333",
                  padding: "20px 0",
                }}
              >
                <div className="info-item">
                  <label>Government ID Type</label>
                  {isEditing.idAndDocuments ? (
                    <select
                      name={`governmentIdType-${index}`}
                      value={document.governmentIdType || "Drivers Licence"}
                      onChange={(e) =>
                        handleInputChange(
                          "idAndDocuments",
                          "governmentIdType",
                          e.target.value,
                          index
                        )
                      }
                      className="edit-input"
                    >
                      <option value="Drivers Licence">Drivers Licence</option>
                      <option value="Passport">Passport</option>
                      <option value="National ID">National ID</option>
                      <option value="Residence Permit">Residence Permit</option>
                      <option value="Work Permit">Work Permit</option>
                    </select>
                  ) : (
                    <span>
                      {document.governmentIdType || "Drivers Licence"}
                    </span>
                  )}
                </div>

                <div className="info-item">
                  <label>Document Number</label>
                  {isEditing.idAndDocuments ? (
                    <input
                      type="text"
                      name={`documentNumber-${index}`}
                      value={document.documentNumber || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "idAndDocuments",
                          "documentNumber",
                          e.target.value,
                          index
                        )
                      }
                      className="edit-input"
                      placeholder="Enter document number"
                    />
                  ) : (
                    <span>{document.documentNumber || "-"}</span>
                  )}
                </div>

                <div className="info-item">
                  <label>Document Expiry Date</label>
                  {isEditing.idAndDocuments ? (
                    <input
                      type="date"
                      name={`documentExpiryDate-${index}`}
                      value={document.documentExpiryDate || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "idAndDocuments",
                          "documentExpiryDate",
                          e.target.value,
                          index
                        )
                      }
                      className="edit-input"
                    />
                  ) : (
                    <span>{document.documentExpiryDate || "-"}</span>
                  )}
                </div>

                <div className="info-item">
                  <label>Upload ID Document</label>
                  {isEditing.idAndDocuments ? (
                    <div className="certificate-upload-container">
                      <FileUploader
                        title="Upload ID Document"
                        currentFile={document.idAndDocumentsFile}
                        preview={document.idAndDocumentsFilePreview}
                        onFileChange={(file, preview) =>
                          handleIDAndDocumentsFileChange(index, file, preview)
                        }
                        onRemove={() => removeIDAndDocumentsFile(index)}
                        ref={idAndDocumentsFileRef?.[index] || null}
                        acceptedFileTypes="all"
                        uploadText="Click to upload ID (Image or PDF)"
                      />
                      {canPreviewIDDocument(document) && (
                        <button
                          className="preview-button"
                          onClick={() => handleIDDocumentPreview(document)}
                        >
                          <FiEye /> Preview
                        </button>
                      )}
                    </div>
                  ) : (
                    <span>
                      {document.idAndDocumentsFileUrl ||
                      document.idAndDocumentsFile ? (
                        <div className="file-actions">
                          <a
                            href={document.idAndDocumentsFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view-link"
                          >
                            View Document
                          </a>
                          <button
                            className="preview-button-small"
                            onClick={() => handleIDDocumentPreview(document)}
                          >
                            <FiEye />
                          </button>
                        </div>
                      ) : (
                        "-"
                      )}
                    </span>
                  )}
                </div>

                {/* Remove Button */}
                {isEditing.idAndDocuments &&
                  formData.idAndDocuments.length > 1 && (
                    <div className="button-container">
                      <button
                        className="icon-button remove-icon-button"
                        onClick={() => removeIDAndDocumentsRecord(index)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  )}
              </div>
            );
          })
        )}

        {/* Add Button */}
        {isEditing.idAndDocuments && (
          <button
            className="icon-button add-icon-button"
            onClick={addIDAndDocumentsRecord}
          >
            <FiPlus />
          </button>
        )}
      </div>
    </div>
  );
};

export default IDAndDocumentsStep;
