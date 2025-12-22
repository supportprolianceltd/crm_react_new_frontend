import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Admin = ({ initialData = {}, onSave, onError, onCancel }) => {
  const [formData, setFormData] = useState({
    uniqueClientId: "",
    serviceStartDate: "",
    currentStatus: "",
    regulatedCare: "",
    riskLevel: "",
    riskDetails: [],
    familyInvolvement: "",
    contingencyPlan: "",
    communicationNeeds: "",
    additionalInfo: "",
    preferredContact: "",
    fundingOptions: [],
    carerPreferences: [],
    group: "",
    ...initialData,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData({
      uniqueClientId: "",
      serviceStartDate: "",
      currentStatus: "",
      regulatedCare: "",
      riskLevel: "",
      riskDetails: [],
      familyInvolvement: "",
      contingencyPlan: "",
      communicationNeeds: "",
      additionalInfo: "",
      preferredContact: "",
      fundingOptions: [],
      carerPreferences: [],
      group: "",
      ...initialData,
    });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked
          ? [...prev[name], value]
          : prev[name].filter((v) => v !== value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const isFormEmpty = () => {
    return Object.values(formData).every(value => {
      if (Array.isArray(value)) return value.length === 0;
      return !value || value.trim() === "";
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormEmpty()) {
      if (onError) {
        onError("Please fill at least one field.");
      }
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onSave) {
        onSave(formData);
      }
    }, 3000);
  };

  const riskOptions = [
    "Risk of falls",
    "Dehydration",
    "Stroke",
    "Weight Loss",
    "Breakdown in skin integrity",
    "Self Neglect",
    "Dysphagia",
    "Decline in mental wellbeing",
    "Others",
  ];

  const fundingOptions = [
    "Local Authority",
    "Self-funded",
    "NHS or health funding",
    "Direct payments",
  ];

  const carerOptions = ["Male", "Female", "Others"];

  const regulatedCareOptions = ["Yes", "No", "Don’t Know"];

  const riskLevelOptions = ["High", "Medium", "Low"];

  const familyInvolvementOptions = ["Very involved", "Not really involved", "Not Involved"];

  const communicationNeedsOptions = [
    "Yes, requires specific contact method",
    "Not really involved",
    "Not Involved",
  ];

  const preferredContactOptions = ["Phone", "Email"];

  const groupOptions = ["GRP 1"];

  return (
    <form className="Info-Palt" onSubmit={handleSubmit}>
      <div className="Info-Palt-Top">
        <h3>Admin</h3>
      </div>

      {/* Identifiers */}
      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Identifiers</h3>
          <div className="JUH-PART">
            <p>Unique client identifier</p>
            <div className="TTtata-Input">
              <input
                type="text"
                name="uniqueClientId"
                value={formData.uniqueClientId}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Status</h3>
          <div className="JUH-PART">
            <p>Service start date</p>
            <div className="TTtata-Input">
              <input
                type="date"
                name="serviceStartDate"
                value={formData.serviceStartDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="JUH-PART">
            <p>Current Status</p>
            <div className="TTtata-Input">
              <select
                name="currentStatus"
                value={formData.currentStatus}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Regulated Care */}
      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Regulated Care</h3>
          <div className="JUH-PART">
            <p>Does client receive regulated care?</p>
            <div className="TTtata-Selltss-LInBt">
              {regulatedCareOptions.map((val) => (
                <label key={val}>
                  <input
                    type="radio"
                    name="regulatedCare"
                    value={val}
                    checked={formData.regulatedCare === val}
                    onChange={handleChange}
                  />
                  {val}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Management */}
      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Risk Management</h3>
          <div className="JUH-PART">
            <p>Assign an overall risk level to client in line with your contingency plan</p>
            <div className="TTtata-Selltss-LInBt">
              {riskLevelOptions.map((val) => (
                <label key={val}>
                  <input
                    type="radio"
                    name="riskLevel"
                    value={val}
                    checked={formData.riskLevel === val}
                    onChange={handleChange}
                  />
                  {val}
                </label>
              ))}
            </div>
          </div>

          <div className="JUH-PART">
            <p>Risk level details</p>
            <div className="TTtata-Selltss-LInBt">
              {riskOptions.map((option) => (
                <label key={option}>
                  <input
                    type="checkbox"
                    name="riskDetails"
                    value={option}
                    checked={formData.riskDetails.includes(option)}
                    onChange={handleChange}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Family Involvement */}
      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Family Involvement</h3>
          <div className="JUH-PART">
            <p>How involved is the client family?</p>
            <div className="TTtata-Selltss-LInBt">
              {familyInvolvementOptions.map((val) => (
                <label key={val}>
                  <input
                    type="radio"
                    name="familyInvolvement"
                    value={val}
                    checked={formData.familyInvolvement === val}
                    onChange={handleChange}
                  />
                  {val}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="JUH-PART mnn-Top">
          <p>What is the contingency plan for client care, in the case of a staffing crisis?</p>
          <div className="TTtata-Input">
            <textarea
              name="contingencyPlan"
              value={formData.contingencyPlan}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Accessible Information Standard */}
      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Accessible Information Standard</h3>
          <div className="JUH-PART">
            <p>Does client have any communication or information needs?</p>
            <div className="TTtata-Selltss-LInBt">
              {communicationNeedsOptions.map((val) => (
                <label key={val}>
                  <input
                    type="radio"
                    name="communicationNeeds"
                    value={val}
                    checked={formData.communicationNeeds === val}
                    onChange={handleChange}
                  />
                  {val}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="JUH-PART mnn-Top">
          <p>Additional Information</p>
          <div className="TTtata-Input">
            <textarea
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
            />
          </div>
        </div>


        <div className="JUH-PART">
          <p>What is client preferred method of contact for admin matters?</p>
          <div className="TTtata-Input">
            <select
              name="preferredContact"
              value={formData.preferredContact}
              onChange={handleChange}
            >
              <option value="">Select</option>
              {preferredContactOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Funding Arrangements */}
      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Funding Arrangements</h3>
          <div className="JUH-PART">
            <p>Please select one or more funding options</p>
            <div className="TTtata-Selltss-LInBt">
              {fundingOptions.map((option) => (
                <label key={option}>
                  <input
                    type="checkbox"
                    name="fundingOptions"
                    value={option}
                    checked={formData.fundingOptions.includes(option)}
                    onChange={handleChange}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Matching */}
      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Matching</h3>
          <div className="JUH-PART">
            <p>Carer Preferences</p>
            <div className="TTtata-Selltss-LInBt">
              {carerOptions.map((option) => (
                <label key={option}>
                  <input
                    type="checkbox"
                    name="carerPreferences"
                    value={option}
                    checked={formData.carerPreferences.includes(option)}
                    onChange={handleChange}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div className="JUH-PART">
            <p>Group (What group of carers should client be put in?)</p>
            <div className="TTtata-Input">
              <select
                name="group"
                value={formData.group}
                onChange={handleChange}
              >
                <option value="">Select</option>
                {groupOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Save/Cancel buttons */}
      <div className="Info-Palt-Main No-Grid">
        <div className="Procc-Act-btn">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="cancel-btn btn-secondary-bg"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="proceed-tast-btn btn-primary-bg"
          >
            {isLoading ? (
              <>
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default Admin;