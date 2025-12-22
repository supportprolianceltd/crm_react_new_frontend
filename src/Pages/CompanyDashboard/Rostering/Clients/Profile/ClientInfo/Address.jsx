import React from "react";
import { PencilIcon } from "@heroicons/react/24/outline";

const Address = ({ clientData }) => {
  const abode = clientData?.livesAlone
    ? "Lives Alone"
    : clientData?.typeOfResidence
    ? clientData.typeOfResidence
    : "N/A";

  return (
    <div className="Info-Palt">
      <div className="Info-Palt-Top">
        <h3>Address Details</h3>
        {/* <a href="#" className="profil-Edit-Btn btn-primary-bg">
          <PencilIcon /> Edit
        </a> */}
      </div>
      <div className="Info-Palt-Main">
        <div className="Info-TTb-BS">
          <div className="Info-TTb-BS-HYH">
            <h5>Address line </h5>
          </div>
          <div className="Info-TTb-BS-HYH">
            <p>{clientData?.addressLine || "N/A"}</p>
          </div>
        </div>

        <div className="Info-TTb-BS">
          <div className="Info-TTb-BS-HYH">
            <h5>Town/City</h5>
          </div>
          <div className="Info-TTb-BS-HYH">
            <p>{clientData?.town || "N/A"}</p>
          </div>
        </div>

        <div className="Info-TTb-BS">
          <div className="Info-TTb-BS-HYH">
            <h5>County</h5>
          </div>
          <div className="Info-TTb-BS-HYH">
            <p>{clientData?.county || "N/A"}</p>
          </div>
        </div>

        <div className="Info-TTb-BS">
          <div className="Info-TTb-BS-HYH">
            <h5>Post Code</h5>
          </div>
          <div className="Info-TTb-BS-HYH">
            <p>{clientData?.postcode || "N/A"}</p>
          </div>
        </div>

        <div className="Info-TTb-BS">
          <div className="Info-TTb-BS-HYH">
            <h5>Abode</h5>
          </div>
          <div className="Info-TTb-BS-HYH">
            <p>{abode}</p>
          </div>
        </div>

        <div className="Info-TTb-BS">
          <div className="Info-TTb-BS-HYH">
            <h5>Carer clockin radius</h5>
          </div>
          <div className="Info-TTb-BS-HYH">
            <p>200meters</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Address;
