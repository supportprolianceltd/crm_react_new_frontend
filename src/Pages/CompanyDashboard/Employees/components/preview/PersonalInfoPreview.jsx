import "../../styles/CreateEmployeeStepPreview.css";

const PersonalInfoPreview = ({ formData }) => {
  return (
    <div className="info-card">
      <div className="info-header">
        <img
          src={formData.profilePreview}
          alt="Profile"
          className="info-image"
        />
        <h2 className="info-name">
          {formData.firstName} {formData.lastName}
        </h2>
      </div>

      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">First Name</span>
          <span className="info-value">{formData.firstName}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Last Name</span>
          <span className="info-value">{formData.lastName}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Email</span>
          <span className="info-value email">{formData.workEmail}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Phone Number</span>
          <span className="info-value">
            {formData.personalPhoneCode}
            {formData.personalPhone}
          </span>
        </div>

        <div className="info-item">
          <span className="info-label">Gender</span>
          <span className="info-value">{formData.gender}</span>
        </div>
        <div className="info-item">
          <span className="info-label">State of Origin</span>
          <span className="info-value">{formData.stateOfOrigin}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Address</span>
          <span className="info-value">{formData.address}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Zip Code</span>
          <span className="info-value">{formData.postalCode}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Next of Kin</span>
          <span className="info-value">{formData.nextOfKin}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Relationship</span>
          <span className="info-value">{formData.relationship}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Next of Kin Address</span>
          <span className="info-value">{formData.nokAddress}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Phone Number</span>
          <span className="info-value">
            {formData.nokPhoneCode1}
            {formData.nokPhone1}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoPreview;
