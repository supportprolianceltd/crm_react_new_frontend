import React from "react";
import CheckboxGroup from "../../../../../components/CheckboxGroup";
import InputField from "../../../../../components/Input/InputField";
import TextAreaField from "../../../../../components/Input/TextAreaField";
import AddTaskComponent from "../components/AddTaskComponent";

const FoodNutritionHydrationStep = ({
  formData,
  handleChange,
  handleCheckboxArrayChange,
  handleSingleCheckboxChange,
  handleAddTask,
}) => {
  return (
    <>
      <div className="content-section">
        <div className="form-section">
          <h2 style={{ fontWeight: 600 }}>Food, Nutrition & Hydration</h2>

          {/* Dietary requirements */}
          <div className="form-section">
            <h3>Dietary requirements</h3>

            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="What is their diet like?"
                options={[
                  { value: "vegetarian", label: "Vegetarian" },
                  { value: "vegan", label: "Vegan" },
                  { value: "halal", label: "Halal" },
                  { value: "kosher", label: "Kosher" },
                  { value: "diabetic", label: "Diabetic" },
                ]}
                value={formData.dietary_requirements || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "dietary_requirements",
                    value: newValues,
                  })
                }
                multiple={true}
                row={true}
              />

              <CheckboxGroup
                label="Do they have any food and drink allergies or intolerances?"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={formData.has_allergies_intolerances || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "has_allergies_intolerances",
                    value: newValues,
                  })
                }
                multiple={false}
                row={true}
              />

              {(formData.has_allergies_intolerances || []) === "yes" && (
                <>
                  <InputField
                    label="Specify them"
                    name="allergies_specify"
                    value={formData.allergies_specify || ""}
                    onChange={handleChange}
                    placeholder="Input text"
                  />
                  <InputField
                    label="How do these allergies impact them?"
                    name="allergies_impact"
                    value={formData.allergies_impact || ""}
                    onChange={handleChange}
                    placeholder="Input text"
                  />
                </>
              )}
            </div>
          </div>

             {/* Dietary requirement foods */}
         <TextAreaField
          label="Dietary requirement"
          name="dietary_requirement"  // Changed: no space
          value={formData.dietary_requirement || ""}
          onChange={handleChange}
          placeholder="Input text"
        />

          {/* Favourite foods */}
          <TextAreaField
            label="Favourite foods"
            name="favourite_foods"
            value={formData.favourite_foods || ""}
            onChange={handleChange}
            placeholder="Input text"
          />

          {/* Eating and swallowing */}
          <div className="form-section">
            <h3>Eating and swallowing</h3>

            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="What is their appetite like?"
                options={[
                  { value: "normal_for_them", label: "Normal for them" },
                  { value: "less_than_normal", label: "Less than normal" },
                  { value: "more_than_normal", label: "More than normal" },
                ]}
                value={formData.appetite || []}
                onChange={(newValues) =>
                  handleChange({ name: "appetite", value: newValues })
                }
                multiple={false}
                row={true}
              />
            </div>

            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="What is their swallow like?"
                options={[
                  {
                    value: "able_to_swallow_safely",
                    label: "Able to swallow safely",
                  },
                  {
                    value: "impaired_when_swallowing_fluids",
                    label: "Impaired when swallowing fluids",
                  },
                  {
                    value: "impaired_when_swallowing_solids",
                    label: "Impaired when swallowing solids",
                  },
                ]}
                value={formData.swallow || []}
                onChange={(newValues) =>
                  handleChange({ name: "swallow", value: newValues })
                }
                multiple={false}
                row={true}
              />
            </div>

            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="Are there any medications that affect ability to swallow?"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={formData.medications_affect_swallowing || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "medications_affect_swallowing",
                    value: newValues,
                  })
                }
                multiple={false}
                row={true}
              />
            </div>

            {(formData.medications_affect_swallowing || []) === "yes" && (
              <InputField
                label="Specify"
                name="medications_affect_swallowing_specify"
                value={formData.medications_affect_swallowing_specify || ""}
                onChange={handleChange}
                placeholder="Input text"
              />
            )}
          </div>

          {/* Can they feed themselves? */}
          <div
            className="checkbox-group-wrapper"
            style={{ marginBottom: "0.8rem" }}
          >
            <CheckboxGroup
              label="Can they feed themselves?"
              options={[
                { value: "yes_independently", label: "Yes, independently" },
                { value: "yes_with_help", label: "Yes, with help" },
                { value: "no_fully_dependent", label: "No, fully dependent" },
              ]}
              value={formData.can_feed_self || []}
              onChange={(newValues) =>
                handleChange({ name: "can_feed_self", value: newValues })
              }
              multiple={false}
              row={true}
            />
          </div>

          {/* Can they prepare a light meal? */}
          <div
            className="checkbox-group-wrapper"
            style={{ marginBottom: "0.8rem" }}
          >
            <CheckboxGroup
              label="Can they prepare a light meal?"
              options={[
                { value: "yes_independently", label: "Yes, independently" },
                { value: "yes_with_help", label: "Yes, with help" },
                { value: "no_fully_dependent", label: "No, fully dependent" },
              ]}
              value={formData.can_prepare_light_meal || []}
              onChange={(newValues) =>
                handleChange({
                  name: "can_prepare_light_meal",
                  value: newValues,
                })
              }
              multiple={false}
              row={true}
            />
          </div>

          {/* Can they cook their meals? */}
          <div
            className="checkbox-group-wrapper"
            style={{ marginBottom: "0.8rem" }}
          >
            <CheckboxGroup
              label="Can they cook their meals?"
              options={[
                { value: "yes_independently", label: "Yes, independently" },
                { value: "yes_with_help", label: "Yes, with help" },
                { value: "no_fully_dependent", label: "No, fully dependent" },
              ]}
              value={formData.can_cook_meals || []}
              onChange={(newValues) =>
                handleChange({ name: "can_cook_meals", value: newValues })
              }
              multiple={false}
              row={true}
            />
          </div>

          {/* Who's responsible for the client's food? */}
          <InputField
            label="Who's responsible for the client's food?"
            name="responsible_for_food"
            value={formData.responsible_for_food || ""}
            onChange={handleChange}
            placeholder="Input text"
          />

          {/* Mealtime support */}
          <div className="form-section">
            <h3>Mealtime support</h3>

            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="Mealtime support"
                options={[
                  { value: "peg_feeding", label: "PEG feeding" },
                  { value: "assisted", label: "Assisted" },
                  { value: "independent", label: "Independent" },
                ]}
                value={formData.mealtime_support || []}
                onChange={(newValues) =>
                  handleChange({ name: "mealtime_support", value: newValues })
                }
                multiple={false}
                row={true}
              />
            </div>

            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="Hydration schedule"
                options={[
                  { value: "reminders", label: "Reminders" },
                  { value: "assisted_drinking", label: "Assisted drinking" },
                  { value: "independent", label: "Independent" },
                ]}
                value={formData.hydration_schedule || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "hydration_schedule",
                    value: newValues,
                  })
                }
                multiple={false}
                row={true}
              />
            </div>
          </div>

          {/* Strong dislikes */}
          <TextAreaField
            label="Strong dislikes"
            name="strong_dislikes"
            value={formData.strong_dislikes || ""}
            onChange={handleChange}
            placeholder="Input text"
          />

          {/* Fluid preference */}
          <TextAreaField
            label="Fluid preference"
            name="fluid_preference"
            value={formData.fluid_preference || ""}
            onChange={handleChange}
            placeholder="Input text"
          />
        </div>
      </div>

      {/* Task Section */}
      <AddTaskComponent handleAddTask={handleAddTask} />
    </>
  );
};

export default FoodNutritionHydrationStep;
