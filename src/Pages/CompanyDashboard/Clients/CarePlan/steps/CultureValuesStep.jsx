import React from "react";
import CheckboxGroup from "../../../../../components/CheckboxGroup";
import InputField from "../../../../../components/Input/InputField";
import TextAreaField from "../../../../../components/Input/TextAreaField";
import SelectField from "../../../../../components/Input/SelectField";
import ToggleButton from "../../../../../components/ToggleButton"; // Adjust path as needed

const CultureValuesStep = ({
  formData,
  handleChange,
  handleCheckboxArrayChange,
  handleSingleCheckboxChange,
}) => {
  const handleCommunicationChange = (newValues) => {
    handleChange({ name: "communication_needs", value: newValues });
    const fields = {
      wears_hearing_aid: "wears_hearing_aid",
      uses_glasses: "uses_glasses",
      requires_large_print: "requires_large_print",
      prefers_written_instructions: "prefers_written_instructions",
      non_verbal: "non_verbal",
    };
    Object.entries(fields).forEach(([opt, field]) => {
      handleSingleCheckboxChange(field, newValues.includes(opt));
    });
  };

  const hasInformalCare = (formData.has_informal_care || []).includes("yes");
  const informalCarerConcernsOther = (
    formData.informal_carer_concerns || []
  ).includes("other");
  const hasFormalCare = (formData.has_formal_care || []).includes("yes");

  return (
    <>
      <div className="content-section">
        <div className="form-section">
          <h2 style={{ fontWeight: 600 }}>Culture, Values, and Identity</h2>

          {/* Cultural & Religious Background */}
          <div className="form-section">
            <InputField
              label="Cultural & Religious Background (e.g., Christian, Muslim, Hindu
            etc.)"
              name="cultural_religious_background"
              value={formData.cultural_religious_background || ""}
              onChange={handleChange}
              placeholder="Input text"
            />
          </div>

          {/* Ethnic Group */}
          <div className="form-section">
            <InputField
              label="Ethnic Group"
              name="ethnic_group"
              value={formData.ethnic_group || ""}
              onChange={handleChange}
              placeholder="Input text"
            />
          </div>

          {/* Specific Religious or Cultural Accommodations */}
          <div className="form-section">
            <TextAreaField
              label="Does the client require any specific religious or cultural
            accommodations?"
              name="specific_religious_cultural_accommodations"
              value={formData.specific_religious_cultural_accommodations || ""}
              onChange={handleChange}
              placeholder="Input text"
            />
          </div>

          {/* Sexuality */}
          <div className="form-section">
            <h3>Sexuality</h3>

            <TextAreaField
              label="What best describes their sexuality?"
              name="sexuality_description"
              value={formData.sexuality_description || ""}
              onChange={handleChange}
              placeholder="Input text"
            />

            <TextAreaField
              label="How does gender, sexual orientation impact their care needs?"
              name="gender_sexual_orientation_impact"
              value={formData.gender_sexual_orientation_impact || ""}
              onChange={handleChange}
              placeholder="Input text"
            />
          </div>

          {/* Preferred Language */}
          <div className="form-section">
            <h3>Preferred Language</h3>

            <SelectField
              label=""
              name="preferred_language"
              value={formData.preferred_language || ""}
              onChange={handleChange}
              options={[
                { value: "english", label: "English" },
                { value: "spanish", label: "Spanish" },
                { value: "french", label: "French" },
                { value: "mandarin", label: "Mandarin" },
                { value: "arabic", label: "Arabic" },
                { value: "other", label: "Other" },
              ]}
            />
          </div>

          {/* Communication Style/Needs */}
          <div className="form-section">
            <h3>Communication Style/Needs</h3>

            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label=""
                options={[
                  { value: "wears_hearing_aid", label: "Wears hearing aid" },
                  { value: "uses_glasses", label: "Uses glasses" },
                  {
                    value: "requires_large_print",
                    label: "Requires large print",
                  },
                  {
                    value: "prefers_written_instructions",
                    label: "Prefers written instructions",
                  },
                  { value: "non_verbal", label: "Non-verbal" },
                  { value: "other", label: "Other" },
                ]}
                value={formData.communication_needs || []}
                onChange={handleCommunicationChange}
                multiple={true}
                row={true}
              />
            </div>

            {(formData.communication_needs || []).includes("other") && (
              <TextAreaField
                label="Specify"
                name="other_communication_needs"
                value={formData.other_communication_needs || ""}
                onChange={handleChange}
                placeholder="Input text"
              />
            )}
          </div>
        </div>
      </div>

      {/* Social Support */}
      <div className="content-section">
        <div className="form-section">
          <h2 style={{ fontWeight: 600 }}>Social Support</h2>

          {/* Key Family Members */}
          <div className="form-section">
            <TextAreaField
              label="Key Family Members"
              name="key_family_members"
              value={formData.key_family_members || ""}
              onChange={handleChange}
              placeholder="Input text"
            />
          </div>

          {/* Informal Care */}
          <div className="form-section">
            <h4 style={{ fontWeight: 600 }}>Informal Care</h4>

            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="Do they receive any informal care?"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={formData.has_informal_care || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "has_informal_care",
                    value: newValues,
                  })
                }
                multiple={false}
                row={true}
              />
            </div>

            {hasInformalCare && (
              <>
                <div
                  className="checkbox-group-wrapper"
                  style={{ marginBottom: "0.8rem" }}
                >
                  <CheckboxGroup
                    label="If yes, who is the informal care provided by?"
                    options={[
                      { value: "family_member", label: "Family Member" },
                      { value: "neighbour", label: "Neighbour" },
                      { value: "spouse", label: "Spouse" },
                      { value: "other", label: "Other (please specify)" },
                    ]}
                    value={formData.informal_care_provider || []}
                    onChange={(newValues) =>
                      handleChange({
                        name: "informal_care_provider",
                        value: newValues,
                      })
                    }
                    multiple={false}
                    row={false}
                  />
                </div>

                {(formData.informal_care_provider || "") === "other" && (
                  <TextAreaField
                    label="Specify"
                    name="informal_care_provider_other"
                    value={formData.informal_care_provider_other || ""}
                    onChange={handleChange}
                    placeholder="Input text"
                  />
                )}

                <TextAreaField
                  label="How are they supported by their informal carer?"
                  name="informal_care_support"
                  value={formData.informal_care_support || ""}
                  onChange={handleChange}
                  placeholder="Input text"
                />

                <div
                  className="checkbox-group-wrapper"
                  style={{ marginBottom: "0.8rem" }}
                >
                  <CheckboxGroup
                    label="Are there any concerns around the wellbeing of their informal carer(s)?"
                    options={[
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                      { value: "other", label: "Other (please specify)" },
                    ]}
                    value={formData.informal_carer_concerns || []}
                    onChange={(newValues) =>
                      handleChange({
                        name: "informal_carer_concerns",
                        value: newValues,
                      })
                    }
                    multiple={false}
                    row={true}
                  />
                </div>

                {(formData.informal_carer_concerns || "") === "other" && (
                  <TextAreaField
                    label="Specify"
                    name="informal_carer_concerns_details"
                    value={formData.informal_carer_concerns_details || ""}
                    onChange={handleChange}
                    placeholder="Input text"
                  />
                )}
              </>
            )}
          </div>

          {/* Formal Care */}
          <div className="form-section">
            <h4 style={{ fontWeight: 600 }}>Formal Care</h4>

            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="Do they receive any formal care?"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={formData.has_formal_care || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "has_formal_care",
                    value: newValues,
                  })
                }
                multiple={false}
                row={true}
              />
            </div>

            {hasFormalCare && (
              <TextAreaField
                label="Specify"
                name="formal_care_details"
                value={formData.formal_care_details || ""}
                onChange={handleChange}
                placeholder="Input text"
              />
            )}
          </div>

          {/* Mental Wellbeing Tracking */}
          <div className="form-section">
            <ToggleButton
              label="Mental Wellbeing Tracking"
              isOn={formData.mental_wellbeing_tracking || false}
              onToggle={(value) =>
                handleChange({ name: "mental_wellbeing_tracking", value })
              }
              showTick={true}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CultureValuesStep;
