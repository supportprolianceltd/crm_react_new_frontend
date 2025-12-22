import React from 'react';
import {
  PencilIcon,
} from "@heroicons/react/24/outline";

const CultureInfo = () => {
  return (
<div className='Info-Palt'>
   
    <div className='Info-Palt-Main'>

        <div className='Info-TTb-BS'>
             <div className='Info-TTb-BS-HYH'>
                <h5>Cultural & Religious Background</h5>
             </div>
              <div className='Info-TTb-BS-HYH'>
                <p>Christain</p>
              </div>
        </div>

         <div className='Info-TTb-BS'>
             <div className='Info-TTb-BS-HYH'>
                <h5>Ethnic Group</h5>
             </div>
              <div className='Info-TTb-BS-HYH'>
                 <p>White British</p>
              </div>
        </div>
        
    </div>

     <div className='Info-Palt-Main No-Grid'>
 <div className='Info-TTb-BS-HYH'>
                <p>Does the client require any specific religious or cultural accommodations?</p>
                <h4>No he doesn’t</h4>
              </div>
        
    </div>

    <div className='Info-Palt-Main No-Grid'>
 <div className='Info-TTb-BS-HYH'>
  <h3>Sexuality</h3>
  <div className='JUH-PART'>
                <p>What best describes their sexuality?</p>
                <h4>Straight</h4>
                </div>
                <div className='JUH-PART'>
                <p>How does sex, gender, or sexual orientation impact their care needs?</p>
                <h4>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy</h4>
              </div>
  </div>
        
    </div>




</div>
  );
};


export default CultureInfo;
