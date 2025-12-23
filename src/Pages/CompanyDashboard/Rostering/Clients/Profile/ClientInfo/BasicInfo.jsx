import React from "react";
import { PencilIcon } from "@heroicons/react/24/outline";

const BasicInfo = ({ clientData }) => {
  const fullName = clientData
    ? `${clientData.title ? clientData.title + " " : ""}${
        clientData.firstName
      } ${clientData.lastName}`
    : "N/A";
  const formattedDob = clientData?.dateOfBirth
    ? new Date(clientData.dateOfBirth).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

    // console.log("clientData")
    // console.log(clientData)
    // console.log(clientData)
    // console.log("clientData")

  return (
    <div className="Info-Palt">
      <div className="Info-Palt-Top">
        <h3>Basic Information</h3>
        {/* <a href="#" className="profil-Edit-Btn btn-primary-bg">
          <PencilIcon /> Edit
        </a> */}
      </div>
      <div className="Info-Palt-Main">
        <div className="Info-TTb-BS">
          <div className="Info-TTb-BS-HYH">
            <h5>Full Name </h5>
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
            <p>{formattedDob}</p>
          </div>
        </div>

        <div className="Info-TTb-BS">
          <div className="Info-TTb-BS-HYH">
            <h5>Gender Identity</h5>
          </div>
          <div className="Info-TTb-BS-HYH">
            <p>{clientData?.genderIdentity || "N/A"}</p>
          </div>
        </div>

        <div className="Info-TTb-BS">
          <div className="Info-TTb-BS-HYH">
            <h5>Preferred Name</h5>
          </div>
          <div className="Info-TTb-BS-HYH">
            <p>{clientData?.preferredName || "N/A"}</p>
          </div>
        </div>

        <div className="Info-TTb-BS">
          <div className="Info-TTb-BS-HYH">
            <h5>Contact Number</h5>
          </div>
          <div className="Info-TTb-BS-HYH">
            <p>{clientData?.contactNumber || "N/A"}</p>
          </div>
        </div>

        <div className="Info-TTb-BS">
          <div className="Info-TTb-BS-HYH">
            <h5>Alt. Contact Number</h5>
          </div>
          <div className="Info-TTb-BS-HYH">
            <p>{clientData?.altContactNumber || "N/A"}</p>
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
            <p>{clientData?.maritalStatus || "N/A"}</p>
          </div>
        </div>

        <div className="Info-TTb-BS">
          <div className="Info-TTb-BS-HYH">
            <h5>NHIS Number</h5>
          </div>
          <div className="Info-TTb-BS-HYH">
            <p>{clientData?.nhisNumber || "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;
