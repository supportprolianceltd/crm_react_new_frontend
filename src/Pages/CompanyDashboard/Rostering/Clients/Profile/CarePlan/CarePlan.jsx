import React, { useState, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Home from "./Home";
import CareEssentials from "./Plans/CareEssentials";
import Routine from "./Plans/Routine";
import Nutrition from "./Plans/NutritionHydration";
import Medication from "./Plans/Medication";
import Safety from "./Plans/RiskAssessments";
import Mobility from "./Plans/MovingHanding";
import Wellbeing from "./Plans/PsychologicalWellbeing";
import SocialActivities from "./Plans/SocialSupport";
import AdministrativeNotes from "./Plans/AdministrativeNotes";
import EnvironmentalInformation from "./Plans/EnvironmentalInformation";
import BodyMap from "./Plans/PlansDetails/BodyMap/BodyMap";
import { fetchCarePlanByClient } from "../../../config/apiConfig";
import LoadingState from "../../../../../../components/LoadingState";
import EmptyState from "../../../../../../components/EmptyState";

const CarePlan = ({ clientData }) => {
  const clientId = clientData?.id;
  const navigate = useNavigate();
  const [carePlan, setCarePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCarePlan = async () => {
      if (!clientId) {
        setError("Client ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchCarePlanByClient(clientId);
        setCarePlan(data);
      } catch (err) {
        setError("Failed to fetch care plan");
      } finally {
        setLoading(false);
      }
    };

    loadCarePlan();
  }, [clientId]);

  if (loading) {
    return <LoadingState text="Loading care plan..." />;
  }

  if (error) {
    return <div className="CarePlan">Error: {error}</div>;
  }

  if (!carePlan || carePlan.length === 0) {
    return (
      <div className="CarePlan">
        <EmptyState
          message="No Care Plan Found"
          description="It looks like there is no care plan for this client yet."
          cta={{
            text: "Create Care Plan",
            onClick: () =>
              // navigate(`/company/client/create-care-plan/${clientData?.id}`),
              navigate(
                `/company/rostering/profile/care-plan/create-care-plan/${clientData?.id}`
              ),
          }}
        />
      </div>
    );
  }

  const carePlanId = carePlan[0]?.id;

  return (
    <div className="CarePlan">
      <Routes>
        {/* Default Care Plan Home - use empty string for exact match */}
        <Route
          path=""
          element={
            <Home
              carePlan={carePlan}
              carePlanId={carePlanId}
              clientData={clientData}
            />
          }
        />

        {/* Care Plan Sections - relative paths (no leading /) */}
        <Route
          path="care-essentials"
          element={
            <CareEssentials
              carePlanSection={carePlan?.[0]?.personalCare}
              carePlanId={carePlanId}
              clientData={clientData}
            />
          }
        />
        <Route
          path="routine"
          element={
            <Routine
              carePlanSection={carePlan?.[0]?.routine}
              carePlanId={carePlanId}
              clientData={clientData}
            />
          }
        />
        <Route
          path="nutrition"
          element={
            <Nutrition
              carePlanSection={carePlan?.[0]?.foodHydration}
              clientData={clientData}
            />
          }
        />
        <Route
          path="medication"
          element={
            <Medication
              carePlanSection={carePlan?.[0]?.medicalInfo}
              carePlanId={carePlanId}
              clientData={clientData}
            />
          }
        />
        <Route
          path="risk-assessments"
          element={
            <Safety
              carePlanSection={carePlan?.[0]?.riskAssessment}
              carePlanId={carePlanId}
              clientData={clientData}
            />
          }
        />
        <Route
          path="moving-handing"
          element={
            <Mobility
              carePlanSection={carePlan?.[0]?.movingHandling}
              carePlanId={carePlanId}
              clientData={clientData}
            />
          }
        />
        <Route
          path="wellbeing"
          element={
            <Wellbeing
              carePlanSection={carePlan?.[0]?.psychologicalInfo}
              carePlanId={carePlanId}
              clientData={clientData}
            />
          }
        />
        <Route
          path="social-support"
          element={
            <SocialActivities
              carePlanSection={carePlan?.[0]?.cultureValues}
              carePlanId={carePlanId}
              clientData={clientData}
            />
          }
        />
        <Route
          path="administrative-notes"
          element={
            <AdministrativeNotes
              carePlanSection={carePlan?.[0]}
              carePlanId={carePlanId}
              clientData={clientData}
            />
          }
        />
        <Route
          path="environmental-information"
          element={
            <EnvironmentalInformation
              carePlanSection={carePlan?.[0]}
              carePlanId={carePlanId}
              clientData={clientData}
            />
          }
        />
        <Route
          path="medication/body-map"
          element={
            <BodyMap
              carePlanSection={carePlan?.[0]?.bodyMap}
              carePlanId={carePlanId}
              clientData={clientData}
            />
          }
        />
      </Routes>
    </div>
  );
};

export default CarePlan;
