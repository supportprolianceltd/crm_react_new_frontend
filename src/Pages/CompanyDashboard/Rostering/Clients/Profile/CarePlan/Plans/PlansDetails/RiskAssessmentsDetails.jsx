import React from "react";
import { PencilIcon } from "@heroicons/react/24/outline";

const RiskAssessmentDetails = ({ carePlanSection }) => {
  const getDisplayValue = (value) =>
    value === true || value === "yes"
      ? "Yes"
      : value === false || value === "no"
      ? "No"
      : value || "N/A";

  const supportNeedsSummary = carePlanSection?.primarySupportNeed
    ? `Personal Care: ${carePlanSection.primarySupportNeed}`
    : "N/A";

  const additionalNotes = carePlanSection?.details || "N/A";

  const riskFactorsList =
    carePlanSection?.riskFactorsAndAlerts?.join(", ") || "N/A";

  const areasSupportList =
    carePlanSection?.areasRequiringSupport?.join(", ") || "N/A";

  const favouriteFoodsList = "N/A"; // Not present in data

  const foodTexture = "N/A"; // Not present in data

  const homeLayout = carePlanSection?.homeLayout || "N/A";

  const safetyFeatures =
    carePlanSection?.safetyFeaturesPresent?.join(", ") || "N/A";

  const hazards = carePlanSection?.hazards?.join(", ") || "N/A";

  const accessibility =
    carePlanSection?.accessibilityNeeds?.join(", ") || "N/A";

  const loneWalker = getDisplayValue(carePlanSection?.loneWorkerConsideration);

  const riskAssessmentTraining = getDisplayValue(
    carePlanSection?.riskAssessmentAndTraining
  );

  return (
    <div className="Info-Palt">
      <div className="Info-Palt-Top">
        <h3>Risk Assessments</h3>
        <a href="#" className="profil-Edit-Btn btn-primary-bg">
          <PencilIcon /> Edit
        </a>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>
              Summary of primary support needs (mobility, personal care,
              nutrition, continence, cognition)
            </p>
            <h4>{supportNeedsSummary}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>Additional Notes</p>
            <h4>{additionalNotes}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>Risk factors & Alerts</p>
            <h4>{riskFactorsList}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>Areas requiring support</p>
            <h4>{areasSupportList}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>Favourite Foods</p>
            <h4>{favouriteFoodsList}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>Food Texture</p>
            <h4>{foodTexture}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Environmental risk assessment</h3>
          <div className="JUH-PART">
            <p>Home layout?</p>
            <h4>{homeLayout}</h4>
          </div>

          <div className="JUH-PART">
            <p>Safety features present</p>
            <h4>{safetyFeatures}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>Hazards</p>
            <h4>{hazards}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>Accessibility</p>
            <h4>{accessibility}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>Lone Walker Considerations</p>
            <h4>{loneWalker}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>Risk Assessment and Training</p>
            <h4>{riskAssessmentTraining}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAssessmentDetails;
