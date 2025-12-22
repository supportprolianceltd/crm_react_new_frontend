import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import Modal from "../../../../../components/Modal";
import InputField from "../../../../../components/Input/InputField";
import TextAreaField from "../../../../../components/Input/TextAreaField";
import CheckboxGroup from "../../../../../components/CheckboxGroup";
import ToastNotification from "../../../../../components/ToastNotification";
import { FiLoader } from "react-icons/fi";
import axios from "axios";
import {
  createRosteringTask,
  fetchAllCarePlans,
} from "../../config/apiService";

const riskCategoryOptions = [
  { value: "fall risk", label: "Fall Risk" },
  { value: "choking risk", label: "Choking Risk" },
  { value: "medication", label: "Medication" },
  { value: "mobility", label: "Mobility" },
  { value: "cognitive", label: "Cognitive" },
  { value: "behavioral", label: "Behavioral" },
  { value: "skin integrity", label: "Skin Integrity" },
  { value: "nutrition", label: "Nutrition" },
  { value: "hydration", label: "Hydration" },
];

const frequencyOptions = [
  { value: "once", label: "Once" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom" },
];

const durationOptions = [
  { value: "recurring", label: "Recurring" },
  { value: "on", label: "On" },
];

const AddTaskModal = ({ isOpen, onClose, onAddSuccess, sectionName }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [titleError, setTitleError] = useState(null);
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [carePlanId, setCarePlanId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    riskCategories: [],
    frequency: [], // Change to array
    startTime: "",
    endTime: "",
    durationType: ["recurring"], // Change to array
    startDate: "",
    endDate: "",
    additionalNotes: "",
  });
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);

  const NHS_API_KEY = import.meta.env.VITE_NHS_API_KEY;

  const riskCategoryMap = {
    falls: "fall risk",
    choking: "choking risk",
    medication_safety: "medication safety",
    safety: "safety",
    others: "others",
  };

  const formatDateTime = (dateStr, timeStr = null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (timeStr) {
      const [hours, minutes] = timeStr.split(":");
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
      // Default times
      date.setHours(9, 0, 0, 0);
    }
    return date.toISOString();
  };

  const formatFrequency = (freq) => {
    if (freq === "once") return "Once";
    return freq.charAt(0).toUpperCase() + freq.slice(1);
  };

  const validateTitle = useCallback(() => {
    if (!formData.title.trim()) {
      return "Task title is required.";
    }
    return null;
  }, [formData.title]);

  const isFormValid = useMemo(() => {
    const {
      title,
      riskCategories,
      frequency,
      startTime,
      endTime,
      startDate,
      endDate,
      durationType,
    } = formData;
    const hasTitle = title.trim() !== "";
    const hasRiskCategories = riskCategories.length > 0;
    const hasFrequency = frequency.length > 0; // Check array length
    const hasStartDate = startDate !== "";

    // For "on" duration type, endDate is not required
    const hasEndDate = durationType[0] === "recurring" ? endDate !== "" : true; // Use first element
    const hasDurationType = durationType.length > 0; // Check array length
    const isCustom = frequency[0] === "custom"; // Use first element
    const hasStartTime = !isCustom || startTime !== "";
    const hasEndTime = !isCustom || endTime !== "";

    return (
      hasTitle &&
      hasRiskCategories &&
      hasFrequency &&
      hasStartDate &&
      hasEndDate &&
      hasDurationType &&
      hasStartTime &&
      hasEndTime
    );
  }, [formData]);

  useEffect(() => {
    if (isOpen && !carePlanId) {
      fetchAllCarePlans()
        .then((data) => {
          if (data?.items?.length > 0) {
            setCarePlanId(data.items[0].id);
          } else {
            setErrorMessage("No care plans available.");
          }
        })
        .catch((err) => {
          setErrorMessage("Failed to fetch care plans.");
        });
    }
  }, [isOpen, carePlanId]);

  const fetchSuggestions = useCallback(
    async (query) => {
      if (!query || query.length < 2 || !NHS_API_KEY) {
        setSuggestions([]);
        return;
      }

      setIsLoadingSuggestions(true);
      setSuggestionError(null);
      try {
        // Simplified query for healthcare tasks/services
        const searchQuery = `${query} homecare OR care service OR nhs task`;

        console.log("Fetching NHS suggestions for query:", searchQuery);

        // Relative URL hits Vite proxy (/nhs -> sandbox.api.service.nhs.uk)
        const response = await axios.get(
          `/nhs/service-search-api?api-version=2&search=${encodeURIComponent(
            query
          )}&$top=5&$count=false`,
          {
            headers: {
              apikey: NHS_API_KEY,
              Accept: "application/json",
            },
          }
        );

        // Extract suggestions from the response (adapt based on actual response structure)
        let newSuggestions = [];
        if (response.data && response.data.value) {
          newSuggestions = response.data.value
            .map(
              (item) =>
                item.OrganisationName ||
                (item.Services && item.Services[0]?.ServiceName) ||
                (item.ServicesOffered && item.ServicesOffered[0]) ||
                (item.SummaryText &&
                  item.SummaryText.substring(0, 50).trim()) ||
                (item.Name && item.Name.substring(0, 50).trim())
            )
            .filter(Boolean)
            .slice(0, 5);
        }

        setSuggestions(newSuggestions);
      } catch (err) {
        console.error(
          "NHS API fetch error:",
          err.response?.data || err.message
        );
        setSuggestionError("Failed to load NHS suggestions. Using fallback.");
        // Fallback to static suggestions
        const fallbackSuggestions = [
          "Assist with bathing",
          "Assist with dressing",
          "Oral hygiene assistance",
          "Medication reminder",
          "Prepare and serve meals",
          "Light housekeeping",
          "Grocery shopping",
          "Transportation to appointments",
          "Companionship visit",
          "Monitor vital signs",
          "Assist with mobility",
          "Safety check",
          "Wound care",
          "Help with toileting",
          "Nutrition monitoring",
        ];
        const filteredFallback = fallbackSuggestions.filter((s) =>
          s.toLowerCase().includes(query.toLowerCase())
        );
        setSuggestions(filteredFallback.slice(0, 5));
      } finally {
        setIsLoadingSuggestions(false);
      }
    },
    [NHS_API_KEY]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.title.trim().length >= 2) {
        fetchSuggestions(formData.title);
      } else {
        setSuggestions([]);
      }
    }, 500); // Debounce

    return () => clearTimeout(timeoutId);
  }, [formData.title, fetchSuggestions]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        riskCategories: checked
          ? [...prev.riskCategories, value]
          : prev.riskCategories.filter((cat) => cat !== value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (name === "title") {
        setTitleError(null);
        // Don't clear suggestions immediately when typing
        if (value.trim().length >= 2) {
          setShowSuggestions(true);
        } else {
          setShowSuggestions(false);
        }
      }
    }
  };

  const handleTitleFocus = () => {
    setTitleError(null);
    setIsTitleFocused(true);
    if (suggestions.length > 0 && !isLoadingSuggestions) {
      setShowSuggestions(true);
    }
  };

  const handleTitleBlur = () => {
    setTitleError(validateTitle());
    setIsTitleFocused(false);
    // Don't hide suggestions immediately on blur to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleRiskCategoriesChange = (newValues) => {
    setFormData((prev) => ({ ...prev, riskCategories: newValues }));
  };

  const handleFrequencyChange = (newValues) => {
    setFormData((prev) => ({ ...prev, frequency: newValues }));

    // Clear times if not custom frequency
    if (!newValues.includes("custom")) {
      setFormData((prev) => ({
        ...prev,
        startTime: "",
        endTime: "",
      }));
    }
  };

  const handleDurationTypeChange = (newValues) => {
    setFormData((prev) => ({ ...prev, durationType: newValues }));

    // Clear end date if duration type is "on"
    if (newValues.includes("on")) {
      setFormData((prev) => ({ ...prev, endDate: "" }));
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData((prev) => ({ ...prev, title: suggestion }));
    setSuggestions([]);
    setShowSuggestions(false);
    // Focus back on input after selection
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSave = async () => {
    const titleErr = validateTitle();
    if (titleErr) {
      setTitleError(titleErr);
      return;
    }
    if (!isFormValid) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }
    if (!carePlanId) {
      setErrorMessage("No care plan available. Please try again.");
      return;
    }

    console.log(formData.riskCategories);

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const payload = {
        carePlanId,
        relatedTable: sectionName,
        relatedId: "clxy98765432133222",
        title: formData.title,
        description: formData.description,
        riskFrequency: formatFrequency(formData.frequency[0]),
        status: "PENDING",
        riskCategory: formData.riskCategories?.map(
          (cat) => riskCategoryMap[cat] || cat
        ),
        startDate: formatDateTime(formData.startDate, formData.startTime),
        dueDate: formData.endDate
          ? formatDateTime(formData.endDate, formData.endTime)
          : formatDateTime(formData.startDate, formData.endTime),
        additionalNotes: formData.additionalNotes,
        createdBy: "Tega Okorare",
      };

      const result = await createRosteringTask(payload);

      if (result) {
        setSuccessMessage("Task added successfully!");
        onAddSuccess?.(result);
      } else {
        throw new Error("Failed to create task");
      }

      setTimeout(() => {
        onClose();
        setFormData({
          title: "",
          description: "",
          riskCategories: [],
          frequency: [], // Reset to empty array
          startTime: "",
          endTime: "",
          durationType: ["recurring"], // Reset to default array
          startDate: "",
          endDate: "",
          additionalNotes: "",
        });
        setSuggestions([]);
        setTitleError(null);
        setShowSuggestions(false);
      }, 1500);
    } catch (error) {
      setErrorMessage("Failed to add task. Please try again.");
      setSuccessMessage(null);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 3000);
    }
  };

  const isCustomFrequency = formData.frequency.includes("custom");
  const isRecurringDuration = formData.durationType.includes("recurring");

  const shouldShowSuggestions =
    showSuggestions && suggestions.length > 0 && !isLoadingSuggestions;

  return (
    <>
      <ToastNotification
        successMessage={successMessage}
        errorMessage={errorMessage}
      />
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Task"
        message="Define and assign a task to ensure the client's risks are properly managed and addressed."
      >
        <div className="form-section" style={{ marginTop: "1rem" }}>
          <div style={{ position: "relative" }}>
            <InputField
              ref={inputRef}
              label="Task Title *"
              name="title"
              value={formData.title}
              onChange={handleChange}
              onFocus={handleTitleFocus}
              onBlur={handleTitleBlur}
              placeholder="Start typing for NHS healthcare suggestions..."
              required
            />
            {titleError && (
              <div
                style={{
                  color: "#c62828",
                  fontSize: "0.75rem",
                  fontStyle: "italic",
                  marginTop: "-1rem",
                  padding: "4px 0",
                }}
              >
                {titleError}
              </div>
            )}
            {isLoadingSuggestions && isTitleFocused && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "0",
                  right: "0",
                  background: "white",
                  border: "1px solid #ccc",
                  borderTop: "none",
                  zIndex: 10,
                  padding: "8px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FiLoader
                  style={{
                    animation: "spin 1s linear infinite",
                    marginRight: "8px",
                  }}
                />
                Loading suggestions...
              </div>
            )}
            {suggestionError && isTitleFocused && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "0",
                  right: "0",
                  background: "#ffebee",
                  color: "#c62828",
                  border: "1px solid #ccc",
                  borderTop: "none",
                  zIndex: 10,
                  padding: "8px",
                  fontSize: "0.875rem",
                }}
              >
                {suggestionError}
              </div>
            )}
            {shouldShowSuggestions && (
              <div
                ref={suggestionsRef}
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "0",
                  right: "0",
                  background: "white",
                  border: "1px solid #ccc",
                  borderTop: "none",
                  maxHeight: "150px",
                  overflowY: "auto",
                  zIndex: 10,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                      fontSize: "0.875rem",
                      transition: "background-color 0.2s",
                    }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#f5f5f5";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent";
                    }}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
          <TextAreaField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Input text"
          />
          <p
            style={{
              fontSize: "0.875rem",
              color: "#666",
              marginTop: "-0.5rem",
              marginBottom: "1rem",
            }}
          >
            The carer would see this note in the app each time they complete
            this task
          </p>

          <h3>Risk Category</h3>
          <CheckboxGroup
            label=""
            options={riskCategoryOptions}
            value={formData.riskCategories}
            onChange={handleRiskCategoriesChange}
            row={true}
            multiple={true}
          />

          <h3>Select a frequency</h3>
          <CheckboxGroup
            label=""
            options={frequencyOptions}
            value={formData.frequency}
            onChange={handleFrequencyChange}
            row={true}
          />

          {isCustomFrequency && (
            <div
              className="input-row"
              style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}
            >
              <InputField
                label="Start Time *"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
              <InputField
                label="End Time *"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
                placeholder="(select times that suit)"
                required
              />
            </div>
          )}

          <div style={{ marginTop: "1.5rem" }}>
            <h3>Duration</h3>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "1rem",
              }}
            >
              <div style={{ flex: 1 }}>
                <p style={{ marginBottom: "0.5rem", fontWeight: "500" }}>
                  Start Date*
                </p>
                <InputField
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ marginBottom: "0.5rem", fontWeight: "500" }}>
                  {!isRecurringDuration
                    ? "End Date* (select times that suit)"
                    : "End Date"}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                  }}
                >
                  <CheckboxGroup
                    label=""
                    options={durationOptions}
                    value={formData.durationType}
                    onChange={handleDurationTypeChange}
                    row={false}
                  />

                  {!isRecurringDuration && (
                    <div style={{ flex: 1 }}>
                      <InputField
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <TextAreaField
            label="Additional Notes (optional)"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            placeholder="Input text"
            style={{ marginTop: "1.5rem" }}
          />
        </div>

        <div className="client-form-actions">
          <button
            className="cancel-btn"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="continue-btn"
            onClick={handleSave}
            disabled={isSubmitting || !isFormValid}
          >
            {isSubmitting ? (
              <>
                <FiLoader
                  style={{
                    animation: "spin 1s linear infinite",
                    margin: "0.6rem 0.3rem 0 0",
                  }}
                />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </Modal>
    </>
  );
};

export default AddTaskModal;
