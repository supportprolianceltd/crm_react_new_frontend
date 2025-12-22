import React, { useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import CheckboxGroup from "../../../../../components/CheckboxGroup";
import InputField from "../../../../../components/Input/InputField";
import TextAreaField from "../../../../../components/Input/TextAreaField";
import SelectField from "../../../../../components/Input/SelectField";
import FileUploader from "../../../../../components/FileUploader/FileUploader";
import ToggleButton from "../../../../../components/ToggleButton";

const MovingHandlingStep = ({ formData, handleChange }) => {
  const [newIntake, setNewIntake] = useState({ time: "", amount: "" });

  const addIntake = () => {
    if (newIntake.time && newIntake.amount) {
      const currentLog = formData.hydration_intake_log || [];
      handleChange({
        name: "hydration_intake_log",
        value: [
          ...currentLog,
          {
            time: newIntake.time,
            amount: `${newIntake.amount}ml`,
          },
        ],
      });
      setNewIntake({ time: "", amount: "" });
    }
  };

  const removeIntake = (index) => {
    const currentLog = formData.hydration_intake_log || [];
    const updatedLog = currentLog.filter((_, i) => i !== index);
    handleChange({ name: "hydration_intake_log", value: updatedLog });
  };

  const editIntake = (index) => {
    const currentLog = formData.hydration_intake_log || [];
    const entry = currentLog[index];
    setNewIntake({
      time: entry.time,
      amount: entry.amount.replace("ml", ""),
    });
    removeIntake(index);
  };

  const hasChangingBehaviors = (formData.has_changing_behaviors || []).includes(
    "yes"
  );

  // Handle risk management plan file change
  const handleRiskPlanFileChange = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleChange({
          name: "risk_management_plan_preview",
          value: e.target.result,
        });
        handleChange({ name: "risk_management_plan_upload", value: file });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle remove risk management plan file
  const handleRemoveRiskPlan = () => {
    handleChange({ name: "risk_management_plan_upload", value: null });
    handleChange({ name: "risk_management_plan_preview", value: "" });
    handleChange({ name: "risk_management_plan_url", value: "" });
  };

  const isAddButtonDisabled = !newIntake.time || !newIntake.amount;

  return (
    <>
      <div className="content-section">
        <div className="form-section">
          <h2 style={{ fontWeight: 600 }}>Moving & Handling</h2>

          {/* Equipment needs */}
          <div className="form-section">
            <SelectField
              label="Equipment needs"
              name="equipment_needs"
              value={formData.equipment_needs || ""}
              onChange={handleChange}
              options={[
                { value: "", label: "Select" },
                { value: "hoist", label: "Hoist" },
                { value: "none", label: "None" },
              ]}
            />
          </div>

          {/* Pain resting/during movement */}
          <div className="form-section">
            <SelectField
              label="Does the client have any pain resting/during movement?"
              name="has_pain"
              value={formData.has_pain || ""}
              onChange={handleChange}
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              placeholder="Select an option"
            />
          </div>

          {/* Cognitive impairment */}
          <div className="form-section">
            <SelectField
              label="Does the client have any cognitive impairment?"
              name="has_cognitive_impairment"
              value={formData.has_cognitive_impairment || ""}
              onChange={handleChange}
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              placeholder="Select an option"
            />
          </div>

          {/* Behaviours that change */}
          <div className="form-section">
            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="Does the client have any behaviours that change?"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={formData.has_changing_behaviors || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "has_changing_behaviors",
                    value: newValues,
                  })
                }
                multiple={false}
                row={true}
              />
            </div>

            {hasChangingBehaviors && (
              <TextAreaField
                label="Please Describe"
                name="behavior_description"
                value={formData.behavior_description || ""}
                onChange={handleChange}
                placeholder="Input text"
              />
            )}
          </div>

          {/* Mobility Questions */}
          <div className="form-section">
            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="Can the client walk independently?"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={formData.can_walk_independently || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "can_walk_independently",
                    value: newValues,
                  })
                }
                multiple={false}
                row={true}
              />
            </div>

            <InputField
              label="How dependent is the client when balancing in standing position?"
              name="standing_balance_dependency"
              value={formData.standing_balance_dependency || ""}
              onChange={handleChange}
              placeholder="Input text"
            />
          </div>

          <div className="form-section">
            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="Can the client manage stairs?"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={formData.can_manage_stairs || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "can_manage_stairs",
                    value: newValues,
                  })
                }
                multiple={false}
                row={true}
              />
            </div>

            <InputField
              label="How dependent is the client when moving from a sitting to standing position?"
              name="sitting_to_standing_dependency"
              value={formData.sitting_to_standing_dependency || ""}
              onChange={handleChange}
              placeholder="Input text"
            />
          </div>

          <div className="form-section">
            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="Does the client have limited sitting balance?"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={formData.has_limited_sitting_balance || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "has_limited_sitting_balance",
                    value: newValues,
                  })
                }
                multiple={false}
                row={true}
              />
            </div>
          </div>

          <div className="form-section">
            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="Can the client move and turn independently in bed?"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={formData.can_move_turn_in_bed || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "can_move_turn_in_bed",
                    value: newValues,
                  })
                }
                multiple={false}
                row={true}
              />
            </div>
          </div>

          <div className="form-section">
            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="Can the client move from a lying to a sitting position independently?"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={formData.can_lying_to_sitting || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "can_lying_to_sitting",
                    value: newValues,
                  })
                }
                multiple={false}
                row={true}
              />
            </div>
          </div>

          {/* Additional Transfer Questions */}
          <div className="form-section">
            <InputField
              label="How dependent is the client when getting in and out of bed?"
              name="bed_in_out_dependency"
              value={formData.bed_in_out_dependency || ""}
              onChange={handleChange}
              placeholder="Input text"
            />
          </div>

          <div className="form-section">
            <SelectField
              label="Does the client use a bath or shower"
              name="bath_or_shower"
              value={formData.bath_or_shower || ""}
              onChange={handleChange}
              options={[
                { value: "bath", label: "Bath" },
                { value: "shower", label: "Shower" },
                { value: "both", label: "Both" },
                { value: "none", label: "None" },
              ]}
              placeholder="Select an option"
            />
          </div>

          <div className="form-section">
            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="Can the client transfer independently from a chair to a commode or bed?"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={formData.can_transfer_independently || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "can_transfer_independently",
                    value: newValues,
                  })
                }
                multiple={false}
                row={true}
              />
            </div>
          </div>

          <div className="form-section">
            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="Does the client have a profiling bed and mattress?"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={formData.has_profiling_bed_mattress || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "has_profiling_bed_mattress",
                    value: newValues,
                  })
                }
                multiple={false}
                row={true}
              />
            </div>
          </div>

          <div className="form-section">
            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="Transfer risks"
                options={[
                  { value: "falling", label: "Falling" },
                  { value: "slipping", label: "Slipping" },
                  { value: "lifting_risk", label: "Lifting risk" },
                ]}
                value={formData.transfer_risks || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "transfer_risks",
                    value: newValues,
                  })
                }
                multiple={true}
                row={true}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        {/* Behaviour Support */}
        <div className="form-section">
          <h2 style={{ fontWeight: 600 }}>Behaviour Support</h2>

          <div
            className="checkbox-group-wrapper"
            style={{ marginBottom: "0.8rem" }}
          >
            <CheckboxGroup
              label="Behavioural challenges"
              options={[
                { value: "aggression", label: "Aggression" },
                { value: "wandering", label: "Wandering" },
                { value: "refusal_of_care", label: "Refusal of care" },
              ]}
              value={formData.behavioural_challenges || []}
              onChange={(newValues) =>
                handleChange({
                  name: "behavioural_challenges",
                  value: newValues,
                })
              }
              multiple={true}
              row={true}
            />
          </div>

          <div style={{ marginTop: "1rem" }}>
            <div className={`GHuh-Form-Input`}>
              <label>Risk management plan</label>
            </div>
            <FileUploader
              currentFile={formData.risk_management_plan_upload}
              preview={formData.risk_management_plan_preview}
              onFileChange={handleRiskPlanFileChange}
              onRemove={handleRemoveRiskPlan}
              acceptedFileTypes="image"
              uploadText="Click to upload Document (SVG, PNG, JPG or GIF max. 800x400px)"
            />
          </div>
        </div>
      </div>

      <div className="content-section">
        {/* Environment & Fire Safety */}
        <div className="form-section">
          <h2 style={{ fontWeight: 600 }}>Environment & Fire Safety</h2>

          <SelectField
            label="Location risk review"
            name="location_risk_review"
            value={formData.location_risk_review || ""}
            onChange={handleChange}
            options={[
              { value: "daily", label: "Daily" },
              { value: "weekly", label: "Weekly" },
              { value: "monthly", label: "Monthly" },
              { value: "as_needed", label: "As Needed" },
            ]}
            placeholder="Select an option"
          />

          <div
            className="checkbox-group-wrapper"
            style={{ marginTop: "1rem", marginBottom: "0.8rem" }}
          >
            <CheckboxGroup
              label="Evacuation plan required?"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              value={formData.evacuation_plan_required || []}
              onChange={(newValues) =>
                handleChange({
                  name: "evacuation_plan_required",
                  value: newValues,
                })
              }
              multiple={false}
              row={true}
            />
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="form-section">
          <h3>Hydration Monitoring (Waterflow)</h3>

          <InputField
            label="Daily Goal (ml)"
            name="daily_hydration_goal"
            value={formData.daily_hydration_goal || ""}
            onChange={handleChange}
            placeholder="2000"
            type="text"
          />

          <div className="form-section" style={{ marginTop: "1rem" }}>
            <h4 style={{ fontWeight: 500 }}>Intake log</h4>
            <div className="intake-log">
              {(formData.hydration_intake_log || []).map((entry, index) => (
                <div key={index} className="intake-item">
                  <div className="intake-entry">
                    <span>
                      {entry.time}&nbsp;|&nbsp;{entry.amount}
                    </span>
                    <div className="clock-container">🕐</div>
                  </div>
                  <div className="entry-actions">
                    <button
                      type="button"
                      onClick={() => editIntake(index)}
                      className="edit-btn"
                    >
                      <FiEdit />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeIntake(index)}
                      className="delete-btn"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <InputField
                label="Time"
                value={newIntake.time}
                onChange={(e) =>
                  setNewIntake({ ...newIntake, time: e.target.value })
                }
                type="time"
                style={{ flex: 1 }}
              />
              <InputField
                label="Amount (ml)"
                value={newIntake.amount}
                onChange={(e) =>
                  setNewIntake({ ...newIntake, amount: e.target.value })
                }
                placeholder="e.g., 250"
                type="number"
                style={{ flex: 1 }}
              />
            </div>
            <button
              type="button"
              onClick={addIntake}
              className="add-more-btn"
              disabled={isAddButtonDisabled}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                backgroundColor: isAddButtonDisabled ? "#ccc" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: isAddButtonDisabled ? "not-allowed" : "pointer",
              }}
            >
              Add More
            </button>
          </div>

          <ToggleButton
            label="Dehydration Alert"
            isOn={formData.dehydration_alert_enabled || false}
            onToggle={(value) =>
              handleChange({ name: "dehydration_alert_enabled", value })
            }
            showTick={true}
          />
        </div>
      </div>
    </>
  );
};

export default MovingHandlingStep;
