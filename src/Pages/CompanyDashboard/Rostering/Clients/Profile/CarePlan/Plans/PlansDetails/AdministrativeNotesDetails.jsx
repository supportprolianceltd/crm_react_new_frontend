import React from "react";
import { PencilIcon } from "@heroicons/react/24/outline";
import {
  normalizeText,
  getDisplayValue,
} from "../../../../../../../../utils/helpers";

const AdministrativeNotesDetails = ({ carePlanSection }) => {
  const bodyMap = carePlanSection?.bodyMap || {};
  const legalReq = carePlanSection?.legalRequirement || {};

  // Finances handling (derived from attorneyType in legalRequirement)
  const financesHandling = legalReq.attorneyType?.includes("finance_property")
    ? "No, with attorney/support"
    : getDisplayValue("YES_INDEPENDENTLY"); // Fallback/default

  // Advanced directive (derived from attorneyType in legalRequirement)
  const advancedDirective =
    legalReq.attorneyType?.includes("health_welfare") ||
    legalReq.attorneyInPlace
      ? getDisplayValue("Yes")
      : getDisplayValue("No");

  // Has will (derived from attorneyType; adjust if a dedicated field exists elsewhere)
  const hasWill = legalReq.attorneyType?.includes("finance_property")
    ? getDisplayValue("Yes")
    : getDisplayValue("No");

  // Invoicing cycle from bodyMap
  const invoicingCycle = normalizeText(bodyMap.invoicingCycle) || "N/A";

  // Funding details from bodyMap
  const fundingDetails =
    normalizeText(bodyMap.fundingAndInsuranceDetails) || "N/A";

  return (
    <div className="Info-Palt">
      <div className="Info-Palt-Top">
        <h3>Administrative Notes</h3>
        <a href="#" className="profil-Edit-Btn btn-primary-bg">
          <PencilIcon /> Edit
        </a>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Finances</h3>
          <div className="JUH-PART">
            <p>Can they handle their own finances</p>
            <h4>{financesHandling}</h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Advanced directive</h3>
          <div className="JUH-PART">
            <p>Do they have an advanced directive in place?</p>
            <h4>{advancedDirective}</h4>
          </div>

          <div className="JUH-PART">
            <p>Do they have a will?</p>
            <h4>{hasWill}</h4>
          </div>

          <div className="JUH-PART">
            <p>Invoicing Cycle</p>
            <h4>{invoicingCycle}</h4>
          </div>

          <div className="JUH-PART">
            <p>Funding/Insurance Details</p>
            <h4>{fundingDetails}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdministrativeNotesDetails;
