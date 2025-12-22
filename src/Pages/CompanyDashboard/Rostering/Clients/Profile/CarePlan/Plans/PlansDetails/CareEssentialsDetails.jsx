import React from "react";
import { PencilIcon } from "@heroicons/react/24/outline";

const CareEssentialsDetails = ({ carePlanSection, onEdit }) => {
  const getDisplayValue = (value) => {
    if (!value) return "N/A";
    if (typeof value === "string" && value.toUpperCase().includes("YES")) {
      return value
        .toLowerCase()
        .replace("yes_", "")
        .replace("_", " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    if (typeof value === "string" && value.includes("_")) {
      return value
        .replace(/_/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    return value;
  };

  const getDisplayList = (values) => {
    if (!values) return "N/A";
    const formatted = Array.isArray(values)
      ? values.map(getDisplayValue).filter(Boolean)
      : [getDisplayValue(values)];
    return formatted.length > 0 ? formatted.join(", ") : "N/A";
  };

  const groomingNeedsList = getDisplayList(carePlanSection?.groomingNeeds);
  const toiletingSupportList = getDisplayList(
    carePlanSection?.toiletingSupport
  );
  const communicationNeedsList = getDisplayList(
    carePlanSection?.communicationStyleNeeds
  );

  return (
    <div className="Info-Palt">
      <div className="Info-Palt-Top">
        <h3>Care Essentials</h3>
        <button onClick={onEdit} className="profil-Edit-Btn btn-primary-bg">
          <PencilIcon /> Edit
        </button>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Bathing/Showering Preferences</h3>
          <div className="JUH-PART">
            <p>Can they wash themselves?</p>
            <h4>{getDisplayValue(carePlanSection?.bathingAndShowering)}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Oral Hygiene</h3>
          <div className="JUH-PART">
            <p>Can they maintain oral Hygiene?</p>
            <h4>{getDisplayValue(carePlanSection?.oralHygiene)}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Personal Appearance</h3>
          <div className="JUH-PART">
            <p>Can they maintain their personal appearance?</p>
            <h4>{getDisplayValue(carePlanSection?.maintainThemselves)}</h4>
          </div>
          <div className="JUH-PART">
            <p>Can they dress themselves?</p>
            <h4>{getDisplayValue(carePlanSection?.dressThemselves)}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Grooming Needs</h3>
          <div className="JUH-PART">
            <p>what grooming needs does the client need help with?</p>
            <h4>{groomingNeedsList}</h4>
          </div>
          {carePlanSection?.otherGrooming && (
            <div className="JUH-PART">
              <p>Other grooming needs (specify):</p>
              <h4>{getDisplayValue(carePlanSection?.otherGrooming)}</h4>
            </div>
          )}
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Toilet</h3>
          <div className="JUH-PART">
            <p>Which best describes their toilet usage?</p>
            <h4>{getDisplayValue(carePlanSection?.toiletUsage)}</h4>
          </div>
          <div className="JUH-PART">
            <p>Do they have control over their bowels?</p>
            <h4>{getDisplayValue(carePlanSection?.bowelControl)}</h4>
          </div>
          <div className="JUH-PART">
            <p>Do they have control over their bladder?</p>
            <h4>{getDisplayValue(carePlanSection?.bladderControl)}</h4>
          </div>
          <div className="JUH-PART">
            <p>Do they need support with the following?</p>
            <h4>{toiletingSupportList}</h4>
          </div>
          {carePlanSection?.otherContinence && (
            <div className="JUH-PART">
              <p>Other continence support (specify):</p>
              <h4>{getDisplayValue(carePlanSection?.otherContinence)}</h4>
            </div>
          )}
        </div>
      </div>

      {carePlanSection?.additionalNotes && (
        <div className="Info-Palt-Main No-Grid">
          <div className="Info-TTb-BS-HYH">
            <h3>Additional Notes</h3>
            <div className="JUH-PART">
              <p>Additional Notes</p>
              <h4>{carePlanSection.additionalNotes}</h4>
            </div>
          </div>
        </div>
      )}

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Continence Care</h3>
          <div className="JUH-PART">
            <p>Continence Care</p>
            <h4>{getDisplayValue(carePlanSection?.continenceCare)}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Mobility Assistance</h3>
          <div className="JUH-PART">
            <p>Mobility Assistance</p>
            <h4>{getDisplayValue(carePlanSection?.mobilityAssistance)}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Communication</h3>
          <div className="JUH-PART">
            <p>Preferred Language</p>
            <h4>{getDisplayValue(carePlanSection?.preferredLanguage)}</h4>
          </div>
          <div className="JUH-PART">
            <p>Communication Style Needs</p>
            <h4>{communicationNeedsList}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareEssentialsDetails;
