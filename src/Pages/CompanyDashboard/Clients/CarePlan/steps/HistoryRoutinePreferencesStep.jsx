import React from "react";
import CheckboxGroup from "../../../../../components/CheckboxGroup";
import InputField from "../../../../../components/Input/InputField";
import TextAreaField from "../../../../../components/Input/TextAreaField";
import SelectField from "../../../../../components/Input/SelectField";
import AddTaskComponent from "../components/AddTaskComponent";

const HistoryRoutinePreferencesStep = ({
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
          <h2 style={{ fontWeight: 600 }}>
            Life History, Routines & Preferences
          </h2>

          {/* History Snapshot/Personal Biography */}
          <div className="form-section">
            <h3>History Snapshot/Personal Biography</h3>

            <TextAreaField
              label=""
              name="personal_biography"
              value={formData.personal_biography || ""}
              onChange={handleChange}
              placeholder="Input text"
            />
          </div>

          {/* Job */}
          <div className="form-section">
            <h3>Job</h3>

            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="Do they have any current jobs or past jobs that are important to them?"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={formData.has_important_jobs || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "has_important_jobs",
                    value: newValues,
                  })
                }
                multiple={false}
                row={true}
              />
            </div>

            {(formData.has_important_jobs || []) === "yes" && (
              <TextAreaField
                label="Tell us about it"
                name="job_details"
                value={formData.job_details || ""}
                onChange={handleChange}
                placeholder="Input text"
              />
            )}
          </div>

          {/* People */}
          <div className="form-section">
            <h3>People</h3>

            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="Anyone important person in their life?"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={formData.has_important_people || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "has_important_people",
                    value: newValues,
                  })
                }
                multiple={false}
                row={true}
              />
            </div>

            {(formData.has_important_people || []) === "yes" && (
              <TextAreaField
                label="Tell us who"
                name="important_people_details"
                value={formData.important_people_details || ""}
                onChange={handleChange}
                placeholder="Input text"
              />
            )}
          </div>

          {/* Location */}
          <div className="form-section">
            <h3>Location</h3>

            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="Any significant place or location in their life?"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={formData.has_significant_locations || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "has_significant_locations",
                    value: newValues,
                  })
                }
                multiple={false}
                row={true}
              />
            </div>

            {(formData.has_significant_locations || []) === "yes" && (
              <TextAreaField
                label="How do these locations affect their care needs?"
                name="locations_care_impact"
                value={formData.locations_care_impact || ""}
                onChange={handleChange}
                placeholder="Input text"
              />
            )}
          </div>

          {/* Personal Appearance */}
          <div className="form-section">
            <h3>Personal Appearance</h3>

            <SelectField
              label="Care Giver Gender Preference"
              name="caregiver_gender_preference"
              value={formData.caregiver_gender_preference || ""}
              onChange={handleChange}
              options={[
                { value: "MALE", label: "Male" },
                { value: "FEMALE", label: "Female" },
                { value: "NON_BINARY", label: "Non Binary" },
                { value: "NO_PREFERENCE", label: "No preference" },
                { value: "OTHER", label: "Other" },
              ]}
            />

            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="Autonomy Preferences"
                options={[
                  { value: "daily_choices", label: "Daily choices" },
                  {
                    value: "independence_in_routine",
                    label: "Independence in routine",
                  },
                  {
                    value: "decision_making_involvement",
                    label: "Decision-making involvement",
                  },
                ]}
                value={formData.autonomy_preferences || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "autonomy_preferences",
                    value: newValues,
                  })
                }
                multiple={true}
                row={false}
              />
            </div>

            <TextAreaField
              label="Daily Routine"
              name="daily_routine"
              value={formData.daily_routine || ""}
              onChange={handleChange}
              placeholder="Input text"
            />
          </div>

          {/* Preferences & Routines */}
          <div className="form-section">
            <h3>Preferences & Routines</h3>

            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="Do they have any specific routines or preferences important to them?"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={formData.has_specific_routines_preferences || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "has_specific_routines_preferences",
                    value: newValues,
                  })
                }
                multiple={false}
                row={true}
              />
            </div>

            {(formData.has_specific_routines_preferences || []) === "yes" && (
              <TextAreaField
                label="Specify"
                name="specific_routines_details"
                value={formData.specific_routines_details || ""}
                onChange={handleChange}
                placeholder="Input text"
              />
            )}
          </div>

          {/* Dislikes */}
          <div className="form-section">
            <h3>Dislikes</h3>

            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="Do they have anything that may worry or upset them?"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={formData.has_dislikes || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "has_dislikes",
                    value: newValues,
                  })
                }
                multiple={false}
                row={true}
              />
            </div>

            {(formData.has_dislikes || []) === "yes" && (
              <TextAreaField
                label="How does this affect their care needs?"
                name="dislikes_details"
                value={formData.dislikes_details || ""}
                onChange={handleChange}
                placeholder="Input text"
              />
            )}
          </div>

          {/* Hobbies */}
          <div className="form-section">
            <h3>Hobbies</h3>

            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="Do they have any specific routines or preferences important to them?"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={formData.has_hobbies || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "has_hobbies",
                    value: newValues,
                  })
                }
                multiple={false}
                row={true}
              />
            </div>

            {(formData.has_hobbies || []) === "yes" && (
              <TextAreaField
                label="How does this impact their care needs?"
                name="hobbies_impact"
                value={formData.hobbies_impact || ""}
                onChange={handleChange}
                placeholder="Input text"
              />
            )}
          </div>
        </div>
      </div>

      {/* Task Section */}
      <AddTaskComponent handleAddTask={handleAddTask} />
    </>
  );
};

export default HistoryRoutinePreferencesStep;
