import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import './ClientCreation.css';

import CreactionProgress from './CreactionProgress';
import PersonalInformation from './PersonalInformation';


const ClientCreation = () => {
      const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // takes user to the previous page
  };

  return (
<div className='GenForm-Page'>
     <div className='form-header'>
        <h2>
          <span onClick={handleBack} style={{ cursor: 'pointer' }}>
            <ArrowLeftIcon className="h-6 w-6 inline" />
          </span>
          Create New Client
        </h2>
        <p>Fill in the Client details to add them to the company roster.</p>
      </div>

      <CreactionProgress />

      <PersonalInformation />
</div>
  );
};


export default ClientCreation;
