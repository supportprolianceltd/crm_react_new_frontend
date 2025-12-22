import React from "react";
import { PencilIcon, EyeIcon } from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom";

const MedicationDetails = ({ carePlanSection }) => {
  const getDisplayValue = (value) =>
    value === true || value === "yes"
      ? "Yes"
      : value === false || value === "no"
      ? "No"
      : value || "N/A";

  const airwayRiskDetails = carePlanSection?.airwayEquipmentRisk || "N/A";
  const mitigationDetails =
    carePlanSection?.airWayEquipmentMitigationPlan || "N/A";
  const skinInfoDetails = carePlanSection?.skinAdditionalInformation || "N/A";
  const safeguardingInfo =
    carePlanSection?.safeGuardingAdditionalInformation || "N/A";

  const medicationsList = carePlanSection?.medications
    ? carePlanSection.medications
        .map((med) => `${med.drugName} (${med.dosage}, ${med.frequency})`)
        .join(", ")
    : "N/A";
  const allergiesList = carePlanSection?.clientAllergies
    ? carePlanSection.clientAllergies
        .map((all) => `${all.allergy} (${all.severity})`)
        .join(", ")
    : "N/A";

  const bodyMapDetails = carePlanSection?.bodyMap || {};
  const woundType = bodyMapDetails.type || "N/A";
  const size = bodyMapDetails.size || "N/A";
  const location = bodyMapDetails.locationDescription || "N/A";
  const dateObserved = bodyMapDetails.dateFirstObserved
    ? new Date(bodyMapDetails.dateFirstObserved).toLocaleDateString()
    : "N/A";
  const weight = bodyMapDetails.weight || "N/A";
  const height = bodyMapDetails.height || "N/A";

  return (
    <div className="Info-Palt">
      <div className="Info-Palt-Top">
        <h3>Medical Information</h3>
        <a href="#" className="profil-Edit-Btn btn-primary-bg">
          <PencilIcon /> Edit
        </a>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Breathing</h3>
          <div className="JUH-PART">
            <p>Does the client have difficulty in breathing?</p>
            <h4>{getDisplayValue(carePlanSection?.breathingDifficulty)}</h4>
          </div>

          <div className="JUH-PART">
            <p>Is equipment used for airway management?</p>
            <h4>
              {getDisplayValue(carePlanSection?.useAirWayManagementEquipment)}
            </h4>
          </div>

          <div className="JUH-PART">
            <p>What are the risk of using these equipments?</p>
            <h4>{airwayRiskDetails}</h4>
          </div>

          <div className="JUH-PART">
            <p>How will these risks be mitigated?</p>
            <h4>{mitigationDetails}</h4>
          </div>

          <div className="JUH-PART">
            <p>Current Medications</p>
            <h4>{medicationsList}</h4>
          </div>

          <div className="JUH-PART">
            <p>Known Allergies</p>
            <h4>
              {getDisplayValue(carePlanSection?.knownAllergies)}:{" "}
              {allergiesList}
            </h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Skin</h3>
          <div className="JUH-PART">
            <p>Does the client have any pressure sores at present or past?</p>
            <h4>{getDisplayValue(carePlanSection?.haveSkinPressureSores)}</h4>
          </div>

          <div className="JUH-PART">
            <p>
              Is there anything concerning about the condition of the client
              skin?
            </p>
            <h4>
              {getDisplayValue(carePlanSection?.skinPressureConcerningIssues)}
            </h4>
          </div>

          <div className="JUH-PART">
            <p>Skin Additional Information</p>
            <h4>{skinInfoDetails}</h4>
          </div>

          <div className="JUH-PART">
            <p>Has a safeguarding issue been raised?</p>
            <h4>{getDisplayValue(carePlanSection?.raisedSafeGuardingIssue)}</h4>
          </div>

          <div className="JUH-PART">
            <p>Safeguarding Additional Information</p>
            <h4>{safeguardingInfo}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Initial skin integrity assessment</h3>
          <div className="JUH-PART">
            <p>Are there any existing wounds, pressure areas, or bruises?</p>
            <h4>{getDisplayValue(bodyMapDetails.initialSkinIntegrity)}</h4>
          </div>
          <div className="JUH-PART">
            <p>Body Map</p>
            <Link to="body-map" className="body-map-btn">
              <EyeIcon /> View Assessment
            </Link>
          </div>
          <div className="JUH-PART">
            <p>Type</p>
            <h4>{woundType}</h4>
          </div>

          <div className="JUH-PART">
            <p>Size/Grade</p>
            <h4>{size}</h4>
          </div>

          <div className="JUH-PART">
            <p>Location Description</p>
            <h4>{location}</h4>
          </div>

          <div className="JUH-PART">
            <p>Date first observed</p>
            <h4>{dateObserved}</h4>
          </div>

          <div className="JUH-PART">
            <p>Weight (KG)</p>
            <h4>{weight}</h4>
          </div>

          <div className="JUH-PART">
            <p>Height (CM)</p>
            <h4>{height}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationDetails;
