import React, { useState, useEffect } from "react";
import { PencilIcon } from "@heroicons/react/24/outline";

const NextOfKin = ({ clientData, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: clientData?.profile?.next_of_kin_full_name || "",
    relationship: clientData?.profile?.next_of_kin_relationship || "",
    phone: clientData?.profile?.next_of_kin_contact_number || "",
    altPhone: clientData?.profile?.next_of_kin_alt_contact_number || "",
    email: clientData?.profile?.next_of_kin_email || "",
  });

  useEffect(() => {
    setForm({
      fullName: clientData?.profile?.next_of_kin_full_name || "",
      relationship: clientData?.profile?.next_of_kin_relationship || "",
      phone: clientData?.profile?.next_of_kin_contact_number || "",
      altPhone: clientData?.profile?.next_of_kin_alt_contact_number || "",
      email: clientData?.profile?.next_of_kin_email || "",
    });
  }, [clientData]);

  const handleChange = (k) => (e) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = () => {
    const updated = {
      ...clientData,
      profile: {
        ...(clientData?.profile || {}),
        next_of_kin_full_name: form.fullName,
        next_of_kin_relationship: form.relationship,
        next_of_kin_contact_number: form.phone,
        next_of_kin_alt_contact_number: form.altPhone,
        next_of_kin_email: form.email,
      },
    };
    if (onUpdate) onUpdate(clientData.id, updated);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setForm({
      fullName: clientData?.profile?.next_of_kin_full_name || "",
      relationship: clientData?.profile?.next_of_kin_relationship || "",
      phone: clientData?.profile?.next_of_kin_contact_number || "",
      altPhone: clientData?.profile?.next_of_kin_alt_contact_number || "",
      email: clientData?.profile?.next_of_kin_email || "",
    });
  };

  return (
    <div className="Info-Palt">
      <div className="Info-Palt-Top">
        <h3>Next of Kin/Emergency Details</h3>
        {!isEditing ? (
          <button
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
                <h5>Full Name</h5>
              </div>
              <div className="Info-TTb-BS-HYH-edit">
                <input
                  value={form.fullName}
                  onChange={handleChange("fullName")}
                />
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Relationship to next of kin</h5>
              </div>
              <div className="Info-TTb-BS-HYH-edit">
                <input
                  value={form.relationship}
                  onChange={handleChange("relationship")}
                />
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Phone Number</h5>
              </div>
              <div className="Info-TTb-BS-HYH-edit">
                <input value={form.phone} onChange={handleChange("phone")} />
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Alt Contact Number</h5>
              </div>
              <div className="Info-TTb-BS-HYH-edit">
                <input
                  value={form.altPhone}
                  onChange={handleChange("altPhone")}
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
          </>
        ) : (
          <>
            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Full Name</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{clientData?.profile?.next_of_kin_full_name || "N/A"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Relationship to next of kin</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{clientData?.profile?.next_of_kin_relationship || "N/A"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Phone Number</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>
                  {clientData?.profile?.next_of_kin_contact_number || "N/A"}
                </p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Alt Contact Number</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>
                  {clientData?.profile?.next_of_kin_alt_contact_number || "N/A"}
                </p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Email Address</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{clientData?.profile?.next_of_kin_email || "N/A"}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NextOfKin;
