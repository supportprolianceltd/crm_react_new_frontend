import React from "react";
import { PencilIcon } from "@heroicons/react/24/outline";

const LegalCapacityDetails = ({ onEdit, carePlan = null }) => {
  const getDisplayValue = (value) => (value?.trim() ? value : "Not specified");

  const legalReq = carePlan?.legalRequirement || {};

  console.log("legalReq")
  console.log(legalReq)
  console.log("legalReq")

  return (
    <div className="Info-Palt">
      <div className="Info-Pyalt-Top">
        <h3>Legal Capacity</h3>
        {/* <button onClick={onEdit} className='profil-Edit-Btn btn-primary-bg'><PencilIcon /> Edit</button> */}
      </div>

      {/* 1️⃣ Attorney Information */}
      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Attorney Information</h3>
          <div className="JUH-PART">
            <p>Is there an attorney in place?</p>
            <h4>{legalReq.attorneyInPlace ? "Yes" : "No"}</h4>
          </div>
          {legalReq.attorneyInPlace && (
            <>
              <div className="JUH-PART">
                <p>Attorney Type</p>
                <h4>{getDisplayValue(legalReq.attorneyType)}</h4>
              </div>
              <div className="JUH-PART">
                <p>Attorney Name</p>
                <h4>{getDisplayValue(legalReq.attorneyName)}</h4>
              </div>
              <div className="JUH-PART">
                <p>Attorney Contact</p>
                <h4>{getDisplayValue(legalReq.attorneyContact)}</h4>
              </div>
              <div className="JUH-PART">
                <p>Attorney Email</p>
                <h4>{getDisplayValue(legalReq.attorneyEmail)}</h4>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2️⃣ Solicitor */}
      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Solicitor</h3>
          <div className="JUH-PART">
            <p>Solicitor Details</p>
            <h4>{getDisplayValue(legalReq.solicitor)}</h4>
          </div>
        </div>
      </div>

      {/* 3️⃣ Certificate Information */}
      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Certificate Information</h3>
          <div className="JUH-PART">
            <p>Certificate Number</p>
            <h4>{getDisplayValue(legalReq.certificateNumber)}</h4>
          </div>
        </div>
      </div>

      {/* 4️⃣ Digital Consents and Permissions */}
      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Digital Consents and Permissions</h3>
          <div className="JUH-PART">
            <p>Consents</p>
            <h4>{legalReq.digitalConsentsAndPermissions?.length > 0 ? legalReq.digitalConsentsAndPermissions.join(", ") : "None"}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalCapacityDetails;
