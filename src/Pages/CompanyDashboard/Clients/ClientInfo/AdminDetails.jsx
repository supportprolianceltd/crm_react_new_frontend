import React from 'react';
import {
  PencilIcon,
} from "@heroicons/react/24/outline";

const AdminDetails = ({ onEdit, data = {} }) => {
  const getDisplayValue = (value) => value?.trim() ? value : 'Not specified';

  const getArrayDisplay = (arr) => arr?.length > 0 ? arr.join(', ') : 'Not specified';

  return (
    <div className='Info-Palt'>
      <div className='Info-Palt-Top'>
        <h3>Admin</h3>
        <button onClick={onEdit} className='profil-Edit-Btn btn-primary-bg'><PencilIcon /> Edit</button>
      </div>

      {/* Identifiers */}
      <div className='Info-Palt-Main No-Grid'>
        <div className='Info-TTb-BS-HYH'>
          <h3>Identifiers</h3>
          <div className='JUH-PART'>
            <p>Unique client identifier</p>
            <h4>{getDisplayValue(data.uniqueClientId)}</h4>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className='Info-Palt-Main No-Grid'>
        <div className='Info-TTb-BS-HYH'>
          <h3>Status</h3>
          <div className='JUH-PART'>
            <p>Service start date</p>
            <h4>{getDisplayValue(data.serviceStartDate)}</h4>
          </div>
          <div className='JUH-PART'>
            <p>Current Status</p>
            <h6>
              <span className={`status ${data.currentStatus?.toLowerCase() || ''}`}>{getDisplayValue(data.currentStatus)}</span>
            </h6>
          </div>
        </div>
      </div>

      {/* Regulated Care */}
      <div className='Info-Palt-Main No-Grid'>
        <div className='Info-TTb-BS-HYH'>
          <h3>Regulated Care</h3>
          <div className='JUH-PART'>
            <p>Does the client receive regulated care?</p>
            <h4>{getDisplayValue(data.regulatedCare)}</h4>
          </div>
        </div>
      </div>

      {/* Risk Management */}
      <div className='Info-Palt-Main No-Grid'>
        <div className='Info-TTb-BS-HYH'>
          <h3>Risk Management</h3>
          <div className='JUH-PART'>
            <p>Assign an overall risk level to client in line with your contingency plan</p>
            <h6>
              <span className={`status ${data.riskLevel?.toLowerCase() || ''}`}>{getDisplayValue(data.riskLevel)}</span>
            </h6>
          </div>
          <div className='JUH-PART'>
            <p>Risk level details</p>
            {data.riskDetails?.map((item) => (
              <h4 key={item}>{item}</h4>
            )) || <h4>Not specified</h4>}
          </div>
        </div>
      </div>

      {/* Family Involvement */}
      <div className='Info-Palt-Main No-Grid'>
        <div className='Info-TTb-BS-HYH'>
          <h3>Family Involvement</h3>
          <div className='JUH-PART'>
            <p>How involved is the client family?</p>
            <h4>{getDisplayValue(data.familyInvolvement)}</h4>
          </div>
        </div>
      </div>

      {/* Contingency Plan */}
      <div className='Info-Palt-Main No-Grid'>
        <div className='Info-TTb-BS-HYH'>
          <h3>What is the contingency plan for client care, in the case of a staffing crisis?</h3>
          <div className='JUH-PART'>
            <h4>{getDisplayValue(data.contingencyPlan)}</h4>
          </div>
        </div>
      </div>

      {/* Accessible Information Standard */}
      <div className='Info-Palt-Main No-Grid'>
        <div className='Info-TTb-BS-HYH'>
          <h3>Accessible Information Standard</h3>
          <div className='JUH-PART'>
            <p>Does client have any communication or information needs?</p>
            <h4>{getDisplayValue(data.communicationNeeds)}</h4>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className='Info-Palt-Main No-Grid'>
        <div className='Info-TTb-BS-HYH'>
          <h3>Additional Information</h3>
          <div className='JUH-PART'>
            <h4>{getDisplayValue(data.additionalInfo)}</h4>
          </div>
        </div>
      </div>

      {/* Preferred Contact */}
      <div className='Info-Palt-Main No-Grid'>
        <div className='Info-TTb-BS-HYH'>
          <div className='JUH-PART'>
            <p>What is client preferred method of contact for admin matters?</p>
            <h4>{getDisplayValue(data.preferredContact)}</h4>
          </div>
        </div>
      </div>

      {/* Funding Arrangements */}
      <div className='Info-Palt-Main No-Grid'>
        <div className='Info-TTb-BS-HYH'>
          <h3>Funding Arrangements</h3>
          <div className='JUH-PART'>
            <p>Please select one or more funding options</p>
            <h4>{getArrayDisplay(data.fundingOptions)}</h4>
          </div>
        </div>
      </div>

      {/* Matching - Carer Preferences */}
      <div className='Info-Palt-Main No-Grid'>
        <div className='Info-TTb-BS-HYH'>
          <h3>Matching</h3>
          <div className='JUH-PART'>
            <p>Carer Preferences</p>
            <h4>{getArrayDisplay(data.carerPreferences)}</h4>
          </div>
        </div>
      </div>

      {/* Group */}
      <div className='Info-Palt-Main No-Grid'>
        <div className='Info-TTb-BS-HYH'>
          <h3>Group</h3>
          <div className='JUH-PART'>
            <p>What group of carers should client be put in?</p>
            <h4>{getDisplayValue(data.group)}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDetails;




