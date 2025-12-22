import InputField from "../../../../../components/Input/InputField";
import SelectField from "../../../../../components/Input/SelectField";
import FileUploader from "../../../../../components/FileUploader/FileUploader";
import {
  disableFutureDates,
  getFileExtension,
} from "../../../../../utils/helpers";

export default function EducationDetailsStep({
  formData,
  handleChange,
  handleEducationCertificateChange,
  removeEducationCertificate,
  educationCertificateRef,
  handleProfessionalQualificationChange,
  removeProfessionalQualification,
  professionalQualificationRef,
  handleIdDocumentChange,
  removeIdDocument,
  idDocumentRef,
}) {
  const isImageUrl = (url) => {
    if (typeof url !== "string" || !url) return false;
    const imageExtensions = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"];
    const extension = getFileExtension(url)?.toLowerCase();
    return imageExtensions.includes(extension);
  };

  const renderDocumentPreview = (
    url,
    preview,
    onRemove,
    title = "Document Preview"
  ) => {
    if (!url) return null;

    const extension = getFileExtension(url).toLowerCase();
    let iframeSrc = url;

    // For .docx, use MS Viewer
    if (extension === "docx" || extension === "doc") {
      iframeSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        url
      )}`;
    }
    // Add similar checks for .pptx, .xlsx if needed

    return (
      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          margin: "10px 0",
          position: "relative",
        }}
      >
        <h4>{title}</h4>
        {isImageUrl(url) ? (
          <img
            src={url}
            alt="Document Preview"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        ) : (
          <iframe
            src={iframeSrc}
            width="100%"
            height="400px"
            style={{ border: "none" }}
          />
        )}
        <button
          type="button"
          onClick={onRemove}
          style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            background: "#ff4444",
            color: "white",
            border: "none",
            padding: "5px",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          Remove
        </button>
      </div>
    );
  };

  const educationCertificatePreviewComponent = renderDocumentPreview(
    formData.educationCertificateUrl,
    formData.educationCertificatePreview,
    () => {
      handleChange({ target: { name: "educationCertificateUrl", value: "" } });
      handleChange({
        target: { name: "educationCertificatePreview", value: "" },
      });
    },
    "Education Certificate Preview"
  );

  const professionalQualificationPreviewComponent = renderDocumentPreview(
    formData.professionalQualificationUrl,
    formData.professionalQualificationPreview,
    () => {
      handleChange({
        target: { name: "professionalQualificationUrl", value: "" },
      });
      handleChange({
        target: { name: "professionalQualificationPreview", value: "" },
      });
    },
    "Professional Qualification Preview"
  );

  const idDocumentPreviewComponent = renderDocumentPreview(
    formData.idDocumentUrl,
    formData.idDocumentPreview,
    () => {
      handleChange({ target: { name: "idDocumentUrl", value: "" } });
      handleChange({ target: { name: "idDocumentPreview", value: "" } });
    },
    "ID Document Preview"
  );

  const cvPreviewComponent = renderDocumentPreview(
    formData.cvFileUrl,
    formData.cvPreview,
    () => {
      handleChange({ target: { name: "cvFileUrl", value: "" } });
      handleChange({ target: { name: "cvPreview", value: "" } });
    },
    "CV Preview"
  );

  return (
    <>
      {/* EDUCATION DETAILS SECTION */}
      <div className="form-section">
        <h3>Education Details</h3>

        <SelectField
          label="Institution"
          name="institution"
          value={formData.institution}
          options={[
            "University of London",
            "University of Manchester",
            "Imperial College",
            "Other",
          ]}
          onChange={handleChange}
        />

        <InputField
          label="Highest Qualification"
          name="highestQualification"
          value={formData.highestQualification}
          onChange={handleChange}
        />

        <InputField
          label="Course of Study"
          name="courseOfStudy"
          value={formData.courseOfStudy}
          onChange={handleChange}
        />

        <div className="input-row">
          <InputField
            label="Start Year"
            type="date"
            name="educationStartYear"
            value={formData.educationStartYear}
            onChange={handleChange}
            placeholder="YYYY"
            max={disableFutureDates()}
          />
          <InputField
            label="End Year"
            type="date"
            name="educationEndYear"
            value={formData.educationEndYear}
            onChange={handleChange}
            placeholder="YYYY"
            max={disableFutureDates()}
          />
        </div>

        {educationCertificatePreviewComponent || (
          <div style={{ marginTop: "1rem" }}>
            <FileUploader
              preview={formData.educationCertificatePreview || ""}
              currentFile={formData.educationCertificate}
              onFileChange={handleEducationCertificateChange}
              onRemove={removeEducationCertificate}
              ref={educationCertificateRef}
              acceptedFileTypes="all"
              uploadText="Click to upload certificate"
            />
          </div>
        )}

        <InputField
          label="Skills (optional)"
          name="educationSkills"
          value={formData.educationSkills}
          onChange={handleChange}
          placeholder="List relevant skills separated by commas"
        />
      </div>

      {/* PROFESSIONAL QUALIFICATIONS SECTION */}
      <div className="form-section">
        <h3>Professional Qualifications</h3>

        <InputField
          label="Qualification Name"
          name="professionalQualification"
          value={formData.professionalQualification}
          onChange={handleChange}
        />

        {professionalQualificationPreviewComponent || (
          <div style={{ marginTop: "1rem" }}>
            <FileUploader
              preview={formData.professionalQualificationPreview || ""}
              currentFile={formData.professionalQualificationFile}
              onFileChange={handleProfessionalQualificationChange}
              onRemove={removeProfessionalQualification}
              ref={professionalQualificationRef}
              acceptedFileTypes="all"
              uploadText="Click to upload qualification certificate"
            />
          </div>
        )}
      </div>

      {/* ID AND DOCUMENTS SECTION */}
      {/* <div className="form-section">
        <h3>ID and Documents</h3>

        <div className="input-row">
          <SelectField
            label="Government ID Type"
            name="governmentIdType"
            value={formData.governmentIdType}
            options={["Drivers Licence", "Passport", "National ID", "Other"]}
            onChange={handleChange}
            placeholder="Select Government ID Type"
          />
          <InputField
            label="ID Number"
            name="governmentIdDocumentNumber"
            value={formData.governmentIdDocumentNumber}
            onChange={handleChange}
          />
        </div>

        {idDocumentPreviewComponent || (
          <div style={{ marginTop: "1rem" }}>
            <FileUploader
              preview={formData.idDocumentPreview || ""}
              currentFile={formData.idDocument}
              onFileChange={handleIdDocumentChange}
              onRemove={removeIdDocument}
              ref={idDocumentRef}
              acceptedFileTypes="all"
              uploadText="Click to upload ID document"
            />
          </div>
        )} */}

      {/* CV SECTION */}
      {/* <div style={{ marginTop: "2rem" }}>
          <h4>Curriculum Vitae (CV)</h4>
          {cvPreviewComponent || (
            <FileUploader
              preview={formData.cvPreview || ""}
              currentFile={formData.cvFile}
              onFileChange={(file) => {
                // Assuming handleCvChange is passed or use handleChange if adjusted in parent
                // For now, placeholder
                console.log("CV file change", file);
              }}
              onRemove={() => {
                // Assuming removeCv
                console.log("Remove CV");
              }}
              acceptedFileTypes="all"
              uploadText="Click to upload CV"
            />
          )}
        </div>
      </div> */}

      {/* --- BANK DETAILS --- */}
      <div className="form-section">
        <h3>Bank Details</h3>
        <InputField
          label="Bank Name"
          name="bankName"
          value={formData.bankName || ""}
          onChange={handleChange}
        />

        <InputField
          label="Account Number"
          name="accountNumber"
          value={formData.accountNumber || ""}
          onChange={handleChange}
        />

        <InputField
          label="Account Name"
          name="accountName"
          value={formData.accountName || ""}
          onChange={handleChange}
        />

        <SelectField
          label="Account Type"
          name="accountType"
          value={formData.accountType || ""}
          options={["Current", "Savings", "Business"]}
          onChange={handleChange}
        />
      </div>
    </>
  );
}
