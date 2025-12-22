import React from "react";
import { PencilIcon } from "@heroicons/react/24/outline";
import {
  normalizeText,
  getDisplayValue,
} from "../../../../../../../../utils/helpers";

const EnvironmentalInformationDetails = ({ carePlanSection }) => {
  const psychologicalInfo = carePlanSection?.psychologicalInfo || {};

  const canDoHousekeeping =
    normalizeText(psychologicalInfo?.canTheyDoHouseKeeping) || "N/A";

  const hasHousekeepingSupport =
    getDisplayValue(psychologicalInfo?.houseKeepingSupport ? "Yes" : "No") ||
    "N/A";

  const housekeepingAdditionalNotes =
    normalizeText(psychologicalInfo?.houseKeepingAdditionalNotes) || "N/A";

  return (
    <div className="Info-Palt">
      <div className="Info-Palt-Top">
        <h3>Environmental Information</h3>
        <a href="#" className="profil-Edit-Btn btn-primary-bg">
          <PencilIcon /> Edit
        </a>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Housekeeping</h3>
          <div className="JUH-PART">
            <p>Can they do their housekeeping (cleaning)?</p>
            <h4>{canDoHousekeeping}</h4>
          </div>

          <div className="JUH-PART">
            <p>Do they have any support for their housekeeping (cleaning)?</p>
            <h4>{hasHousekeepingSupport}</h4>
          </div>

          <div className="JUH-PART">
            <p>Additional Details</p>
            <h4>{housekeepingAdditionalNotes}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalInformationDetails;
