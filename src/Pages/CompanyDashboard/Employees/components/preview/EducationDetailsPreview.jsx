import "../../styles/CreateEmployeeStepPreview.css";
import {
  isImageFile,
  isPDFFile,
  isWordFile,
  formatFileSize,
  getFileExtension,
} from "../../../../../utils/helpers";
import { FaFilePdf } from "react-icons/fa6";
import { PiMicrosoftWordLogoFill } from "react-icons/pi";

// const renderFilePreview = (file, previewUrl) => {
//   if (!file && !previewUrl) return null;

//   if (isImageFile(file?.name || previewUrl)) {
//     return (
//       <div className="file-preview-container">
//         <img
//           src={previewUrl || URL.createObjectURL(file)}
//           alt="Uploaded document"
//           className="file-preview-image"
//         />
//         {file && (
//           <div className="file-info">
//             <span className="file-name">{file.name}</span>
//             <span className="file-size">{formatFileSize(file.size)}</span>
//           </div>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className="file-preview-container">
//       <div className="document-icon">
//         {isPDFFile(file?.name || previewUrl) ? (
//           <FaFilePdf style={{ color: "#e53e3e" }} />
//         ) : isWordFile(file?.name || previewUrl) ? (
//           <PiMicrosoftWordLogoFill />
//         ) : (
//           <span className="generic-icon">
//             {getFileExtension(file?.name || previewUrl)}
//           </span>
//         )}
//       </div>
//       {file && (
//         <div className="file-info">
//           <span className="file-name">{file.name}</span>
//           <span className="file-size">{formatFileSize(file.size)}</span>
//         </div>
//       )}
//     </div>
//   );
// };

export default function EducationDetailsPreview({ formData }) {
  const renderFilePreview = (file) => {
    if (!file) return null;

    if (isImageFile(file)) {
      return (
        <div className="file-preview-container">
          <img
            src={URL.createObjectURL(file)}
            alt="Uploaded document"
            className="file-preview-image"
          />
          <div className="file-info">
            <span className="file-name">{file.name}</span>
            <span className="file-size">{formatFileSize(file.size)}</span>
          </div>
        </div>
      );
    }
    return (
      <div className="file-preview-container">
        <div className="document-icon">
          {isPDFFile(file) ? (
            <FaFilePdf style={{ color: "#e53e3e" }} />
          ) : isWordFile(file) ? (
            <PiMicrosoftWordLogoFill />
          ) : (
            <span className="generic-icon">{getFileExtension(file.name)}</span>
          )}
        </div>
        <div className="file-info">
          <span className="file-name">{file.name}</span>
          <span className="file-size">{formatFileSize(file.size)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="info-card">
      {/* EDUCATION SECTION */}
      <h3 className="section-title">Education</h3>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Institution</span>
          <span className="info-value">{formData.institution || "-"}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Highest Qualification</span>
          <span className="info-value">
            {formData.highestQualification || "-"}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Course of Study</span>
          <span className="info-value">{formData.courseOfStudy || "-"}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Education Period</span>
          <span className="info-value">
            {formData.educationStartYear} - {formData.educationEndYear}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Skills</span>
          <span className="info-value">{formData.educationSkills || "-"}</span>
        </div>

        {(formData.educationCertificate ||
          formData.educationCertificatePreview) && (
          <div className="info-item file-preview-wrapper">
            <span className="info-label">Education Certificate</span>
            {renderFilePreview(
              formData.educationCertificate,
              formData.educationCertificatePreview
            )}
          </div>
        )}
      </div>

      {/* PROFESSIONAL QUALIFICATIONS SECTION */}
      <h3 className="section-title">Professional Qualifications</h3>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Qualification</span>
          <span className="info-value">
            {formData.professionalQualification || "-"}
          </span>
        </div>

        {(formData.professionalQualificationFile ||
          formData.professionalQualificationPreview) && (
          <div className="info-item file-preview-wrapper">
            <span className="info-label">Qualification Document</span>
            {renderFilePreview(
              formData.professionalQualificationFile,
              formData.professionalQualificationPreview
            )}
          </div>
        )}
      </div>

      {/* ID AND DOCUMENTS SECTION */}
      <h3 className="section-title">ID and Documents</h3>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">ID Type</span>
          <span className="info-value">{formData.governmentIdType || "-"}</span>
        </div>
        <div className="info-item">
          <span className="info-label">ID Number</span>
          <span className="info-value">
            {formData.governmentIdDocumentNumber || "-"}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Document Expiry</span>
          <span className="info-value">
            {formData.documentExpiryDate || "-"}
          </span>
        </div>

        {(formData.idDocument || formData.idDocumentPreview) && (
          <div className="info-item file-preview-wrapper">
            <span className="info-label">ID Document</span>
            {renderFilePreview(formData.idDocument, formData.idDocumentPreview)}
          </div>
        )}
      </div>

      {/* BANK DETAILS SECTION */}
      <h3 className="section-title">Bank Details</h3>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Bank Name</span>
          <span className="info-value">{formData.bankName}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Account Number</span>
          <span className="info-value">{formData.accountNumber}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Account Name</span>
          <span className="info-value">{formData.accountName}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Account Type</span>
          <span className="info-value">{formData.accountType}</span>
        </div>
      </div>
    </div>
  );
}
