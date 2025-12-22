import React from "react";
import { PencilIcon } from "@heroicons/react/24/outline";

const NextOfKin = ({ clientData }) => {
  return (
    <div className="Info-Palt">
    
      <div className="Info-Palt-Main">
        <div className="Info-TTb-BS">
          <div className="Info-TTb-BS-HYH">
            <h5>Full Name</h5>
          </div>
          <div className="Info-TTb-BS-HYH">
            <p>{clientData?.nextOfKinFullName || "N/A"}</p>
          </div>
        </div>

        <div className="Info-TTb-BS">
          <div className="Info-TTb-BS-HYH">
            <h5>Relationship to next of kin</h5>
          </div>
          <div className="Info-TTb-BS-HYH">
            <p>{clientData?.nextOfKinRelationship || "N/A"}</p>
          </div>
        </div>

        <div className="Info-TTb-BS">
          <div className="Info-TTb-BS-HYH">
            <h5>Phone Number</h5>
          </div>
          <div className="Info-TTb-BS-HYH">
            <p>{clientData?.nextOfKinContactNumber || "N/A"}</p>
          </div>
        </div>

        <div className="Info-TTb-BS">
          <div className="Info-TTb-BS-HYH">
            <h5>Alt Contact Number</h5>
          </div>
          <div className="Info-TTb-BS-HYH">
            <p>{clientData?.nextOfKinAltContactNumber || "N/A"}</p>
          </div>
        </div>

        <div className="Info-TTb-BS">
          <div className="Info-TTb-BS-HYH">
            <h5>Email Address</h5>
          </div>
          <div className="Info-TTb-BS-HYH">
            <p>{clientData?.nextOfKinEmail || "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NextOfKin;
