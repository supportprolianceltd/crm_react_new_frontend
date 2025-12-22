import React from 'react';
import RosterCalendar from './RosterCalendar';

const RosterBody = ({ 
  selected, 
  activeIndex, 
  onItemClick, 
  selectedDate, 
  onDateChange,
  allVisits,
  carerProfiles,
  isLoading
}) => {
  return (
    <div className='RosterBody'>
      <RosterCalendar 
        selected={selected} 
        activeIndex={activeIndex} 
        onItemClick={onItemClick}
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        allVisits={allVisits}
        carerProfiles={carerProfiles}
        isLoading={isLoading}
      />
    </div>
  );
};

export default RosterBody;