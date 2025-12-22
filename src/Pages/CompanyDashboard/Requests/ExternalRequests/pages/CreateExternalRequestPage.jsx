import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/solid";
import InputField from "../../../../../components/Input/InputField";
import SelectField from "../../../../../components/Input/SelectField";
import SideNavBar from "../../../Home/SideNavBar";
import ToastNotification from "../../../../../components/ToastNotification";
import { createExternalRequest } from "../../config/apiConfig";
import ScheduleSelector from "../../../../../components/ScheduleSelector";
import { IoMdClose } from "react-icons/io";
import { validateEndDateAfterStart } from "../../../../../utils/helpers";
const urgencyOptions = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];
const requestTypeOptions = [
  { value: "Care Services", label: "Care Services" },
  { value: "Logistics Services", label: "Logistics Services" },
  { value: "Engineering Services", label: "Engineering Services" },
  { value: "Others", label: "Others" },
];
const dayLabels = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};
const obfuscate = (str) => btoa(str).split("").reverse().join("");
const deobfuscate = (str) => atob(str.split("").reverse().join(""));
const CreateExternalRequestPage = () => {
  const tenantId = localStorage.getItem("tenantId");
  // console.log(tenantId);
  const navigate = useNavigate();
  const [shrinkNav, setShrinkNav] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    content: "",
    requestorEmail: "",
    requestorName: "",
    requestorPhone: "",
    address: "",
    postcode: "",
    urgency: "",
    requirements: "",
    notes: "",
    scheduledStart: "",
    scheduledEnd: "",
    skills: [],
    availabilityRequirements: {},
    requestTypes: "",
    customRequestType: "",
  });
  const [loading, setLoading] = useState(false);
  // Toast states
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSkillsInput, setShowSkillsInput] = useState(false);
  const [skillInputValue, setSkillInputValue] = useState("");
  const [isEditingAvailability, setIsEditingAvailability] = useState(true);
  const timeoutRef = useRef(null);
  const availabilityRequirements = formData.availabilityRequirements || {};
  const hasEnabledAvailabilityDays = Object.values(
    availabilityRequirements
  ).some((slots) => slots && slots.length > 0);
  // Update editing state reactively if formData changes externally (e.g., via props or reset)
  useEffect(() => {
    setIsEditingAvailability(!hasEnabledAvailabilityDays);
  }, [hasEnabledAvailabilityDays]);
  // Auto-clear toast messages after 3 seconds
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);
  const emptyFormData = {
    subject: "",
    content: "",
    requestorEmail: "",
    requestorName: "",
    requestorPhone: "",
    address: "",
    postcode: "",
    urgency: "",
    requirements: "",
    notes: "",
    scheduledStart: "",
    scheduledEnd: "",
    skills: [],
    availabilityRequirements: {},
    requestTypes: "",
    customRequestType: "",
  };
  const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };
  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };
  const calculateDuration = (startStr, endStr) => {
    if (!startStr || !endStr) return 0;
    const s = new Date(startStr);
    const e = new Date(endStr);
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || e <= s) return 0;
    const diffMs = e.getTime() - s.getTime();
    return Math.floor(diffMs / (1000 * 60));
  };
  const displayDuration = (totalMinutes) => {
    if (totalMinutes === 0) return "Not set";
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;
    const parts = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    if (minutes > 0 || parts.length === 0)
      parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
    return parts.join(", ");
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddressInputChange = useCallback((e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, address: value }));
    setShowSuggestions(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }
    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            value
          )}&format=json&addressdetails=1&limit=5`
        );
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        setSuggestions([]);
      }
    }, 300);
  }, []);
  const handleSuggestionSelect = (suggestion) => {
    setFormData((prev) => ({
      ...prev,
      address: suggestion.display_name,
      postcode: suggestion.address?.postcode || "",
    }));
    setSuggestions([]);
    setShowSuggestions(false);
  };
  const handleAddressBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };
  // Skills handlers
  const suggestedSkills = [
    "Personal Care",
    "Medication Administration",
    "Meal Preparation",
    "Companionship",
    "Housekeeping",
    "Transportation Assistance",
    "First Aid",
    "Elderly Care",
    "Child Care",
    "Nursing Support",
  ];
  const handleSkillInputChange = (e) => setSkillInputValue(e.target.value);
  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter") {
      const trimmed = skillInputValue.trim();
      if (trimmed) {
        const newSkills = trimmed
          .split(",")
          .map((s) => s.trim())
          .filter(
            (s) =>
              s &&
              !formData.skills.some(
                (existing) => existing.toLowerCase() === s.toLowerCase()
              )
          );
        if (newSkills.length > 0) {
          setFormData((prev) => ({
            ...prev,
            skills: [...prev.skills, ...newSkills],
          }));
        }
        setSkillInputValue("");
      }
    }
  };
  const handleSuggestionClick = (skill) => {
    if (!formData.skills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }
    setSkillInputValue("");
  };
  const handleRemoveSkill = (skillName) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillName),
    }));
  };
  const handleToggleSkillsInput = () => {
    setShowSkillsInput(!showSkillsInput);
  };
  // Transform availabilityRequirements to ScheduleSelector format
  const getTransformedInitialSchedule = () => {
    const transformedInitial = {};
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    days.forEach((day) => {
      const slots = availabilityRequirements[day];
      if (slots && slots.length > 0) {
        transformedInitial[day] = {
          enabled: true,
          slots: slots.map((slot, i) => ({
            startTime: slot.start,
            endTime: slot.end,
            id: `initial-${day}-${i}`,
          })),
          lunchStart: "",
          lunchEnd: "",
        };
      } else {
        transformedInitial[day] = {
          enabled: false,
          slots: [],
          lunchStart: "",
          lunchEnd: "",
        };
      }
    });
    return transformedInitial;
  };
  // Availability handlers
  const handleAvailabilitySave = (schedule) => {
    const transformedSchedule = {};
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    days.forEach((day) => {
      const dayData = schedule[day];
      if (dayData.enabled && dayData.slots.length > 0) {
        transformedSchedule[day] = dayData.slots.map((slot) => ({
          start: slot.startTime,
          end: slot.endTime,
        }));
      } else {
        transformedSchedule[day] = null;
      }
    });
    setFormData((prev) => ({
      ...prev,
      availabilityRequirements: transformedSchedule,
    }));
    setIsEditingAvailability(false);
  };
  const handleEditAvailability = () => {
    setIsEditingAvailability(true);
  };
  const validateScheduleDates = () => {
    if (formData.scheduledStart && formData.scheduledEnd) {
      if (
        !validateEndDateAfterStart(
          formData.scheduledStart,
          formData.scheduledEnd
        )
      ) {
        setErrorMessage("Scheduled end time must be after start time.");
        return false;
      }
    }
    if (formData.scheduledStart) {
      const startDate = new Date(formData.scheduledStart);
      const now = new Date();
      if (startDate < now) {
        setErrorMessage("Scheduled start time cannot be in the past.");
        return false;
      }
    }
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateScheduleDates()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { scheduledStart, scheduledEnd, customRequestType, ...rest } =
        formData;
      // Convert datetime-local strings to full ISO 8601 UTC format
      const startDate = scheduledStart ? new Date(scheduledStart) : null;
      const endDate = scheduledEnd ? new Date(scheduledEnd) : null;
      const durationMins = calculateDuration(scheduledStart, scheduledEnd);
      const actualRequestType =
        formData.requestTypes === "others"
          ? formData.customRequestType
          : formData.requestTypes;
      const submitData = {
        ...rest,
        requestTypes: actualRequestType,
        estimatedDuration: durationMins,
        scheduledStartTime: startDate ? startDate.toISOString() : undefined,
        scheduledEndTime: endDate ? endDate.toISOString() : undefined,
        requiredSkills: formData.skills, // Array of skill strings
        availabilityRequirements: formData.availabilityRequirements, // Transformed schedule object
      };
      const response = await createExternalRequest(submitData);
      setSuccessMessage(
        "Your external request has been submitted successfully."
      );
      setFormData(emptyFormData);
      setShowSkillsInput(false);
      setIsEditingAvailability(true);
      setErrorMessage("");
      navigate(-1);
    } catch (error) {
      setErrorMessage(
        `Failed to create request: ${error.message || "Please try again."}`
      );
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };
  const isFormComplete = () => {
    const hasValidRequestType =
      formData.requestTypes &&
      (formData.requestTypes !== "others" || formData.customRequestType);
    return (
      hasValidRequestType &&
      formData.subject &&
      formData.content &&
      formData.urgency &&
      formData.requirements &&
      formData.requestorName &&
      isValidEmail(formData.requestorEmail) &&
      formData.requestorPhone &&
      formData.address &&
      formData.postcode &&
      formData.skills.length > 0
    );
  };
  const encodedTenantId = tenantId ? obfuscate(tenantId) : null;
  const handleCopyLink = async () => {
    if (!encodedTenantId) return;
    const url = `${window.location.origin}/create-external-request/${encodedTenantId}`;
    try {
      await navigator.clipboard.writeText(url);
      setSuccessMessage("Link copied to clipboard!");
      setErrorMessage("");
    } catch (err) {
      setErrorMessage("Failed to copy link");
      setSuccessMessage("");
    }
  };
  const currentDateTime = getCurrentDateTimeLocal();
  const startMin = currentDateTime;
  const endMin = formData.scheduledStart || currentDateTime;
  const estimatedDurationMins = calculateDuration(
    formData.scheduledStart,
    formData.scheduledEnd
  );
  return (
    <div className={`DB-Envt ${shrinkNav ? "ShrinkNav" : ""}`}>
      <SideNavBar setShrinkNav={setShrinkNav} />
      <div className="Main-DB-Envt">
        <div className="GenForm-Page" style={{ paddingInline: "3rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div className="form-header">
              <h2>
                <span
                  onClick={() => navigate(-1)}
                  style={{ cursor: "pointer" }}
                >
                  <ArrowLeftIcon className="h-6 w-6 inline" />
                </span>
                Create External Request
              </h2>
              <p>Here you can manually create a new external request</p>
            </div>
            <button
              onClick={handleCopyLink}
              style={{
                backgroundColor: "#e6e0fe",
                color: "#7226FF",
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                height: "40px",
              }}
            >
              Copy External Request Public Link
              <ClipboardDocumentIcon
                style={{ width: "20px", height: "20px" }}
              />
            </button>
          </div>
          <div className="Davv-Pils">
            <div className="Davv-Pils-Box">
              <div className="form-section">
                <h3>Fill in your service request details</h3>
                <form onSubmit={handleSubmit}>
                  <SelectField
                    label="Request Type"
                    name="requestTypes"
                    value={formData.requestTypes}
                    options={requestTypeOptions}
                    onChange={handleChange}
                  />
                  {formData.requestTypes === "others" && (
                    <InputField
                      label="Specify Request Type"
                      name="customRequestType"
                      value={formData.customRequestType}
                      onChange={handleChange}
                      placeholder="e.g., I need help with a dead man"
                    />
                  )}
                  <InputField
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g., I need help with a dead man"
                  />
                  <div className="GHuh-Form-Input">
                    <label>Content</label>
                    <div>
                      <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Provide detailed information about the service needed..."
                      />
                    </div>
                  </div>
                  <div className="input-row">
                    <SelectField
                      label="Urgency"
                      name="urgency"
                      value={formData.urgency}
                      options={urgencyOptions}
                      onChange={handleChange}
                    />
                  </div>
                  <InputField
                    label="Requirements"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    placeholder="e.g., Personal care assistance"
                  />
                  {/* Skills Section */}
                  <div className="GHuh-Form-Input">
                    <label>Skills Required</label>
                    <div>
                      {showSkillsInput ? (
                        <>
                          <input
                            type="text"
                            value={skillInputValue}
                            onChange={handleSkillInputChange}
                            onKeyDown={handleSkillKeyDown}
                            placeholder="Type skills separated by commas and press Enter, or click suggestions below"
                            className="skills-input"
                          />
                          <div className="suggestions-grid">
                            {suggestedSkills
                              .filter(
                                (skill) =>
                                  !formData.skills.some(
                                    (s) =>
                                      s.toLowerCase() === skill.toLowerCase()
                                  )
                              )
                              .map((skill) => (
                                <button
                                  key={skill}
                                  type="button"
                                  onClick={() => handleSuggestionClick(skill)}
                                  className="suggestion-btn"
                                >
                                  {skill}
                                </button>
                              ))}
                          </div>
                          <div className="selected-skills">
                            {formData.skills.map((skill) => (
                              <div key={skill} className="skill-tag">
                                <span>{skill}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSkill(skill)}
                                  className="remove-skill-btn"
                                  aria-label="Remove skill"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={handleToggleSkillsInput}
                            className="skills-edit-btn"
                          >
                            <IoMdClose />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          {formData.skills.length > 0 ? (
                            <ul className="skills-view-ul">
                              {formData.skills.map((skill) => (
                                <li key={skill} className="skills-view-li">
                                  {skill}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span style={{ marginRight: "1rem" }}>
                              No skills added
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={handleToggleSkillsInput}
                            className="skills-view-btn"
                          >
                            Add Skills
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="input-row">
                    <InputField
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleAddressInputChange}
                      onBlur={handleAddressBlur}
                      placeholder="e.g., 152 Main Street, London"
                    />
                    <InputField
                      label="Postcode"
                      name="postcode"
                      value={formData.postcode}
                      onChange={handleChange}
                      placeholder="e.g., SW1A 1AA"
                    />
                  </div>
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="suggestions-dropdown">
                      {suggestions.map((sug, index) => (
                        <div
                          key={index}
                          className="suggestion-item"
                          onClick={() => handleSuggestionSelect(sug)}
                        >
                          {sug.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                  <h6>Requestor Information</h6>
                  <InputField
                    label="Name"
                    name="requestorName"
                    value={formData.requestorName}
                    onChange={handleChange}
                    placeholder="Full name"
                  />
                  <InputField
                    label="Email"
                    type="email"
                    name="requestorEmail"
                    value={formData.requestorEmail}
                    onChange={handleChange}
                    placeholder="e.g., tonna@prolianceltd.com"
                  />
                  <InputField
                    label="Phone"
                    name="requestorPhone"
                    value={formData.requestorPhone}
                    onChange={handleChange}
                    placeholder="e.g., +234 802 123 4567"
                  />
                  <div className="input-row">
                    <InputField
                      label="Scheduled Start Time"
                      type="datetime-local"
                      name="scheduledStart"
                      value={formData.scheduledStart}
                      onChange={handleChange}
                      min={startMin}
                    />
                    <InputField
                      label="Scheduled End Time"
                      type="datetime-local"
                      name="scheduledEnd"
                      value={formData.scheduledEnd}
                      onChange={handleChange}
                      min={endMin}
                    />
                  </div>
                  <InputField
                    label="Estimated Duration"
                    type="text"
                    value={displayDuration(estimatedDurationMins)}
                    readOnly
                  />
                  {/* Availability Section */}
                  <div className="GHuh-Form-Input">
                    <label>Preferred Availability</label>
                    <div>
                      {isEditingAvailability ? (
                        <ScheduleSelector
                          initialSchedule={getTransformedInitialSchedule()}
                          onSave={handleAvailabilitySave}
                          showLunch={false}
                          multiSlot={true}
                          defaultSlotStart="09:00"
                          defaultSlotEnd="17:00"
                        />
                      ) : (
                        <>
                          {hasEnabledAvailabilityDays ? (
                            <div className="schedule-summary">
                              {Object.entries(availabilityRequirements).map(
                                ([day, slots]) => {
                                  if (!slots || slots.length === 0) return null;
                                  return (
                                    <div key={day} className="day-entry">
                                      <strong>{dayLabels[day]}:</strong>{" "}
                                      {slots
                                        .map(
                                          (slot) =>
                                            `${slot.start} - ${slot.end}`
                                        )
                                        .join(", ")}
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          ) : (
                            <p className="no-availability">
                              No availability set.
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={handleEditAvailability}
                            className="availability-edit-btn"
                          >
                            Edit Availability
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="GHuh-Form-Input">
                    <label>Notes (Optional)</label>
                    <div>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Any additional notes..."
                      />
                    </div>
                  </div>
                  <div className="GHuh-Form-Input">
                    <button
                      type="submit"
                      className="GenFlt-BTn btn-primary-bg"
                      disabled={!isFormComplete() || loading}
                    >
                      {loading ? "Submitting..." : "Submit Request"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastNotification
        successMessage={successMessage}
        errorMessage={errorMessage}
      />
    </div>
  );
};
export default CreateExternalRequestPage;
