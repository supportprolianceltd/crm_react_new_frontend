import React from "react";
import { PencilIcon } from "@heroicons/react/24/outline";

const RoutineDetails = ({ carePlanSection }) => {
  const getDisplayValue = (value) =>
    value === true || value === "yes"
      ? "Yes"
      : value === false || value === "no"
      ? "No"
      : value || "N/A";

  const dailyRoutineDetails = carePlanSection?.dailyRoutine || "N/A";
  const dislikesImpact = carePlanSection?.dislikesEffect || "N/A";
  const hobbiesImpact = carePlanSection?.hobbiesRoutinesEffect || "N/A";

  return (
    <div className="Info-Palt">
      <div className="Info-Palt-Top">
        <h3>Routine</h3>
        <a href="#" className="profil-Edit-Btn btn-primary-bg">
          <PencilIcon /> Edit
        </a>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Preferences & Routines</h3>
          <div className="JUH-PART">
            <p>
              Do they have any specific routines or preferences important to
              them?
            </p>
            <h4>
              {getDisplayValue(carePlanSection?.haveSpecificImportantRoutine)}
            </h4>
          </div>

          <div className="JUH-PART">
            <p>Specify</p>
            <h4>{dailyRoutineDetails}</h4>
          </div>

          <div className="JUH-PART">
            <p>Do they have anything that may worry or upset them?</p>
            <h4>{getDisplayValue(carePlanSection?.haveDislikes)}</h4>
          </div>

          <div className="JUH-PART">
            <p>Specify</p>
            <h4>{carePlanSection?.aboutImportantPerson || "N/A"}</h4>
          </div>

          <div className="JUH-PART">
            <p>How does this impact their care needs?</p>
            <h4>{dislikesImpact}</h4>
          </div>

          <div className="JUH-PART">
            <p>Mental wellbeing tracking?</p>
            <h4>{getDisplayValue(carePlanSection?.mentalWellbeingTracking)}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutineDetails;
