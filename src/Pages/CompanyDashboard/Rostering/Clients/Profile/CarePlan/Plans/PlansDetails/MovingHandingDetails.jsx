import React from "react";
import { PencilIcon } from "@heroicons/react/24/outline";

const MovingHandlingDetails = ({ carePlanSection }) => {
  const getDisplayValue = (value) =>
    value === true || value === "yes"
      ? "Yes"
      : value === false || value === "no"
      ? "No"
      : value || "N/A";

  const equipmentNeeds = carePlanSection?.equipmentsNeeds || "N/A";

  const painDuringRestingAndMovement = getDisplayValue(
    carePlanSection?.anyPainDuringRestingAndMovement
  );

  const cognitiveImpairment = getDisplayValue(
    carePlanSection?.anyCognitiveImpairment
  );

  const behaviouralChanges = getDisplayValue(
    carePlanSection?.behaviouralChanges
  );

  const describeBehaviouralChanges =
    carePlanSection?.describeBehaviouralChanges || "N/A";

  const walkIndependently = getDisplayValue(carePlanSection?.walkIndependently);

  const manageStairs = getDisplayValue(carePlanSection?.manageStairs);

  const sittingToStandingDependence = getDisplayValue(
    carePlanSection?.sittingToStandingDependence
  );

  const limitedSittingBalance = getDisplayValue(
    carePlanSection?.limitedSittingBalance
  );

  const turnInBed = getDisplayValue(carePlanSection?.turnInBed);

  const lyingToSittingDependence = getDisplayValue(
    carePlanSection?.lyingToSittingDependence
  );

  const gettingUpFromChairDependence = getDisplayValue(
    carePlanSection?.gettingUpFromChairDependence
  );

  const bathOrShower = carePlanSection?.bathOrShower || "N/A";

  const chairToCommodeOrBed = getDisplayValue(
    carePlanSection?.chairToCommodeOrBed
  );

  const profilingBedAndMattress = getDisplayValue(
    carePlanSection?.profilingBedAndMattress
  );

  const transferRisks = carePlanSection?.transferRisks?.join(", ") || "N/A";

  const behaviouralChallenges =
    carePlanSection?.behaviouralChallenges?.join(", ") || "N/A";

  const riskManagementPlan = carePlanSection?.riskManagementPlan || "N/A";

  const locationRiskReview = carePlanSection?.locationRiskReview || "N/A";

  const evacuationPlanRequired = getDisplayValue(
    carePlanSection?.EvacuationPlanRequired
  );

  const dailyGoal = carePlanSection?.dailyGoal || "N/A";

  const intakeLog = carePlanSection?.IntakeLog || [];

  return (
    <div className="Info-Palt">
      <div className="Info-Palt-Top">
        <h3>Moving & Handling</h3>
        <a href="#" className="profil-Edit-Btn btn-primary-bg">
          <PencilIcon /> Edit
        </a>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>Equipment Needs</p>
            <h4>{equipmentNeeds}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>
              Does the client have any pain resting/ resting during movement?
            </p>
            <h4>{painDuringRestingAndMovement}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>Does the client have any cognitive impairment?</p>
            <h4>{cognitiveImpairment}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>Does the client have any behaviour that changes?</p>
            <h4>{behaviouralChanges}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>Please Describe</p>
            <h4>{describeBehaviouralChanges}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>Can the client walk independently?</p>
            <h4>{walkIndependently}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>Can the client manage stairs?</p>
            <h4>{manageStairs}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>
              How dependent is the client when moving from a sitting to standing
              position?
            </p>
            <h4>{sittingToStandingDependence}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>Does the client have limited sitting balance?</p>
            <h4>{limitedSittingBalance}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>Can the client move and turn independently in bed?</p>
            <h4>{turnInBed}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>
              Can the client move from a lying to a sitting position
              independently?
            </p>
            <h4>{lyingToSittingDependence}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>How dependent is the client when getting up from chair?</p>
            <h4>{gettingUpFromChairDependence}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>Does the client use a bath or shower?</p>
            <h4>{bathOrShower}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>
              Can the client transfer independently from a chair to a commode or
              bed?
            </p>
            <h4>{chairToCommodeOrBed}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>Does the client use profiling bed and mattress?</p>
            <h4>{profilingBedAndMattress}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>Transfer risks</p>
            <h4>{transferRisks}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>Behavioural Challenges</p>
            <h4>{behaviouralChallenges}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>Risk Management Plan</p>
            <h4>{riskManagementPlan}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>Location Risk Review</p>
            <h4>{locationRiskReview}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>Evacuation Plan Required</p>
            <h4>{evacuationPlanRequired}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>Daily Goal</p>
            <h4>{dailyGoal}</h4>
          </div>
        </div>
      </div>

      {intakeLog.length > 0 && (
        <div className="Info-Palt-Main No-Grid">
          <div className="Info-TTb-BS-HYH">
            <h3>Intake Log</h3>
            {intakeLog.map((log, index) => (
              <div key={index} className="JUH-PART">
                <p>
                  Time: {log.time}, Amount: {log.amount}, Notes:{" "}
                  {log.notes || "N/A"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovingHandlingDetails;
