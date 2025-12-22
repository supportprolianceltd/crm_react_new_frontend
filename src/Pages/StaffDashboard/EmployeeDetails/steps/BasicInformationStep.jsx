import { useState } from "react";
import { PencilIcon } from "../../../../assets/icons/PencilIcon";
import { IoMdClose } from "react-icons/io";

const BasicInformationStep = ({
  formData,
  isEditing,
  handleEditToggle,
  handleInputChange,
  handleEventInputChange,
}) => {
  const [errors, setErrors] = useState({});

  const validateNextOfKinEmail = (value) => {
    if (value && value.includes("@")) {
      const userDomain = formData.email.split("@")[1];
      const kinDomain = value.split("@")[1];
      if (kinDomain !== userDomain) {
        setErrors((prev) => ({
          ...prev,
          nextOfKinEmail: "Email must be from the same domain as your email.",
        }));
      } else {
        setErrors((prev) => ({ ...prev, nextOfKinEmail: "" }));
      }
    } else if (value) {
      setErrors((prev) => ({
        ...prev,
        nextOfKinEmail: "Please enter a valid email address.",
      }));
    } else {
      setErrors((prev) => ({ ...prev, nextOfKinEmail: "" }));
    }
  };

  if (!formData) return null;

  return (
    <div className="step-form">
      <div className="info-card">
        <div className="card-header">
          <h4>Personal Information</h4>
          <button
            className="edit-button"
            onClick={() => handleEditToggle("personal")}
          >
            {isEditing.personal ? (
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
        <div className="info-grid">
          <div className="info-item">
            <label>First Name</label>
            {isEditing.personal ? (
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  handleInputChange("personal", "firstName", e.target.value)
                }
                className="edit-input"
              />
            ) : (
              <span>{formData.firstName}</span>
            )}
          </div>
          <div className="info-item">
            <label>Last Name</label>
            {isEditing.personal ? (
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  handleInputChange("personal", "lastName", e.target.value)
                }
                className="edit-input"
              />
            ) : (
              <span>{formData.lastName}</span>
            )}
          </div>
          <div className="info-item disabled">
            <label>Email</label>
            <span>{formData.email}</span>
          </div>
          <div className="info-item">
            <label>Personal Phone Number</label>
            {isEditing.personal ? (
              <input
                type="text"
                name="personalPhone"
                value={formData.personalPhone}
                onChange={(e) =>
                  handleInputChange("personal", "personalPhone", e.target.value)
                }
                className="edit-input"
              />
            ) : (
              <span>{formData.personalPhone}</span>
            )}
          </div>
          <div className="info-item">
            <label>Work Phone Number</label>
            {isEditing.personal ? (
              <input
                type="text"
                name="workPhone"
                value={formData.workPhone}
                onChange={(e) =>
                  handleInputChange("personal", "workPhone", e.target.value)
                }
                className="edit-input"
              />
            ) : (
              <span>{formData.workPhone}</span>
            )}
          </div>
          <div className="info-item">
            <label>Marital Status</label>
            {isEditing.personal ? (
              <input
                type="text"
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={(e) =>
                  handleInputChange("personal", "maritalStatus", e.target.value)
                }
                className="edit-input"
              />
            ) : (
              <span>{formData.maritalStatus}</span>
            )}
          </div>
          <div className="info-item">
            <label>City</label>
            {isEditing.personal ? (
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={(e) =>
                  handleInputChange("personal", "city", e.target.value)
                }
                className="edit-input"
              />
            ) : (
              <span>{formData.city}</span>
            )}
          </div>
          <div className="info-item">
            <label>State</label>
            {isEditing.personal ? (
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={(e) =>
                  handleInputChange("personal", "state", e.target.value)
                }
                className="edit-input"
              />
            ) : (
              <span>{formData.state}</span>
            )}
          </div>
          <div className="info-item">
            <label>Post Code</label>
            {isEditing.personal ? (
              <input
                type="text"
                name="postCode"
                value={formData.postCode}
                onChange={(e) =>
                  handleInputChange("personal", "postCode", e.target.value)
                }
                className="edit-input"
              />
            ) : (
              <span>{formData.postCode}</span>
            )}
          </div>
          <div className="info-item full-width">
            <label>Address</label>
            {isEditing.personal ? (
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={(e) =>
                  handleInputChange("personal", "address", e.target.value)
                }
                className="edit-input"
              />
            ) : (
              <span>{formData.address}</span>
            )}
          </div>
        </div>
      </div>

      <div className="info-card">
        <div className="card-header">
          <h4>Next of Kin</h4>
          <button
            className="edit-button"
            onClick={() => handleEditToggle("nextOfKin")}
          >
            {isEditing.nextOfKin ? (
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
        <div className="info-grid">
          <div className="info-item">
            <label>Name</label>
            {isEditing.nextOfKin ? (
              <input
                type="text"
                name="name"
                value={formData.nextOfKin.name}
                onChange={(e) =>
                  handleInputChange("nextOfKin", "name", e.target.value)
                }
                className="edit-input"
              />
            ) : (
              <span>{formData.nextOfKin.name}</span>
            )}
          </div>
          <div className="info-item">
            <label>Email</label>
            {isEditing.nextOfKin ? (
              <>
                <input
                  type="text"
                  name="email"
                  value={formData.nextOfKin.email}
                  onChange={(e) =>
                    handleInputChange("nextOfKin", "email", e.target.value)
                  }
                  onBlur={(e) => validateNextOfKinEmail(e.target.value)}
                  className="edit-input"
                />
                {errors.nextOfKinEmail && (
                  <div className="error">{errors.nextOfKinEmail}</div>
                )}
              </>
            ) : (
              <span>{formData.nextOfKin.email}</span>
            )}
          </div>
          <div className="info-item">
            <label>Phone Number</label>
            {isEditing.nextOfKin ? (
              <input
                type="text"
                name="phone"
                value={formData.nextOfKin.phone}
                onChange={(e) =>
                  handleInputChange("nextOfKin", "phone", e.target.value)
                }
                className="edit-input"
              />
            ) : (
              <span>{formData.nextOfKin.phone}</span>
            )}
          </div>
          <div className="info-item">
            <label>Alt. Phone Number</label>
            {isEditing.nextOfKin ? (
              <input
                type="text"
                name="altPhone"
                value={formData.nextOfKin.altPhone}
                onChange={(e) =>
                  handleInputChange("nextOfKin", "altPhone", e.target.value)
                }
                className="edit-input"
              />
            ) : (
              <span>{formData.nextOfKin.altPhone}</span>
            )}
          </div>
          <div className="info-item">
            <label>Post Code</label>
            {isEditing.nextOfKin ? (
              <input
                type="text"
                name="postCode"
                value={formData.nextOfKin.postCode}
                onChange={(e) =>
                  handleInputChange("nextOfKin", "postCode", e.target.value)
                }
                className="edit-input"
              />
            ) : (
              <span>{formData.nextOfKin.postCode}</span>
            )}
          </div>
          <div className="info-item">
            <label>Town</label>
            {isEditing.nextOfKin ? (
              <input
                type="text"
                name="town"
                value={formData.nextOfKin.town}
                onChange={(e) =>
                  handleInputChange("nextOfKin", "town", e.target.value)
                }
                className="edit-input"
              />
            ) : (
              <span>{formData.nextOfKin.town}</span>
            )}
          </div>
          <div className="info-item">
            <label>Relationship to Next of Kin</label>
            {isEditing.nextOfKin ? (
              <input
                type="text"
                name="relationship"
                value={formData.nextOfKin.relationship}
                onChange={(e) =>
                  handleInputChange("nextOfKin", "relationship", e.target.value)
                }
                className="edit-input"
              />
            ) : (
              <span>{formData.nextOfKin.relationship}</span>
            )}
          </div>
          <div className="info-item full-width">
            <label>Address</label>
            {isEditing.nextOfKin ? (
              <input
                type="text"
                name="address"
                value={formData.nextOfKin.address}
                onChange={(e) =>
                  handleInputChange("nextOfKin", "address", e.target.value)
                }
                className="edit-input"
              />
            ) : (
              <span>{formData.nextOfKin.address}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInformationStep;
