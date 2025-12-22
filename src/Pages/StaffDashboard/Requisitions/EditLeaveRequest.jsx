// EditLeaveRequest.jsx
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
import { usePhoneCountryCode } from "../../../hooks/usePhoneCountryCode";

const EditLeaveRequest = ({ request, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // Prefilled form state
  const [formData, setFormData] = useState({
    title: "",
    leaveCategory: "",
    numberOfDays: "",
    startDate: "",
    resumptionDate: "",
    regionOfStay: "",
    addressDuringLeave: "",
    phone: "",
    additionalInformation: "",
  });

  // Original data for comparison
  const [originalData, setOriginalData] = useState(null);

  // File states
  const [initialDocumentUrl, setInitialDocumentUrl] = useState(null);
  const [newFile, setNewFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [removed, setRemoved] = useState(false);

  const phoneHook = usePhoneCountryCode("+234");

  // Helper functions
  const titleCase = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const splitPhone = (fullPhone) => {
    if (!fullPhone || typeof fullPhone !== "string") {
      return { code: "+234", number: "" };
    }
    // Simple split based on common codes; can be improved
    const codeMap = phoneHook.options.map((opt) => ({
      code: opt.value,
      length: opt.value.length,
    }));
    for (const { code, length } of codeMap) {
      if (fullPhone.startsWith(code)) {
        return { code, number: fullPhone.substring(length) };
      }
    }
    return { code: "+234", number: fullPhone };
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

    const loadData = async () => {
      try {
        setLoading(true);
        // Wait for phone options to load
        if (phoneHook.loading) {
          return; // Will re-run when phoneHook changes
        }
        // Map API fields to form fields
        const phoneSplit = splitPhone(
          getField(request, "contact_phone_number")
        );
        const mappedData = {
          title: getField(request, "title") || "",
          leaveCategory: titleCase(getField(request, "leave_category")) || "",
          numberOfDays: getField(request, "number_of_days")?.toString() || "",
          startDate: getField(request, "start_date")
            ? new Date(getField(request, "start_date"))
                .toISOString()
                .split("T")[0]
            : "",
          resumptionDate: getField(request, "resumption_date")
            ? new Date(getField(request, "resumption_date"))
                .toISOString()
                .split("T")[0]
            : "",
          regionOfStay: titleCase(getField(request, "region_of_stay")) || "",
          addressDuringLeave: getField(request, "address_during_leave") || "",
          phone: phoneSplit.number,
          additionalInformation:
            getField(request, "additional_information") || "",
        };
        setFormData(mappedData);
        setOriginalData({ ...mappedData, countryCode: phoneSplit.code });

        phoneHook.setCountryCode(phoneSplit.code);

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
  }, [request, phoneHook.loading, phoneHook.options]);

  // Check if form has changes
  const currentData = { ...formData, countryCode: phoneHook.countryCode };
  const formChanged =
    JSON.stringify(currentData) !== JSON.stringify(originalData);
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

    const contactPhone = phoneHook.countryCode + formData.phone;
    const payload = {
      title: formData.title,
      leave_category: formData.leaveCategory.toLowerCase(),
      number_of_days: parseInt(formData.numberOfDays) || 0,
      start_date: formData.startDate,
      resumption_date: formData.resumptionDate,
      region_of_stay: formData.regionOfStay.toLowerCase(),
      address_during_leave: formData.addressDuringLeave,
      contact_phone_number: contactPhone,
      additional_information: formData.additionalInformation,
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
      setModalMessage("Your leave request has been updated successfully.");
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
          Edit Request
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="Davv-Pils">
          <div className="Davv-Pils-Box">
            <div className="form-section">
              <h3>Fill in your request details</h3>

              <InputField
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />

              <SelectField
                label="Leave Category"
                name="leaveCategory"
                value={formData.leaveCategory}
                options={["Annual", "Casual", "Sick", "Study", "Others"]}
                onChange={handleChange}
              />

              <InputField
                label="Number of Days"
                type="number"
                name="numberOfDays"
                value={formData.numberOfDays}
                onChange={handleChange}
                min="1"
              />

              <div className="input-row">
                <InputField
                  label="Start Date"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
                <InputField
                  label="Resumption Date"
                  type="date"
                  name="resumptionDate"
                  value={formData.resumptionDate}
                  onChange={handleChange}
                />
              </div>

              <SelectField
                label="Region of Stay During Leave"
                name="regionOfStay"
                value={formData.regionOfStay}
                options={["Abroad", "Local"]}
                onChange={handleChange}
              />

              <InputField
                label="Address During Leave"
                name="addressDuringLeave"
                value={formData.addressDuringLeave}
                onChange={handleChange}
              />

              <div className="GHuh-Form-Input">
                <label>Contact Phone Number While on Leave</label>
                <div className="phone-wrapper">
                  <select
                    value={phoneHook.countryCode}
                    onChange={(e) => phoneHook.setCountryCode(e.target.value)}
                  >
                    {phoneHook.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div className="GHuh-Form-Input">
                <label>Additional Information (Optional)</label>
                <div>
                  <textarea
                    name="additionalInformation"
                    value={formData.additionalInformation}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>

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
        name="Leave Request"
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

export default EditLeaveRequest;
