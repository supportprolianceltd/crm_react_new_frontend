import React from "react";
import { PencilIcon } from "@heroicons/react/24/outline";
const MedicalInfo = ({ carePlan = null, loading = false }) => {
  const medical = carePlan?.medicalInfo || {};
  const getDisplayValue = (value) => (value?.trim() ? value : "Not specified");

  if (loading) {
    return (
      <div className="Info-Palt">
        <div className="Info-Palt-Top">
          <h3>Medical Information</h3>
        </div>
        <div className="Info-Palt-Main">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="Info-Palt">
      <div className="Info-Palt-Top">
        <h3>Medical Information</h3>
        {/* <a href='#' className='profil-Edit-Btn btn-primary-bg'><PencilIcon /> Edit</a> */}
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <p>Primary Diagnosis</p>
          <h4>{getDisplayValue(medical.primaryDiagnosis)}</h4>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <p>Primary Diagnosis Additional Notes</p>
          <h4>{getDisplayValue(medical.primaryAdditionalNotes)}</h4>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <p>Secondary Diagnosis</p>
          <h4>{getDisplayValue(medical.secondaryDiagnoses)}</h4>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <p>Secondary Diagnosis Additional Notes</p>
          <h4>{getDisplayValue(medical.secondaryAdditionalNotes)}</h4>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <p>Past Medical History</p>
          <h4>{getDisplayValue(medical.pastMedicalHistory)}</h4>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Medical Support Contacts</h3>
          <div className="JUH-PART">
            <p>GP/Primary Doctor</p>
            <h4>{getDisplayValue(medical.primaryDoctor)}</h4>
          </div>
          <div className="JUH-PART">
            <p>Support Contact Phone</p>
            <h4>{getDisplayValue(medical.supportContactPhone)}</h4>
          </div>
          <div className="JUH-PART">
            <p>Specialist Contact</p>
            <h4>{getDisplayValue(medical.specialistContact)}</h4>
          </div>
          <div className="JUH-PART">
            <p>Hospital Contact</p>
            <h4>{getDisplayValue(medical.HospitalContact)}</h4>
          </div>
          <div className="JUH-PART">
            <p>Emergency Care Notes</p>
            <h4>{getDisplayValue(medical.EmergencyCareNotes)}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Allergies</h3>
          <div className="JUH-PART">
            <p>Any known allergies?</p>
            <h4>{medical.knownAllergies ? "Yes" : "No"}</h4>
          </div>
          {medical.knownAllergies && (
            <>
              <div className="JUH-PART">
                <p>Allergies</p>
                <h4>{medical.clientAllergies?.length > 0 ? medical.clientAllergies.join(", ") : "None specified"}</h4>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Medications</h3>
          {medical.medications?.length > 0 ? (
            medical.medications.map((med, index) => (
              <div key={index} className="JUH-PART">
                <p>Medication {index + 1}</p>
                <h4>{med.name || "Unknown"} - {med.dosage || "Unknown dosage"} - {med.frequency || "Unknown frequency"}</h4>
              </div>
            ))
          ) : (
            <div className="JUH-PART">
              <p>No medications listed</p>
            </div>
          )}
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Additional Medical Information</h3>
          <div className="JUH-PART">
            <p>Current Health Status</p>
            <h4>{getDisplayValue(medical.currentHealthStatus)}</h4>
          </div>
          <div className="JUH-PART">
            <p>Medical Support Needed</p>
            <h4>{medical.medicalSupport ? "Yes" : "No"}</h4>
          </div>
          <div className="JUH-PART">
            <p>Safeguarding Issue Raised</p>
            <h4>{medical.raisedSafeGuardingIssue ? "Yes" : "No"}</h4>
          </div>
          {medical.raisedSafeGuardingIssue && (
            <div className="JUH-PART">
              <p>Safeguarding Additional Information</p>
              <h4>{getDisplayValue(medical.safeGuardingAdditionalInformation)}</h4>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalInfo;
