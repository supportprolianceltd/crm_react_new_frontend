import React from "react";
import CheckboxGroup from "../../../../../components/CheckboxGroup";
import InputField from "../../../../../components/Input/InputField";
import TextAreaField from "../../../../../components/Input/TextAreaField";
import AddTaskComponent from "../components/AddTaskComponent";

const PsychologicalInformationStep = ({
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
          <h2 style={{ fontWeight: 600 }}>Psychological Information</h2>

          {/* Everyday Activities */}
          <div className="form-section">
            <h3>Everyday Activities</h3>

            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="How satisfied are they with their level of health?"
                options={[
                  { value: "very_satisfied", label: "Very satisfied" },
                  {
                    value: "dissatisfied_but_could_be_better",
                    label: "Dissatisfied but could be better",
                  },
                  { value: "very_dissatisfied", label: "Very dissatisfied" },
                  { value: "fairly_satisfied", label: "Fairly satisfied" },
                ]}
                value={formData.health_satisfaction || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "health_satisfaction",
                    value: newValues,
                  })
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
                label="How motivated are they to maintain their health and wellbeing?"
                options={[
                  { value: "highly_motivated", label: "Highly motivated" },
                  {
                    value: "moderately_motivated",
                    label: "Moderately motivated",
                  },
                  { value: "lacks_motivation", label: "Lacks motivation" },
                ]}
                value={formData.motivation_level || []}
                onChange={(newValues) =>
                  handleChange({ name: "motivation_level", value: newValues })
                }
                multiple={false}
                row={true}
              />
            </div>
          </div>

          {/* Mood and sleep */}
          <div className="form-section">
            <h3>Mood and sleep</h3>

            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="How is their mood?"
                options={[
                  { value: "normal_for_them", label: "Normal for them" },
                  {
                    value: "more_anxious_than_average",
                    label: "More anxious than average",
                  },
                  { value: "other", label: "Other (please specify)" },
                ]}
                value={formData.mood || []}
                onChange={(newValues) =>
                  handleChange({ name: "mood", value: newValues })
                }
                multiple={false}
                row={true}
              />
              {(formData.mood || []) === "other" && (
                <InputField
                  label=""
                  name="mood_specify"
                  value={formData.mood_specify || ""}
                  onChange={handleChange}
                  placeholder="Input text"
                />
              )}
            </div>

            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="How is their sleep?"
                options={[
                  {
                    value: "acceptable_for_them",
                    label: "Acceptable for them",
                  },
                  { value: "insomnia", label: "Insomnia" },
                  { value: "disrupted", label: "Disrupted" },
                  { value: "other", label: "Other (please specify)" },
                ]}
                value={formData.sleep || []}
                onChange={(newValues) =>
                  handleChange({ name: "sleep", value: newValues })
                }
                multiple={false}
                row={true}
              />
              {(formData.sleep || []) === "other" && (
                <InputField
                  label=""
                  name="sleep_specify"
                  value={formData.sleep_specify || ""}
                  onChange={handleChange}
                  placeholder="Input text"
                />
              )}
            </div>
          </div>

          {/* Memory */}
          <div className="form-section">
            <h3>Memory</h3>

            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="Is the client, or anyone close to the client, worried about their memory?"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={formData.worried_about_memory || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "worried_about_memory",
                    value: newValues,
                  })
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
                label="How is their memory?"
                options={[
                  {
                    value: "no_noticeable_memory_loss",
                    label: "No noticeable memory loss",
                  },
                  { value: "mild_memory_loss", label: "Mild memory loss" },
                  { value: "severe_memory_loss", label: "Severe memory loss" },
                ]}
                value={formData.memory || []}
                onChange={(newValues) =>
                  handleChange({ name: "memory", value: newValues })
                }
                multiple={false}
                row={true}
              />
            </div>

            <InputField
              label="Specify"
              name="memory_specify"
              value={formData.memory_specify || ""}
              onChange={handleChange}
              placeholder="Input text"
            />
          </div>
        </div>
      </div>

      <div className="content-section">
        {/* Environmental Information */}
        <div className="form-section">
          <h2 style={{ fontWeight: 600 }}>Environmental Information</h2>

          <div className="form-section">
            <h3>Housekeeping</h3>

            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="Can they do their housekeeping (cleaning)?"
                options={[
                  { value: "yes_independently", label: "Yes, independently" },
                  {
                    value: "yes_with_assistance",
                    label: "Yes, with assistance",
                  },
                  {
                    value: "no_needs_full_assistance",
                    label: "No, Needs full assistance",
                  },
                ]}
                value={formData.housekeeping_ability || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "housekeeping_ability",
                    value: newValues,
                  })
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
                label="Do they have any support for their housekeeping (cleaning)?"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={formData.housekeeping_support || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "housekeeping_support",
                    value: newValues,
                  })
                }
                multiple={false}
                row={true}
              />
            </div>

            <TextAreaField
              label="Additional Notes"
              name="housekeeping_notes"
              value={formData.housekeeping_notes || ""}
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

export default PsychologicalInformationStep;
