import React from "react";
import { PencilIcon } from "@heroicons/react/24/outline";

const CultureInfo = ({ clientData, carePlan = null, loading = false }) => {
  if (loading) {
    return (
      <div className="Info-Palt">
        <div className="Info-Palt-Top">
          <h3>Culture Value and Identity</h3>
        </div>
        <div className="Info-Palt-Main">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // console.log("carePlan")
  // console.log(carePlan)
  // console.log("carePlan")

  return (
    <div className="Info-Palt">
      <div className="Info-Palt-Top">
        <h3>Culture Value and Identity</h3>
        {/* <a href='#' className='profil-Edit-Btn btn-primary-bg'><PencilIcon /> Edit</a> */}
      </div>
      <div className="Info-Palt-Main">
        <div className="Info-TTb-BS">
          <div className="Info-TTb-BS-HYH">
            <h5>Cultural & Religious Background</h5>
          </div>
          <div className="Info-TTb-BS-HYH">
            <p>{carePlan?.cultureValues?.religiousBackground || "N/A"}</p>
          </div>
        </div>

        <div className="Info-TTb-BS">
          <div className="Info-TTb-BS-HYH">
            <h5>Ethnic Group</h5>
          </div>
          <div className="Info-TTb-BS-HYH">
            <p>{carePlan?.cultureValues?.ethnicGroup || "N/A"}</p>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <p>
            Does the client require any specific religious or cultural
            accommodations?
          </p>
          <h4>{carePlan?.cultureValues?.culturalAccommodation || "N/A"}</h4>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Sexuality</h3>
          <div className="JUH-PART">
            <p>What best describes their sexuality?</p>
            <h4>{carePlan?.cultureValues?.sexualityandRelationshipPreferences || "N/A"}</h4>
          </div>
          <div className="JUH-PART">
            <p>
              How does sex, gender, or sexual orientation impact their care
              needs?
            </p>
            <h4>
              {carePlan?.cultureValues?.sexImpartingCareNeeds || "N/A"}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CultureInfo;
