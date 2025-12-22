import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PencilIcon } from "@heroicons/react/24/outline";

const LegalCapacity = ({ initialData = {}, onSave, onError, onCancel }) => {
  const [formData, setFormData] = useState({
    decisionAbility: "",
    healthLpa: "",
    healthLpaRef: "",
    financialLpa: "",
    financialLpaRef: "",
    dnacpr: "",
    dnacprWhere: "",
    adrt: "",
    adrtWhere: "",
    respect: "",
    respectWhere: "",
    ...initialData,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData({
      decisionAbility: "",
      healthLpa: "",
      healthLpaRef: "",
      financialLpa: "",
      financialLpaRef: "",
      dnacpr: "",
      dnacprWhere: "",
      adrt: "",
      adrtWhere: "",
      respect: "",
      respectWhere: "",
      ...initialData,
    });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormEmpty = () => {
    return Object.values(formData).every(value => !value || value.trim() === "");
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

  return (
    <form className="Info-Palt" onSubmit={handleSubmit}>
      <div className="Info-Palt-Top">
        <h3>Legal Capacity</h3>
      </div>

      {/* 1️⃣ Capacity and documentation */}
      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Capacity and documentation</h3>
          <div className="JUH-PART">
            <p>
              Does client have the ability to make decisions related to their
              health & wellbeing?
            </p>
            <div className="TTtata-Selltss-LInBt">
              {["Yes", "No", "Don’t Know"].map((val) => (
                <label key={val}>
                  <input
                    type="radio"
                    name="decisionAbility"
                    value={val}
                    checked={formData.decisionAbility === val}
                    onChange={handleChange}
                  />
                  {val}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2️⃣ Health and Welfare LPA */}
      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Health and welfare LPA</h3>
          <div className="JUH-PART">
            <p>Has client made a LPA for health and welfare?</p>
            <div className="TTtata-Selltss-LInBt">
              {["Yes", "No", "Don’t Know"].map((val) => (
                <label key={val}>
                  <input
                    type="radio"
                    name="healthLpa"
                    value={val}
                    checked={formData.healthLpa === val}
                    onChange={handleChange}
                  />
                  {val}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 👇 Slide down LPA reference number if Yes */}
        <AnimatePresence>
          {formData.healthLpa === "Yes" && (
            <motion.div
              key="healthLpaRef"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="JUH-PART mnn-Top"
            >
              <p>LPA reference number</p>
              <div className="TTtata-Input">
                <input
                  type="text"
                  name="healthLpaRef"
                  value={formData.healthLpaRef}
                  onChange={handleChange}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3️⃣ Property and Financial Affairs LPA */}
      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Property and Financial Affairs LPA</h3>
          <div className="JUH-PART">
            <p>Has client made a LPA for property and financial affairs?</p>
            <div className="TTtata-Selltss-LInBt">
              {["Yes", "No", "Don’t Know"].map((val) => (
                <label key={val}>
                  <input
                    type="radio"
                    name="financialLpa"
                    value={val}
                    checked={formData.financialLpa === val}
                    onChange={handleChange}
                  />
                  {val}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 👇 Slide down LPA reference number if Yes */}
        <AnimatePresence>
          {formData.financialLpa === "Yes" && (
            <motion.div
              key="financialLpaRef"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="JUH-PART mnn-Top"
            >
              <p>LPA reference number</p>
              <div className="TTtata-Input">
                <input
                  type="text"
                  name="financialLpaRef"
                  value={formData.financialLpaRef}
                  onChange={handleChange}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4️⃣ DNACPR */}
      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Do not attempt cardiopulmonary resuscitation (DNACPR)</h3>
          <div className="JUH-PART">
            <p>Does client have a DNACPR order in place?</p>
            <div className="TTtata-Selltss-LInBt">
              {["Yes", "No", "Don’t Know"].map((val) => (
                <label key={val}>
                  <input
                    type="radio"
                    name="dnacpr"
                    value={val}
                    checked={formData.dnacpr === val}
                    onChange={handleChange}
                  />
                  {val}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 👇 Slide down "Where is it kept?" if Yes */}
        <AnimatePresence>
          {formData.dnacpr === "Yes" && (
            <motion.div
              key="dnacprWhere"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="JUH-PART mnn-Top"
            >
              <p>Where is it kept?</p>
              <div className="TTtata-Input">
                <textarea
                  name="dnacprWhere"
                  value={formData.dnacprWhere}
                  onChange={handleChange}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5️⃣ ADRT */}
      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Advance Decision to Refuse Treatment (ADRT/Living Will)</h3>
          <div className="JUH-PART">
            <p>Does client have ADRT in place?</p>
            <div className="TTtata-Selltss-LInBt">
              {["Yes", "No", "Don’t Know"].map((val) => (
                <label key={val}>
                  <input
                    type="radio"
                    name="adrt"
                    value={val}
                    checked={formData.adrt === val}
                    onChange={handleChange}
                  />
                  {val}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 👇 Slide down "Where is it kept?" if Yes */}
        <AnimatePresence>
          {formData.adrt === "Yes" && (
            <motion.div
              key="adrtWhere"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="JUH-PART mnn-Top"
            >
              <p>Where is it kept?</p>
              <div className="TTtata-Input">
                <textarea
                  name="adrtWhere"
                  value={formData.adrtWhere}
                  onChange={handleChange}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 6️⃣ ReSPECT */}
      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>
            Recommended Summary Plan for Emergency Care and Treatment (ReSPECT)
          </h3>
          <div className="JUH-PART">
            <p>Does client have a ReSPECT in place?</p>
            <div className="TTtata-Selltss-LInBt">
              {["Yes", "No", "Don’t Know"].map((val) => (
                <label key={val}>
                  <input
                    type="radio"
                    name="respect"
                    value={val}
                    checked={formData.respect === val}
                    onChange={handleChange}
                  />
                  {val}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 👇 Slide down "Where is it kept?" if Yes */}
        <AnimatePresence>
          {formData.respect === "Yes" && (
            <motion.div
              key="respectWhere"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="JUH-PART mnn-Top"
            >
              <p>Where is it kept?</p>
              <div className="TTtata-Input">
                <textarea
                  name="respectWhere"
                  value={formData.respectWhere}
                  onChange={handleChange}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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

export default LegalCapacity;