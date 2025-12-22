import React from "react";

const FinalPreviewStep = ({ formData }) => {
  const formatTime = (time) => {
    if (!time) return "Not specified";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="final-preview-step">
      <h3>Review Client Information</h3>
      <p className="preview-subtitle">
        Please review all information before submitting
      </p>

      {/* Personal Information */}
      <div className="preview-section">
        <h4>Personal Information</h4>
        <div className="preview-grid">
          <div>
            <label>Title</label>
            <p>{formData.title || "Not specified"}</p>
          </div>
          <div>
            <label>Name</label>
            <p>
              {formData.firstName} {formData.lastName}
            </p>
          </div>
          <div>
            <label>Preferred Name</label>
            <p>{formData.preferredName || "Not specified"}</p>
          </div>
          <div>
            <label>Date of Birth</label>
            <p>{formData.dob || "Not provided"}</p>
          </div>
          <div>
            <label>Gender</label>
            <p>{formData.gender || "Not specified"}</p>
          </div>
          <div>
            <label>Preferred Pronouns</label>
            <p>{formData.preferredPronouns || "Not specified"}</p>
          </div>
          <div>
            <label>Marital Status</label>
            <p>{formData.maritalStatus || "Not specified"}</p>
          </div>
          <div>
            <label>NHIS Number</label>
            <p>{formData.nhisNumber || "Not provided"}</p>
          </div>
          <div>
            <label>Email</label>
            <p>{formData.email || "Not provided"}</p>
          </div>
          <div>
            <label>Phone</label>
            <p>
              {formData.phoneCode} {formData.phone || "Not provided"}
            </p>
          </div>
          <div>
            <label>Alternate Phone</label>
            <p>
              {formData.altPhoneCode} {formData.altPhone || "Not provided"}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div className="preview-section">
        <h4>Contact Details</h4>
        <div className="preview-grid">
          <div>
            <label>Primary Contact</label>
            <p>{formData.primaryContact || "Not specified"}</p>
          </div>
          <div>
            <label>Primary Contact Phone</label>
            <p>
              {formData.primaryContactPhoneCode}{" "}
              {formData.primaryContactPhone || "Not provided"}
            </p>
          </div>
          <div>
            <label>Primary Contact Email</label>
            <p>{formData.primaryContactEmail || "Not provided"}</p>
          </div>
          <div>
            <label>Secondary Contact</label>
            <p>{formData.secondaryContact || "Not specified"}</p>
          </div>
          <div>
            <label>Secondary Contact Phone</label>
            <p>
              {formData.secondaryContactPhoneCode}{" "}
              {formData.secondaryContactPhone || "Not provided"}
            </p>
          </div>
          <div>
            <label>Secondary Contact Email</label>
            <p>{formData.secondaryContactEmail || "Not provided"}</p>
          </div>
          <div>
            <label>Communication Preferences</label>
            <p>
              {formData.communicationPreferences.length > 0
                ? formData.communicationPreferences
                : "Not specified"}
            </p>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="preview-section">
        <h4>Address Information</h4>
        <div className="preview-grid">
          <div>
            <label>Address</label>
            <p>
              {formData.address}, {formData.city}, {formData.county},{" "}
              {formData.postalCode}
            </p>
          </div>
          <div>
            <label>Residence Type</label>
            <p>{formData.residenceType || "Not specified"}</p>
          </div>
          <div>
            <label>Lives Alone</label>
            <p>{formData.livesAlone || "Not specified"}</p>
          </div>
          <div>
            <label>Cohabitants</label>
            <p>{formData.cohabitants || "Not specified"}</p>
          </div>
          <div>
            <label>Key Safe/Access Instructions</label>
            <p>{formData.keySafeAccessInstructions || "Not specified"}</p>
          </div>
        </div>
      </div>

      {/* Next of Kin */}
      <div className="preview-section">
        <h4>Next of Kin</h4>
        <div className="preview-grid">
          <div>
            <label>Name</label>
            <p>{formData.nextOfKin || "Not specified"}</p>
          </div>
          <div>
            <label>Relationship</label>
            <p>{formData.relationship || "Not specified"}</p>
          </div>
          <div>
            <label>Email</label>
            <p>{formData.nokEmail || "Not provided"}</p>
          </div>
          <div>
            <label>Town</label>
            <p>{formData.nokTown || "Not specified"}</p>
          </div>
          <div>
            <label>Phone 1</label>
            <p>
              {formData.nokPhoneCode1} {formData.nokPhone1 || "Not provided"}
            </p>
          </div>
          <div>
            <label>Phone 2</label>
            <p>
              {formData.nokPhoneCode2} {formData.nokPhone2 || "Not provided"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalPreviewStep;
