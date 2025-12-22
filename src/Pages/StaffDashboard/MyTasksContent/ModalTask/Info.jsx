import React from "react";

const Info = () => {
  // Static dummy data
  const carePlanSection = {
    bathingAndShowering: "Yes",
    oralHygiene: "No",
    maintainThemselves: "Partially",
    dressThemselves: "Yes with Help",
    groomingNeeds: ["Hair Washing", "Nail Care", "Shaving"],
    otherGrooming: "Assistance with makeup application",
    toiletUsage: "Independent",
    bowelControl: "Yes",
    bladderControl: "No",
    toiletingSupport: ["Wiping Assistance", "Transfer Support"],
    otherContinence: "Nighttime pads required",
    additionalNotes: "Client prefers morning routines and has a fear of water during bathing.",
    continenceCare: "Pad Changes",
    mobilityAssistance: "Wheelchair Transfer",
    preferredLanguage: "English",
    communicationStyleNeeds: ["Simple Language", "Visual Aids"]
  };

  return (
   <div className="Ggen-BDa custom-scroll-bar">

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Bathing/Showering Preferences</h3>
          <div className="JUH-PART">
            <p>Can they wash themselves?</p>
            <h4>{carePlanSection.bathingAndShowering}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Oral Hygiene</h3>
          <div className="JUH-PART">
            <p>Can they maintain oral hygiene?</p>
            <h4>{carePlanSection.oralHygiene}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Personal Appearance</h3>
          <div className="JUH-PART">
            <p>Can they maintain their personal appearance?</p>
            <h4>{carePlanSection.maintainThemselves}</h4>
          </div>
          <div className="JUH-PART">
            <p>Can they dress themselves?</p>
            <h4>{carePlanSection.dressThemselves}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Grooming Needs</h3>
          <div className="JUH-PART">
            <p>What grooming needs does the client need help with?</p>
            <h4>{carePlanSection.groomingNeeds.join(", ")}</h4>
          </div>
          {carePlanSection.otherGrooming && (
            <div className="JUH-PART">
              <p>Other grooming needs (specify):</p>
              <h4>{carePlanSection.otherGrooming}</h4>
            </div>
          )}
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Toilet</h3>
          <div className="JUH-PART">
            <p>Which best describes their toilet usage?</p>
            <h4>{carePlanSection.toiletUsage}</h4>
          </div>
          <div className="JUH-PART">
            <p>Do they have control over their bowels?</p>
            <h4>{carePlanSection.bowelControl}</h4>
          </div>
          <div className="JUH-PART">
            <p>Do they have control over their bladder?</p>
            <h4>{carePlanSection.bladderControl}</h4>
          </div>
          <div className="JUH-PART">
            <p>Do they need support with the following?</p>
            <h4>{carePlanSection.toiletingSupport.join(", ")}</h4>
          </div>
          {carePlanSection.otherContinence && (
            <div className="JUH-PART">
              <p>Other continence support (specify):</p>
              <h4>{carePlanSection.otherContinence}</h4>
            </div>
          )}
        </div>
      </div>

      {carePlanSection.additionalNotes && (
        <div className="Info-Palt-Main No-Grid">
          <div className="Info-TTb-BS-HYH">
            <h3>Additional Notes</h3>
            <div className="JUH-PART">
              <p>Additional Notes</p>
              <h4>{carePlanSection.additionalNotes}</h4>
            </div>
          </div>
        </div>
      )}

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Continence Care</h3>
          <div className="JUH-PART">
            <p>Continence Care</p>
            <h4>{carePlanSection.continenceCare}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Mobility Assistance</h3>
          <div className="JUH-PART">
            <p>Mobility Assistance</p>
            <h4>{carePlanSection.mobilityAssistance}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Communication</h3>
          <div className="JUH-PART">
            <p>Preferred Language</p>
            <h4>{carePlanSection.preferredLanguage}</h4>
          </div>
          <div className="JUH-PART">
            <p>Communication Style Needs</p>
            <h4>{carePlanSection.communicationStyleNeeds.join(", ")}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
