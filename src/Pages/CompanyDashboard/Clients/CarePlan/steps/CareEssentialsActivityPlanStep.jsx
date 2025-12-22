import SelectField from "../../../../../components/Input/SelectField";
import InputField from "../../../../../components/Input/InputField";
import CheckboxGroup from "../../../../../components/CheckboxGroup";
import TextAreaField from "../../../../../components/Input/TextAreaField";
import AddTaskComponent from "../components/AddTaskComponent";

const CareEssentialsActivityPlanStep = ({
  formData,
  handleChange,
  handleCheckboxArrayChange,
  handleSingleCheckboxChange,
  handleCommunicationNeedsChange,
  handleAddTask,
}) => {
  const independenceOptions = [
    { value: "YES_INDEPENDENTLY", label: "Yes, independently" },
    { value: "YES_WITH_HELP", label: "Yes, with help" },
    { value: "NO_NEEDS_FULL_ASSISTANCE", label: "No, needs full assistance" },
  ];

  const toiletUsageOptions = [
    { value: "uses_independently", label: "Uses independently" },
    { value: "requires_assistance", label: "Requires assistance" },
    { value: "needs_full_assistance", label: "Needs full assistance" },
  ];

  const controlOptions = [
    { value: "continent", label: "Continent" },
    { value: "occasional_accidents", label: "Occasional accidents" },
    { value: "incontinent", label: "Incontinent" },
  ];

  const groomingNeedsOptions = [
    { value: "toilet", label: "Toilet" },
    { value: "nails", label: "Nails" },
    { value: "shaving", label: "Shaving" },
    { value: "oral_hygiene", label: "Oral Hygiene" },
    { value: "others", label: "Others (specify)" },
  ];

  const continenceSupportOptions = [
    { value: "continence", label: "Continence" },
    { value: "stoma_bag", label: "Stoma bag" },
    { value: "incontinence_pad", label: "Incontinence pad" },
    { value: "other", label: "Other (please specify)" },
  ];

  const mobilityAssistanceOptions = [
    { value: "none", label: "None" },
    { value: "minimal", label: "Minimal assistance" },
    { value: "full", label: "Full assistance" },
  ];

  const communicationNeedsOptions = [
    { value: "wears_hearing_aid", label: "Wears hearing aid" },
    { value: "uses_glasses", label: "Uses glasses" },
    { value: "requires_large_print", label: "Requires large print" },
    {
      value: "prefers_written_instructions",
      label: "Prefers written instructions",
    },
    { value: "non_verbal", label: "Non-verbal" },
  ];

  const yesNoOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  const communityAccessOptions = [
    { value: "shopping", label: "shopping" },
    { value: "religious_services", label: "religious services" },
    { value: "social_clubs", label: "social clubs" },
    { value: "others", label: "Others" },
  ];

  const exerciseOptions = [
    { value: "walking", label: "Walking" },
    { value: "swimming", label: "Swimming" },
    { value: "gym", label: "Gym" },
    { value: "cycling", label: "Cycling" },
    { value: "other", label: "Other" },
  ];

  const mobilityLevelOptions = [
    { value: "INDEPENDENT", label: "Independent" },
    { value: "DEPENDENT", label: "Dependent" },
    {
      value: "INDEPENDENT_WITH_AIDS",
      label: "Independent with aids/equipment",
    },
    { value: "IMMOBILE", label: "Immobile" },
  ];

  const mobilitySupportOptions = [
    { value: "WALKING_STICK", label: "Walking stick or quad" },
    { value: "WHEELCHAIR", label: "Wheelchair" },
    { value: "NONE", label: "None" },
    { value: "OTHERS", label: "Other (please specify)" },
  ];

  const transferOptions = [
    { value: "YES_INDEPENDENTLY", label: "Yes independently" },
    { value: "YES_WITH_HELP", label: "Yes with help" },
    { value: "NO_FULLY_DEPENDENT", label: "No fully dependent" },
  ];

  // Handler for communication needs CheckboxGroup change
  const handleCommunicationNeedsGroupChange = (newValues) => {
    // Update the array
    handleChange({ name: "communication_needs", value: newValues });

    // Sync individual boolean fields based on presence in array
    communicationNeedsOptions.forEach((option) => {
      const isChecked = newValues.includes(option.value);
      switch (option.value) {
        case "wears_hearing_aid":
          handleSingleCheckboxChange("wears_hearing_aid", isChecked);
          break;
        case "uses_glasses":
          handleSingleCheckboxChange("uses_glasses", isChecked);
          break;
        case "requires_large_print":
          handleSingleCheckboxChange("requires_large_print", isChecked);
          break;
        case "prefers_written_instructions":
          handleSingleCheckboxChange("prefers_written_instructions", isChecked);
          break;
        case "non_verbal":
          handleSingleCheckboxChange("non_verbal", isChecked);
          break;
        default:
          break;
      }
    });
  };

  return (
    <>
      <div className="content-section">
        <div className="form-section">
          <h2 style={{ fontWeight: 600 }}>Care Essentials</h2>
          <div className="sub-section">
            <h3>Bathing/Showering Preferences</h3>

            <div className="checkbox-group-wrapper">
              <CheckboxGroup
                label="Can they wash themselves?"
                name="can_wash_themselves"
                options={independenceOptions}
                value={formData.can_wash_themselves || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "can_wash_themselves",
                    value: newValues,
                  })
                }
                row={true}
                multiple={false}
              />
            </div>

            <h3>Oral Hygiene</h3>
            <div className="checkbox-group-wrapper">
              <CheckboxGroup
                label="Can they maintain oral hygiene?"
                name="can_maintain_oral_hygiene"
                options={independenceOptions}
                value={formData.can_maintain_oral_hygiene || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "can_maintain_oral_hygiene",
                    value: newValues,
                  })
                }
                row={true}
                multiple={false}
              />
            </div>
          </div>

          <div className="sub-section">
            <h3>Personal Appearance</h3>
            <div className="checkbox-group-wrapper">
              <CheckboxGroup
                label="Can they maintain their personal appearance?"
                name="can_maintain_personal_appearance"
                options={independenceOptions}
                value={formData.can_maintain_personal_appearance || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "can_maintain_personal_appearance",
                    value: newValues,
                  })
                }
                row={true}
                multiple={false}
              />
              <CheckboxGroup
                label="Can they dress themselves?"
                name="can_dress_themselves"
                options={independenceOptions}
                value={formData.can_dress_themselves || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "can_dress_themselves",
                    value: newValues,
                  })
                }
                row={true}
                multiple={false}
              />
            </div>
          </div>

          <div className="sub-section">
            <h3>Grooming Needs</h3>
            <div className="checkbox-group-wrapper">
              <CheckboxGroup
                label="What grooming needs does the client need help with?"
                options={groomingNeedsOptions}
                value={formData.grooming_needs || []}
                onChange={(newValues) =>
                  handleChange({ name: "grooming_needs", value: newValues })
                }
                row={true}
              />
            </div>
            <InputField
              label="Others (specify)"
              name="other_grooming"
              value={formData.other_grooming || ""}
              onChange={handleChange}
              placeholder="Input text"
            />
          </div>

          <div className="sub-section">
            <h3>Toilet</h3>
            <div className="checkbox-group-wrapper">
              <CheckboxGroup
                label="Which best describes their toilet usage?"
                name="toilet_usage"
                options={toiletUsageOptions}
                value={formData.toilet_usage || []}
                onChange={(newValues) =>
                  handleChange({ name: "toilet_usage", value: newValues })
                }
                row={true}
                multiple={false}
              />
              <CheckboxGroup
                label="Do they have control over their bowels?"
                name="bowel_control"
                options={controlOptions}
                value={formData.bowel_control || []}
                onChange={(newValues) =>
                  handleChange({ name: "bowel_control", value: newValues })
                }
                row={true}
                multiple={false}
              />
              <CheckboxGroup
                label="Do they have control over their bladder?"
                name="bladder_control"
                options={controlOptions}
                value={formData.bladder_control || []}
                onChange={(newValues) =>
                  handleChange({ name: "bladder_control", value: newValues })
                }
                row={true}
                multiple={false}
              />
              <CheckboxGroup
                label="Do they need support with the following?"
                options={continenceSupportOptions}
                value={formData.continence_support || []}
                onChange={(newValues) =>
                  handleChange({ name: "continence_support", value: newValues })
                }
                row={true}
              />
            </div>
            <InputField
              label="Other (please specify)"
              name="other_continence"
              value={formData.other_continence || ""}
              onChange={handleChange}
              placeholder="Input text"
            />
            <TextAreaField
              label="Additional Notes"
              name="additional_notes"
              value={formData.additional_notes || ""}
              onChange={handleChange}
              placeholder="Input text"
            />
          </div>

          <div className="sub-section">
            <SelectField
              label="Continence Care"
              name="continence_care"
              value={formData.continence_care || ""}
              options={toiletUsageOptions}
              onChange={handleChange}
            />
            <SelectField
              label="Mobility Assistance"
              name="mobility_assistance"
              value={formData.mobility_assistance || ""}
              options={mobilityAssistanceOptions}
              onChange={handleChange}
            />
          </div>

          <div className="sub-section">
            <InputField
              label="Preferred Language"
              name="preferred_language"
              value={formData.preferred_language || ""}
              onChange={handleChange}
              placeholder="e.g., English"
            />
          </div>

          <div className="sub-section">
            <h3>Communication Style/Needs</h3>
            <div className="checkbox-group-wrapper">
              <CheckboxGroup
                label=""
                options={communicationNeedsOptions}
                value={formData.communication_needs || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "communication_needs",
                    value: newValues,
                  })
                }
                multiple={false}
                row={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Task Section */}
      <AddTaskComponent handleAddTask={handleAddTask} />

      {/* Everyday Activity Plan Section */}
      <div className="content-section">
        <div className="form-section">
          <h2 style={{ fontWeight: 600 }}>Everyday Activity Plan</h2>

          <div className="sub-section">
            <h3>Shopping</h3>
            <div className="checkbox-group-wrapper">
              <CheckboxGroup
                label="Can they do their shopping?"
                name="can_do_shopping"
                options={independenceOptions}
                value={formData.can_do_shopping || []}
                onChange={(newValues) =>
                  handleChange({ name: "can_do_shopping", value: newValues })
                }
                row={true}
                multiple={false}
              />
            </div>
          </div>

          <div className="sub-section">
            <h3>Telephone</h3>
            <div className="checkbox-group-wrapper">
              <CheckboxGroup
                label="Can they use the telephone?"
                name="can_use_telephone"
                options={independenceOptions}
                value={formData.can_use_telephone || []}
                onChange={(newValues) =>
                  handleChange({ name: "can_use_telephone", value: newValues })
                }
                row={true}
                multiple={false}
              />
            </div>
          </div>

          <div className="sub-section">
            <h3>Laundry</h3>
            <div className="checkbox-group-wrapper">
              <CheckboxGroup
                label="Can they do their laundry?"
                name="can_do_laundry"
                options={independenceOptions}
                value={formData.can_do_laundry || []}
                onChange={(newValues) =>
                  handleChange({ name: "can_do_laundry", value: newValues })
                }
                row={true}
                multiple={false}
              />
            </div>
          </div>

          <div className="sub-section">
            <TextAreaField
              label="Additional Notes"
              name="everyday_activity_notes"
              value={formData.everyday_activity_notes || ""}
              onChange={handleChange}
              placeholder="Input text"
            />
          </div>

          <div className="sub-section">
            <h3>Community Access Needs</h3>
            <CheckboxGroup
              label=""
              name="community_access_needs"
              options={communityAccessOptions}
              value={formData.community_access_needs || []}
              onChange={(newValues) =>
                handleChange({
                  name: "community_access_needs",
                  value: newValues,
                })
              }
              row={true}
            />

            <SelectField
              label="Exercise / Mobility Activities"
              name="exercise_mobility_activities"
              value={formData.exercise_mobility_activities || ""}
              options={exerciseOptions}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Task Section */}
      <AddTaskComponent handleAddTask={handleAddTask} />

      {/* Falls and Mobility Section */}
      <div className="content-section">
        <div className="form-section">
          <h2 style={{ fontWeight: 600 }}>Falls and Mobility</h2>
          <div className="sub-section">
            <h3>Falling</h3>
            <div className="checkbox-group-wrapper">
              <CheckboxGroup
                label="Have they had a fall before?"
                name="had_fall_before"
                options={yesNoOptions}
                value={formData.had_fall_before || []}
                onChange={(newValues) =>
                  handleChange({ name: "had_fall_before", value: newValues })
                }
                row={true}
                multiple={false}
              />
            </div>
            <InputField
              label="How many times?"
              name="fall_count"
              value={formData.fall_count || ""}
              onChange={handleChange}
              placeholder="Input text"
            />
          </div>
          <div className="sub-section">
            <h3>Mobility</h3>
            <div className="checkbox-group-wrapper">
              <CheckboxGroup
                label="What is their level of mobility?"
                name="mobility_level"
                options={mobilityLevelOptions}
                value={formData.mobility_level || []}
                onChange={(newValues) =>
                  handleChange({ name: "mobility_level", value: newValues })
                }
                row={true}
                multiple={false}
              />
              <CheckboxGroup
                label="What is used to support their mobility?"
                name="mobility_support"
                options={mobilitySupportOptions}
                value={formData.mobility_support || []}
                onChange={(newValues) =>
                  handleChange({ name: "mobility_support", value: newValues })
                }
                row={true}
              />
              <InputField
                label="Other (please specify)"
                name="other_mobility_support"
                value={formData.other_mobility_support || ""}
                onChange={handleChange}
                placeholder="Input text"
              />
              <CheckboxGroup
                label="Are they as active as they would like to be?"
                name="as_active_as_liked"
                options={yesNoOptions}
                value={formData.as_active_as_liked || []}
                onChange={(newValues) =>
                  handleChange({ name: "as_active_as_liked", value: newValues })
                }
                row={true}
                multiple={false}
              />
              <CheckboxGroup
                label="Can they transfer?"
                name="can_transfer"
                options={transferOptions}
                value={formData.can_transfer || []}
                onChange={(newValues) =>
                  handleChange({ name: "can_transfer", value: newValues })
                }
                row={true}
                multiple={false}
              />
              <CheckboxGroup
                label="Can they get up and down stairs?"
                name="can_stairs"
                options={transferOptions}
                value={formData.can_stairs || []}
                onChange={(newValues) =>
                  handleChange({ name: "can_stairs", value: newValues })
                }
                row={true}
                multiple={false}
              />
              <CheckboxGroup
                label="Can they travel on their own?"
                name="can_travel_own"
                options={transferOptions}
                value={formData.can_travel_own || []}
                onChange={(newValues) =>
                  handleChange({ name: "can_travel_own", value: newValues })
                }
                row={true}
                multiple={false}
              />
            </div>
            <TextAreaField
              label="Additional Notes"
              name="falls_mobility_notes"
              value={formData.falls_mobility_notes || ""}
              onChange={handleChange}
              placeholder="Input text"
            />
          </div>
        </div>

        {/* Sensory Needs Section */}
        <div className="form-section">
          <h3>Sensory needs</h3>

          <div className="sub-section">
            <div className="checkbox-group-wrapper">
              <CheckboxGroup
                label="How is their vision?"
                name="vision_status"
                options={[
                  { value: "unimpaired", label: "Unimpaired" },
                  { value: "impaired", label: "Impaired" },
                  {
                    value: "require_some_support",
                    label: "Require some support",
                  },
                  { value: "fully_dependent", label: "Fully Dependent" },
                ]}
                value={formData.vision_status || []}
                onChange={(newValues) =>
                  handleChange({ name: "vision_status", value: newValues })
                }
                row={true}
                multiple={false}
              />
              <CheckboxGroup
                label="How is their speech?"
                name="speech_status"
                options={[
                  { value: "unimpaired", label: "Unimpaired" },
                  { value: "impaired", label: "Impaired" },
                  {
                    value: "require_some_support",
                    label: "Require some support",
                  },
                  { value: "fully_dependent", label: "Fully Dependent" },
                ]}
                value={formData.speech_status || []}
                onChange={(newValues) =>
                  handleChange({ name: "speech_status", value: newValues })
                }
                row={true}
                multiple={false}
              />
              <CheckboxGroup
                label="How is their hearing?"
                name="hearing_status"
                options={[
                  { value: "unimpaired", label: "Unimpaired" },
                  { value: "impaired", label: "Impaired" },
                  {
                    value: "require_some_support",
                    label: "Require some support",
                  },
                  { value: "fully_dependent", label: "Fully Dependent" },
                ]}
                value={formData.hearing_status || []}
                onChange={(newValues) =>
                  handleChange({ name: "hearing_status", value: newValues })
                }
                row={true}
                multiple={false}
              />
            </div>
          </div>

          <div className="sub-section">
            <TextAreaField
              label="Additional Notes"
              name="sensory_needs_notes"
              value={formData.sensory_needs_notes || ""}
              onChange={handleChange}
              placeholder="Input text"
            />
          </div>
        </div>
      </div>

      {/* Task Section */}
      <AddTaskComponent handleAddTask={handleAddTask} />
    </>
  );
};

export default CareEssentialsActivityPlanStep;
