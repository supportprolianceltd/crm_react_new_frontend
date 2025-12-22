import React from "react";
import { PencilIcon } from "@heroicons/react/24/outline";

const ContactInfo = ({ clientData }) => {
  return (
    <div className="Info-Palt">
      <div className="Info-Palt-Top">
        <h3>Contact Information</h3>
        {/* <a href="#" className="profil-Edit-Btn btn-primary-bg">
          <PencilIcon /> Edit
        </a> */}
      </div>
      <div className="Info-Palt-Main">
        <div className="Info-TTb-BS">
          <div className="Info-TTb-BS-HYH">
            <h5>Primary Contact</h5>
          </div>
          <div className="Info-TTb-BS-HYH">
            <p>{clientData?.primaryContactName || "N/A"}</p>
          </div>
        </div>

        <div className="Info-TTb-BS">
          <div className="Info-TTb-BS-HYH">
            <h5>Contact Number</h5>
          </div>
          <div className="Info-TTb-BS-HYH">
            <p>{clientData?.primaryContactPhone || "N/A"}</p>
          </div>
        </div>

        <div className="Info-TTb-BS">
          <div className="Info-TTb-BS-HYH">
            <h5>Email Address</h5>
          </div>
          <div className="Info-TTb-BS-HYH">
            <p>{clientData?.primaryContactEmail || "N/A"}</p>
          </div>
        </div>

        <div className="Info-TTb-BS">
          <div className="Info-TTb-BS-HYH">
            <h5>Secondary Contact</h5>
          </div>
          <div className="Info-TTb-BS-HYH">
            <p>{clientData?.secondaryContactName || "N/A"}</p>
          </div>
        </div>

        <div className="Info-TTb-BS">
          <div className="Info-TTb-BS-HYH">
            <h5>Contact Number</h5>
          </div>
          <div className="Info-TTb-BS-HYH">
            <p>{clientData?.secondaryContactPhone || "N/A"}</p>
          </div>
        </div>

        <div className="Info-TTb-BS">
          <div className="Info-TTb-BS-HYH">
            <h5>Email Address</h5>
          </div>
          <div className="Info-TTb-BS-HYH">
            <p>{clientData?.secondaryContactEmail || "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
