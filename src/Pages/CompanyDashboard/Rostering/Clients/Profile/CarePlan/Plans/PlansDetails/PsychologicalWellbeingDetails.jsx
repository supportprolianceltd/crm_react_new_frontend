import { PencilIcon } from "@heroicons/react/24/outline";
import { normalizeText } from "../../../../../../../../utils/helpers";

const PsychologicalWellbeingDetails = ({ carePlanSection }) => {
  const getDisplayValue = (value) =>
    value === true || value === "yes"
      ? "Yes"
      : value === false || value === "no"
      ? "No"
      : value || "N/A";

  const healthLevelSatisfaction = normalizeText(
    carePlanSection?.healthLevelSatisfaction
  );

  const healthMotivationalLevel = normalizeText(
    carePlanSection?.healthMotivationalLevel
  );

  const sleepMood = normalizeText(carePlanSection?.sleepMood);

  const specifySleepMood = carePlanSection?.specifySleepMood || "N/A";

  const sleepStatus = normalizeText(carePlanSection?.sleepStatus);

  const anyoneWorriedAboutMemory = getDisplayValue(
    carePlanSection?.anyoneWorriedAboutMemory
  );

  const memoryStatus = normalizeText(carePlanSection?.memoryStatus);

  const specifyMemoryStatus =
    normalizeText(carePlanSection?.specifyMemoryStatus) || "N/A";

  const canTheyDoHouseKeeping = normalizeText(
    carePlanSection?.canTheyDoHouseKeeping
  );

  const houseKeepingSupport = getDisplayValue(
    carePlanSection?.houseKeepingSupport
  );

  const houseKeepingAdditionalNotes =
    normalizeText(carePlanSection?.houseKeepingAdditionalNotes) || "N/A";

  return (
    <div className="Info-Palt">
      <div className="Info-Palt-Top">
        <h3>Psychological Information</h3>
        <a href="#" className="profil-Edit-Btn btn-primary-bg">
          <PencilIcon /> Edit
        </a>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Everyday Activities</h3>
          <div className="JUH-PART">
            <p>How satisfied are they with their level of health?</p>
            <h4>{healthLevelSatisfaction}</h4>
          </div>

          <div className="JUH-PART">
            <p>
              How motivated are they to maintain their health and wellbeing?
            </p>
            <h4>{healthMotivationalLevel}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Mood and sleep</h3>
          <div className="JUH-PART">
            <p>How is their mood?</p>
            <h4>{sleepMood}</h4>
          </div>

          {specifySleepMood !== "N/A" && (
            <div className="JUH-PART">
              <p>Specify Mood</p>
              <h4>{specifySleepMood}</h4>
            </div>
          )}

          <div className="JUH-PART">
            <p>How is their sleep?</p>
            <h4>{sleepStatus}</h4>
          </div>

          <div className="JUH-PART">
            <p>
              Is the client, or anyone close to the client, worried about their
              memory?
            </p>
            <h4>{anyoneWorriedAboutMemory}</h4>
          </div>

          <div className="JUH-PART">
            <p>How is their memory?</p>
            <h4>{memoryStatus}</h4>
          </div>

          {specifyMemoryStatus !== "N/A" && (
            <div className="JUH-PART">
              <p>Specify Memory Status</p>
              <h4>{specifyMemoryStatus}</h4>
            </div>
          )}
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Housekeeping</h3>
          <div className="JUH-PART">
            <p>Can they do housekeeping?</p>
            <h4>{canTheyDoHouseKeeping}</h4>
          </div>

          <div className="JUH-PART">
            <p>Does housekeeping support required?</p>
            <h4>{houseKeepingSupport}</h4>
          </div>

          {houseKeepingAdditionalNotes !== "N/A" && (
            <div className="JUH-PART">
              <p>Housekeeping Additional Notes</p>
              <h4>{houseKeepingAdditionalNotes}</h4>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PsychologicalWellbeingDetails;
