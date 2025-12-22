import React from "react";
import { PencilIcon } from "@heroicons/react/24/outline";

const NutritionHydrationDetails = ({ carePlanSection }) => {
  const getDisplayValue = (value) => {
    if (typeof value === "string" && value.toUpperCase().includes("YES")) {
      return value
        .toLowerCase()
        .replace("yes_", "")
        .replace("_", " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    return value || "N/A";
  };

  const foodTexturesList = carePlanSection?.foodTextures
    ? carePlanSection.foodTextures.split(", ")
    : ["N/A"];
  const strongDislikesDetails = carePlanSection?.strongDislikes || "N/A";

  return (
    <div className="Info-Palt">
      <div className="Info-Palt-Top">
        <h3>Nutrition & Hydration</h3>
        <a href="#" className="profil-Edit-Btn btn-primary-bg">
          <PencilIcon /> Edit
        </a>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Dietary Requirements</h3>
          <div className="JUH-PART">
            <p>What is their diet like?</p>
            <h4>{getDisplayValue(carePlanSection?.dietaryRequirements)}</h4>
          </div>

          <div className="JUH-PART">
            <p>
              Do they have any food and drink allergies and/or intolerances?
            </p>
            <h4>{getDisplayValue(carePlanSection?.foodOrDrinkAllergies)}</h4>
          </div>

          <div className="JUH-PART">
            <p>Specify them</p>
            <h4>
              {getDisplayValue(carePlanSection?.foodAllergiesSpecification)}
            </h4>
          </div>

          <div className="JUH-PART">
            <p>How do these allergies impact them?</p>
            <h4>{getDisplayValue(carePlanSection?.allergiesImpact)}</h4>
          </div>

          <div className="JUH-PART">
            <p>Favourite Foods</p>
            <h4>{getDisplayValue(carePlanSection?.favouriteFoods)}</h4>
          </div>

          {foodTexturesList.map((texture, index) => (
            <div key={index} className="JUH-PART">
              <p>Food Texture</p>
              <h4>{texture}</h4>
            </div>
          ))}
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Eating and swallowing</h3>
          <div className="JUH-PART">
            <p>What is their appetite like?</p>
            <h4>{getDisplayValue(carePlanSection?.appetiteLevel)}</h4>
          </div>

          <div className="JUH-PART">
            <p>What is their swallow like?</p>
            <h4>{getDisplayValue(carePlanSection?.swallowingDifficulties)}</h4>
          </div>

          <div className="JUH-PART">
            <p>Are there any medications that affect their swallowing?</p>
            <h4>
              {getDisplayValue(carePlanSection?.medicationsAffectingSwallowing)}
            </h4>
          </div>

          <div className="JUH-PART">
            <p>Specify them</p>
            <h4>
              {getDisplayValue(
                carePlanSection?.specifyMedicationsAffectingSwallowing
              )}
            </h4>
          </div>

          <div className="JUH-PART">
            <p>Can they feed themselves?</p>
            <h4>{getDisplayValue(carePlanSection?.canFeedSelf)}</h4>
          </div>

          <div className="JUH-PART">
            <p>Mealtime Support</p>
            <h4>{getDisplayValue(carePlanSection?.mealtimeSupport)}</h4>
          </div>

          <div className="JUH-PART">
            <p>Hydration Schedule</p>
            <h4>{getDisplayValue(carePlanSection?.hydrationSchedule)}</h4>
          </div>

          <div className="JUH-PART">
            <p>Specify them</p>
            <h4>{strongDislikesDetails}</h4>
          </div>

          <div className="JUH-PART">
            <p>Fluid Preferences</p>
            <h4>{getDisplayValue(carePlanSection?.fluidPreferences)}</h4>
          </div>

          <div className="JUH-PART">
            <p>Can they prepare a light meal?</p>
            <h4>{getDisplayValue(carePlanSection?.canPrepareLightMeals)}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionHydrationDetails;
