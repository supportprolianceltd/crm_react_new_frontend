import React, { useState, useEffect } from "react";
import { PencilIcon } from "@heroicons/react/24/outline";

const Address = ({ clientData, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    addressLine: clientData?.profile?.address_line || "",
    town: clientData?.profile?.town || "",
    county: clientData?.profile?.county || "",
    postcode: clientData?.profile?.postcode || "",
  });

  useEffect(() => {
    setForm({
      addressLine: clientData?.profile?.address_line || "",
      town: clientData?.profile?.town || "",
      county: clientData?.profile?.county || "",
      postcode: clientData?.profile?.postcode || "",
    });
  }, [clientData]);

  const handleChange = (k) => (e) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = () => {
    const updated = {
      ...clientData,
      profile: {
        ...(clientData?.profile || {}),
        address_line: form.addressLine,
        town: form.town,
        county: form.county,
        postcode: form.postcode,
      },
    };
    if (onUpdate) onUpdate(clientData.id, updated);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setForm({
      addressLine: clientData?.profile?.address_line || "",
      town: clientData?.profile?.town || "",
      county: clientData?.profile?.county || "",
      postcode: clientData?.profile?.postcode || "",
    });
  };

  const abode = clientData?.livesAlone
    ? "Lives Alone"
    : clientData?.typeOfResidence
    ? clientData.typeOfResidence
    : "N/A";

  return (
    <div className="Info-Palt">
      <div className="Info-Palt-Top">
        <h3>Address Details</h3>
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
                <h5>Address line </h5>
              </div>
              <div className="Info-TTb-BS-HYH-edit">
                <input
                  value={form.addressLine}
                  onChange={handleChange("addressLine")}
                />
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Town/City</h5>
              </div>
              <div className="Info-TTb-BS-HYH-edit">
                <input value={form.town} onChange={handleChange("town")} />
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>County</h5>
              </div>
              <div className="Info-TTb-BS-HYH-edit">
                <input value={form.county} onChange={handleChange("county")} />
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Post Code</h5>
              </div>
              <div className="Info-TTb-BS-HYH-edit">
                <input
                  value={form.postcode}
                  onChange={handleChange("postcode")}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Address line </h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{clientData?.profile?.address_line || "N/A"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Town/City</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{clientData?.profile?.town || "N/A"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>County</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{clientData?.profile?.county || "N/A"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Post Code</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{clientData?.profile?.postcode || "N/A"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Carer clockin radius</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>200 meters</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Address;
