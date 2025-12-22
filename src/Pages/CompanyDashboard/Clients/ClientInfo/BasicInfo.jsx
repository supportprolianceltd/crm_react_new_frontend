import React, { useState } from "react";
import { PencilIcon } from "@heroicons/react/24/outline";

const BasicInfo = ({ clientData, onUpdate, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(() => ({
    title: clientData?.profile?.title || "",
    firstName: clientData?.first_name || "",
    lastName: clientData?.last_name || "",
    dateOfBirth: clientData?.profile?.date_of_birth || "",
    genderIdentity: clientData?.profile?.gender_identity || "",
    preferredName: clientData?.profile?.preferred_name || "",
    contactNumber: clientData?.profile?.contact_number || "",
    altContactNumber: clientData?.profile?.alt_contact_number || "",
    email: clientData?.email || "",
    maritalStatus: clientData?.profile?.marital_status || "",
    nhisNumber: clientData?.profile?.nhis_number || "",
  }));

  // keep form in sync when clientData changes
  React.useEffect(() => {
    setForm({
      title: clientData?.profile?.title || "",
      firstName: clientData?.first_name || "",
      lastName: clientData?.last_name || "",
      dateOfBirth: clientData?.profile?.date_of_birth || "",
      genderIdentity: clientData?.profile?.gender_identity || "",
      preferredName: clientData?.profile?.preferred_name || "",
      contactNumber: clientData?.profile?.contact_number || "",
      altContactNumber: clientData?.profile?.alt_contact_number || "",
      email: clientData?.email || "",
      maritalStatus: clientData?.profile?.marital_status || "",
      nhisNumber: clientData?.profile?.nhis_number || "",
    });
  }, [clientData]);

  const fullName = clientData
    ? `${clientData.profile?.title ? clientData.profile.title + " " : ""}${
        clientData.first_name
      } ${clientData.last_name}`
    : "N/A";

  const handleChange = (key) => (e) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSave = () => {
    const updated = {
      ...clientData,
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      profile: {
        ...(clientData?.profile || {}),
        title: form.title,
        date_of_birth: form.dateOfBirth,
        gender_identity: form.genderIdentity,
        preferred_name: form.preferredName,
        contact_number: form.contactNumber,
        alt_contact_number: form.altContactNumber,
        marital_status: form.maritalStatus,
        nhis_number: form.nhisNumber,
      },
    };
    if (onUpdate) onUpdate(clientData.id, updated);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setForm({
      title: clientData?.profile?.title || "",
      firstName: clientData?.first_name || "",
      lastName: clientData?.last_name || "",
      dateOfBirth: clientData?.profile?.date_of_birth || "",
      genderIdentity: clientData?.profile?.gender_identity || "",
      preferredName: clientData?.profile?.preferred_name || "",
      contactNumber: clientData?.profile?.contact_number || "",
      altContactNumber: clientData?.profile?.alt_contact_number || "",
      email: clientData?.email || "",
      maritalStatus: clientData?.profile?.marital_status || "",
      nhisNumber: clientData?.profile?.nhis_number || "",
    });
  };

  return (
    <div className="Info-Palt">
      <div className="Info-Palt-Top">
        <h3>Basic Information</h3>
        {!isEditing ? (
          <button
            type="button"
            className="profil-Edit-Btn btn-primary-bg"
            onClick={() => setIsEditing(true)}
          >
            <PencilIcon /> Edit
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="profil-Edit-Btn btn-primary-bg"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="profil-Edit-Btn btn-primary-bg"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="Info-Palt-Main">
        {isEditing ? (
          <>
            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Title</h5>
              </div>
              <div className="Info-TTb-BS-HYH-edit">
                <input value={form.title} onChange={handleChange("title")} />
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>First Name</h5>
              </div>
              <div className="Info-TTb-BS-HYH-edit">
                <input
                  value={form.firstName}
                  onChange={handleChange("firstName")}
                />
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Last Name</h5>
              </div>
              <div className="Info-TTb-BS-HYH-edit">
                <input
                  value={form.lastName}
                  onChange={handleChange("lastName")}
                />
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Date of Birth</h5>
              </div>
              <div className="Info-TTb-BS-HYH-edit">
                <input
                  value={form.dateOfBirth}
                  onChange={handleChange("dateOfBirth")}
                />
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Gender Identity</h5>
              </div>
              <div className="Info-TTb-BS-HYH-edit">
                <input
                  value={form.genderIdentity}
                  onChange={handleChange("genderIdentity")}
                />
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Preferred Name</h5>
              </div>
              <div className="Info-TTb-BS-HYH-edit">
                <input
                  value={form.preferredName}
                  onChange={handleChange("preferredName")}
                />
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Contact Number</h5>
              </div>
              <div className="Info-TTb-BS-HYH-edit">
                <input
                  value={form.contactNumber}
                  onChange={handleChange("contactNumber")}
                />
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Alt. Contact Number</h5>
              </div>
              <div className="Info-TTb-BS-HYH-edit">
                <input
                  value={form.altContactNumber}
                  onChange={handleChange("altContactNumber")}
                />
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Email Address</h5>
              </div>
              <div className="Info-TTb-BS-HYH-edit">
                <input value={form.email} onChange={handleChange("email")} />
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Marital Status</h5>
              </div>
              <div className="Info-TTb-BS-HYH-edit">
                <input
                  value={form.maritalStatus}
                  onChange={handleChange("maritalStatus")}
                />
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>NHIS Number</h5>
              </div>
              <div className="Info-TTb-BS-HYH-edit">
                <input
                  value={form.nhisNumber}
                  onChange={handleChange("nhisNumber")}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Full Name</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{fullName}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Date of Birth</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{clientData?.profile?.date_of_birth || "N/A"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Gender Identity</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{clientData?.profile?.gender_identity || "N/A"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Preferred Name</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{clientData?.profile?.preferred_name || "N/A"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Contact Number</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{clientData?.profile?.contact_number || "N/A"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Alt. Contact Number</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{clientData?.profile?.alt_contact_number || "N/A"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Email Address</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{clientData?.email || "N/A"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Marital Status</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{clientData?.profile?.marital_status || "N/A"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>NHIS Number</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{clientData?.profile?.nhis_number || "N/A"}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BasicInfo;
