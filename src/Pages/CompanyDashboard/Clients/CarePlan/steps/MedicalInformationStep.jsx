import SelectField from "../../../../../components/Input/SelectField";
import InputField from "../../../../../components/Input/InputField";
import CheckboxGroup from "../../../../../components/CheckboxGroup";
import TextAreaField from "../../../../../components/Input/TextAreaField";
import FileUploader from "../../../../../components/FileUploader/FileUploader";
import AddTaskComponent from "../components/AddTaskComponent";
import { FiCalendar, FiPlus, FiTrash2, FiLoader } from "react-icons/fi";
import { usePhoneCountryCode } from "../../../../../hooks/usePhoneCountryCode";
import { useEffect } from "react";

const MedicalInformationStep = ({
  formData,
  handleChange,
  handleCheckboxArrayChange,
  handleSingleCheckboxChange,
  handleAddTask,
}) => {
  const gpPhoneHook = usePhoneCountryCode("+44");
  const specialistPhoneHook = usePhoneCountryCode("+44");
  const hospitalPhoneHook = usePhoneCountryCode("+44");

  useEffect(() => {
    gpPhoneHook.setCountryCode(formData.gp_primary_doctor_code);
  }, [formData.gp_primary_doctor_code, gpPhoneHook]);

  useEffect(() => {
    specialistPhoneHook.setCountryCode(formData.specialist_code);
  }, [formData.specialist_code, specialistPhoneHook]);

  useEffect(() => {
    hospitalPhoneHook.setCountryCode(formData.hospital_clinic_code);
  }, [formData.hospital_clinic_code, hospitalPhoneHook]);

  // Handle adding a new medication entry
  const handleAddMedication = () => {
    const currentMedications = formData.medication_schedule || [];
    const newMedication = {
      drugName: "",
      dosage: "",
      frequency: "",
    };
    handleChange({
      name: "medication_schedule",
      value: [...currentMedications, newMedication],
    });
  };

  // Handle removing a medication entry
  const handleRemoveMedication = (index) => {
    const currentMedications = formData.medication_schedule || [];
    const updatedMedications = currentMedications.filter((_, i) => i !== index);
    handleChange({
      name: "medication_schedule",
      value: updatedMedications,
    });
  };

  // Handle updating a specific medication field
  const handleMedicationChange = (index, field, value) => {
    const currentMedications = formData.medication_schedule || [];
    const updatedMedications = currentMedications.map((med, i) =>
      i === index ? { ...med, [field]: value } : med
    );
    handleChange({
      name: "medication_schedule",
      value: updatedMedications,
    });
  };

  // Handle adding a new allergy entry
  const handleAddAllergy = () => {
    const currentAllergies = formData.allergies || [];
    const newAllergy = {
      name: "",
      severity: "",
      allergyMedicationName: "",
      allergyMedicationDosage: "",
      allergyMedicationFrequency: "",
      Appointments: "",
      knownTrigger: "",
    };
    handleChange({
      name: "allergies",
      value: [...currentAllergies, newAllergy],
    });
  };

  // Handle removing an allergy entry
  const handleRemoveAllergy = (index) => {
    const currentAllergies = formData.allergies || [];
    const updatedAllergies = currentAllergies.filter((_, i) => i !== index);
    handleChange({
      name: "allergies",
      value: updatedAllergies,
    });
  };

  // Handle updating a specific allergy field
  const handleAllergyChange = (index, field, value) => {
    const currentAllergies = formData.allergies || [];
    const updatedAllergies = currentAllergies.map((all, i) =>
      i === index ? { ...all, [field]: value } : all
    );
    handleChange({
      name: "allergies",
      value: updatedAllergies,
    });
  };

  const severityOptions = [
    { value: "", label: "Select severity" },
    { value: "mild", label: "Mild" },
    { value: "moderate", label: "Moderate" },
    { value: "severe", label: "Severe" },
  ];

  // Handle documentation file change
  const handleDocumentationFileChange = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleChange({
          name: "documentation_upload_preview",
          value: e.target.result,
        });
        handleChange({ name: "documentation_upload", value: file });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle remove documentation file
  const handleRemoveDocumentation = () => {
    handleChange({ name: "documentation_upload", value: null });
    handleChange({ name: "documentation_upload_preview", value: "" });
    handleChange({ name: "documentation_upload_url", value: "" });
  };

  const handleGpCodeChange = (e) => {
    handleChange(e);
    gpPhoneHook.setCountryCode(e.target.value);
  };

  const handleSpecialistCodeChange = (e) => {
    handleChange(e);
    specialistPhoneHook.setCountryCode(e.target.value);
  };

  const handleHospitalCodeChange = (e) => {
    handleChange(e);
    hospitalPhoneHook.setCountryCode(e.target.value);
  };

  // Handle body map consent checkbox
  const handleBodyMapConsentChange = (e) => {
    handleSingleCheckboxChange("body_map_consent", e.target.checked);
  };

  return (
    <>
      <div className="content-section">
        <div className="form-section">
          <h2 style={{ fontWeight: 600 }}>Medical Information</h2>

          {/* Primary Diagnosis */}
          <InputField
            label="Primary Diagnosis"
            name="primary_diagnosis"
            value={formData.primary_diagnosis || ""}
            onChange={handleChange}
            placeholder="Input text"
          />

          {/* Additional Notes for Primary Diagnosis */}
          <TextAreaField
            label="Additional Notes"
            name="primary_additional_notes"
            value={formData.primary_additional_notes || ""}
            onChange={handleChange}
            placeholder="Input text"
          />

          {/* Secondary Diagnosis */}
          <InputField
            label="Secondary Diagnosis"
            name="secondary_diagnosis"
            value={formData.secondary_diagnosis || ""}
            onChange={handleChange}
            placeholder="Input text"
          />

          {/* Additional Notes for Secondary Diagnosis */}
          <TextAreaField
            label="Additional Notes"
            name="secondary_additional_notes"
            value={formData.secondary_additional_notes || ""}
            onChange={handleChange}
            placeholder="Input text"
          />

          {/* Past Medical History */}
          <TextAreaField
            label="Past Medical History"
            name="past_medical_history"
            value={formData.past_medical_history || ""}
            onChange={handleChange}
            placeholder="Input text"
          />
        </div>

        {/* Medical Support Section */}
        <div className="form-section">
          <h3>Medical Support</h3>
          <div className="sub-section">
            <div className="checkbox-group-wrapper">
              <CheckboxGroup
                label="Does client need support taking their medication?"
                options={[
                  { value: "yes", label: "Yes (full support)" },
                  {
                    value: "no",
                    label:
                      "No (They can manage their own medication independently)",
                  },
                ]}
                value={formData.medication_support || []}
                onChange={(newValues) =>
                  handleChange({ name: "medication_support", value: newValues })
                }
                multiple={false}
                row={true}
              />
            </div>
          </div>
        </div>

        {/* Breathing Section */}
        <div className="form-section">
          <h3>Breathing</h3>
          <div className="checkbox-group-wrapper">
            <CheckboxGroup
              label="Does the client have difficulty in breathing?"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              value={formData.breathing_difficulty || []}
              onChange={(newValues) =>
                handleChange({ name: "breathing_difficulty", value: newValues })
              }
              multiple={false}
              row={true}
            />
          </div>

          <TextAreaField
            label="What support does the client need with breathing?"
            name="breathing_support_notes"
            value={formData.breathing_support_notes || ""}
            onChange={handleChange}
            placeholder="Input text"
          />
        </div>

        {/* Airway Management Section */}
        <div className="form-section">
          <div className="checkbox-group-wrapper">
            <CheckboxGroup
              label="Is equipment used for airway management?"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              value={formData.airway_equipment_used || []}
              onChange={(newValues) =>
                handleChange({
                  name: "airway_equipment_used",
                  value: newValues,
                })
              }
              multiple={false}
              row={true}
            />

            <CheckboxGroup
              label="What type of equipment?"
              options={[
                { value: "oxygen", label: "Oxygen" },
                { value: "airway_suction", label: "Airway suction" },
                {
                  value: "invasive_ventilation",
                  label: "Invasive ventilation",
                },
                { value: "other", label: "Other (Specify)" },
              ]}
              value={formData.airway_equipment_types || []}
              onChange={(newValues) =>
                handleChange({
                  name: "airway_equipment_types",
                  value: newValues,
                })
              }
              multiple={false}
              row={true}
            />
          </div>

          <TextAreaField
            label="Specify"
            name="airway_equipment_specify"
            value={formData.airway_equipment_specify || ""}
            onChange={handleChange}
            placeholder="Input text"
          />

          <TextAreaField
            label="What are the risks of using this equipment?"
            name="airway_equipment_risks"
            value={formData.airway_equipment_risks || ""}
            onChange={handleChange}
            placeholder="Input text"
          />

          <TextAreaField
            label="How will these risks be mitigated?"
            name="airway_risks_mitigation"
            value={formData.airway_risks_mitigation || ""}
            onChange={handleChange}
            placeholder="Input text"
          />
        </div>

        {/* Skin Section */}
        <div className="form-section">
          <h3>Skin</h3>
          <div className="checkbox-group-wrapper">
            <CheckboxGroup
              label="Does the client have any pressure sores at present or past?"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              value={formData.has_pressure_sores || []}
              onChange={(newValues) =>
                handleChange({ name: "has_pressure_sores", value: newValues })
              }
              multiple={false}
              row={true}
            />

            <CheckboxGroup
              label="Is there anything concerning about the condition of the client skin?"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              value={formData.skin_concerns || []}
              onChange={(newValues) =>
                handleChange({ name: "skin_concerns", value: newValues })
              }
              multiple={false}
              row={true}
            />
          </div>

          <TextAreaField
            label="Additional Information (Optional)"
            name="skin_additional_info"
            value={formData.skin_additional_info || ""}
            onChange={handleChange}
            placeholder="Input text"
          />
        </div>
      </div>

      <div className="content-section">
        {/* Initial Clinical Observations & Body Map */}
        <div className="form-section">
          <h2 style={{ fontWeight: 600, marginBottom: "1rem" }}>
            Initial Clinical Observations & Body Map
          </h2>
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <input
              type="checkbox"
              name="body_map_consent"
              checked={formData.body_map_consent || false}
              onChange={handleBodyMapConsentChange}
              style={{ marginTop: "0.25rem" }}
            />
            <span>
              I consent to the use of a digital body map to record and monitor
              skin integrity, wounds, and bruises.
            </span>
          </label>
        </div>
      </div>

      <div className="content-section">
        <div className="form-section">
          {/* Initial Skin Integrity Assessment */}
          <h2 style={{ fontWeight: 600, marginBottom: "1rem" }}>
            Initial Skin Integrity Assessment:
          </h2>
          <div className="checkbox-group-wrapper">
            <CheckboxGroup
              label="Are there any existing wounds, pressure areas, or bruises?"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              value={formData.has_existing_wounds || []}
              onChange={(newValues) =>
                handleChange({ name: "has_existing_wounds", value: newValues })
              }
              multiple={false}
              row={true}
            />
          </div>

          <p
            style={{
              fontSize: "0.9rem",
              marginTop: "1rem",
              marginBottom: "1rem",
            }}
          >
            If yes, please use the digital body map tool to mark the location
          </p>

          <button
            type="button"
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#f3f4f6",
              border: "1px solid #d1d5db",
              borderRadius: "0.375rem",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 500,
            }}
            onClick={() => {
              console.log("Launch Body Map");
            }}
          >
            Launch Body Map
          </button>

          {/* Wound Details */}
          <div style={{ marginTop: "1.5rem" }}>
            <SelectField
              label="Type"
              name="wound_type"
              value={formData.wound_type || ""}
              onChange={handleChange}
              options={[
                { value: "", label: "Select type" },
                { value: "pressure_ulcer", label: "Pressure Ulcer" },
                { value: "surgical_wound", label: "Surgical Wound" },
                { value: "bruise", label: "Bruise" },
                { value: "laceration", label: "Laceration" },
                { value: "abrasion", label: "Abrasion" },
                { value: "burn", label: "Burn" },
                { value: "other", label: "Other" },
              ]}
            />

            {/* <InputField
              label="Care Plan Review Date"
              name="care_plan_review_date"
              type="date"
              value={formData.care_plan_review_date || ""}
              onChange={handleChange}
            /> */}

            <InputField
              label="Size/Grade"
              name="wound_size_grade"
              value={formData.wound_size_grade || ""}
              onChange={handleChange}
              placeholder="e.g., 2cm×1cm"
            />

            <InputField
              label="Location Description"
              name="wound_location_description"
              value={formData.wound_location_description || ""}
              onChange={handleChange}
              placeholder="e.g., Left Hip"
            />

            <div style={{ position: "relative" }}>
              <InputField
                label="Date first observed"
                name="wound_date_observed"
                type="date"
                value={formData.wound_date_observed || ""}
                onChange={handleChange}
              />
            </div>

            <InputField
              label="Weight (kg)"
              name="client_weight"
              type="text"
              value={formData.client_weight || ""}
              onChange={handleChange}
              placeholder=""
            />

            <InputField
              label="Height (cm)"
              name="client_height"
              type="text"
              value={formData.client_height || ""}
              onChange={handleChange}
              placeholder=""
            />
          </div>
        </div>

        {/* Safeguarding Section */}
        <div className="form-section" style={{ marginTop: "2rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>Safeguarding</h3>
          <div className="checkbox-group-wrapper">
            <p>
              Have any safeguarding issues been raised with regards to client or
              their care?
            </p>
            <CheckboxGroup
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              value={formData.safeguarding_issues || []}
              onChange={(newValues) =>
                handleChange({ name: "safeguarding_issues", value: newValues })
              }
              multiple={false}
              row={true}
            />

            <p>
              Is there anything concerning about the condition of the client
              skin?
            </p>
            <CheckboxGroup
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              value={formData.safeguarding_skin_concerns || []}
              onChange={(newValues) =>
                handleChange({
                  name: "safeguarding_skin_concerns",
                  value: newValues,
                })
              }
              multiple={false}
              row={true}
            />
          </div>

          <TextAreaField
            label="Additional Information (Optional)"
            name="safeguarding_additional_info"
            value={formData.safeguarding_additional_info || ""}
            onChange={handleChange}
            placeholder="Input text"
          />
        </div>

        {/* Current Health Status */}
        <div className="form-section" style={{ marginTop: "2rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>Current Health Status</h3>
          <div className="checkbox-group-wrapper">
            <CheckboxGroup
              options={[
                { value: "stable", label: "Stable" },
                { value: "deteriorating", label: "Deteriorating" },
                { value: "palliative", label: "Palliative" },
              ]}
              value={formData.current_health_status || []}
              onChange={(newValues) =>
                handleChange({
                  name: "current_health_status",
                  value: newValues,
                })
              }
              multiple={false}
              row={true}
            />
          </div>
        </div>
      </div>

      {/* Allergies Section */}
      <div className="content-section">
        <div className="form-section">
          <h3>Allergies</h3>
          <CheckboxGroup
            label="Any known allergies?"
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            value={formData.has_allergies || []}
            onChange={(newValues) =>
              handleChange({ name: "has_allergies", value: newValues })
            }
            multiple={false}
            row={true}
          />

          {(formData.has_allergies || []).includes("yes") && (
            <>
              <TextAreaField
                label="Provide details of the allergy"
                name="allergies_details"
                value={formData.allergies_details || ""}
                onChange={handleChange}
                placeholder="Input text"
              />
              {(formData.allergies || []).map((allergy, index) => (
                <div
                  key={index}
                  style={{
                    paddingTop: "2rem",
                    marginBottom: "1rem",
                    position: "relative",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveAllergy(index)}
                    style={{
                      position: "absolute",
                      top: "0.5rem",
                      right: "1rem",
                      padding: "0.5rem",
                      backgroundColor: "#fee2e2",
                      border: "none",
                      borderRadius: "0.375rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      color: "#dc2626",
                    }}
                  >
                    <FiTrash2 size={16} />
                  </button>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem",
                    }}
                  >
                    <InputField
                      label="Allergy Name"
                      name={`allergies_name_${index}`}
                      value={allergy.name || ""}
                      onChange={(e) =>
                        handleAllergyChange(index, "name", e.target.value)
                      }
                      placeholder="e.g., Penicillin"
                    />

                    <SelectField
                      label="Severity"
                      name={`allergies_severity_${index}`}
                      value={allergy.severity || ""}
                      onChange={(e) =>
                        handleAllergyChange(index, "severity", e.target.value)
                      }
                      options={severityOptions}
                    />
                  </div>

                  <InputField
                    label="Allergy Medication Name"
                    name={`allergies_allergyMedicationName_${index}`}
                    value={allergy.allergyMedicationName || ""}
                    onChange={(e) =>
                      handleAllergyChange(
                        index,
                        "allergyMedicationName",
                        e.target.value
                      )
                    }
                    placeholder="Medication name"
                  />

                  <InputField
                    label="Allergy Medication Dosage"
                    name={`allergies_allergyMedicationDosage_${index}`}
                    value={allergy.allergyMedicationDosage || ""}
                    onChange={(e) =>
                      handleAllergyChange(
                        index,
                        "allergyMedicationDosage",
                        e.target.value
                      )
                    }
                    placeholder="Dosage"
                  />

                  <InputField
                    label="Allergy Medication Frequency"
                    name={`allergies_allergyMedicationFrequency_${index}`}
                    value={allergy.allergyMedicationFrequency || ""}
                    onChange={(e) =>
                      handleAllergyChange(
                        index,
                        "allergyMedicationFrequency",
                        e.target.value
                      )
                    }
                    placeholder="Frequency"
                  />

                  <InputField
                    label="Appointments"
                    name={`allergies_Appointments_${index}`}
                    type="date"
                    value={allergy.Appointments || ""}
                    onChange={(e) =>
                      handleAllergyChange(index, "Appointments", e.target.value)
                    }
                    placeholder=""
                  />

                  <TextAreaField
                    label="Known Trigger"
                    name={`allergies_knownTrigger_${index}`}
                    value={allergy.knownTrigger || ""}
                    onChange={(e) =>
                      handleAllergyChange(index, "knownTrigger", e.target.value)
                    }
                    placeholder="Known triggers for this allergy"
                    rows={3}
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddAllergy}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "white",
                  border: "2px dashed #d1d5db",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  color: "#6b7280",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <FiPlus size={16} />
                Add Allergy
              </button>
            </>
          )}
        </div>

        {/* Medication Schedule */}
        <div className="form-section" style={{ marginTop: "2rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>Medication Schedule</h3>

          {(formData.medication_schedule || []).map((medication, index) => (
            <div
              key={index}
              style={{
                paddingTop: "1.5rem",
                borderRadius: "0.5rem",
                marginBottom: "1rem",
                position: "relative",
              }}
            >
              <button
                type="button"
                onClick={() => handleRemoveMedication(index)}
                style={{
                  position: "absolute",
                  top: "0.5rem",
                  right: "1rem",
                  padding: "0.5rem",
                  backgroundColor: "#fee2e2",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  color: "#dc2626",
                }}
              >
                <FiTrash2 size={16} />
              </button>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <InputField
                  label="Drug Name"
                  name={`drugName_${index}`}
                  value={medication.drugName || ""}
                  onChange={(e) =>
                    handleMedicationChange(index, "drugName", e.target.value)
                  }
                  placeholder="e.g., Penicillin"
                />

                <InputField
                  label="Dosage"
                  name={`dosage_${index}`}
                  value={medication.dosage || ""}
                  onChange={(e) =>
                    handleMedicationChange(index, "dosage", e.target.value)
                  }
                  placeholder=""
                />
              </div>

              <InputField
                label="Frequency"
                name={`frequency_${index}`}
                value={medication.frequency || ""}
                onChange={(e) =>
                  handleMedicationChange(index, "frequency", e.target.value)
                }
                placeholder=""
              />
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddMedication}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "white",
              border: "2px dashed #d1d5db",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "500",
              color: "#6b7280",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            <FiPlus size={16} />
            Add Medication
          </button>
        </div>
      </div>

      {/* Medical Support Contacts Section */}
      <div className="content-section">
        <div className="form-section" style={{ marginTop: "2rem" }}>
          <h2 style={{ fontWeight: 600 }}>Medical Support Contacts</h2>

          <InputField
            label="GP/Primary Doctor Name"
            name="gp_primary_doctor_name"
            value={formData.gp_primary_doctor_name || ""}
            onChange={handleChange}
            placeholder="Input text"
          />

          <div className="GHuh-Form-Input">
            <label>GP/Primary Doctor Contact (optional)</label>
            <div className="phone-wrapper">
              {gpPhoneHook.loading ? (
                <div
                  style={{
                    minWidth: "60px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.375rem",
                  }}
                >
                  <FiLoader className="animate-spin" size={20} />
                </div>
              ) : (
                <select
                  name="gp_primary_doctor_code"
                  value={formData.gp_primary_doctor_code}
                  onChange={handleGpCodeChange}
                >
                  {gpPhoneHook.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
              <input
                type="tel"
                name="gp_primary_doctor_phone"
                value={formData.gp_primary_doctor_phone}
                onChange={handleChange}
                placeholder="Phone number"
              />
            </div>
          </div>

          <div className="GHuh-Form-Input">
            <label>Specialist Contact (applicable)</label>
            <div className="phone-wrapper">
              {specialistPhoneHook.loading ? (
                <div
                  style={{
                    minWidth: "60px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.375rem",
                  }}
                >
                  <FiLoader className="animate-spin" size={20} />
                </div>
              ) : (
                <select
                  name="specialist_code"
                  value={formData.specialist_code}
                  onChange={handleSpecialistCodeChange}
                >
                  {specialistPhoneHook.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
              <input
                type="tel"
                name="specialist_phone"
                value={formData.specialist_phone}
                onChange={handleChange}
                placeholder="Phone number"
              />
            </div>
          </div>

          <div className="GHuh-Form-Input">
            <label>Hospital/Clinic (usual care provider)</label>
            <div className="phone-wrapper">
              {hospitalPhoneHook.loading ? (
                <div
                  style={{
                    minWidth: "60px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.375rem",
                  }}
                >
                  <FiLoader className="animate-spin" size={20} />
                </div>
              ) : (
                <select
                  name="hospital_clinic_code"
                  value={formData.hospital_clinic_code}
                  onChange={handleHospitalCodeChange}
                >
                  {hospitalPhoneHook.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
              <input
                type="tel"
                name="hospital_clinic_phone"
                value={formData.hospital_clinic_phone}
                onChange={handleChange}
                placeholder="Phone number"
              />
            </div>
          </div>

          <TextAreaField
            label="Emergency Care Notes (hospital preference, DNR status if applicable)"
            name="emergency_care_notes"
            value={formData.emergency_care_notes || ""}
            onChange={handleChange}
            placeholder="Input text"
          />

          <div style={{ marginTop: "1rem" }}>
            <div className={`GHuh-Form-Input`}>
              <label>
                Documentation Upload (Medical Reports, Prescriptions, Care
                Letters)
              </label>
            </div>
            <FileUploader
              currentFile={formData.documentation_upload}
              preview={formData.documentation_upload_preview}
              onFileChange={handleDocumentationFileChange}
              onRemove={handleRemoveDocumentation}
              acceptedFileTypes="image"
              uploadText="Click to upload documents (PNG, JPG max 400px, GIF 800px)"
            />
          </div>
        </div>
      </div>
      {/* Task Section */}
      <AddTaskComponent handleAddTask={handleAddTask} />
    </>
  );
};

export default MedicalInformationStep;
