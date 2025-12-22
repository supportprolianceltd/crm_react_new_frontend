import { PencilIcon } from "@heroicons/react/24/outline";
import {
  normalizeText,
  getDisplayValue,
} from "../../../../../../../../utils/helpers";

const SocialSupportDetails = ({ carePlanSection }) => {
  const receivesInformalCare = getDisplayValue(
    carePlanSection?.receivesInformalCare
  );

  const informalCareByWho =
    normalizeText(carePlanSection?.informalCareByWho) || "N/A";

  const supportMethodByInformalCare =
    normalizeText(carePlanSection?.supportMethodByInformalCare) || "N/A";

  const concernsOnInformalCare = normalizeText(
    carePlanSection?.concernsOnInformalCare
  );

  const specifyConcernsOnInformalCare =
    normalizeText(carePlanSection?.specifyConcernsOnInformalCare) || "N/A";

  const receivesFormalCare = getDisplayValue(
    carePlanSection?.receivesFormalCare
  );

  const specifyFormalCare =
    normalizeText(carePlanSection?.specifyFormalCare) || "N/A";

  const mentalWellbeingTracking = getDisplayValue(
    carePlanSection?.mentalWellbeingTracking
  );

  return (
    <div className="Info-Palt">
      <div className="Info-Palt-Top">
        <h3>Social Support</h3>
        <a href="#" className="profil-Edit-Btn btn-primary-bg">
          <PencilIcon /> Edit
        </a>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Informal Care</h3>
          <div className="JUH-PART">
            <p>Do they receive any informal care?</p>
            <h4>{receivesInformalCare}</h4>
          </div>

          {receivesInformalCare === "Yes" && (
            <>
              <div className="JUH-PART">
                <p>If yes, who is the informal care provided by?</p>
                <h4>{informalCareByWho}</h4>
              </div>

              <div className="JUH-PART">
                <p>How are they supported by their informal carer?</p>
                <h4>{supportMethodByInformalCare}</h4>
              </div>
            </>
          )}

          <div className="JUH-PART">
            <p>
              Are there any concerns around the wellbeing of their informal
              carers?
            </p>
            <h4>{concernsOnInformalCare}</h4>
          </div>

          {concernsOnInformalCare === "Yes" && (
            <div className="JUH-PART">
              <p>
                Are there any concerns around the wellbeing of their informal
                carers?
              </p>
              <h4>{specifyConcernsOnInformalCare}</h4>
            </div>
          )}
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Formal Care</h3>
          <div className="JUH-PART">
            <p>Do they receive any formal care?</p>
            <h4>{receivesFormalCare}</h4>
          </div>

          {receivesFormalCare === "Yes" && (
            <div className="JUH-PART">
              <p>Specify formal care</p>
              <h4>{specifyFormalCare}</h4>
            </div>
          )}

          <div className="JUH-PART">
            <p>Mental wellbeing tracking</p>
            <h4>{mentalWellbeingTracking}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialSupportDetails;
