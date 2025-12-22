import React, { useState, useEffect } from "react";
import { PencilIcon } from "@heroicons/react/24/outline";

const ContactInfo = ({ clientData, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    primaryContactName: clientData?.profile?.primary_contact_name || "",
    primaryContactPhone: clientData?.profile?.primary_contact_phone || "",
    email: clientData?.email || "",
    secondaryContactName: clientData?.profile?.secondary_contact_name || "",
    secondaryContactPhone: clientData?.profile?.secondary_contact_phone || "",
  });

  useEffect(() => {
    setForm({
      primaryContactName: clientData?.profile?.primary_contact_name || "",
      primaryContactPhone: clientData?.profile?.primary_contact_phone || "",
      email: clientData?.email || "",
      secondaryContactName: clientData?.profile?.secondary_contact_name || "",
      secondaryContactPhone: clientData?.profile?.secondary_contact_phone || "",
    });
  }, [clientData]);

  const handleChange = (key) => (e) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSave = () => {
    const updated = {
      ...clientData,
      email: form.email,
      profile: {
        ...(clientData?.profile || {}),
        primary_contact_name: form.primaryContactName,
        primary_contact_phone: form.primaryContactPhone,
        secondary_contact_name: form.secondaryContactName,
        secondary_contact_phone: form.secondaryContactPhone,
      },
    };
    if (onUpdate) onUpdate(clientData.id, updated);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setForm({
      primaryContactName: clientData?.profile?.primary_contact_name || "",
      primaryContactPhone: clientData?.profile?.primary_contact_phone || "",
      email: clientData?.email || "",
      secondaryContactName: clientData?.profile?.secondary_contact_name || "",
      secondaryContactPhone: clientData?.profile?.secondary_contact_phone || "",
    });
  };

  return (
    <div className="Info-Palt">
      <div className="Info-Palt-Top">
        <h3>Contact Information</h3>
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
                <h5>Primary Contact</h5>
              </div>
              <div className="Info-TTb-BS-HYH-edit">
                <input
                  value={form.primaryContactName}
                  onChange={handleChange("primaryContactName")}
                />
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Contact Number</h5>
              </div>
              <div className="Info-TTb-BS-HYH-edit">
                <input
                  value={form.primaryContactPhone}
                  onChange={handleChange("primaryContactPhone")}
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
                <h5>Secondary Contact</h5>
              </div>
              <div className="Info-TTb-BS-HYH-edit">
                <input
                  value={form.secondaryContactName}
                  onChange={handleChange("secondaryContactName")}
                />
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Contact Number</h5>
              </div>
              <div className="Info-TTb-BS-HYH-edit">
                <input
                  value={form.secondaryContactPhone}
                  onChange={handleChange("secondaryContactPhone")}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Primary Contact</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{clientData?.profile?.primary_contact_name || "N/A"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Contact Number</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{clientData?.profile?.primary_contact_phone || "N/A"}</p>
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
                <h5>Secondary Contact</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{clientData?.profile?.secondary_contact_name || "N/A"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Contact Number</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{clientData?.profile?.secondary_contact_phone || "N/A"}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContactInfo;
