import React from "react";
import { PencilIcon } from "@heroicons/react/24/outline";

const LegalCapacityDetails = ({ onEdit, data = {} }) => {
  const getDisplayValue = (value) => (value?.trim() ? value : "Not specified");

  const showSubField = (radioValue) => radioValue === "Yes";

  return (
    <div className="Info-Palt">
      <div className="Info-Palt-Top">
        <h3>Legal Capacity</h3>
        {/* <button onClick={onEdit} className='profil-Edit-Btn btn-primary-bg'><PencilIcon /> Edit</button> */}
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
            <h4>{getDisplayValue(data.decisionAbility)}</h4>
          </div>
        </div>
      </div>

      {/* 2️⃣ Health and Welfare LPA */}
      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Health and welfare LPA</h3>
          <div className="JUH-PART">
            <p>Has client made a LPA for health and welfare</p>
            <h4>{getDisplayValue(data.healthLpa)}</h4>
          </div>
          {showSubField(data.healthLpa) && (
            <div className="JUH-PART">
              <p>LPA reference number</p>
              <h4>{getDisplayValue(data.healthLpaRef)}</h4>
            </div>
          )}
        </div>
      </div>

      {/* 3️⃣ Property and Financial Affairs LPA */}
      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Property and Financial Affairs LPA</h3>
          <div className="JUH-PART">
            <p>Has client made a LPA for property and financial affairs?</p>
            <h4>{getDisplayValue(data.financialLpa)}</h4>
          </div>
          {showSubField(data.financialLpa) && (
            <div className="JUH-PART">
              <p>LPA reference number</p>
              <h4>{getDisplayValue(data.financialLpaRef)}</h4>
            </div>
          )}
        </div>
      </div>

      {/* 4️⃣ DNACPR */}
      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Do not attempt cardiopulmonary resuscitation (DNACPR)</h3>
          <div className="JUH-PART">
            <p>Does client have a DNACPR order in place?</p>
            <h4>{getDisplayValue(data.dnacpr)}</h4>
          </div>
          {showSubField(data.dnacpr) && (
            <div className="JUH-PART">
              <p>Where is it kept?</p>
              <h4>{getDisplayValue(data.dnacprWhere)}</h4>
            </div>
          )}
        </div>
      </div>

      {/* 5️⃣ ADRT */}
      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Advance Decision to Refuse Treatment (ADRT/Living Will)</h3>
          <div className="JUH-PART">
            <p>Does client have ADRT in place?</p>
            <h4>{getDisplayValue(data.adrt)}</h4>
          </div>
          {showSubField(data.adrt) && (
            <div className="JUH-PART">
              <p>Where is it kept?</p>
              <h4>{getDisplayValue(data.adrtWhere)}</h4>
            </div>
          )}
        </div>
      </div>

      {/* 6️⃣ ReSPECT */}
      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>
            Recommended Summary Plan for Emergency Care and Treatment (ReSPECT)
          </h3>
          <div className="JUH-PART">
            <p>Does client have a ReSPECT in place?</p>
            <h4>{getDisplayValue(data.respect)}</h4>
          </div>
          {showSubField(data.respect) && (
            <div className="JUH-PART">
              <p>Where is it kept?</p>
              <h4>{getDisplayValue(data.respectWhere)}</h4>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalCapacityDetails;
