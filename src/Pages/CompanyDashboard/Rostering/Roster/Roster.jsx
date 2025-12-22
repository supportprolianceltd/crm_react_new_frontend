import React, { useState, useEffect } from 'react';
import './Roster.css';
import RosterTop from './RosterTop';
import RosterBody from './RosterBody';
import { fetchScheduledVisits, fetchBulkUserDetails } from '../config/apiConfig';

const Roster = () => {
  const [selected, setSelected] = useState('Client');
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allVisits, setAllVisits] = useState([]);
  const [carerProfiles, setCarerProfiles] = useState({});
  const [isLoadingVisits, setIsLoadingVisits] = useState(true);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  const handleItemClick = (index) => {
    setActiveIndex(index);
  };

  // Fetch visits when selected date changes
  useEffect(() => {
    const loadVisits = async () => {
      setIsLoadingVisits(true);
      try {
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);

        const filters = {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        };

        const response = await fetchScheduledVisits(filters);
        setAllVisits(response?.items || []);
      } catch (error) {
        setAllVisits([]);
      } finally {
        setIsLoadingVisits(false);
      }
    };

    loadVisits();
  }, [selectedDate]);

  // Fetch carer profiles once visits are loaded
  useEffect(() => {
    const loadCarerProfiles = async () => {
      if (allVisits.length === 0) {
        setCarerProfiles({});
        return;
      }

      setIsLoadingProfiles(true);
      try {
        // Extract unique carer IDs from all visits
        const carerIds = new Set();
        allVisits.forEach(visit => {
          if (visit.assignees && Array.isArray(visit.assignees)) {
            visit.assignees.forEach(assignee => {
              if (assignee.carerId) {
                carerIds.add(assignee.carerId);
              }
            });
          }
        });

        if (carerIds.size > 0) {
          const profiles = await fetchBulkUserDetails(Array.from(carerIds));
          setCarerProfiles(profiles || {});
        } else {
          setCarerProfiles({});
        }
      } catch (error) {
        setCarerProfiles({});
      } finally {
        setIsLoadingProfiles(false);
      }
    };

    loadCarerProfiles();
  }, [allVisits]);

  return (
    <div className='Roster-Mman-Pag'>
      <div className='RosterTop'>
        <RosterTop 
          selected={selected} 
          onSelect={setSelected}
          allVisits={allVisits}
          carerProfiles={carerProfiles}
          isLoading={isLoadingVisits || isLoadingProfiles}
        />
      </div>
      <RosterBody 
        selected={selected} 
        activeIndex={activeIndex} 
        onItemClick={handleItemClick}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        allVisits={allVisits}
        carerProfiles={carerProfiles}
        isLoading={isLoadingVisits || isLoadingProfiles}
      />
    </div>
  );
};

export default Roster;