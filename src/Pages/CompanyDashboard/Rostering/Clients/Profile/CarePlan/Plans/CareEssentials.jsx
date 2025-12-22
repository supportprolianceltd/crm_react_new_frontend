import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  ArrowLeftIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import TaskImg from "../../Img/TaskImg.png";
import CareEssentialsDetails from "./PlansDetails/CareEssentialsDetails";
import SelectField from "../../../../../../../components/Input/SelectField";
import InputField from "../../../../../../../components/Input/InputField";
import CheckboxGroup from "../../../../../../../components/CheckboxGroup";
import TextAreaField from "../../../../../../../components/Input/TextAreaField";
import { XIcon } from "lucide-react";
import {
  createClientTask,
  fetchClientTaskByClientAndRelatedTable,
} from "../../../../config/apiConfig";

const CareEssentials = ({ carePlanSection, carePlanId, clientData }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [riskCategory, setRiskCategory] = useState("");
  const [frequency, setFrequency] = useState("");
  const [frequencyStartDate, setFrequencyStartDate] = useState("");
  const [frequencyEndDate, setFrequencyEndDate] = useState("");
  const [frequencyEndType, setFrequencyEndType] = useState("");
  const [taskStartDate, setTaskStartDate] = useState("");
  const [taskEndDate, setTaskEndDate] = useState("");
  const [otherRiskText, setOtherRiskText] = useState("");
  const [preferredTiming, setPreferredTiming] = useState("Anytime");
  const [selectedSession, setSelectedSession] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [addToCareVisit, setAddToCareVisit] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [successAlert, setSuccessAlert] = useState({
    show: false,
    title: "",
    updated: false,
  });
  const [viewOpen, setViewOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  // New states for section editing
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [sectionSaving, setSectionSaving] = useState(false);

  // Assume carePlanId and relatedId are available from props
  // e.g., carePlanId = clientData.carePlanId || carePlanSection.carePlan;
  // relatedId = carePlanSection.id;
  const clientId = clientData?.id;
  const relatedId = carePlanSection?.id;
  const relatedTable = "PersonalCare"; // Or dynamically set based on section, e.g., "EverydayActivityPlan" for that part
  const createdBy = "Tega Okorare"; // Replace with actual user context, e.g., from auth

  // Friendly labels for display in the tasks list
  const RISK_LABELS = {
    falls: "Falls",
    choking: "Choking",
    medication: "Medication Safety",
    safety: "Safety",
    others: "Others",
  };
  const FREQ_LABELS = {
    once: "Once",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    custom: "Custom",
  };

  // Mapping for risk categories to payload array
  const RISK_CATEGORY_MAP = {
    falls: ["fall risk"],
    choking: ["choking risk"],
    medication: ["medication"],
    safety: ["mobility"], // Adjust mapping as needed, e.g., to "skin integrity" or add "safety"
    others: ["cognitive"], // Or dynamically based on otherRiskText, e.g., push custom
  };

  // Mapping for frequency to payload riskFrequency
  const FREQUENCY_MAP = {
    once: "Once",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    custom: "Custom",
  };

  // Reverse mappings for normalization
  const REVERSE_RISK_MAP = {
    "fall risk": "falls",
    "choking risk": "choking",
    medication: "medication",
    mobility: "safety",
    cognitive: "others",
    behavioral: "others",
    // Add more as needed
  };

  const REVERSE_FREQ_MAP = {
    Once: "once",
    Daily: "daily",
    Weekly: "weekly",
    Monthly: "monthly",
    Custom: "custom",
  };

  const sessionRanges = {
    morning: "6:00 AM → 11:59 AM",
    afternoon: "12:00 PM → 4:59 PM",
    evening: "5:00 PM → 8:59 PM",
    night: "9:00 PM → 5:59 AM",
  };

  // Options for form fields (copied from CareEssentialsActivityPlanStep)
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

  const visionSpeechHearingOptions = [
    { value: "unimpaired", label: "Unimpaired" },
    { value: "impaired", label: "Impaired" },
    { value: "require_some_support", label: "Require some support" },
    { value: "fully_dependent", label: "Fully Dependent" },
  ];

  // Normalize API task to local format
  const normalizeTask = (apiTask) => {
    let riskCategory = "";
    let otherRiskText = "";
    if (apiTask.riskCategory && apiTask.riskCategory.length > 0) {
      const firstCat = apiTask.riskCategory[0];
      riskCategory = REVERSE_RISK_MAP[firstCat] || "others";
      if (riskCategory === "others") {
        otherRiskText = firstCat;
      }
    }

    const frequency = REVERSE_FREQ_MAP[apiTask.riskFrequency] || "once";

    const taskStartDate = apiTask.startDate
      ? apiTask.startDate.split("T")[0]
      : "";
    const taskEndDate = apiTask.dueDate ? apiTask.dueDate.split("T")[0] : "";

    return {
      ...apiTask,
      riskCategory,
      otherRiskText,
      frequency,
      taskStartDate,
      taskEndDate,
      frequencyStartDate: "",
      frequencyEndDate: "",
      frequencyEndType: "",
      session: "",
      startTime: "",
      endTime: "",
      addToCareVisit: false,
    };
  };

  // Fetch tasks on mount
  useEffect(() => {
    const loadTasks = async () => {
      if (!clientId || !relatedTable) return;
      try {
        const apiResponse = await fetchClientTaskByClientAndRelatedTable(
          clientId,
          relatedTable
        );
        const apiTasks = apiResponse?.tasks || [];
        const normalizedTasks = Array.isArray(apiTasks)
          ? apiTasks.map(normalizeTask)
          : [];
        setTasks(normalizedTasks);
      } catch (error) {
        setTasks([]);
      }
    };
    loadTasks();
  }, [clientId, relatedTable]);

  // Updated populateFormData: Directly copy from carePlanSection since it now uses formData keys
  const populateFormData = () => {
    if (!carePlanSection) return {};
    const data = { ...carePlanSection };
    // Ensure arrays for checkbox fields (in case of legacy data, but based on log, already arrays)
    const checkboxFields = [
      "can_wash_themselves",
      "can_maintain_oral_hygiene",
      "can_maintain_personal_appearance",
      "can_dress_themselves",
      "grooming_needs",
      "toilet_usage",
      "bowel_control",
      "bladder_control",
      "continence_support",
      "communication_needs",
      "can_do_shopping",
      "can_use_telephone",
      "can_do_laundry",
      "community_access_needs",
      "had_fall_before",
      "mobility_level",
      "mobility_support",
      "as_active_as_liked",
      "can_transfer",
      "can_stairs",
      "can_travel_own",
      "vision_status",
      "speech_status",
      "hearing_status",
    ];
    checkboxFields.forEach((field) => {
      if (data[field] && !Array.isArray(data[field])) {
        data[field] = [data[field]];
      } else if (!data[field]) {
        data[field] = [];
      }
    });
    // Ensure strings for text fields
    const textFields = [
      "other_grooming",
      "other_continence",
      "additional_notes",
      "continence_care",
      "mobility_assistance",
      "preferred_language",
      "everyday_activity_notes",
      "exercise_mobility_activities",
      "fall_count",
      "other_mobility_support",
      "falls_mobility_notes",
      "sensory_needs_notes",
    ];
    textFields.forEach((field) => {
      data[field] = data[field] || "";
    });
    return data;
  };

  // Handlers for form changes
  const handleSectionChange = ({ name, value }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxArrayChange = ({ name, value }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSingleCheckboxChange = (field, checked) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
  };

  const handleCommunicationNeedsChange = (newValues) => {
    handleSectionChange({ name: "communication_needs", value: newValues });
    // Removed unnecessary sync to individual booleans (not used in form)
  };

  // Edit section handler
  const handleEditSection = () => {
    const populatedData = populateFormData();
    setFormData(populatedData);
    setIsEditing(true);
  };

  // Cancel section edit
  const handleCancelSection = () => {
    setIsEditing(false);
    setFormData({});
  };

  // Save section handler (replace simulation with real API call)
  const handleSaveSection = async () => {
    if (sectionSaving) return;
    setSectionSaving(true);
    try {
      // TODO: Map formData back to API format and call update endpoint
      // e.g., await updateCarePlanSection(clientData.id, 'personalCare', formData);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSuccessAlert({
        show: true,
        title: "Care Essentials",
        updated: true,
      });
      setTimeout(
        () => setSuccessAlert({ show: false, title: "", updated: false }),
        2200
      );
    } catch (error) {
      alert("Failed to save changes");
    } finally {
      setSectionSaving(false);
      setIsEditing(false);
    }
  };

  const handleSessionChange = (session) => {
    setSelectedSession(session);
  };

  // Helper to convert date string to ISO with time
  const toISODateTime = (dateStr, timeStr = null) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-"); // YYYY-MM-DD format
    const date = new Date(
      `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    );
    if (timeStr) {
      const [hours, minutes] = timeStr.split(":");
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
      date.setHours(9, 0, 0, 0); // Default to 9AM if no time
    }
    return date.toISOString();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title) {
      alert("Please enter a Task Title");
      return;
    }
    setSaving(true);
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const saveFreqStart =
      frequency === "custom" ? frequencyStartDate : currentDate;
    const saveFreqEnd = frequency === "custom" ? frequencyEndDate : "";
    const saveFreqEndType = frequency === "custom" ? frequencyEndType : "";
    const saveTaskStart = taskStartDate || currentDate;
    const saveTaskEnd = taskEndDate || "";

    // Map to payload
    const riskCategories = RISK_CATEGORY_MAP[riskCategory] || [];
    if (riskCategory === "others" && otherRiskText) {
      riskCategories.push(
        otherRiskText.toLowerCase().includes("cognitive")
          ? "cognitive"
          : "behavioral"
      ); // Example dynamic mapping; adjust as needed
    }
    const startDateISO = toISODateTime(
      saveTaskStart,
      preferredTiming === "Sessions" && selectedSession ? startTime : null
    );
    const dueDateISO = saveTaskEnd
      ? toISODateTime(
          saveTaskEnd,
          preferredTiming === "Sessions" && selectedSession ? endTime : null
        )
      : startDateISO; // Default due to start if no end
    const taskPayload = {
      carePlanId,
      relatedTable,
      relatedId,
      title,
      description,
      riskFrequency: FREQUENCY_MAP[frequency] || frequency,
      status: "PENDING",
      riskCategory: riskCategories,
      startDate: startDateISO,
      dueDate: dueDateISO,
      additionalNotes: description, // Or separate if needed
      createdBy,
    };

    try {
      const response = await createClientTask(taskPayload);
      // Refetch to sync with server
      const apiResponse = await fetchClientTaskByClientAndRelatedTable(
        clientId,
        relatedTable
      );
      const apiTasks = apiResponse?.tasks || [];
      const normalizedTasks = Array.isArray(apiTasks)
        ? apiTasks.map(normalizeTask)
        : [];
      setTasks(normalizedTasks);

      setOpen(false);
      setTitle("");
      setDescription("");
      setFrequencyStartDate("");
      setFrequencyEndDate("");
      setFrequencyEndType("");
      setTaskStartDate("");
      setTaskEndDate("");
      setOtherRiskText("");
      setRiskCategory("");
      setFrequency("");
      setPreferredTiming("Anytime");
      setSelectedSession("");
      setStartTime("");
      setEndTime("");
      setAddToCareVisit(false);
      const wasUpdate = editIndex !== null && editIndex >= 0;
      setEditIndex(null);
      setSuccessAlert({
        show: true,
        title: title || "Untitled task",
        updated: !!wasUpdate,
      });
      setTimeout(
        () => setSuccessAlert({ show: false, title: "", updated: false }),
        2200
      );
    } catch (error) {
      alert("Failed to save task. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleFrequencyChange = (val) => {
    setFrequency(val);
    if (val !== "custom") {
      setFrequencyStartDate("");
      setFrequencyEndDate("");
      setFrequencyEndType("");
    }
  };

  const handleEdit = (index) => {
    const t = tasks[index];
    if (!t) return;
    setTitle(t.title || "");
    setDescription(t.description || "");
    setTaskStartDate(t.taskStartDate || "");
    setTaskEndDate(t.taskEndDate || "");
    setFrequencyStartDate(t.frequencyStartDate || "");
    setFrequencyEndDate(t.frequencyEndDate || "");
    setFrequencyEndType(t.frequencyEndType || "");
    setRiskCategory(t.riskCategory || "");
    setOtherRiskText(t.otherRiskText || "");
    setFrequency(t.frequency || "");
    setPreferredTiming(t.session ? "Sessions" : "Anytime");
    setSelectedSession(t.session || "");
    setStartTime(t.startTime || "");
    setEndTime(t.endTime || "");
    setAddToCareVisit(t.addToCareVisit || false);
    setEditIndex(index);
    setViewOpen(false);
    setTimeout(() => setOpen(true), 0);
  };

  const navigate = useNavigate();

  const goBack = () => navigate(-1);

  const openNewTask = () => {
    setEditIndex(null);
    setTitle("");
    setDescription("");
    setFrequencyStartDate("");
    setFrequencyEndDate("");
    setFrequencyEndType("");
    setTaskStartDate("");
    setTaskEndDate("");
    setRiskCategory("");
    setFrequency("");
    setPreferredTiming("Anytime");
    setSelectedSession("");
    setStartTime("");
    setEndTime("");
    setAddToCareVisit(false);
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
    if (editIndex !== null) {
      setViewOpen(true);
    }
  };

  return (
    <div className="DDD-PPLso-Sec">
      <div className="DDD-PPLso-Sec-Main">
        <div className="DDD-PPLso-1">
          <div className="DDD-PPLso-1-Top">
            <span
              role="button"
              tabIndex={0}
              onClick={goBack}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") goBack();
              }}
            >
              <ArrowLeftIcon /> Go Back
            </span>
          </div>
          {!isEditing ? (
            <CareEssentialsDetails
              carePlanSection={carePlanSection}
              clientData={clientData}
              onEdit={handleEditSection}
            />
          ) : (
            <div className="edit-section-container custom-scroll-bar">
              <div className="Info-Palt-Top">
                <div>
                  <h3>Edit Care Essentials</h3>
                  <p>Update the care essentials details below.</p>
                </div>
                <button
                  onClick={handleCancelSection}
                  className="profil-Edit-Btn btn-primary-bg"
                >
                  <XIcon /> Cancel
                </button>
              </div>
              <div className="content-section">
                <div className="form-section">
                  <div className="sub-section">
                    <h3>Bathing/Showering Preferences</h3>

                    <div className="checkbox-group-wrapper">
                      <CheckboxGroup
                        label="Can they wash themselves?"
                        name="bathingAndShowering"
                        options={independenceOptions}
                        value={formData.bathingAndShowering || []}
                        onChange={(newValues) =>
                          handleSectionChange({
                            name: "bathingAndShowering",
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
                        name="oralHygiene"
                        options={independenceOptions}
                        value={formData.oralHygiene || []}
                        onChange={(newValues) =>
                          handleSectionChange({
                            name: "oralHygiene",
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
                        name="maintainThemselves"
                        options={independenceOptions}
                        value={formData.maintainThemselves || []}
                        onChange={(newValues) =>
                          handleSectionChange({
                            name: "maintainThemselves",
                            value: newValues,
                          })
                        }
                        row={true}
                        multiple={false}
                      />
                      <CheckboxGroup
                        label="Can they dress themselves?"
                        name="dressThemselves"
                        options={independenceOptions}
                        value={formData.dressThemselves || []}
                        onChange={(newValues) =>
                          handleSectionChange({
                            name: "dressThemselves",
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
                        value={formData.groomingNeeds[0] || []}
                        onChange={(newValues) =>
                          handleSectionChange({
                            name: "groomingNeeds",
                            value: newValues,
                          })
                        }
                        row={true}
                      />
                    </div>
                    <InputField
                      label="Others (specify)"
                      name="other_grooming"
                      value={formData.other_grooming || ""}
                      onChange={handleSectionChange}
                      placeholder="Input text"
                    />
                  </div>

                  <div className="sub-section">
                    <h3>Toilet</h3>
                    <div className="checkbox-group-wrapper">
                      <CheckboxGroup
                        label="Which best describes their toilet usage?"
                        name="toiletUsage"
                        options={toiletUsageOptions}
                        value={formData.toiletUsage || []}
                        onChange={(newValues) =>
                          handleSectionChange({
                            name: "toiletUsage",
                            value: newValues,
                          })
                        }
                        row={true}
                        multiple={false}
                      />
                      <CheckboxGroup
                        label="Do they have control over their bowels?"
                        name="bowelControl"
                        options={controlOptions}
                        value={formData.bowelControl || []}
                        onChange={(newValues) =>
                          handleSectionChange({
                            name: "bowelControl",
                            value: newValues,
                          })
                        }
                        row={true}
                        multiple={false}
                      />
                      <CheckboxGroup
                        label="Do they have control over their bladder?"
                        name="bladderControl"
                        options={controlOptions}
                        value={formData.bladderControl || []}
                        onChange={(newValues) =>
                          handleSectionChange({
                            name: "bladderControl",
                            value: newValues,
                          })
                        }
                        row={true}
                        multiple={false}
                      />
                      <CheckboxGroup
                        label="Do they need support with the following?"
                        options={continenceSupportOptions}
                        value={formData.continence_support || []}
                        onChange={(newValues) =>
                          handleSectionChange({
                            name: "continence_support",
                            value: newValues,
                          })
                        }
                        row={true}
                      />
                    </div>
                    <InputField
                      label="Other (please specify)"
                      name="other_continence"
                      value={formData.other_continence || ""}
                      onChange={handleSectionChange}
                      placeholder="Input text"
                    />
                    <TextAreaField
                      label="Additional Notes"
                      name="additional_notes"
                      value={formData.additional_notes || ""}
                      onChange={handleSectionChange}
                      placeholder="Input text"
                    />
                  </div>

                  <div className="sub-section">
                    <SelectField
                      label="Continence Care"
                      name="continence_care"
                      value={formData.continence_care || ""}
                      options={toiletUsageOptions}
                      onChange={handleSectionChange}
                    />
                    <SelectField
                      label="Mobility Assistance"
                      name="mobility_assistance"
                      value={formData.mobility_assistance || ""}
                      options={mobilityAssistanceOptions}
                      onChange={handleSectionChange}
                    />
                  </div>

                  <div className="sub-section">
                    <InputField
                      label="Preferred Language"
                      name="preferred_language"
                      value={formData.preferred_language || ""}
                      onChange={handleSectionChange}
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
                        onChange={handleCommunicationNeedsChange}
                        multiple={true}
                        row={false}
                      />
                    </div>
                  </div>
                </div>
              </div>

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
                          handleSectionChange({
                            name: "can_do_shopping",
                            value: newValues,
                          })
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
                          handleSectionChange({
                            name: "can_use_telephone",
                            value: newValues,
                          })
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
                          handleSectionChange({
                            name: "can_do_laundry",
                            value: newValues,
                          })
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
                      onChange={handleSectionChange}
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
                        handleSectionChange({
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
                      onChange={handleSectionChange}
                    />
                  </div>
                </div>
              </div>

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
                          handleSectionChange({
                            name: "had_fall_before",
                            value: newValues,
                          })
                        }
                        row={true}
                        multiple={false}
                      />
                    </div>
                    <InputField
                      label="How many times?"
                      name="fall_count"
                      value={formData.fall_count || ""}
                      onChange={handleSectionChange}
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
                          handleSectionChange({
                            name: "mobility_level",
                            value: newValues,
                          })
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
                          handleSectionChange({
                            name: "mobility_support",
                            value: newValues,
                          })
                        }
                        row={true}
                      />
                      <InputField
                        label="Other (please specify)"
                        name="other_mobility_support"
                        value={formData.other_mobility_support || ""}
                        onChange={handleSectionChange}
                        placeholder="Input text"
                      />
                      <CheckboxGroup
                        label="Are they as active as they would like to be?"
                        name="as_active_as_liked"
                        options={yesNoOptions}
                        value={formData.as_active_as_liked || []}
                        onChange={(newValues) =>
                          handleSectionChange({
                            name: "as_active_as_liked",
                            value: newValues,
                          })
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
                          handleSectionChange({
                            name: "can_transfer",
                            value: newValues,
                          })
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
                          handleSectionChange({
                            name: "can_stairs",
                            value: newValues,
                          })
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
                          handleSectionChange({
                            name: "can_travel_own",
                            value: newValues,
                          })
                        }
                        row={true}
                        multiple={false}
                      />
                    </div>
                    <TextAreaField
                      label="Additional Notes"
                      name="falls_mobility_notes"
                      value={formData.falls_mobility_notes || ""}
                      onChange={handleSectionChange}
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
                        options={visionSpeechHearingOptions}
                        value={formData.vision_status || []}
                        onChange={(newValues) =>
                          handleSectionChange({
                            name: "vision_status",
                            value: newValues,
                          })
                        }
                        row={true}
                        multiple={false}
                      />
                      <CheckboxGroup
                        label="How is their speech?"
                        name="speech_status"
                        options={visionSpeechHearingOptions}
                        value={formData.speech_status || []}
                        onChange={(newValues) =>
                          handleSectionChange({
                            name: "speech_status",
                            value: newValues,
                          })
                        }
                        row={true}
                        multiple={false}
                      />
                      <CheckboxGroup
                        label="How is their hearing?"
                        name="hearing_status"
                        options={visionSpeechHearingOptions}
                        value={formData.hearing_status || []}
                        onChange={(newValues) =>
                          handleSectionChange({
                            name: "hearing_status",
                            value: newValues,
                          })
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
                      onChange={handleSectionChange}
                      placeholder="Input text"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancelSection}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="continue-btn"
                  onClick={handleSaveSection}
                  disabled={sectionSaving}
                >
                  {sectionSaving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="DDD-PPLso-2">
          <div className="Tassk-Sug-Box">
            <div className="Tassk-Sug-BBans">
              <img src={TaskImg} alt="task" />
            </div>
            <div className="Tassk-Sug-Dlt">
              <p>
                {tasks.length === 0
                  ? "No task have been added yet!"
                  : tasks.length === 1
                  ? "A task is added — click to view the task"
                  : `There are ${tasks.length} task${
                      tasks.length > 1 ? "s" : ""
                    } added`}
              </p>
              <div className="Tassk-Sug-Dlt-Btn">
                {tasks.length === 0 ? (
                  <button className="btn-primary-bg no-task" type="button">
                    <ExclamationTriangleIcon /> No task
                  </button>
                ) : (
                  <button
                    className="btn-primary-bg view-task"
                    type="button"
                    onClick={() => setViewOpen(true)}
                  >
                    <BriefcaseIcon /> View task&nbsp;
                    {tasks.length > 1 ? "s" : ""}
                  </button>
                )}
                <span className="add-task-trigger" onClick={openNewTask}>
                  <PlusIcon />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global success alert */}
      <AnimatePresence>
        {successAlert.show && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className="global-task-success-alert"
          >
            <div>
              {successAlert.updated
                ? "Successfully updated:"
                : "Successfully added:"}{" "}
              <strong>{successAlert.title}</strong>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks list modal */}
      <AnimatePresence>
        {viewOpen && (
          <>
            <motion.div
              className="add-task-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewOpen(false)}
            />
            <motion.div
              className="add-task-panel"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="TTas-Boxxs custom-scroll-bar">
                <div className="TTas-Boxxs-Top">
                  <h4>Tasks List</h4>
                  <p>All added tasks are shown below. This is read-only.</p>
                </div>
                <div className="TTas-Boxxs-Body">
                  <div style={{ display: "grid", gap: 12 }}>
                    {tasks.length === 0 ? (
                      <div style={{ padding: 16 }}>No tasks yet.</div>
                    ) : (
                      tasks.map((t, i) => (
                        <div key={i} className="task-list-item">
                          <div className="task-list-item-Top">
                            <h3>{t.title || "Untitled"}</h3>
                            <div className="task-list-item-Top-Btn">
                              <button
                                type="button"
                                className="btn-edit-task btn-primary-bg"
                                onClick={() => handleEdit(i)}
                              >
                                <PencilIcon /> Edit
                              </button>
                            </div>
                          </div>
                          <div className="task-list-item-Body">
                            {t.description && <p>{t.description}</p>}
                          </div>
                          <div className="task-list-item-LSts">
                            <div className="task-list-item-LSts-Main">
                              <h4>Risk Category</h4>
                              <p>
                                {t.riskCategory === "others"
                                  ? t.otherRiskText || "Others"
                                  : RISK_LABELS[t.riskCategory] ||
                                    t.riskCategory ||
                                    "—"}
                              </p>
                            </div>
                            <div className="task-list-item-LSts-Main">
                              <h4>Frequency</h4>
                              <p>
                                {t.frequency === "custom"
                                  ? `Custom (Start time:${
                                      t.frequencyStartDate
                                    } - ${
                                      t.frequencyEndDate ||
                                      (t.frequencyEndType === "recurring"
                                        ? "Recurring"
                                        : "—")
                                    })`
                                  : FREQ_LABELS[t.frequency] ||
                                    t.frequency ||
                                    "—"}
                              </p>
                            </div>
                            {t.taskStartDate && (
                              <div className="task-list-item-LSts-Main">
                                <h4>Task Period</h4>
                                <p>
                                  {t.taskStartDate}{" "}
                                  {t.taskEndDate ? `to ${t.taskEndDate}` : ""}
                                </p>
                              </div>
                            )}
                            {t.session && (
                              <div className="task-list-item-LSts-Main">
                                <h4>Preferred Timing</h4>
                                <p>{`${
                                  t.session.charAt(0).toUpperCase() +
                                  t.session.slice(1)
                                } (Start time: ${t.startTime} - End time: ${
                                  t.endTime
                                })`}</p>
                              </div>
                            )}
                            {t.addToCareVisit && (
                              <div className="task-list-item-LSts-Main">
                                <h4>Care Visit</h4>
                                <p>Added to Care Visit</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="add-task-actions" style={{ marginTop: 14 }}>
                    <button
                      type="button"
                      className="close-task"
                      onClick={() => setViewOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add/Edit Task Modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="add-task-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="add-task-panel"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="TTas-Boxxs custom-scroll-bar">
                <div className="TTas-Boxxs-Top">
                  <h4>{editIndex !== null ? "Edit Task" : "Add Task"}</h4>
                  <p>
                    Define and assign a task to ensure the client’s risks are
                    properly managed and addressed.
                  </p>
                </div>
                <div className="TTas-Boxxs-Body">
                  <form onSubmit={handleSave} className="add-task-form">
                    <div className="TTtata-Input">
                      <label>Task Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="TTtata-Input">
                      <label>Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                      <p>
                        The carer would see this note in the app each time they
                        complete this task
                      </p>
                    </div>
                    <div className="TTtata-Selltss">
                      <h4>Risk Category</h4>
                      <div className="TTtata-Selltss-LInBt">
                        <label>
                          <input
                            type="radio"
                            name="riskCategory"
                            value="falls"
                            checked={riskCategory === "falls"}
                            onChange={() => setRiskCategory("falls")}
                          />
                          Falls
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="riskCategory"
                            value="choking"
                            checked={riskCategory === "choking"}
                            onChange={() => setRiskCategory("choking")}
                          />
                          Choking
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="riskCategory"
                            value="medication"
                            checked={riskCategory === "medication"}
                            onChange={() => setRiskCategory("medication")}
                          />
                          Medication Safety
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="riskCategory"
                            value="safety"
                            checked={riskCategory === "safety"}
                            onChange={() => setRiskCategory("safety")}
                          />
                          Safety
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="riskCategory"
                            value="others"
                            checked={riskCategory === "others"}
                            onChange={() => setRiskCategory("others")}
                          />
                          Others
                        </label>
                      </div>
                    </div>
                    <AnimatePresence>
                      {riskCategory === "others" && (
                        <motion.div
                          className="TTtata-Input"
                          initial={{ opacity: 0, height: 0, y: -6 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -6 }}
                          transition={{ type: "tween", duration: 0.22 }}
                        >
                          <input
                            type="text"
                            value={otherRiskText}
                            placeholder="Specify"
                            onChange={(e) => setOtherRiskText(e.target.value)}
                            required
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="TTtata-Selltss">
                      <h4>Select Frequency</h4>
                      <div className="TTtata-Selltss-LInBt">
                        <label>
                          <input
                            type="radio"
                            name="frequency"
                            value="once"
                            checked={frequency === "once"}
                            onChange={() => handleFrequencyChange("once")}
                          />
                          Once
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="frequency"
                            value="daily"
                            checked={frequency === "daily"}
                            onChange={() => handleFrequencyChange("daily")}
                          />
                          Daily
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="frequency"
                            value="weekly"
                            checked={frequency === "weekly"}
                            onChange={() => handleFrequencyChange("weekly")}
                          />
                          Weekly
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="frequency"
                            value="monthly"
                            checked={frequency === "monthly"}
                            onChange={() => handleFrequencyChange("monthly")}
                          />
                          Monthly
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="frequency"
                            value="custom"
                            checked={frequency === "custom"}
                            onChange={() => handleFrequencyChange("custom")}
                          />
                          Custom
                        </label>
                      </div>
                    </div>
                    <AnimatePresence>
                      {frequency === "custom" && (
                        <motion.div
                          className="cusTom-Sec"
                          initial={{ opacity: 0, height: 0, y: -6 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -6 }}
                          transition={{ type: "tween", duration: 0.22 }}
                        >
                          <h3>Duration</h3>
                          <div className="cusTom-Sec-Main">
                            <div className="TTtata-Input">
                              <label>Start Date*</label>
                              <input
                                type="date"
                                value={frequencyStartDate}
                                onChange={(e) =>
                                  setFrequencyStartDate(e.target.value)
                                }
                                required
                              />
                            </div>
                            <div className="TTtata-Selltss">
                              <h4>End Date* (select dates that suit)</h4>
                              <div className="TTtata-Selltss-LInBt KKjm-OLks">
                                <label>
                                  <input
                                    type="radio"
                                    name="endTimeType"
                                    value="recurring"
                                    checked={frequencyEndType === "recurring"}
                                    onChange={() => {
                                      setFrequencyEndType("recurring");
                                      setFrequencyEndDate("");
                                    }}
                                  />
                                  Recurring
                                </label>
                                <input
                                  type="date"
                                  value={frequencyEndDate}
                                  onChange={(e) => {
                                    setFrequencyEndDate(e.target.value);
                                    setFrequencyEndType("");
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="TTtata-Selltss OOksl-Pls">
                      <h4>Select Preferred Timing</h4>
                      <div className="Info-TTb-BS-HYH">
                        <div className="TTtata-Input">
                          <select
                            value={preferredTiming}
                            onChange={(e) => setPreferredTiming(e.target.value)}
                          >
                            <option>Anytime</option>
                            <option>Sessions</option>
                          </select>
                        </div>
                      </div>
                      <AnimatePresence>
                        {preferredTiming === "Sessions" && (
                          <motion.div
                            className="Info-TTb-BS-HYH"
                            initial={{ opacity: 0, height: 0, y: -6 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -6 }}
                            transition={{ type: "tween", duration: 0.22 }}
                          >
                            <div className="TTtata-Selltss-LInBt">
                              <label>
                                <input
                                  type="radio"
                                  name="session"
                                  value="morning"
                                  checked={selectedSession === "morning"}
                                  onChange={() =>
                                    handleSessionChange("morning")
                                  }
                                />
                                Morning
                              </label>
                              <label>
                                <input
                                  type="radio"
                                  name="session"
                                  value="afternoon"
                                  checked={selectedSession === "afternoon"}
                                  onChange={() =>
                                    handleSessionChange("afternoon")
                                  }
                                />
                                Afternoon
                              </label>
                              <label>
                                <input
                                  type="radio"
                                  name="session"
                                  value="evening"
                                  checked={selectedSession === "evening"}
                                  onChange={() =>
                                    handleSessionChange("evening")
                                  }
                                />
                                Evening
                              </label>
                              <label>
                                <input
                                  type="radio"
                                  name="session"
                                  value="night"
                                  checked={selectedSession === "night"}
                                  onChange={() => handleSessionChange("night")}
                                />
                                Night
                              </label>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <AnimatePresence>
                        {preferredTiming === "Sessions" && selectedSession && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, y: -6 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -6 }}
                            transition={{ type: "tween", duration: 0.22 }}
                          >
                            <div className="Info-TTb-BS-HYH">
                              <h5 className="RRagbs-Plsa">
                                {selectedSession.charAt(0).toUpperCase() +
                                  selectedSession.slice(1)}
                                : {sessionRanges[selectedSession]}
                              </h5>
                            </div>
                            <div className="ggllak-Ppaths">
                              <div className="Info-TTb-BS-HYH">
                                <h5>Start Time</h5>
                                <div className="TTtata-Input">
                                  <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) =>
                                      setStartTime(e.target.value)
                                    }
                                  />
                                </div>
                              </div>
                              <div className="Info-TTb-BS-HYH">
                                <h5>End Time</h5>
                                <div className="TTtata-Input">
                                  <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="TTtata-Selltss OOksl-Pls">
                      <h4>Care Visit</h4>

                      <div className="TTtata-Selltss-LInBt">
                        <label>
                          <input
                            type="checkbox"
                            checked={addToCareVisit}
                            onChange={(e) =>
                              setAddToCareVisit(e.target.checked)
                            }
                          />
                          Add to Care Visit
                        </label>
                      </div>
                    </div>

                    <div className="add-task-actions">
                      <button
                        type="button"
                        className="close-task"
                        onClick={handleCancel}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="proceed-tast-btn btn-primary-bg"
                      >
                        {saving ? (
                          <>
                            <motion.div
                              initial={{ rotate: 0 }}
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              style={{
                                width: 15,
                                height: 15,
                                borderRadius: "50%",
                                border: "3px solid #fff",
                                borderTopColor: "transparent",
                                marginRight: "5px",
                                display: "inline-block",
                              }}
                            />
                            Saving...
                          </>
                        ) : editIndex !== null ? (
                          "Save changes"
                        ) : (
                          "Save task"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CareEssentials;
