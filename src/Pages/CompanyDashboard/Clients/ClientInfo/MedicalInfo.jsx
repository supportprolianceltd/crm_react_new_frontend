import React from "react";
import { PencilIcon } from "@heroicons/react/24/outline";

const LifeHistory = ({ onUpdate }) => {
  return (
    <div className="Info-Palt">
      <div className="Info-Palt-Top">
        <h3>Medical Information</h3>
        <a href="#" className="profil-Edit-Btn btn-primary-bg">
          <PencilIcon /> Edit
        </a>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <p>Primary Diagnosis</p>
          <h4>Stroke</h4>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <p>Additional Notes</p>
          <h4>
            The client has a Cerebrovascular Accident (Stroke) resulting in
            partial right-sided weakness (hemiparesis) and mild expressive
            aphasia (difficulty forming words). The stroke occurred
            approximately 18 months ago, with ongoing rehabilitation support
            through physiotherapy and speech therapy.
          </h4>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <p>Secondary Diagnosis</p>
          <h4>Stroke</h4>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <p>Additional Notes</p>
          <h4>
            The client has a Cerebrovascular Accident (Stroke) resulting in
            partial right-sided weakness (hemiparesis) and mild expressive
            aphasia (difficulty forming words). The stroke occurred
            approximately 18 months ago, with ongoing rehabilitation support
            through physiotherapy and speech therapy.
          </h4>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <p>Past Medical History</p>
          <h4>
            The client was diagnosed with hypertension in 2016 following
            persistent blood pressure readings (average 150/95mmHg). The
            condition has been managed through lifestyle modification anf
            medication.
          </h4>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <p>NHS Number</p>
          <h4>00012</h4>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Medical Support Contacts</h3>
          <div className="JUH-PART">
            <p>GP/Primary Doctor</p>
            <h4>Dr Conrad Hawkins</h4>
          </div>
          <div className="JUH-PART">
            <p>Contact</p>
            <h4>+1287654320098</h4>
          </div>
          <div className="JUH-PART">
            <p>Specialist Contact (if applicable)</p>
            <h4>+1287654320098</h4>
          </div>

          <div className="JUH-PART">
            <p>Hospital/Clinic (usual care provider)</p>
            <h4>+1287654320098</h4>
          </div>

          <div className="JUH-PART">
            <p>
              Emergency Care Notes (hospital preference, DNAR status if
              applicable)
            </p>
            <h4>
              Client prefers to be taken to St. Mary’s Hospital in case of
              emergency. DNAR (Do Not Attempt Resuscitation) form is signed and
              filed with the care team. Emergency contact: Jane Doe (daughter) –
              0802 345 6789. Ensure ambulance access through back entrance due
              to steep front steps.”
            </h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Allergies</h3>
          <div className="JUH-PART">
            <p>Any known allergies?</p>
            <h4>Yes</h4>
          </div>
          <div className="JUH-PART">
            <p>Allergies</p>
            <h4>Penicillin</h4>
          </div>

          <div className="JUH-PART">
            <p>Severity</p>
            <h4>High</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Medication Schedule</h3>
          <div className="JUH-PART">
            <p>Medication Name</p>
            <h4>Letrozole</h4>
          </div>
          <div className="JUH-PART">
            <p>Dosage</p>
            <h4>2.5 mg tablet</h4>
          </div>

          <div className="JUH-PART">
            <p>Frequency</p>
            <h4>Once daily</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>Documentation Uploads</p>
            <h4>
              <button className="downn-pdf-btn">Medical Report.pdf</button>
            </h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <div className="JUH-PART">
            <p>Triggers</p>
            <h4>
              Administration of any penicillin-based antibiotic or related
              beta-lactam medications (e.g., amoxicillin, flucloxacillin).
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifeHistory;
