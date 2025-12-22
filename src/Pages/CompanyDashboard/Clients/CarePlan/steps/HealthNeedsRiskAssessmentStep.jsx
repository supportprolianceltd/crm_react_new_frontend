import SelectField from "../../../../../components/Input/SelectField";
import InputField from "../../../../../components/Input/InputField";
import CheckboxGroup from "../../../../../components/CheckboxGroup";
import TextAreaField from "../../../../../components/Input/TextAreaField";
import AddTaskComponent from "../components/AddTaskComponent";

const HealthNeedsRiskAssessmentStep = ({
  formData,
  handleChange,
  handleCheckboxArrayChange,
  handleSingleCheckboxChange,
  handleAddTask,
}) => {
  const riskFactorsOptions = [
    { value: "fall risk", label: "Fall risk" },
    { value: "choking risk", label: "Choking risk" },
    { value: "compliance", label: "Compliance" },
    { value: "wandering", label: "Wandering" },
    { value: "sensory impairment", label: "Sensory impairment" },
    { value: "others", label: "Others" },
  ];

  const supportOptions = [
    { value: "washing bathing", label: "Washing/Bathing" },
    { value: "dressing", label: "Dressing" },
    { value: "grooming", label: "Grooming" },
    { value: "oral care", label: "Oral Care" },
    { value: "toileting", label: "Toileting" },
    { value: "nutrition hydration", label: "Nutrition/Hydration" },
    { value: "medication prompting", label: "Medication Prompting" },
  ];

  const stairsOptions = [
    { value: "stairs", label: "Stairs" },
    { value: "duplex", label: "Duplex" },
    { value: "none", label: "None" },
  ];

  const safetyOptions = [
    { value: "grab rail", label: "Grab rail" },
    { value: "good lighting", label: "Good lighting" },
    { value: "none", label: "None" },
  ];

  const hazardsOptions = [
    { value: "loose rugs", label: "Loose rugs" },
    { value: "clutter", label: "Clutter" },
    { value: "electrical risks", label: "Electrical risks" },
  ];

  const accessibilityOptions = [
    { value: "ramps", label: "Ramps" },
    { value: "lifts", label: "Lifts" },
    { value: "wide doors", label: "Wide doors" },
    { value: "adapted furniture", label: "Adapted furniture" },
  ];

  const loneWorkerOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  return (
    <>
      <div className="content-section">
        {/* Health, Needs & Risk Assessment */}
        <div className="form-section">
          <h2 style={{ fontWeight: 600 }}>Health, Needs & Risk Assessment</h2>
          <p style={{ marginBottom: "-20px" }}>
            Summary of primary support needs (physical, personal, nutrition,
            cognitive)
          </p>
          <TextAreaField
            placeholder="Input text"
            name="risk_details"
            value={formData.risk_details || ""}
            onChange={handleChange}
          />

          <h3>Risk factors & alerts</h3>
          <CheckboxGroup
            label=""
            options={riskFactorsOptions}
            value={formData.risk_factors || []}
            onChange={(newValues) =>
              handleChange({ name: "risk_factors", value: newValues })
            }
            row={true}
          />

          {/* FIXED: Renamed to 'risk_factors_details' to avoid sharing state with the summary textarea above */}
          <TextAreaField
            label="Details"
            placeholder="Input text"
            name="risk_factors_details"  // <-- Changed from "risk_details"
            value={formData.risk_factors_details || ""}  // <-- Bind to unique key
            onChange={handleChange}
          />
        </div>

        {/* Areas Requiring Support */}
        <div className="form-section">
          <h3>Areas requiring support</h3>
          <CheckboxGroup
            label=""
            options={supportOptions}
            value={formData.support_areas || []}
            onChange={(newValues) =>
              handleChange({ name: "support_areas", value: newValues })
            }
            row={true}
            multiple
          />
        </div>
      </div>

      <div className="content-section">
        {/* Environmental Risk Assessment */}
        <div className="form-section">
          <h2 style={{ fontWeight: 600 }}>Environmental Risk Assessment</h2>
          <SelectField
            label="Home Layout"
            name="stairs"
            value={formData.stairs || ""}
            options={stairsOptions}
            onChange={handleChange}
          />
          <div className="sub-section">
            <label>Safety Features Present</label>
            <CheckboxGroup
              options={safetyOptions}
              value={formData.safety_features || []}
              onChange={(newValues) =>
                handleChange({ name: "safety_features", value: newValues })
              }
              row={true}
            />
          </div>
          <div className="sub-section">
            <label>Hazards</label>
            <CheckboxGroup
              options={hazardsOptions}
              value={formData.hazards || []}
              onChange={(newValues) =>
                handleChange({ name: "hazards", value: newValues })
              }
              row={true}
            />
            <InputField
              label="Other"
              name="other_hazards"
              value={formData.other_hazards || ""}
              onChange={handleChange}
              placeholder="Input text"
              as="textarea"
            />
          </div>
          <div className="sub-section">
            <label>Accessibility Needs</label>
            <CheckboxGroup
              options={accessibilityOptions}
              value={formData.accessibility || []}
              onChange={(newValues) =>
                handleChange({ name: "accessibility", value: newValues })
              }
              row={true}
            />
          </div>
          <div className="sub-section">
            <label>Lone Worker Considerations</label>
            <CheckboxGroup
              options={loneWorkerOptions}
              value={formData.lone_worker || []}
              onChange={(newValues) =>
                handleChange({ name: "lone_worker", value: newValues })
              }
              row={true}
              multiple={false}
            />
          </div>
          <TextAreaField
            label="Risk Assessment & Training"
            name="risk_assessment_training"
            value={formData.risk_assessment_training || ""}
            onChange={handleChange}
            placeholder="Input text"
          />
        </div>
      </div>

      {/* Task Section */}
      <AddTaskComponent
        handleAddTask={handleAddTask}
        sectionName="RiskAssessment"
      />
    </>
  );
};

export default HealthNeedsRiskAssessmentStep;