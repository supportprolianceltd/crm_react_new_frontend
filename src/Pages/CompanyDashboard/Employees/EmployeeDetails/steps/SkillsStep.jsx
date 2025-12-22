// steps/SkillsStep.jsx
import React, { useState } from "react";
import { PencilIcon } from "../../../../../assets/icons/PencilIcon";
import { IoMdClose } from "react-icons/io";

const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
const isAdmin = currentUser.role === "admin" || currentUser.role === "co-admin" || currentUser.role === "root-admin";
const hasStaffInUrl = window.location.pathname.includes("staff");
const shouldDisableSensitiveFields = hasStaffInUrl || !isAdmin;

const SkillsStep = ({
  formData,
  isEditing,
  handleEditToggle,
  handleInputChange,
  handleAddSkill,
  handleRemoveSkill,
  handleSkillFileChange,
  handleSkillFileRemove,
}) => {
  const [inputValue, setInputValue] = useState("");
  const suggestedSkills = [
    "JavaScript",
    "Python",
    "React",
    "SQL",
    "AWS",
    "Project Management",
    "Excel",
    "Customer Service",
    "Digital Marketing",
    "Machine Learning",
  ];
  if (!formData) return null;
  const skills = formData.skills || [];
  const handleAddInputChange = (e) => setInputValue(e.target.value);
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const trimmed = inputValue.trim();
      if (trimmed) {
        // Split by comma and add each
        const newSkills = trimmed
          .split(",")
          .map((s) => s.trim())
          .filter(
            (s) =>
              s &&
              !skills.some(
                (existing) => existing.skill_name && existing.skill_name.toLowerCase() === s.toLowerCase()
              )
          );
        if (newSkills.length > 0) {
          newSkills.forEach((skill) => handleAddSkill(skill));
        }
        setInputValue("");
      }
    }
  };
  const handleSuggestionClick = (skill) => {
    if (!skills.some((s) => s.skill_name && s.skill_name.toLowerCase() === skill.toLowerCase())) {
      handleAddSkill(skill);
    }
    setInputValue(""); // Clear input after adding
  };
  if (!isEditing.skills) {
    return (
      <div className="step-form">
        <div className="info-card">
          <div className="card-header">
            <h4>Skills </h4>
            <div>
              <button
                className="edit-button"
                onClick={() => handleEditToggle("skills")}
              >
                <PencilIcon />
                Edit
              </button>
            </div>
          </div>
          <div className="info-grid">
            {skills.length > 0 ? (
              <div className="info-item full-width">
                <label>Skills</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px", marginTop: "16px" }}>
                  {skills.map((skill) => (
                    <div key={skill.id || skill.skill_name} style={{ border: "1px solid #ddd", padding: "16px", borderRadius: "8px", backgroundColor: "#f9f9f9", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                      <h4 style={{ margin: "0 0 12px 0", color: "#333" }}>{skill.skill_name}</h4>
                      {skill.description && (
                        <div style={{ marginBottom: "8px" }}>
                          <strong>Description:</strong> {skill.description}
                        </div>
                      )}
                      {skill.acquired_date && (
                        <div style={{ marginBottom: "8px" }}>
                          <strong>Acquired Date:</strong> {skill.acquired_date}
                        </div>
                      )}
                      {skill.years_of_experience && (
                        <div style={{ marginBottom: "8px" }}>
                          <strong>Years of Experience:</strong> {skill.years_of_experience}
                        </div>
                      )}
                      {skill.proficiency_level && (
                        <div style={{ marginBottom: "8px" }}>
                          <strong>Proficiency Level:</strong> {skill.proficiency_level}
                        </div>
                      )}
                      <div>
                        {skill.certificate_url ? (
                          <a
                            href={skill.certificate_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#007bff", textDecoration: "none" }}
                          >
                            {skill.skill_name}
                          </a>
                        ) : "No document"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="info-item full-width">
                <label>Skills</label>
                <span>No skills added</span>
              </div>
            )}
          </div>
          {(() => {
            const lastUpdated =
              formData.lastUpdatedBy || formData.last_updated_by || formData.profile?.last_updated_by || null;
            if (!lastUpdated) return null;
            return (
              <div className="last-edited-by">
                Last Edited By : {lastUpdated.first_name} {" "}
                {lastUpdated.last_name} - {lastUpdated.email}
              </div>
            );
          })()}
        </div>
      </div>
    );
  }
  return (
    <div className="step-form">
      <div className="info-card">
        <div className="card-header">
          <h4>Skills</h4>
          <div>
            <button
              className="edit-button"
              onClick={() => handleEditToggle("skills")}
            >
              <IoMdClose />
              Cancel
            </button>
          </div>
        </div>
        <div className="info-grid">
          <div className="info-item full-width">
            <label>Add Skills </label>
            <input
              type="text"
              value={inputValue}
              onChange={handleAddInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type skills separated by commas and press Enter, or click suggestions below"
              className="edit-input"
              style={{ width: "100%", marginBottom: "8px" }}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              {suggestedSkills
                .filter(
                  (skill) =>
                    !skills.some(
                      (s) => s.skill_name && s.skill_name.toLowerCase() === skill.toLowerCase()
                    )
                )
                .map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSuggestionClick(skill)}
                    className="suggestion-btn"
                    style={{
                      padding: "4px 8px",
                      border: "1px solid #ddd",
                      background: "white",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    {skill}
                  </button>
                ))}
            </div>
          </div>
          {skills.length > 0 && (
            <div className="info-item full-width">
              <label>Manage Skills</label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "16px",
                  marginTop: "8px",
                }}
              >
                {skills.map((skill, index) => (
                  <div
                    key={skill.id || `skill-${index}`}
                    style={{
                      border: "1px solid #ddd",
                      padding: "12px",
                      borderRadius: "4px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <h4 style={{ margin: 0 }}>Skill {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(index)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#666",
                          cursor: "pointer",
                          fontSize: "18px",
                          padding: 0,
                        }}
                      >
                        ×
                      </button>
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                      <label>Skill Name</label>
                      <input
                        type="text"
                        defaultValue={skill.skill_name || ""}
                        onBlur={(e) => handleInputChange("skills", "skill_name", e.target.value, index)}
                        className="edit-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                      <label>Acquired Date</label>
                      <input
                        type="date"
                        defaultValue={skill.acquired_date || ""}
                        onBlur={(e) => handleInputChange("skills", "acquired_date", e.target.value, index)}
                        className="edit-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                      <label>Upload Document</label>
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const preview = URL.createObjectURL(file);
                            handleSkillFileChange(index, file, preview);
                          }
                        }}
                        style={{ width: "100%" }}
                      />
                      {skill.certificate && (
                        <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                          {skill.certificate.type?.startsWith('image/') ? (
                            <img
                              src={skill.certificate_preview || skill.certificate_url}
                              alt="Document preview"
                              style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }}
                            />
                          ) : (
                            <div style={{ padding: "8px", background: "#f0f0f0", borderRadius: "4px" }}>
                              📄 {skill.certificate.name}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleSkillFileRemove(index)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#666",
                              cursor: "pointer",
                              fontSize: "18px",
                            }}
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
      
      {(() => {
        const lastUpdated =
          formData.lastUpdatedBy || formData.last_updated_by || formData.profile?.last_updated_by || null;
        if (!lastUpdated) return null;
        return (
          <div className="last-edited-by">
            Last Edited By : {lastUpdated.first_name} {" "}
            {lastUpdated.last_name} - {lastUpdated.email}
          </div>
        );
      })()}
      </div>
    </div>
  );
};
export default SkillsStep;
