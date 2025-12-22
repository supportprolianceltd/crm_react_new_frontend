import React, { useState, useEffect } from "react";
import { PlusIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

const Skills = ({ employeeData }) => {
  const [editIndex, setEditIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuIndex, setOpenMenuIndex] = useState(null);

  const [skills, setSkills] = useState([]);

  // Load skills from employeeData
  useEffect(() => {
    if (employeeData?.skills) {
      setSkills(employeeData.skills);
    }
  }, [employeeData]);

  const handleEdit = (index) => {
    setEditIndex(index);
    setOpenMenuIndex(null);
    // Placeholder for edit functionality - implement modal or redirect as needed
    console.log("Edit skill at index:", index);
  };

  const handleDelete = (index) => {
    const newSkills = skills.filter((_, i) => i !== index);
    setSkills(newSkills);
    setOpenMenuIndex(null);
    console.log("Delete skill at index:", index);
    // Implement delete functionality (e.g., API call)
  };

  const getRiskDisplay = (cat, text) =>
    cat === "others" ? text || "Others" : RISK_LABELS[cat] || cat || "—";

  const getFrequencyDisplay = (t) => {
    if (t.frequency === "custom") {
      const end = t.endDate ? `End time:${t.endDate}` : "Recurring";
      return `Custom (Start time:${t.startDate} - ${end})`;
    }
    return FREQ_LABELS[t.frequency] || t.frequency || "—";
  };

  const getDateDisplay = (t) => {
    if (t.frequency === "custom") {
      return `${t.startDate || t.date} - ${
        t.endDate ? `to ${t.endDate}` : ""
      } - ${t.uploadTime}`;
    }
    return `${t.startDate || t.date} - ${t.uploadTime}`;
  };

  const getSessionDisplay = (t) => {
    if (t.session && sessionRanges[t.session]) {
      return `${
        t.session.charAt(0).toUpperCase() + t.session.slice(1)
      } (Start time: ${t.startTime} - End time: ${t.endTime})`;
    }
    return "Anytime";
  };

  // Hide dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".actions-dropdown") &&
        !event.target.closest(".ff-SVVgs")
      ) {
        setOpenMenuIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      <div className="GHGb-MMIn-DDahs-Top KKm-Hheaders">
        <h3>List of Skills</h3>
        {/* <button className="GenFlt-BTn btn-primary-bg kika-pplsBTN">
          <PlusIcon /> Add Skill
        </button> */}
      </div>

      <div className="PPOl-COnt">
        <div className="table-container">
          <table className="KLk-TTabsg">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Certificate</th>
                <th>Acquired Date</th>
                {/* <th>Action</th> */}
              </tr>
            </thead>
            <tbody>
              {skills.length > 0 ? (
                skills.map((skill, index) => {
                  const isLastRow = index === skills.length - 1;
                  return (
                    <tr key={skill.id || index}>
                      <td>{skill.skill_name}</td>
                      <td>
                        {skill.certificate_url ? (
                          <a href={skill.certificate_url} target="_blank" rel="noopener noreferrer" className="caare-pllans">
                            View Certificate
                          </a>
                        ) : (
                          "No certificate"
                        )}
                      </td>
                      <td>{skill.acquired_date || "N/A"}</td>
                      {/* <td>
                        <div className="relative">
                          <button
                            className="actions-button ff-SVVgs"
                            onClick={() =>
                              setOpenMenuIndex(
                                openMenuIndex === index ? null : index
                              )
                            }
                          >
                            <EllipsisHorizontalIcon />
                          </button>
                          <AnimatePresence>
                            {openMenuIndex === index && (
                              <motion.div
                                className={`dropdown-menu actions-dropdown ${
                                  isLastRow
                                    ? "last-row-dropdown"
                                    : "not-last-row-dropdown"
                                } NNo-Spacebbatw`}
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                              >
                                <span
                                  className="dropdown-item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(index);
                                  }}
                                >
                                  Edit Skill
                                </span>
                                <span
                                  className="dropdown-item last-item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(index);
                                  }}
                                >
                                  Delete Skill
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td> */}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No skills found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Skills;
