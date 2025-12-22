import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';
import { IconWalk, IconBus, IconCar } from "@tabler/icons-react";
import { useNavigate } from 'react-router-dom';
import CareerImg1 from '../../Img/Careers/1.jpg';
import CareerImg2 from '../../Img/Careers/2.jpg';
import CareerImg3 from '../../Img/Careers/3.jpg';
import CareerImg4 from '../../Img/Careers/4.jpg';
import CareerImg5 from '../../Img/Careers/5.jpg';
// Constants for carers only
const CARERS = ['Anna Kowalski', 'Raj Singh', 'Lena Müller', 'Carlos Lopez', 'Aisha Khan', 'Pierre Dubois', 'Yuki Tanaka'];
const CARER_DISTANCES = ['2km', '0.5km', '3km', '1.5km', '4km', '1km', '2.5km'];
const CARER_IMAGES = [CareerImg1, CareerImg2, CareerImg3, CareerImg4, CareerImg5];
const CARER_TRANSPORTS = [IconWalk, IconBus, IconCar, IconWalk, IconBus, IconCar, IconWalk];
const CareTeam = ({ task, carerProfiles, activeIndex, onItemClick }) => {
  const navigate = useNavigate();
  const [currentOpenIndex, setCurrentOpenIndex] = useState(-1);
  const [showSuggested, setShowSuggested] = useState(false);
  const [suggestedOpenIndex, setSuggestedOpenIndex] = useState(-1);
  const [replacingSlot, setReplacingSlot] = useState(-1);
  const [currentCarers, setCurrentCarers] = useState([]);
  const [suggestedCarers, setSuggestedCarers] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (task && carerProfiles) {
      const assignedCarers = task.assignees?.map(assignee => {
        const profile = carerProfiles[assignee.carerId];
        const name = profile ? `${profile.first_name} ${profile.last_name}` : 'Unassigned';
        return name !== 'Unassigned' ? { name, distance: assignee.distance || 'N/A' } : null;
      }).filter(Boolean) || [];
      setCurrentCarers(assignedCarers);
      setSuggestedCarers(CARERS.slice(2));
    }
  }, [task, carerProfiles]);
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  const showImageForCarer = (carerName) => {
    const index = CARERS.indexOf(carerName);
    return index !== -1 && index < CARER_IMAGES.length;
  };
  const getCarerImage = (carerName) => {
    const index = CARERS.indexOf(carerName);
    if (index !== -1 && index < CARER_IMAGES.length) {
      return CARER_IMAGES[index];
    }
    return null;
  };
  const getCarerIndex = (carerName) => {
    return CARERS.indexOf(carerName);
  };
  const handleViewProfile = (carerName) => {
    window.open(`${window.location.origin}/company/rostering/employee-profile/${encodeURIComponent(carerName)}`, '_blank');
  };
  const handleToggleCurrent = (i) => {
    setCurrentOpenIndex(currentOpenIndex === i ? -1 : i);
    onItemClick(i);
  };
  const handleToggleSuggested = (sI) => {
    setSuggestedOpenIndex(suggestedOpenIndex === sI ? -1 : sI);
  };
  const handleAssign = (sI) => {
    if (replacingSlot !== -1) {
      const selectedCarer = suggestedCarers[sI];
      setCurrentCarers(prev => {
        const newCurrent = [...prev];
        newCurrent[replacingSlot] = { name: selectedCarer, distance: 'N/A' };
        return newCurrent;
      });
      setSuggestedCarers(prev => prev.filter((_, index) => index !== sI));
      onItemClick(replacingSlot);
    }
    setSuggestedOpenIndex(-1);
    setReplacingSlot(-1);
    // Do not hide suggested section after assignment
  };
  const handleDrop = (e, i) => {
    e.preventDefault();
    const sI = parseInt(e.dataTransfer.getData('text/plain'));
    if (sI >= 0 && sI < suggestedCarers.length) {
      const selectedCarer = suggestedCarers[sI];
      setCurrentCarers(prev => {
        const newCurrent = [...prev];
        newCurrent[i] = { name: selectedCarer, distance: 'N/A' };
        return newCurrent;
      });
      setSuggestedCarers(prev => prev.filter((_, index) => index !== sI));
      onItemClick(i);
    }
    setSuggestedOpenIndex(-1);
    setCurrentOpenIndex(-1);
    setReplacingSlot(-1);
    // Do not hide suggested section after drag-drop assignment
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setCurrentOpenIndex(-1);
        setSuggestedOpenIndex(-1);
        setShowSuggested(false);
        setReplacingSlot(-1);
      }
    };
    const isAnyOpen = currentOpenIndex !== -1 || suggestedOpenIndex !== -1 || showSuggested;
    if (isAnyOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [currentOpenIndex, suggestedOpenIndex, showSuggested]);
  return (
    <div ref={containerRef} className="kujas-PPOlaujmss HYhaks-PPPOplssaw">
      {currentCarers.map((item, i) => {
        const isOpen = currentOpenIndex === i;
        const globalIndex = i;
        const carerIndex = getCarerIndex(item);
        return (
          <div key={i} style={{ position: 'relative' }}>
            <div
              className={`DD-Day ${globalIndex === activeIndex ? 'actived' : ''}`}
              onClick={!showSuggested ? () => handleToggleCurrent(i) : undefined}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, i)}
            >
              <div className='Roosth-Gb-S Uyjayhjs-PPo'>
                <div className='DDD-Booxs'>
                  <div className='NGbas-CCads'>
                    <div className='HGh-Tabl-Gbs'>
                      <div className='HGh-Tabl-Gbs-Tit'>
                        <h3>
                          <b className="initials">{getInitials(item.name)}</b>
                          <span className='Cree-Name'>
                            <span>{item.name}</span>
                          </span>
                        </h3>
                      </div>
                      <div className='HGh-Tabl-Gbs-Badgs'>
                        <span><IconWalk /></span>
                        <span><ArrowsRightLeftIcon /></span>
                        <span>{item.distance}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {isOpen && (
              <div
                className="current-dropdown"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  background: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  zIndex: 1000,
                  minWidth: '200px',
                }}
              >
                <button
                  onClick={() => {
                    handleViewProfile(item);
                    setCurrentOpenIndex(-1);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  View profile
                </button>
                <button
                  onClick={() => {
                    setReplacingSlot(i);
                    setShowSuggested(true);
                    setCurrentOpenIndex(-1);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  Replace carer
                </button>
              </div>
            )}
          </div>
        );
      })}
      {showSuggested && (
        <>
          <div
            className="suggest-header"
            style={{ padding: '10px', fontWeight: 'bold', borderBottom: '1px solid #ccc' }}
          >
            Suggest carers for this visit
          </div>
          {suggestedCarers.map((item, sI) => {
            const globalIndex = sI + currentCarers.length;
            const isOpen = suggestedOpenIndex === sI;
            return (
              <div key={sI} style={{ position: 'relative' }}>
                <div
                  className={`DD-Day ${globalIndex === activeIndex ? 'actived' : ''}`}
                  onClick={() => handleToggleSuggested(sI)}
                  draggable={true}
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', sI.toString())}
                >
                  <div className='Roosth-Gb-S Uyjayhjs-PPo'>
                    <div className='DDD-Booxs'>
                      <div className='NGbas-CCads'>
                        <div className='HGh-Tabl-Gbs'>
                          <div className='HGh-Tabl-Gbs-Tit'>
                            <h3>
                              <b className="initials">{getInitials(item)}</b>
                              <span className='Cree-Name'>
                                <span>{item}</span>
                              </span>
                            </h3>
                          </div>
                          <div className='HGh-Tabl-Gbs-Badgs'>
                            <span><IconWalk /></span>
                            <span><ArrowsRightLeftIcon /></span>
                            <span>N/A</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {isOpen && (
                  <div
                    className="suggested-dropdown"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      background: 'white',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      zIndex: 1000,
                      minWidth: '200px',
                    }}
                  >
                    <button
                      onClick={() => {
                        handleViewProfile(item);
                        setSuggestedOpenIndex(-1);
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '8px',
                        border: 'none',
                        background: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      View profile
                    </button>
                    <button
                      onClick={() => handleAssign(sI)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '8px',
                        border: 'none',
                        background: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      Assign carer to visit
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};
export default CareTeam;