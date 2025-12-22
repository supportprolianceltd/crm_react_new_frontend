import { FiArrowLeft } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import InputField from "../../../../components/Input/InputField";
import SelectField from "../../../../components/Input/SelectField";
import CheckboxGroup from "../../../../components/CheckboxGroup";
import MissingFieldsModal from "../../Employees/modals/MissingFieldsModal";
import SuccessOrErrorModal from "../../../../components/Modal/SuccessOrErrorModal";
import ClearFormModal from "../../Employees/modals/ClearFormModal";
import { fetchSingleClient, createCarePlan } from "../config/apiService";
import "../styles/CreateCarePlan.css";
import CarePlanProfileCard from "./CarePlanProfileCard";
import HealthNeedsRiskAssessmentStep from "./steps/HealthNeedsRiskAssessmentStep";
import CareEssentialsActivityPlanStep from "./steps/CareEssentialsActivityPlanStep";
import MedicalInformationStep from "./steps/MedicalInformationStep";
import PsychologicalInformationStep from "./steps/PsychologicalInformationStep";
import FoodNutritionHydrationStep from "./steps/FoodNutritionHydrationStep";
import HistoryRoutinePreferencesStep from "./steps/HistoryRoutinePreferencesStep";
import CultureValuesStep from "./steps/CultureValuesStep";
import AdministrativeBodyMapStep from "./steps/AdministrativeBodyMapStep";
import MovingHandlingStep from "./steps/MovingHandlingStep";
import CareRequirementsStep from "./steps/CareRequirementsStep";
import LegalRequirementsStep from "./steps/LegalRequirementsStep";
import LoadingState from "../../../../components/LoadingState";
import { convertToISO } from "../../../../utils/helpers";
import SubSideNav from "../../Rostering/SubSideNav";

const createInitialFormData = () => {
  const currentDate = new Date().toISOString();

  return {
    // Risk Assessment fields
    risk_factors: "",
    risk_details: "",
    support_areas: "",
    stairs: "",
    safety_features: "",
    hazards: "",
    other_hazards: "",
    accessibility: "",
    lone_worker: null,
    risk_assessment_training: "",

    // Care Essentials fields
    can_wash_themselves: "YES_INDEPENDENTLY",
    can_maintain_oral_hygiene: "",
    can_maintain_personal_appearance: "",
    can_dress_themselves: "",
    grooming_needs: "",
    other_grooming: "",
    toilet_usage: "",
    bowel_control: "",
    bladder_control: "",
    continence_support: "",
    other_continence: "",
    additional_notes: "",
    continence_care: "",
    mobility_assistance: "",
    preferred_language: "",
    wears_hearing_aid: false,
    uses_glasses: false,
    requires_large_print: false,
    prefers_written_instructions: false,
    non_verbal: false,

    // Communication needs (from checkboxes)
    communication_needs: "",

    // Everyday Activity Plan fields
    can_do_shopping: "",
    can_use_telephone: "",
    can_do_laundry: "",
    everyday_activity_notes: "",
    community_access_needs: "",
    exercise_mobility_activities: "",

    // Falls and Mobility fields
    had_fall_before: "",
    fall_count: "",
    mobility_level: "INDEPENDENT",
    mobility_support: "NONE",
    other_mobility_support: "",
    as_active_as_liked: "",
    can_transfer: "",
    can_stairs: "",
    can_travel_own: "",
    falls_mobility_notes: "",

    // Sensory needs fields
    vision_status: "",
    speech_status: "",
    hearing_status: "",
    sensory_needs_notes: "",

    // MEDICAL INFORMATION SECTION
    primary_diagnosis: "",
    primary_additional_notes: "",
    secondary_diagnosis: "",
    secondary_additional_notes: "",
    past_medical_history: "",
    medication_support: [],
    breathing_difficulty: [],
    breathing_support_notes: "",

    // Airway Management fields
    airway_equipment_used: [],
    airway_equipment_types: [],
    airway_equipment_specify: "",
    airway_equipment_risks: "",
    airway_risks_mitigation: "",

    // Skin fields
    has_pressure_sores: [],
    skin_concerns: [],
    skin_additional_info: "",

    // Body Map consent and wound details
    body_map_consent: false,
    care_plan_review_date: currentDate,
    has_existing_wounds: [],
    wound_type: "",
    wound_size_grade: "",
    wound_location_description: "",
    wound_date_observed: currentDate,
    client_weight: "",
    client_height: "",

    // Safeguarding
    safeguarding_issues: [],
    safeguarding_skin_concerns: [],
    safeguarding_additional_info: "",

    // Current Health Status
    current_health_status: [],

    // Allergies
    has_allergies: [],
    allergies_details: "",
    allergies: [],

    // Medication Schedule (array of medication objects)
    medication_schedule: [],

    // Activity plan placeholder
    activity_plan_notes: "",

    // Medical Support Contacts
    gp_primary_doctor_name: "",
    gp_primary_doctor_code: "+44",
    gp_primary_doctor_phone: "",
    specialist_code: "+44",
    specialist_phone: "",
    hospital_clinic_code: "+44",
    hospital_clinic_phone: "",
    emergency_care_notes: "",
    documentation_upload: null,
    documentation_upload_preview: "",
    documentation_upload_url: "",

    // Psychological Information fields
    health_satisfaction: "",
    motivation_level: "",
    mood: "",
    mood_specify: "",
    sleep: "",
    sleep_specify: "",
    worried_about_memory: "",
    memory: "",
    memory_specify: "",

    // Environmental Information fields
    housekeeping_ability: "",
    housekeeping_support: "",
    housekeeping_notes: "",

    // Food Nutrition & Hydration fields
    dietary_requirements: [],
    has_allergies_intolerances: "",
    allergies_specify: "",
    allergies_impact: "",
    dietary_requirement: "",
    favourite_foods: "",
    appetite: "",
    swallow: "",
    medications_affect_swallowing: "",
    medications_affect_swallowing_specify: "",
    can_feed_self: "",
    can_prepare_light_meal: "",
    can_cook_meals: "",
    responsible_for_food: "",
    mealtime_support: "",
    hydration_schedule: "",
    strong_dislikes: "",
    fluid_preference: "",

    // History, Routine & Preferences fields
    personal_biography: "",
    has_important_jobs: [],
    job_details: "",
    has_important_people: [],
    important_people_details: "",
    has_significant_locations: [],
    locations_care_impact: "",
    caregiver_gender_preference: "NO_PREFERENCE",
    autonomy_preferences: [],
    daily_routine: "",
    has_specific_routines_preferences: [],
    specific_routines_details: "",
    has_dislikes: [],
    dislikes_details: "",
    has_hobbies: [],
    hobbies_impact: "",

    // Culture, Values & Identity fields
    cultural_religious_background: "",
    ethnic_group: "",
    specific_religious_cultural_accommodations: "",
    sexuality_description: "",
    gender_sexual_orientation_impact: "",
    other_communication_needs: "",

    // Social Support fields
    key_family_members: "",
    has_informal_care: "",
    informal_care_provider: "",
    informal_care_provider_other: "",
    informal_care_support: "",
    informal_carer_concerns: "",
    informal_carer_concerns_details: "",
    has_formal_care: "",
    formal_care_details: "",
    mental_wellbeing_tracking: false,

    // Administrative fields
    finances_handling: [],
    advanced_directive: [],
    has_will: [],
    admin_additional_notes: "",
    invoicing_cycle: "",
    funding_insurance_details: "",
    assigned_care_manager: "",

    // Moving & Handling fields
    equipment_needs: "",
    has_pain: "",
    has_cognitive_impairment: "",
    has_changing_behaviors: [],
    behavior_description: "",
    can_walk_independently: [],
    standing_balance_dependency: "",
    can_manage_stairs: [],
    sitting_to_standing_dependency: "",
    has_limited_sitting_balance: [],
    can_move_turn_in_bed: [],
    can_lying_to_sitting: [],
    bed_in_out_dependency: "",
    bath_or_shower: "",
    can_transfer_independently: [],
    has_profiling_bed_mattress: [],
    transfer_risks: [],
    behavioural_challenges: [],
    location_risk_review: "",
    evacuation_plan_required: [],

    // Hydration Monitoring fields (added to Moving & Handling)
    daily_hydration_goal: "",
    hydration_intake_log: [],
    dehydration_alert_enabled: false,

    risk_management_plan_upload: null,
    risk_management_plan_preview: "",
    risk_management_plan_url: "",

    // Care Requirements fields
    care_type: [],
    contractStart: "",
    contractEnd: "",

    // Legal Requirements fields
    has_power_of_attorney: [],
    poa_type: [],
    poa_name_health_welfare: "",
    poa_name_finance_property: "",
    poa_code: "+44",
    poa_contact_number: "",
    poa_email: "",
    poa_solicitor_firm: "",
    poa_certificate_number: "",
    poa_upload: null,
    poa_upload_preview: "",
    poa_upload_url: "",
    consent_data_protection: false,
    consent_medication: false,
    consent_personal_care: false,
    acknowledge_complaints_policy: false,
    id_upload: null,
    id_upload_preview: "",
    id_upload_url: "",

    // Schedule field
    agreedCareVisits: {},
  };
};

const CreateCarePlanPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showMissingFieldsModal, setShowMissingFieldsModal] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [client, setClient] = useState(null);
  const [activeTab, setActiveTab] = useState("risk-assessment");
  const [isLoadingClientInfo, setIsLoadingClientInfo] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const STORAGE_KEY = `carePlan_${id}`;

  const [formData, setFormData] = useState(createInitialFormData);

  const requiredFieldsPerStep = {
    "risk-assessment": [
      "risk_details",
      "stairs",
      "other_hazards",
      "risk_assessment_training",
    ],
    "care-essentials": ["can_wash_themselves"],
    "medical-information": ["primary_diagnosis", "past_medical_history"],
    "psychological-information": [
      "health_satisfaction",
      "housekeeping_ability",
    ],
    "food-nutrition-hydration": ["dietary_requirements", "favourite_foods"],
    "history-routine-preferences": ["personal_biography", "daily_routine"],
    "culture-values": [
      "cultural_religious_background",
      "ethnic_group",
      "key_family_members",
    ],
    "administrative-body-map": [
      "finances_handling",
      "advanced_directive",
      "has_will",
    ],
    "moving-handling": [
      "equipment_needs",
      "has_pain",
      "has_cognitive_impairment",
      "has_changing_behaviors",
      "can_walk_independently",
      "standing_balance_dependency",
      "can_manage_stairs",
      "sitting_to_standing_dependency",
      "has_limited_sitting_balance",
      "can_move_turn_in_bed",
      "can_lying_to_sitting",
      "bed_in_out_dependency",
      "bath_or_shower",
      "can_transfer_independently",
      "has_profiling_bed_mattress",
      "transfer_risks",
      "behavioural_challenges",
      "location_risk_review",
      "evacuation_plan_required",
      "daily_hydration_goal",
    ],
    "care-requirements": ["care_type", "agreedCareVisits"],
    legal: [
      "consent_data_protection",
      "consent_medication",
      "consent_personal_care",
      "acknowledge_complaints_policy",
    ],
  };

  const fieldLabels = {
    risk_details: "Details",
    stairs: "Home Layout",
    other_hazards: "Other Hazards",
    risk_assessment_training: "Risk Assessment & Training",
    can_wash_themselves: "Can they wash themselves?",
    preferred_language: "Preferred Language",
    primary_diagnosis: "Primary Diagnosis",
    past_medical_history: "Past Medical History",
    health_satisfaction: "Health Satisfaction",
    housekeeping_ability: "Housekeeping Ability",
    dietary_requirements: "Dietary Requirements",
    favourite_foods: "Favourite Foods",
    personal_biography: "Personal Biography",
    daily_routine: "Daily Routine",
    cultural_religious_background: "Cultural & Religious Background",
    ethnic_group: "Ethnic Group",
    key_family_members: "Key Family Members",
    finances_handling: "Finances",
    advanced_directive: "Advanced Directive",
    has_will: "Will",
    equipment_needs: "Equipment needs",
    has_pain: "Pain resting/during movement",
    has_cognitive_impairment: "Cognitive impairment",
    has_changing_behaviors: "Behaviours that change",
    can_walk_independently: "Can the client walk independently?",
    standing_balance_dependency:
      "How dependent is the client when balancing in standing position?",
    can_manage_stairs: "Can the client manage stairs?",
    sitting_to_standing_dependency:
      "How dependent is the client when moving from a sitting to standing position?",
    has_limited_sitting_balance:
      "Does the client have limited sitting balance?",
    can_move_turn_in_bed: "Can the client move and turn independently in bed?",
    can_lying_to_sitting:
      "Can the client move from a lying to a sitting position independently?",
    bed_in_out_dependency:
      "How dependent is the client when getting in and out of bed?",
    bath_or_shower: "Does the client use a bath or shower",
    can_transfer_independently:
      "Can the client transfer independently from a chair to a commode or bed?",
    has_profiling_bed_mattress:
      "Does the client have a profiling bed and mattress?",
    transfer_risks: "Transfer risks",
    behavioural_challenges: "Behavioural challenges",
    location_risk_review: "Location risk review",
    evacuation_plan_required: "Evacuation plan required?",
    daily_hydration_goal: "Daily Hydration Goal",
    care_type: "Care Type",
    agreedCareVisits: "Agreed Care Visits",
    consent_data_protection: "Data Protection Consent",
    consent_medication: "Medication Consent",
    consent_personal_care: "Personal Care Consent",
    acknowledge_complaints_policy: "Complaints Policy Acknowledgement",
  };

  const tabs = [
    { key: "risk-assessment", label: "Risk Assessment" },
    { key: "care-essentials", label: "Care Essentials & Activity Plan" },
    { key: "medical-information", label: "Medical Information" },
    { key: "psychological-information", label: "Psychological Information" },
    { key: "food-nutrition-hydration", label: "Food Nutrition & Hydration" },
    {
      key: "history-routine-preferences",
      label: "Life History, Routines & Preferences",
    },
    { key: "culture-values", label: "Culture & Values" },
    { key: "administrative-body-map", label: "Administrative & Body Map" },
    { key: "moving-handling", label: "Moving & Handling" },
    { key: "care-requirements", label: "Care Requirements" },
    { key: "legal", label: "Legal Requirements" },
  ];

  // Enhanced localStorage loading with error handling and data validation
  const loadFromLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedData = JSON.parse(saved);

        // Merge with fresh form data to ensure all fields exist
        const mergedData = { ...createInitialFormData(), ...parsedData };

        // Ensure array fields are always arrays and boolean fields are booleans
        Object.keys(mergedData).forEach((key) => {
          const freshData = createInitialFormData();
          if (
            Array.isArray(freshData[key]) &&
            !Array.isArray(mergedData[key])
          ) {
            mergedData[key] = [];
          }
          if (
            typeof freshData[key] === "boolean" &&
            typeof mergedData[key] !== "boolean"
          ) {
            mergedData[key] = Boolean(mergedData[key]);
          }
          if (
            key === "agreedCareVisits" &&
            typeof mergedData[key] !== "object"
          ) {
            mergedData[key] = {};
          }
          // Ensure hydration_intake_log is properly formatted
          if (
            key === "hydration_intake_log" &&
            Array.isArray(mergedData[key])
          ) {
            mergedData[key] = mergedData[key].map((entry) => ({
              time: entry.time || "",
              amount: entry.amount || "",
            }));
          }
        });

        setFormData(mergedData);
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      setFormData(createInitialFormData());
    }
  }, [STORAGE_KEY]);

  // Enhanced localStorage saving with error handling and file object handling
  const saveToLocalStorage = useCallback(
    (data) => {
      try {
        // Create a copy of data and remove/convert non-serializable file objects
        const dataToSave = { ...data };
        Object.keys(dataToSave).forEach((key) => {
          if (dataToSave[key] instanceof File) {
            // Save filename and size instead of the full File object
            dataToSave[key] = {
              name: dataToSave[key].name,
              size: dataToSave[key].size,
              type: dataToSave[key].type,
              _isFileObject: true,
            };
          }
          // Handle file previews (Data URLs can be large but are serializable)
          if (
            key.includes("_preview") &&
            dataToSave[key] &&
            dataToSave[key].length > 100000
          ) {
            // Truncate very large previews to prevent localStorage limits
            dataToSave[key] =
              dataToSave[key].substring(0, 50000) + "...[truncated]";
          }
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (error) {
        console.error("Failed to save to localStorage:", error);
        // If data is too large, try to save without file previews
        try {
          const dataWithoutPreviews = { ...dataToSave };
          Object.keys(dataWithoutPreviews).forEach((key) => {
            if (key.includes("_preview")) {
              delete dataWithoutPreviews[key];
            }
          });
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(dataWithoutPreviews)
          );
        } catch (secondError) {
          console.error("Failed to save even without previews:", secondError);
        }
      }
    },
    [STORAGE_KEY]
  );

  // Load from localStorage on component mount
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  // Save to localStorage whenever formData changes (with debouncing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToLocalStorage(formData);
    }, 500); // Increased debounce time

    return () => clearTimeout(timeoutId);
  }, [formData, saveToLocalStorage]);

  // Enhanced form data update function that handles all input types
  const handleChange = useCallback((eOrValue) => {
    if (eOrValue && eOrValue.target) {
      const { name, value, type, checked } = eOrValue.target;

      setFormData((prev) => {
        let newValue;

        switch (type) {
          case "checkbox":
            // For single checkboxes, use the checked value directly
            newValue = checked;
            break;
          case "number":
            newValue = value === "" ? "" : Number(value);
            break;
          case "select-multiple":
            const selectedOptions = Array.from(
              eOrValue.target.selectedOptions
            ).map((option) => option.value);
            newValue = selectedOptions;
            break;
          case "date":
            newValue = value;
            break;
          default:
            newValue = value;
        }

        return { ...prev, [name]: newValue };
      });
    } else if (
      typeof eOrValue === "object" &&
      eOrValue.name &&
      eOrValue.value !== undefined
    ) {
      setFormData((prev) => ({ ...prev, [eOrValue.name]: eOrValue.value }));
    } else {
      setFormData((prev) => ({ ...prev, ...eOrValue }));
    }
  }, []);

  // Enhanced checkbox array handler for grouped checkboxes
  const handleCheckboxArrayChange = useCallback(
    (fieldName, value, isChecked) => {
      setFormData((prev) => {
        const currentArray = Array.isArray(prev[fieldName])
          ? prev[fieldName]
          : [];

        let newArray;
        if (isChecked) {
          newArray = [...new Set([...currentArray, value])];
        } else {
          newArray = currentArray.filter((item) => item !== value);
        }

        return { ...prev, [fieldName]: newArray };
      });
    },
    []
  );

  // Enhanced single checkbox handler
  const handleSingleCheckboxChange = useCallback((fieldName, checked) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: checked,
    }));
  }, []);

  // Special handler for communication needs to sync individual fields
  const handleCommunicationNeedsChange = useCallback(
    (value, isChecked) => {
      handleCheckboxArrayChange("communication_needs", value, isChecked);

      switch (value) {
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
    },
    [handleCheckboxArrayChange, handleSingleCheckboxChange]
  );

  // Fetch client details
  useEffect(() => {
    const fetchClient = async () => {
      setIsLoadingClientInfo(true);
      try {
        const data = await fetchSingleClient(id);
        setClient(data);
      } catch (error) {
        setModalType("error");
        setModalTitle("Error Fetching Client");
        setModalMessage("Failed to load client details. Please try again.");
        setShowStatusModal(true);
      } finally {
        setTimeout(() => {
          setIsLoadingClientInfo(false);
        }, 1000);
      }
    };
    if (id) {
      fetchClient();
    }
  }, [id]);

  // Animate scroll to top when activeTab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  const currentIndex = tabs.findIndex((t) => t.key === activeTab);
  const isLastStep = currentIndex === tabs.length - 1;

  const isStepValid = (step) => {
    const req = requiredFieldsPerStep[step] || [];
    return req.every((field) => {
      const value = formData[field];
      if (field === "agreedCareVisits") {
        return Object.values(value || {}).some((d) => d.enabled);
      }
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== null && value !== "" && value !== false;
    });
  };

  const getMissingFieldsForStep = (step) => {
    const req = requiredFieldsPerStep[step] || [];
    return req.filter((field) => {
      const value = formData[field];
      if (field === "agreedCareVisits") {
        return !Object.values(value || {}).some((d) => d.enabled);
      }
      if (Array.isArray(value)) {
        return value.length === 0;
      }
      return value === null || value === "" || value === false;
    });
  };

  const getMissingFieldLabelsForStep = (step) =>
    getMissingFieldsForStep(step).map((field) => fieldLabels[field] || field);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  const handleClearForm = () => {
    setShowClearModal(true);
  };

  const handleConfirmClear = () => {
    setFormData(createInitialFormData());
    localStorage.removeItem(STORAGE_KEY);
    setShowClearModal(false);
  };

  // Helper to normalize arrays from strings
  const normalizeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string" && value.trim()) {
      return value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  // Step save/next function
  const handleSave = async () => {
    if (!isStepValid(activeTab)) {
      const missingLabels = getMissingFieldLabelsForStep(activeTab);
      setMissingFields(missingLabels);
      setShowMissingFieldsModal(true);
      return;
    }

    if (isLastStep) {
      setIsSubmitting(true);
      try {
        const clientAllergies = (formData.allergies || [])
          .filter((allergy) => allergy.name?.trim() !== "")
          .map((allergy) => ({
            allergy: allergy.name || "",
            allergyDetails: allergy.allergiesDetails || "",
            severity: allergy.severity || "",
            allergyMedicationFrequency:
              allergy.allergyMedicationFrequency || "",
            allergyMedicationName: allergy.allergyMedicationName || "",
            allergyMedicationDosage: allergy.allergyMedicationDosage || "",
            Appointments: convertToISO(allergy.Appointments) || "",
            knownTrigger: allergy.knownTrigger || "",
          }));

        // Normalize agreedCareVisits (convert slot times to ISO) and include in payload
        const normalizedAgreedCareVisits = (function () {
          const agreed = formData.agreedCareVisits || {};
          try {
            const toIso = (timeStr) => {
              if (!timeStr) return null;
              // time-only like "09:00"
              if (/^\d{2}:\d{2}$/.test(timeStr)) {
                const [hh, mm] = timeStr.split(":").map(Number);
                const d = new Date();
                d.setHours(hh, mm, 0, 0);
                return d.toISOString();
              }
              // Otherwise try existing convertToISO (handles full dates)
              return convertToISO(timeStr) || null;
            };

            return Object.fromEntries(
              Object.entries(agreed).map(([day, info]) => {
                const slots = (info?.slots || []).map((slot) => ({
                  ...slot,
                  startTime: toIso(slot.startTime),
                  endTime: toIso(slot.endTime),
                }));
                return [day, { ...info, slots }];
              })
            );
          } catch (e) {
            return formData.agreedCareVisits || {};
          }
        })();

        // Validate schedule slots: ensure enabled days' slots have startTime and endTime
        const missingSlots = [];
        Object.entries(normalizedAgreedCareVisits || {}).forEach(
          ([day, info]) => {
            if (info && info.enabled) {
              (info.slots || []).forEach((slot, idx) => {
                if (!slot || !slot.startTime || !slot.endTime) {
                  const slotId = slot?.id || idx;
                  missingSlots.push(
                    `${day}: slot ${slotId} missing start or end time`
                  );
                }
              });
            }
          }
        );

        if (missingSlots.length > 0) {
          setIsSubmitting(false);
          setModalType("error");
          setModalTitle("Missing slot times");
          setModalMessage(
            `Please provide start and end times for the following slots:\n- ${missingSlots.join(
              "\n- "
            )}`
          );
          setShowStatusModal(true);
          return;
        }

        // Normalize care type to backend enum values (more permissive)
        const normalizeCareType = (raw) => {
          const value = Array.isArray(raw) ? raw[0] : raw || (formData.care_type || [])[0];
          if (!value) return null;
          let v = String(value).trim().toUpperCase();
          // Normalize separators and remove unexpected chars
          v = v.replace(/[- ]+/g, "_").replace(/[^A-Z0-9_]/g, "");

          // Direct matches or common variants
          if (v === "S" || v.startsWith("SINGLE") || v.includes("PERSONAL")) {
            return "SINGLE_HANDED_CALL";
          }
          if (v === "D" || v.startsWith("DOUBLE")) {
            return "DOUBLE_HANDED_CALL";
          }
          if (v.startsWith("SPECIAL") || v.includes("SPECIALCARE") || v.includes("SPECIAL_CARE")) {
            return "SPECIALCARE";
          }

          return null;
        };

        const normalizedCareTypeValue = normalizeCareType((formData.care_type || [])[0]);

        // If we couldn't map the selected care type, block submit and show an error
        if (!normalizedCareTypeValue) {
          setIsSubmitting(false);
          setModalType("error");
          setModalTitle("Invalid Care Type");
          setModalMessage(
            "Please select a valid Care Type: Single Handed Call, Double Handed Call, or Special Care."
          );
          setShowStatusModal(true);
          return;
        }

        // Ensure dateFirstObserved is sent as ISO datetime at 08:00 UTC
        const toIsoAt08UTC = (dateStr) => {
          if (!dateStr) return null;
          // If already contains time component, return normalized ISO
          if (String(dateStr).includes("T")) {
            try {
              return new Date(dateStr).toISOString();
            } catch {
              return null;
            }
          }
          // If date-only like YYYY-MM-DD
          const m = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})$/);
          if (m) {
            const year = Number(m[1]);
            const month = Number(m[2]) - 1;
            const day = Number(m[3]);
            return new Date(Date.UTC(year, month, day, 8, 0, 0)).toISOString();
          }
          // Fallback to convertToISO then set to 08:00 UTC on that date
          try {
            const iso = convertToISO(dateStr);
            if (!iso) return null;
            const dt = new Date(iso);
            return new Date(
              Date.UTC(
                dt.getUTCFullYear(),
                dt.getUTCMonth(),
                dt.getUTCDate(),
                8,
                0,
                0
              )
            ).toISOString();
          } catch {
            return null;
          }
        };

        const dateFirstObservedIso = toIsoAt08UTC(formData.wound_date_observed);

        const payload = {
          tenantId: "4",
          clientId: id,
          title: `${client?.first_name || ""} ${
            client?.last_name || ""
          } Care Plan`,
          description: `Comprehensive care plan covering all aspects for ${
            client?.first_name || ""
          } ${client?.last_name || ""}`,
          startDate: new Date().toISOString(),
          endDate: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(),

          riskAssessment: {
            primarySupportNeed: "dressing",
            riskFactorsAndAlerts: normalizeArray(formData.risk_factors),
            details: formData.risk_details,
            areasRequiringSupport: normalizeArray(formData.support_areas),
            homeLayout: formData.stairs,
            safetyFeaturesPresent: normalizeArray(formData.safety_features),
            hazards: [
              ...normalizeArray(formData.hazards),
              formData.other_hazards,
            ].filter(Boolean),
            accessibilityNeeds: normalizeArray(formData.accessibility),
            loneWorkerConsideration:
              formData.lone_worker === "yes" ? true : false,
            riskAssessmentAndTraining: formData.risk_assessment_training,
          },

          personalCare: {
            bathingAndShowering: formData.can_wash_themselves,
            oralHygiene: formData.can_maintain_oral_hygiene,
            maintainThemselves: formData.can_maintain_personal_appearance,
            dressThemselves: formData.can_dress_themselves,
            groomingNeeds: normalizeArray(formData.grooming_needs),
            toiletUsage: formData.toilet_usage,
            bowelControl: formData.bowel_control,
            bladderControl: formData.bladder_control,
            toiletingSupport: formData.continence_support,
            additionalNotes: formData.additional_notes,
            continenceCare: formData.continence_care,
            mobilityAssistance: formData.mobility_assistance,
            preferredLanguage: formData.preferred_language,
            communicationStyleNeeds: formData.communication_needs,
          },

          everydayActivityPlan: {
            canTheyShop: formData.can_do_shopping,
            canTheyCall: formData.can_use_telephone,
            canTheyWash: formData.can_do_laundry,
            additionalNotes: formData.everyday_activity_notes,
            communityAccessNeeds: formData.community_access_needs,
            ExerciseandMobilityActivities:
              formData.exercise_mobility_activities,
          },

          fallsAndMobility: {
            fallenBefore:
              formData.had_fall_before === "Yes" ||
              formData.had_fall_before === true,
            timesFallen: Number(formData.fall_count),
            mobilityLevel: formData.mobility_level,
            mobilitySupport: formData.mobility_support,
            otherMobilitySupport: formData.other_mobility_support,
            activeAsTheyLikeToBe: formData.as_active_as_liked,
            canTransfer: formData.can_transfer,
            canuseStairs: formData.can_stairs,
            canTravelAlone: formData.can_travel_own,
            mobilityAdditionalNotes: formData.falls_mobility_notes,
            visionStatus: formData.vision_status,
            speechStatus: formData.speech_status,
            hearingStatus: formData.hearing_status,
            sensoryAdditionalNotes: formData.sensory_needs_notes,
          },

          medicalInfo: {
            primaryDiagnosis: formData.primary_diagnosis,
            primaryAdditionalNotes: formData.primary_additional_notes,
            secondaryDiagnoses: formData.secondary_diagnosis,
            secondaryAdditionalNotes: formData.secondary_additional_notes,
            pastMedicalHistory: formData.past_medical_history,
            medicalSupport: (formData.medication_support || []).includes("yes"),
            breathingDifficulty: (formData.breathing_difficulty || []).includes(
              "yes"
            ),
            breathingSupportNeed: formData.breathing_support_notes,
            useAirWayManagementEquipment: (
              formData.airway_equipment_used || []
            ).includes("yes"),
            specifyAirwayEquipment:
              formData.airway_equipment_types?.[0] ||
              formData.airway_equipment_specify,
            airwayEquipmentRisk: formData.airway_equipment_risks,
            airWayEquipmentMitigationPlan: formData.airway_risks_mitigation,
            haveSkinPressureSores: (formData.has_pressure_sores || []).includes(
              "yes"
            ),
            skinPressureConcerningIssues: (
              formData.skin_concerns || []
            ).includes("yes"),
            skinAdditionalInformation: formData.skin_additional_info,
            currentHealthStatus: formData.current_health_status?.[0] || "",
            raisedSafeGuardingIssue: (
              formData.safeguarding_issues || []
            ).includes("yes"),
            safeGuardingAdditionalInformation:
              formData.safeguarding_additional_info,
            primaryDoctor: formData.gp_primary_doctor_name,
            supportContactPhone: `${formData.gp_primary_doctor_code}${formData.gp_primary_doctor_phone}`,
            specialistContact: `${formData.specialist_code}${formData.specialist_phone}`,
            HospitalContact: `${formData.hospital_clinic_code}${formData.hospital_clinic_phone}`,
            EmergencyCareNotes: formData.emergency_care_notes,
            medicalReportUpload: formData.documentation_upload_url,
            knownAllergies: (formData.has_allergies || []).includes("yes"),
            medications: formData.medication_schedule || [],
            clientAllergies,
          },

          psychologicalInfo: {
            healthLevelSatisfaction: formData.health_satisfaction,
            healthMotivationalLevel: formData.motivation_level,
            sleepMood: formData.mood,
            specifySleepMood: formData.mood_specify,
            sleepStatus: formData.sleep,
            anyoneWorriedAboutMemory:
              formData.worried_about_memory === "Yes" ||
              formData.worried_about_memory === true,
            memoryStatus: formData.memory,
            specifyMemoryStatus: formData.memory_specify,
            canTheyDoHouseKeeping: formData.housekeeping_ability,
            houseKeepingSupport:
              formData.housekeeping_support === "Yes" ||
              formData.housekeeping_support === true,
            houseKeepingAdditionalNotes: formData.housekeeping_notes,
          },

          foodHydration: {
            dietaryRequirements: Array.isArray(formData.dietary_requirements)
              ? formData.dietary_requirements.join(", ")
              : formData.dietary_requirements,
            foodOrDrinkAllergies:
              formData.has_allergies_intolerances === "Yes" ||
              formData.has_allergies_intolerances === true,
            foodAllergiesSpecification: formData.allergies_specify,
            allergiesImpact: formData.allergies_impact,
            favouriteFoods: formData.favourite_foods,
            foodTextures: "",
            appetiteLevel: formData.appetite,
            swallowingDifficulties: formData.swallow,
            medicationsAffectingSwallowing:
              formData.medications_affect_swallowing,
            specifyMedicationsAffectingSwallowing:
              formData.medications_affect_swallowing_specify,
            canFeedSelf: formData.can_feed_self,
            canPrepareLightMeals: formData.can_prepare_light_meal,
            canCookMeals: formData.can_cook_meals,
            clientFoodGiver: formData.responsible_for_food,
            mealtimeSupport: formData.mealtime_support,
            hydrationSchedule: formData.hydration_schedule,
            strongDislikes: formData.strong_dislikes,
            fluidPreferences: formData.fluid_preference,
          },

          routine: {
            PersonalBiography: formData.personal_biography,
            haveJob: (formData.has_important_jobs || []).length > 0,
            aboutJob: formData.job_details,
            haveImportantPerson:
              (formData.has_important_people || []).length > 0,
            aboutImportantPerson: formData.important_people_details,
            significantPersonHasLocation:
              (formData.has_significant_locations || []).length > 0,
            importantPersonLocationEffects: formData.locations_care_impact,
            canMaintainOralHygiene: formData.can_maintain_oral_hygiene,
            careGiverGenderPreference: formData.caregiver_gender_preference,
            autonomyPreference: Array.isArray(formData.autonomy_preferences)
              ? formData.autonomy_preferences.join(", ")
              : formData.autonomy_preferences,
            dailyRoutine: formData.daily_routine,
            haveSpecificImportantRoutine:
              (formData.has_specific_routines_preferences || []).length > 0,
            haveDislikes: (formData.has_dislikes || []).length > 0,
            dislikesEffect: formData.dislikes_details,
            haveHobbiesRoutines: (formData.has_hobbies || []).length > 0,
            hobbiesRoutinesEffect: formData.hobbies_impact,
          },

          cultureValues: {
            religiousBackground: formData.cultural_religious_background,
            ethnicGroup: formData.ethnic_group,
            culturalAccommodation:
              formData.specific_religious_cultural_accommodations,
            sexualityandRelationshipPreferences: formData.sexuality_description,
            sexImpartingCareNeeds: formData.gender_sexual_orientation_impact,
            preferredLanguage: formData.preferred_language,
            communicationStyleNeeds: normalizeArray(
              formData.other_communication_needs
            ),
            preferredMethodOfCommunication: "PHONE",
            keyFamilyMembers: formData.key_family_members,
            receivesInformalCare:
              formData.has_informal_care === "Yes" ||
              formData.has_informal_care === true,
            informalCareByWho:
              formData.informal_care_provider ||
              formData.informal_care_provider_other,
            supportMethodByInformalCare: formData.informal_care_support,
            concernsOnInformalCare: formData.informal_carer_concerns,
            specifyConcernsOnInformalCare:
              formData.informal_carer_concerns_details,
            receivesFormalCare:
              formData.has_formal_care === "Yes" ||
              formData.has_formal_care === true,
            specifyFormalCare: formData.formal_care_details,
            socialGroupAndCommunity: formData.activity_plan_notes || "",
            emotionalSupportNeeds: [],
            mentalWellbeingTracking: formData.mental_wellbeing_tracking,
          },

          bodyMap: {
            visitFrequency: "Weekly",
            carePlanReviewDate: formData.care_plan_review_date,
            invoicingCycle: formData.invoicing_cycle,
            fundingAndInsuranceDetails: formData.funding_insurance_details,
            assignedCareManager: formData.assigned_care_manager,
            initialClinicalObservations: formData.body_map_consent,
            initialSkinIntegrity: (formData.has_existing_wounds || []).includes(
              "yes"
            ),
            type: (formData.has_existing_wounds || []).includes("yes")
              ? formData.wound_type
              : "Full assessment",
            size: formData.wound_size_grade,
            locationDescription: formData.wound_location_description,
            dateFirstObserved: dateFirstObservedIso,
            weight: formData.client_weight,
            height: formData.client_height,
          },

          movingHandling: {
            equipmentsNeeds: formData.equipment_needs,
            anyPainDuringRestingAndMovement: formData.has_pain,
            anyCognitiveImpairment: formData.has_cognitive_impairment,
            behaviouralChanges:
              (formData.has_changing_behaviors || []).length > 0,
            describeBehaviouralChanges: formData.behavior_description,
            walkIndependently:
              formData.can_walk_independently === "yes" ? true : false,
            manageStairs: formData.can_manage_stairs === "yes" ? true : false,
            sittingToStandingDependence:
              formData.sitting_to_standing_dependency || "Moderate",
            limitedSittingBalance:
              formData.has_limited_sitting_balance === "yes" ? true : false,
            turnInBed: formData.can_move_turn_in_bed === "yes" ? true : false,
            lyingToSittingDependence:
              formData.can_lying_to_sitting === "yes" ? true : false,
            gettingUpFromChairDependence:
              formData.bed_in_out_dependency || "Assisted",
            bathOrShower: formData.bath_or_shower,
            chairToCommodeOrBed:
              formData.can_transfer_independently === "yes" ? true : false,
            profilingBedAndMattress:
              formData.has_profiling_bed_mattress === "yes" ? true : false,
            transferRisks: normalizeArray(formData.transfer_risks),
            behaviouralChallenges: normalizeArray(
              formData.behavioural_challenges
            ),
            riskManagementPlan: formData.risk_management_plan_url
              ? "Uploaded"
              : "Standard plan",
            locationRiskReview: formData.location_risk_review,
            EvacuationPlanRequired:
              formData.evacuation_plan_required === "yes" ? true : false,
            dailyGoal: formData.daily_hydration_goal,
            IntakeLog: [
              {
                time: "15:44",
                amount: "200ml",
              },
            ],
            //  formData.hydration_intake_log || [],
          },

          legalRequirement: {
            attorneyInPlace:
              formData.has_power_of_attorney === "yes" ? true : false,
            attorneyType: Array.isArray(formData.poa_type)
              ? formData.poa_type.join(", ")
              : formData.poa_type,
            attorneyName:
              formData.poa_name_health_welfare ||
              formData.poa_name_finance_property,
            attorneyContact: `${formData.poa_code}${formData.poa_contact_number}`,
            attorneyEmail: formData.poa_email,
            solicitor: formData.poa_solicitor_firm,
            certificateNumber: formData.poa_certificate_number,
            certificateUpload: formData.poa_upload_url,
            digitalConsentsAndPermissions: [],
            consertUpload: formData.id_upload_url,
          },

          careRequirements: {
            careType: normalizedCareTypeValue || "SINGLE_HANDED_CALL",
            contractStart: convertToISO(formData.contractStart) || null,
            contractEnd: convertToISO(formData.contractEnd) || null,
            agreedCareVisits: normalizedAgreedCareVisits,
          },

          carers: [],
        };

        await createCarePlan(payload);

        localStorage.removeItem(STORAGE_KEY);

        setModalType("success");
        setModalTitle("Care Plan Created Successfully");
        setModalMessage(
          `Care plan for ${client?.first_name} ${client?.last_name} has been created.`
        );
        setShowStatusModal(true);
      } catch (error) {
        setModalType("error");
        setModalTitle("Creation Failed");
        setModalMessage(
          error.message ||
            "There was an error creating the care plan. Please try again."
        );
        setShowStatusModal(true);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const nextTab = tabs[currentIndex + 1];
      setActiveTab(nextTab.key);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleAddTask = () => {
    console.log("Add task clicked");
  };

  const handleViewList = () => {
    setShowStatusModal(false);
    navigate("/company/clients");
  };

  const renderSidebar = () => (
    <nav
      className="sidebar"
      style={{ position: "sticky", top: "5rem", left: "8rem" }}
    >
      <ul className="care-plan-sidebar-list">
        {tabs.map((tab) => (
          <li key={tab.key}>
            <button
              className={`sidebar-item ${
                activeTab === tab.key ? "active" : ""
              }`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );

  if (!client) {
    return <div>Loading client details...</div>;
  }

  let pronoun;
  const gender = client?.profile?.gender_identity?.toLowerCase();

  if (gender === "male") {
    pronoun = "his";
  } else if (gender === "female") {
    pronoun = "her";
  } else {
    pronoun = "their";
  }

  const subtitle = `${client?.first_name} ${client?.last_name}'s care plan provides a comprehensive overview of ${pronoun} medical details, daily routines, cultural preferences and support requirements. It is designed to guide carers in delivering safe, person-centred and compliant care at every visit.`;

  if (isLoadingClientInfo) {
    return <LoadingState text="Loading client information..." />;
  }
  return (
    <>
      <div className="RosttDDn-PAg">
        <SubSideNav />
        <div className="right-hand-content">
          <div className="render-side-bar">{renderSidebar()}</div>
          <div>
            <div className="care-plan-page">
              <div className="care-plan-btns">
                <button className="back-button" onClick={handleCancel}>
                  <FiArrowLeft size={16} />
                  Back
                </button>
                <button
                  onClick={handleClearForm}
                  disabled={isSubmitting}
                  className="clear-btn"
                >
                  Clear Form
                </button>
              </div>
              <div className="care-plan-header">
                <div className="header-title">
                  <h1>
                    {client?.first_name} {client?.last_name}&apos;s Care Plan
                  </h1>
                  <div>
                    <CarePlanProfileCard client={client} />
                  </div>

                  <p>{subtitle}</p>
                </div>
              </div>

              <div className="main-layout">
                <div className="right-content">
                  <>
                    {activeTab === "risk-assessment" && (
                      <HealthNeedsRiskAssessmentStep
                        formData={formData}
                        handleChange={handleChange}
                        handleCheckboxArrayChange={handleCheckboxArrayChange}
                        handleSingleCheckboxChange={handleSingleCheckboxChange}
                        handleAddTask={handleAddTask}
                      />
                    )}
                    {activeTab === "care-essentials" && (
                      <CareEssentialsActivityPlanStep
                        formData={formData}
                        handleChange={handleChange}
                        handleCheckboxArrayChange={handleCheckboxArrayChange}
                        handleSingleCheckboxChange={handleSingleCheckboxChange}
                        handleCommunicationNeedsChange={
                          handleCommunicationNeedsChange
                        }
                        handleAddTask={handleAddTask}
                      />
                    )}
                    {activeTab === "medical-information" && (
                      <MedicalInformationStep
                        formData={formData}
                        handleChange={handleChange}
                        handleCheckboxArrayChange={handleCheckboxArrayChange}
                        handleSingleCheckboxChange={handleSingleCheckboxChange}
                        handleAddTask={handleAddTask}
                      />
                    )}
                    {activeTab === "psychological-information" && (
                      <PsychologicalInformationStep
                        formData={formData}
                        handleChange={handleChange}
                        handleCheckboxArrayChange={handleCheckboxArrayChange}
                        handleSingleCheckboxChange={handleSingleCheckboxChange}
                        handleAddTask={handleAddTask}
                      />
                    )}
                    {activeTab === "food-nutrition-hydration" && (
                      <FoodNutritionHydrationStep
                        formData={formData}
                        handleChange={handleChange}
                        handleCheckboxArrayChange={handleCheckboxArrayChange}
                        handleSingleCheckboxChange={handleSingleCheckboxChange}
                        handleAddTask={handleAddTask}
                      />
                    )}
                    {activeTab === "history-routine-preferences" && (
                      <HistoryRoutinePreferencesStep
                        formData={formData}
                        handleChange={handleChange}
                        handleCheckboxArrayChange={handleCheckboxArrayChange}
                        handleSingleCheckboxChange={handleSingleCheckboxChange}
                        handleAddTask={handleAddTask}
                      />
                    )}
                    {activeTab === "culture-values" && (
                      <CultureValuesStep
                        formData={formData}
                        handleChange={handleChange}
                        handleCheckboxArrayChange={handleCheckboxArrayChange}
                        handleSingleCheckboxChange={handleSingleCheckboxChange}
                      />
                    )}
                    {activeTab === "administrative-body-map" && (
                      <AdministrativeBodyMapStep
                        formData={formData}
                        handleChange={handleChange}
                        handleSingleCheckboxChange={handleSingleCheckboxChange}
                        handleAddTask={handleAddTask}
                      />
                    )}
                    {activeTab === "moving-handling" && (
                      <MovingHandlingStep
                        formData={formData}
                        handleChange={handleChange}
                        handleCheckboxArrayChange={handleCheckboxArrayChange}
                        handleSingleCheckboxChange={handleSingleCheckboxChange}
                      />
                    )}
                    {activeTab === "care-requirements" && (
                      <CareRequirementsStep
                        formData={formData}
                        handleChange={handleChange}
                      />
                    )}
                    {activeTab === "legal" && (
                      <LegalRequirementsStep
                        formData={formData}
                        handleChange={handleChange}
                        handleSingleCheckboxChange={handleSingleCheckboxChange}
                      />
                    )}

                    <div className="client-form-actions">
                      <button
                        className="cancel-btn"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>

                      <button
                        className="next-btn"
                        onClick={handleSave}
                        disabled={isSubmitting}
                      >
                        {isSubmitting
                          ? "Saving..."
                          : isLastStep
                          ? "Create Care Plan"
                          : "Next"}
                      </button>
                    </div>
                  </>
                </div>
              </div>

              <MissingFieldsModal
                isOpen={showMissingFieldsModal}
                onClose={() => setShowMissingFieldsModal(false)}
                missingFields={missingFields}
              />

              <SuccessOrErrorModal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                name="Care Plan"
                type={modalType}
                title={modalTitle}
                message={modalMessage}
                showAddAnother={false}
                onViewList={handleViewList}
                onContinue={() => navigate(`/company/rostering/clients`)}
              />

              <ClearFormModal
                isOpen={showClearModal}
                onClose={() => setShowClearModal(false)}
                onConfirm={handleConfirmClear}
              />
            </div>
            -
          </div>
        </div>
      </div>

      {/* </div> */}
    </>
  );
};

export default CreateCarePlanPage;
