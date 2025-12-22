import React, { useState, useRef, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  BarsArrowDownIcon,
  MapPinIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { 
  IconUsers, 
  IconChecklist, 
  IconUserHeart,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from 'framer-motion';

const RosterTop = ({ selected, onSelect, allVisits, carerProfiles, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  // Calculate statistics from real data
  const uniqueClients = new Set();
  const uniqueCarers = new Set();
  
  allVisits.forEach(visit => {
    if (visit.clientId) {
      uniqueClients.add(visit.clientId);
    }
    if (visit.assignees && Array.isArray(visit.assignees)) {
      visit.assignees.forEach(assignee => {
        if (assignee.carerId) {
          uniqueCarers.add(assignee.carerId);
        }
      });
    }
  });

  const clientCount = uniqueClients.size;
  const carerCount = uniqueCarers.size;
  const visitCount = allVisits.length;

  const searchPlaceholder = selected === 'Client' ? 'Search clients' : 'Search carer';

  return (
    <div className='RosterTop-content'>
      <div className='TTo-Rost-1'>
        <div className='oIK-Btns'>
          <div className='dropdown-container' ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)}>
              <BarsArrowDownIcon />Sort By: {selected}
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="dropdown-menu"
                >
                  <li className='dropdown-item' onClick={() => handleSelect('Clients')}>Clients</li>
                  <li className='dropdown-item' onClick={() => handleSelect('Carers')}>Carers</li>
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className='oIK-Search'>
          <span><MagnifyingGlassIcon /></span>
          <input type='text' placeholder={searchPlaceholder} />
        </div>
        <div className='HHj-IIctgs'>
          <span><IconUsers /> {isLoading ? '-' : clientCount}</span>
          <span><IconUserHeart /> {isLoading ? '-' : carerCount}</span>
          <span><IconChecklist /> {isLoading ? '-' : visitCount}</span>
        </div>
      </div>
       <div className='TTo-Rost-2'>
        <div className='cccll-Gbajjs'>
          {/* <div className='cccll-Gbajjs-Main'>
            <button><ChartBarIcon /> View Reports</button>
            <button className='Gradient-Btn'><MapPinIcon /> Coverage Map</button>
          </div> */}
        </div>
       </div>
    </div>
  );
};

export default RosterTop;