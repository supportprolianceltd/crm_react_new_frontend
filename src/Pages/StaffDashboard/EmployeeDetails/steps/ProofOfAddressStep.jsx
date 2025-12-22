import { useEffect } from "react";
import { PencilIcon } from "../../../../assets/icons/PencilIcon";
import { IoMdClose } from "react-icons/io";
import { FiPlus, FiTrash2, FiEye } from "react-icons/fi";
import FileUploader from "../../../../components/FileUploader/FileUploader";
import FilePreviewModal from "../../../../components/Modal/FilePreviewModal";
import useFilePreview from "../../../../hooks/useFilePreview";
import { getMaxDate, getMinDate } from "../../../../utils/helpers";

const addressProofOptions = [
  { value: "utility_bill", label: "Utility Bill" },
  { value: "bank_statement", label: "Bank Statement" },
  { value: "tenancy_agreement", label: "Tenancy Agreement" },
];

const ProofOfAddressStep = ({
  formData,
  isEditing,
  handleEditToggle,
  handleInputChange,
  handleUtilityBillUpload,
  removeUtilityBill,
  utilityBillRef,
  handleNinUpload,
  removeNin,
  ninRef,
  addProofOfAddressRecord,
  removeProofOfAddressRecord,
}) => {
  const {
    previewFile,
    previewType,
    showPreview,
    handlePreviewFile,
    closePreview,
    canPreviewFile,
  } = useFilePreview();

  // Automatically add a proof of address record when entering edit mode if none exists
  useEffect(() => {
    if (isEditing.proofOfAddress && formData.proofOfAddress.length === 0) {
      addProofOfAddressRecord();
    }
  }, [
    isEditing.proofOfAddress,
    formData.proofOfAddress,
    addProofOfAddressRecord,
  ]);

  if (!formData) return null;

  // Helper function to handle file preview for utility bill
  const handleUtilityBillPreview = (proof) => {
    handlePreviewFile({
      file: null,
      fileUrl: proof.utilityBill,
      filePreview: proof.utilityBillPreview,
    });
  };

  // Helper function to handle file preview for NIN document
  const handleNinPreview = (proof) => {
    handlePreviewFile({
      file: null,
      fileUrl: proof.ninFile,
      filePreview: proof.ninPreview,
    });
  };

  // Helper function to check if utility bill can be previewed
  const canPreviewUtilityBill = (proof) => {
    return canPreviewFile({
      file: proof.utilityBill,
      fileUrl: proof.utilityBill,
      filePreview: proof.utilityBillPreview,
    });
  };

  // Helper function to check if NIN document can be previewed
  const canPreviewNin = (proof) => {
    return canPreviewFile({
      file: proof.ninFile,
      fileUrl: proof.ninUrl,
      filePreview: proof.ninPreview,
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
          <h4>Proof of Address</h4>
          <div>
            <button
              className="edit-button"
              onClick={() => handleEditToggle("proofOfAddress")}
            >
              {isEditing.proofOfAddress ? (
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

        {formData.proofOfAddress.length === 0 && !isEditing.proofOfAddress ? (
          <p>No proof of address documents available.</p>
        ) : (
          formData.proofOfAddress.map((proof, index) => {
            const isLast = index === formData.proofOfAddress.length - 1;

            return (
              <div
                key={index}
                className="info-grid"
                style={{
                  borderBottom: isLast ? "none" : "1px dashed #333",
                  padding: "20px 0",
                }}
              >
                {/* Type */}
                <div className="info-item">
                  <label>Type</label>
                  {isEditing.proofOfAddress ? (
                    <>
                      <select
                        name={`addressProofType-${index}`}
                        value={proof.addressProofType || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "proofOfAddress",
                            "addressProofType",
                            e.target.value,
                            index
                          )
                        }
                        className="edit-input"
                      >
                        <option value="">Select Type</option>
                        {addressProofOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <p className="note">ⓘ Within the last 3 months</p>
                    </>
                  ) : (
                    <span>
                      {addressProofOptions.find(
                        (option) => option.value === proof.addressProofType
                      )?.label ||
                        proof.addressProofType ||
                        "-"}
                    </span>
                  )}
                </div>

                {/* Upload Proof of Address */}
                <div className="info-item">
                  <label>Upload Proof of Address</label>
                  {isEditing.proofOfAddress ? (
                    <div className="certificate-upload-container">
                      <FileUploader
                        title="Upload Proof of Address"
                        currentFile={proof.utilityBill}
                        preview={proof.utilityBillPreview}
                        onFileChange={(file, preview) =>
                          handleUtilityBillUpload(index, file, preview)
                        }
                        onRemove={() => removeUtilityBill(index)}
                        ref={utilityBillRef}
                        acceptedFileTypes="all"
                        uploadText="Click to upload proof of address"
                      />
                      {canPreviewUtilityBill(proof) && (
                        <button
                          className="preview-button"
                          onClick={() => handleUtilityBillPreview(proof)}
                        >
                          <FiEye /> Preview
                        </button>
                      )}
                    </div>
                  ) : (
                    <span>
                      {proof.utilityBillPreview || proof.utilityBill ? (
                        <div className="file-actions">
                          <a
                            href={proof.utilityBillPreview}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view-link"
                          >
                            View Document
                          </a>
                          <button
                            className="preview-button-small"
                            onClick={() => handleUtilityBillPreview(proof)}
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

                {/* Date of Issue */}
                <div className="info-item">
                  <label>Date of Issue</label>
                  {isEditing.proofOfAddress ? (
                    <input
                      type="date"
                      name={`utilityBillDate-${index}`}
                      value={proof.utilityBillDate || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "proofOfAddress",
                          "utilityBillDate",
                          e.target.value,
                          index
                        )
                      }
                      className="edit-input"
                      min={getMinDate()}
                      max={getMaxDate()}
                    />
                  ) : (
                    <span>{proof.utilityBillDate || "-"}</span>
                  )}
                </div>

                {/* National Insurance Number (NIN) */}
                <div className="info-item">
                  <label>National Insurance Number (NIN)</label>
                  {isEditing.proofOfAddress ? (
                    <input
                      type="text"
                      name={`nin-${index}`}
                      value={proof.nin || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "proofOfAddress",
                          "nin",
                          e.target.value,
                          index
                        )
                      }
                      className="edit-input"
                    />
                  ) : (
                    <span>{proof.nin || "-"}</span>
                  )}
                </div>

                {/* Upload NIN Document */}
                <div className="info-item">
                  <label>Upload NIN Document</label>
                  {isEditing.proofOfAddress ? (
                    <div className="certificate-upload-container">
                      <FileUploader
                        title="Upload NIN Document"
                        currentFile={proof.ninFile}
                        preview={proof.ninPreview}
                        onFileChange={(file, preview) =>
                          handleNinUpload(index, file, preview)
                        }
                        onRemove={() => removeNin(index)}
                        ref={ninRef}
                        acceptedFileTypes="all"
                        uploadText="Click to upload NIN document"
                      />
                      {canPreviewNin(proof) && (
                        <button
                          className="preview-button"
                          onClick={() => handleNinPreview(proof)}
                        >
                          <FiEye /> Preview
                        </button>
                      )}
                    </div>
                  ) : (
                    <span>
                      {proof.ninPreview || proof.ninFile ? (
                        <div className="file-actions">
                          <a
                            href={proof.ninPreview}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view-link"
                          >
                            View Document
                          </a>
                          <button
                            className="preview-button-small"
                            onClick={() => handleNinPreview(proof)}
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
                {isEditing.proofOfAddress &&
                  formData.proofOfAddress.length > 1 && (
                    <div className="button-container">
                      <button
                        className="icon-button remove-icon-button"
                        onClick={() => removeProofOfAddressRecord(index)}
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
        {isEditing.proofOfAddress && (
          <button
            className="icon-button add-icon-button"
            onClick={addProofOfAddressRecord}
          >
            <FiPlus />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProofOfAddressStep;
