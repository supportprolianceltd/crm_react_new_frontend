import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PencilIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

const PersonalDetails = () => {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  // Track selected option
  const [medicineSupport, setMedicineSupport] = useState("");

  return (
    <div className="DDD-PPLso-Sec kOll-MinWidth">
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

      <div className="Info-Palt-Top">
        <h3>Personal Details</h3>
        <a href="#" className="profil-Edit-Btn btn-primary-bg">
          <PencilIcon /> Edit
        </a>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Allergy</h3>
          <div className="JUH-PART">
            <h4>
              The client has a documented allergy to penicillin, which causes
              skin rashes and mild swelling when administered. The allergy was
              confirmed by a GP, and the client’s medical record and medication
              list have been updated accordingly.
            </h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>GP/Primary Doctor</h3>
          <div className="JUH-PART">
            <p>GP/Primary Doctor</p>
            <h4>Steven Okon</h4>
            <p>Contact</p>
            <h4>+2347765432233</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Medicine Support</h3>
          <div className="JUH-PART">
            <p>Please select:</p>
          </div>

          {/* Radio Option 1 */}
          <label className="labell-NGba">
            <input
              type="radio"
              name="medicineSupport"
              value="provide"
              checked={medicineSupport === "provide"}
              onChange={(e) => setMedicineSupport(e.target.value)}
            />
            <div className="JUH-PART">
              <p>We provide client’s medical support</p>
              <h4>Carers must record each time they help with medication</h4>
            </div>
          </label>

          {/* Radio Option 2 */}
          <label className="labell-NGba">
            <input
              type="radio"
              name="medicineSupport"
              value="not_provide"
              checked={medicineSupport === "not_provide"}
              onChange={(e) => setMedicineSupport(e.target.value)}
            />
            <div className="JUH-PART">
              <p>We do not provide client’s medicine support</p>
              <h4>Carers are not allowed to record client’s medication</h4>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetails;
