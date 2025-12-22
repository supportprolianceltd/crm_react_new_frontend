import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './Medications.css';
import Home from './Home';
import MedicationScheduler from './MediactionPages/MedicationScheduler';
import PersonalDetails from './MediactionPages/PersonalDetails';
import MedicationMonitoring from './MediactionPages/MedicationMonitoring';

const CarePlan = ({ clientData }) => {
  return (
    <div className='CarePlan'>
      <Routes>
        {/* Default Care Plan Home */}
        <Route path="/" element={<Home clientData={clientData} />} />
        <Route path="/medication-scheduler" element={<MedicationScheduler clientData={clientData} />} />
        <Route path="/personal-details" element={<PersonalDetails clientData={clientData} />} />
        <Route path="/medication-monitoring" element={<MedicationMonitoring clientData={clientData} />} />

      </Routes>
    </div>
  );
};

export default CarePlan;
