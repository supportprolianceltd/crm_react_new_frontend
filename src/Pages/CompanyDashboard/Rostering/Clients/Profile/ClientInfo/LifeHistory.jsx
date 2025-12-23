import React from "react";
import { PencilIcon } from "@heroicons/react/24/outline";
const LifeHistory = ({ carePlan = null, loading = false }) => {
  const routine = carePlan?.routine || {};
  const getDisplayValue = (value) => (value?.trim() ? value : "Not specified");

  if (loading) {
    return (
      <div className="Info-Palt">
        <div className="Info-Palt-Top">
          <h3>Life History</h3>
        </div>
        <div className="Info-Palt-Main">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // console.log("carePlan")
  // console.log(carePlan)
  // console.log("carePlan")

  return (
    <div className="Info-Palt">
      <div className="Info-Palt-Top">
        <h3>Life History</h3>
        {/* <a href='#' className='profil-Edit-Btn btn-primary-bg'><PencilIcon /> Edit</a> */}
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <p>History Snapshot/Personal Biography</p>
          <h4>{getDisplayValue(routine.PersonalBiography)}</h4>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Job</h3>
          <div className="JUH-PART">
            <p>Do they have any current jobs or past jobs that are important to them?</p>
            <h4>{routine.haveJob ? "Yes" : "No"}</h4>
          </div>
          {routine.haveJob && (
            <div className="JUH-PART">
              <p>Tell us about it</p>
              <h4>{getDisplayValue(routine.aboutJob)}</h4>
            </div>
          )}
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>People</h3>
          <div className="JUH-PART">
            <p>Anyone important person in their life?</p>
            <h4>{routine.haveImportantPerson ? "Yes" : "No"}</h4>
          </div>
          {routine.haveImportantPerson && (
            <div className="JUH-PART">
              <p>Tell us who</p>
              <h4>{getDisplayValue(routine.aboutImportantPerson)}</h4>
            </div>
          )}
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Location</h3>
          <div className="JUH-PART">
            <p>Any significant place or location in their life?</p>
            <h4>{routine.significantPersonHasLocation ? "Yes" : "No"}</h4>
          </div>
          {routine.significantPersonHasLocation && (
            <div className="JUH-PART">
              <p>How do these locations affect their care needs?</p>
              <h4>{getDisplayValue(routine.importantPersonLocationEffects)}</h4>
            </div>
          )}
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Daily Routine</h3>
          <div className="JUH-PART">
            <p>Daily Routine Details</p>
            <h4>{getDisplayValue(routine.dailyRoutine)}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Preferences</h3>
          <div className="JUH-PART">
            <p>Care Giver Gender Preference</p>
            <h4>{getDisplayValue(routine.careGiverGenderPreference)}</h4>
          </div>
          <div className="JUH-PART">
            <p>Autonomy Preferences</p>
            <h4>{getDisplayValue(routine.autonomyPreference)}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifeHistory;
