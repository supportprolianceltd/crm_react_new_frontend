import React from "react";
import CheckboxGroup from "../../../../../components/CheckboxGroup";
import InputField from "../../../../../components/Input/InputField";
import TextAreaField from "../../../../../components/Input/TextAreaField";
import SelectField from "../../../../../components/Input/SelectField";
import AddTaskComponent from "../components/AddTaskComponent";

const AdministrativeBodyMapStep = ({
  formData,
  handleChange,
  handleSingleCheckboxChange,
  handleAddTask,
}) => {
  return (
    <>
      <div className="content-section">
        <div className="form-section">
          <h2 style={{ fontWeight: 600 }}>Administrative Notes</h2>

          {/* Finances */}
          <div className="form-section">
            <h3>Finances</h3>

            <div
              className="checkbox-group-wrapper"
              style={{ marginBottom: "0.8rem" }}
            >
              <CheckboxGroup
                label="Can they handle their own finances?"
                options={[
                  { value: "yes_independently", label: "Yes, independently" },
                  {
                    value: "yes_with_assistance",
                    label: "Yes, with assistance",
                  },
                  { value: "no_fully_dependent", label: "No, fully dependent" },
                ]}
                value={formData.finances_handling || []}
                onChange={(newValues) =>
                  handleChange({
                    name: "finances_handling",
                    value: newValues,
                  })
                }
                multiple={false}
                row={true}
              />
            </div>
          </div>

          {/* Advanced directive */}
          <div
            className="checkbox-group-wrapper"
            style={{ marginBottom: "0.8rem" }}
          >
            <CheckboxGroup
              label="Do they have an advanced directive in place?"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              value={formData.advanced_directive || []}
              onChange={(newValues) =>
                handleChange({
                  name: "advanced_directive",
                  value: newValues,
                })
              }
              multiple={false}
              row={true}
            />
          </div>

          {/* Will */}
          <div
            className="checkbox-group-wrapper"
            style={{ marginBottom: "0.8rem" }}
          >
            <CheckboxGroup
              label="Do they have a will?"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              value={formData.has_will || []}
              onChange={(newValues) =>
                handleChange({
                  name: "has_will",
                  value: newValues,
                })
              }
              multiple={false}
              row={true}
            />
          </div>

          {/* Additional Notes */}
          <TextAreaField
            label="Additional Notes"
            name="admin_additional_notes"
            value={formData.admin_additional_notes || ""}
            onChange={handleChange}
            placeholder="Input text"
          />

          {/* Invoicing Cycle */}
          <SelectField
            label="Invoicing Cycle"
            name="invoicing_cycle"
            value={formData.invoicing_cycle || ""}
            onChange={handleChange}
            options={["Daily", "Weekly", "Monthly", "Quarterly"]}
          />

          {/* Funding/Insurance Details */}
          <TextAreaField
            label="Funding/insurance details"
            name="funding_insurance_details"
            value={formData.funding_insurance_details || ""}
            onChange={handleChange}
            placeholder="Input text"
          />

          {/* Assigned Care Manager */}
          {/* <SelectField
            label="Assigned Care Manager"
            name="assigned_care_manager"
            value={formData.assigned_care_manager || ""}
            onChange={handleChange}
            options={[]}
          /> */}
        </div>
      </div>

      {/* Task Section */}
      <AddTaskComponent handleAddTask={handleAddTask} />
    </>
  );
};

export default AdministrativeBodyMapStep;
