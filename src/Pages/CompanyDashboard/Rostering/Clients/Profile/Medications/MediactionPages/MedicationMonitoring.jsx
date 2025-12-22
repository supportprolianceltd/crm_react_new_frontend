import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PencilIcon, 
    ArrowLeftIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CalendarDaysIcon
 } from "@heroicons/react/24/outline";
import { 
    IconDownload
} from '@tabler/icons-react';

const MedicationMonitoring = () => {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  // Track selected option
  const [medicineSupport, setMedicineSupport] = useState("");

  return (
    <div className="GenReq-Page Meddi-Ppage">
        <div className='DDD-PPLso-1-Top'>
                  <span
                    role='button'
                    tabIndex={0}
                    onClick={goBack}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') goBack(); }}
                  ><ArrowLeftIcon /> Go Back</span>
                </div>


        <div className="GHGb-MMIn-DDahs-Top KKm-Hheaders">
              <h3>Medication Monitoring</h3>
              <button className="GenFlt-BTn btn-primary-bg kika-pplsBTN">
                 Download PDF <IconDownload />
              </button>
            </div>

        <div className="ooilaui-Cards">
            <div className="ooilaui-Card Simp-Boxshadow">
                <h4>Total Medications</h4>
                <h3>0</h3>
            </div>

             <div className="ooilaui-Card Simp-Boxshadow">
                <h4>Taken</h4>
                <h3>0</h3>
            </div>

             <div className="ooilaui-Card Simp-Boxshadow">
                <h4>Missed</h4>
                <h3>0</h3>
            </div>

             <div className="ooilaui-Card Simp-Boxshadow">
                <h4>Delayed</h4>
                <h3>0</h3>
            </div>

        </div>

        <div className="NNwe-Madd-TTops">
                    <ul className="Ul-OKik">
                     
                      <li>
                        <ChevronLeftIcon />
                      </li>
                       <li>
                        <h3>Thursday 16 2025</h3>
                      </li>
                      <li>
                        <ChevronRightIcon />
                      </li>
                     
        
                       <li className="KMN-YHA">
                        <CalendarDaysIcon /> 
                      </li>
        
                    </ul>
                    </div>

    </div>
  );
};

export default MedicationMonitoring;
