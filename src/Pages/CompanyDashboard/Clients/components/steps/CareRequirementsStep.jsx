import React from "react";
import InputField from "../../../../../components/Input/InputField";
import SelectField from "../../../../../components/Input/SelectField";
import CheckboxGroup from "../../../../../components/CheckboxGroup";
import { AvailabilityGrid } from "../../../Employees/components/steps/DrivingStatusDetailsStep";

const CareRequirementsStep = ({ formData, handleChange, handleTimeChange }) => {
  const handleAvailabilityChange = (availability) => {
    handleChange({
      target: {
        name: "availability",
        value: availability,
      },
    });
  };

  return (
    <>
      <div className="form-section">
        <h3>Care Requirements</h3>

        <InputField
          label="Care Plan"
          name="carePlan"
          value={formData.carePlan}
          onChange={handleChange}
          type="textarea"
          placeholder="Describe the overall care plan for the client"
          required
        />

        <InputField
          label="Care Tasks"
          name="careTasks"
          value={formData.careTasks}
          onChange={handleChange}
          type="textarea"
          placeholder="List specific care tasks to be performed"
        />

        <SelectField
          label="Care Type"
          name="careType"
          value={formData.careType}
          options={[
            "Personal care",
            "Medical care",
            "Companionship",
            "Respite care",
            "Dementia care",
            "Palliative care",
            "Other",
          ]}
          onChange={handleChange}
        />

        <InputField
          label="Special Needs"
          name="specialNeeds"
          value={formData.specialNeeds}
          onChange={handleChange}
          type="textarea"
          placeholder="List any special needs or requirements"
        />

        <SelectField
          label="Preferred Carer Gender"
          name="preferredCarerGender"
          value={formData.preferredCarerGender}
          options={["No preference", "Male", "Female", "Other"]}
          onChange={handleChange}
        />

        <InputField
          label="Language Preference"
          name="languagePreference"
          value={formData.languagePreference}
          onChange={handleChange}
          type="text"
          placeholder="Preferred language for communication"
        />
      </div>

      <div className="form-section">
        <h3>Preferred Care Times</h3>
        <p>
          Specify the times of day the client prefers to receive care (e.g.,
          mornings, afternoons, evenings). This ensures visits are scheduled at
          the most convenient times.
        </p>

        <AvailabilityGrid
          value={formData.availability || {}}
          onChange={handleAvailabilityChange}
        />
      </div>

      <div className="form-section">
        <h3>Frequency of care</h3>
        <p style={{ paddingBottom: "0.8rem" }}>
          Select how often care should be provided. This helps us schedule
          carers according to the client's needs
        </p>
        <CheckboxGroup
          options={[
            { label: "Daily", value: "Daily" },
            { label: "Weekly", value: "Weekly" },
            { label: "Weekend", value: "Weekend" },
          ]}
          value={formData.frequencyOfCare}
          onChange={(val) =>
            handleChange({ target: { name: "frequencyOfCare", value: val } })
          }
          multiple={false}
          row
        />
      </div>

      <div className="form-section">
        <h3>Flexibility</h3>
        <p style={{ paddingBottom: "0.8rem" }}>
          Indicate whether the client is open to adjustments in visit times.
          This helps coordinators manage unexpected changes and ensures care
          continuity.
        </p>
        <CheckboxGroup
          options={[
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ]}
          value={formData.flexibility}
          onChange={(val) =>
            handleChange({ target: { name: "flexibility", value: val } })
          }
          multiple={false}
          row
        />
      </div>
    </>
  );
};

export default CareRequirementsStep;
