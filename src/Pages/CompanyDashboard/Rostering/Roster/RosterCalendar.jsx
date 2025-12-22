import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  UserIcon,
  UsersIcon,
  ChevronDownIcon,
  CalendarDaysIcon,
  CubeTransparentIcon,
  ClockIcon,
  ArrowsRightLeftIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { IconWalk, IconBus, IconCar, IconCaretDown, IconCarGarage } from "@tabler/icons-react";
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon as CheckCircleSolidIcon,
} from '@heroicons/react/24/solid';

import { Link } from "react-router-dom";

import CalendarDropdown from '../../../../components/CalendarDropdown/CalendarDropdown';

import RosterDetails from './RosterContents/Details';
import CareTeam from './RosterContents/CareTeam';
import RosterTask from './RosterContents/RosterTask';
import RosterActivities from './RosterContents/RosterActivities';
import LoadingState from '../../../../components/LoadingState';
import EmptyState from '../../../../components/EmptyState';

// Utility functions to format time and calculate duration
const formatTime = (dateString) => {
  if (!dateString) return '00:00';
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return '0hrs 0min';
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end - start;
  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;
  return `${hours}hrs ${minutes}min`;
};

const formatDurationToHours = (durationStr) => {
  if (!durationStr || durationStr === 'N/A') return 'N/A';
  const match = durationStr.match(/(\d+)\s*mins?/);
  if (match) {
    const totalMins = parseInt(match[1], 10);
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hours === 0) {
      return `${mins} mins`;
    } else if (mins === 0) {
      return `${hours} hrs`;
    } else {
      return `${hours} hrs ${mins} mins`;
    }
  }
  return durationStr;
};

// Define colors for different statuses
const TASK_COLORS = {
  'completed': {
    background: '#F0E9FF',
    border: '#8B4CFF',
    text: '#8B4CFF'
  },
  'in-progress': {
    background: '#feefff',
    border: '#F042FF',
    text: '#F042FF'
  },
  'upcoming': {
    background: '#dbeafe',
    border: '#3b82f6',
    text: '#1e40af'
  }
};

const tabs = ['Details', 'Carer', 'Tasks', 'Activities'];

// Memoized TaskItem component
const TaskItem = React.memo(({ task, selected, hourWidth, onTaskClick, carerProfiles }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Calculate position once
  const calculateTaskPosition = useCallback((startTime, endTime, widthPerHour) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    const left = (startTotalMinutes / 60) * widthPerHour;
    const width = ((endTotalMinutes - startTotalMinutes) / 60) * widthPerHour;
    
    return { left, width };
  }, []);

  const startTime = formatTime(task.startDate);
  const endTime = formatTime(task.endDate);
  
  const { left, width } = calculateTaskPosition(startTime, endTime, hourWidth);
  
  const taskColor = TASK_COLORS[task.status] || TASK_COLORS['in-progress'];

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).replace('-', ' ');

  // Get carer names from assignees
  const carerNames = task.assignees?.map(assignee => {
    const profile = carerProfiles[assignee.carerId];
    return profile ? `${profile.first_name} ${profile.last_name}` : 'Unassigned';
  }) || [];

  const callType = task.assignees?.length > 1 ? 'double' : 'single';

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    onTaskClick(task);
  }, [task, onTaskClick]);

  return (
    <motion.div
      className="calendar-task frg-PPOlas"
      style={{
        left: `${left}px`,
        width: `${width}px`,
        backgroundColor: taskColor.background,
        borderColor: taskColor.border,
        color: taskColor.text,
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={handleClick}
      onTouchStart={(e) => e.stopPropagation()}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      {showDetails && (
        <div className='DDRgs-DDPaols'>
          <h3>{task.client_name || 'Unknown Client'}</h3>
          <div className='UJkas-PPOlas-P'>
            <p>
              <span>Call</span>
              <b>{capitalize(callType)}</b>
            </p>
            <p>
              <span>Carer</span>
              <b>
                {carerNames.length === 1 
                  ? carerNames[0] 
                  : carerNames.length > 1
                  ? `${carerNames[0]} & ${carerNames[1]}`
                  : 'Unassigned'}
              </b>
            </p>
            <p>
              <span>Cluster</span>
              <b>{task.cluster_name || 'N/A'}</b>
            </p>
            <p>
              <span>Travel Time</span>
              <b>
                <span className='TTrabs-Sppka'>
                  {formatDurationToHours(task.assignees?.[0]?.duration || 'N/A')}
                </span>
              </b>
            </p>
            <p>
              <span>Driver</span>
              <b>{task.driver_assigned ? 'Assigned' : 'Not Assigned'}</b>
            </p>
            <p>
              <span>Status</span>
              <b>
                <span className={`sttahs-SPOPSna ${task.status}`}>{capitalize(task.status)}</span>
              </b>
            </p>
          </div>
        </div>
      )}
      <div className="task-content">
        <div className="task-name-container">
          {selected === 'Client' ? (
            <div className="task-name">
              <span>
                {carerNames.length === 1 
                  ? carerNames[0] 
                  : carerNames.length > 1
                  ? `${carerNames[0]} & ${carerNames[1]}`
                  : 'Unassigned'}
              </span>
            </div>
          ) : (
            <div className="task-name">
              <span>{task.client_name || 'Unknown'}</span>
            </div>
          )}
        </div>
        <div className="dRetask-call-type">
          {callType == 'single' ? (
            <p>
              <CheckCircleSolidIcon />
              <UserIcon className="call-icon" />
            </p>
          ) : (
            <p>
              <CheckCircleSolidIcon />
              <UsersIcon className="call-icon" />
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
});

TaskItem.displayName = 'TaskItem';

const RosterCalendar = ({ 
  selected, 
  activeIndex, 
  onItemClick,
  selectedDate,
  onDateChange,
  allVisits,
  carerProfiles,
  isLoading
}) => {
  const scrollRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const partsRef = useRef([]);
  const rafRef = useRef(null);
  const [dragDirection, setDragDirection] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hourWidth, setHourWidth] = useState(100);

  // Side panel state
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTab, setActiveTab] = useState('Details');
  const sidePanelRef = useRef(null);

  // Calendar state
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  const capitalize = useCallback((str) => str.charAt(0).toUpperCase() + str.slice(1).replace('-', ' '), []);

  const handleToggleCalendar = useCallback(() => {
    setShowCalendar((s) => !s);
  }, []);

  const handleDateSelect = useCallback((date) => {
    onDateChange(date);
    setShowCalendar(false);
  }, [onDateChange]);

  const handleTodayClick = useCallback(() => {
    onDateChange(new Date());
    setShowCalendar(false);
  }, [onDateChange]);

  const handlePrevDay = useCallback(() => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    onDateChange(prevDate);
  }, [selectedDate, onDateChange]);

  const handleNextDay = useCallback(() => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    onDateChange(nextDate);
  }, [selectedDate, onDateChange]);

  const handleTaskClick = useCallback((task) => {
    setSelectedTask(task);
    setShowSidePanel(true);
  }, []);

  const handleCloseSidePanel = useCallback(() => {
    setShowSidePanel(false);
  }, []);

  useEffect(() => {
    if (selectedTask) {
      setActiveTab('Details');
    }
  }, [selectedTask]);

  // Handle click outside for calendar
  useEffect(() => {
    function handleClickOutside(e) {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    }

    function handleKey(e) {
      if (e.key === 'Escape') {
        setShowCalendar(false);
        handleCloseSidePanel();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [handleCloseSidePanel]);

  // Handle click outside for side panel
  useEffect(() => {
    function handleClickOutside(e) {
      if (sidePanelRef.current && 
          !sidePanelRef.current.contains(e.target) && 
          !e.target.closest('.calendar-task')) {
        handleCloseSidePanel();
      }
    }

    if (showSidePanel) {
      // Add slight delay to prevent immediate trigger
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSidePanel, handleCloseSidePanel]);

  // Get unique clients from visits
  const uniqueClients = useMemo(() => {
    const clientMap = new Map();
    allVisits.forEach(visit => {
      if (visit.client_name && visit.clientId) {
        clientMap.set(visit.clientId, visit.client_name);
      }
    });
    return Array.from(clientMap.entries()).map(([id, name]) => ({ id, name }));
  }, [allVisits]);

  // Get unique carers from visits and profiles
  const uniqueCarers = useMemo(() => {
    const carerMap = new Map();
    allVisits.forEach(visit => {
      if (visit.assignees && Array.isArray(visit.assignees)) {
        visit.assignees.forEach(assignee => {
          if (assignee.carerId && carerProfiles[assignee.carerId]) {
            const profile = carerProfiles[assignee.carerId];
            carerMap.set(assignee.carerId, {
              id: assignee.carerId,
              name: `${profile.first_name} ${profile.last_name}`,
              profile: profile
            });
          }
        });
      }
    });
    return Array.from(carerMap.values());
  }, [allVisits, carerProfiles]);

  // Group visits by client or carer
  const groupedVisits = useMemo(() => {
    if (selected === 'Client') {
      return uniqueClients.map(client => ({
        entity: client,
        visits: allVisits.filter(visit => visit.clientId === client.id)
      }));
    } else {
      return uniqueCarers.map(carer => ({
        entity: carer,
        visits: allVisits.filter(visit => 
          visit.assignees?.some(assignee => assignee.carerId === carer.id)
        )
      }));
    }
  }, [selected, allVisits, uniqueClients, uniqueCarers]);

  const effectiveGroups = useMemo(() => {
    let groups = groupedVisits;
    const target = 30;
    if (groups.length < target) {
      const pads = Array.from({ length: target - groups.length }, (_, i) => ({
        entity: { id: `pad-${groups.length + i}`, name: '' },
        visits: []
      }));
      groups = [...groups, ...pads];
    }
    return groups;
  }, [groupedVisits]);

  const getInitials = useCallback((name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }, []);

  const getProfileImage = useCallback((profile) => {
    return profile?.profile?.profile_picture || null;
  }, []);

  // Function to find the earliest task start time
  const findEarliestTaskTime = useCallback(() => {
    let earliestTime = 24;
    
    allVisits.forEach(visit => {
      if (visit.startDate) {
        const date = new Date(visit.startDate);
        const startHour = date.getHours();
        if (startHour < earliestTime) {
          earliestTime = startHour;
        }
      }
    });
    
    return earliestTime === 24 ? 8 : earliestTime;
  }, [allVisits]);

  // Calculate hour width based on actual calendar grid
  useEffect(() => {
    const calculateHourWidth = () => {
      const hourColumnWidth = 100;
      setHourWidth(hourColumnWidth);
    };

    calculateHourWidth();
  }, []);

  // Auto-scroll to the earliest task time
  useEffect(() => {
    if (!scrollRef.current || !hourWidth) return;
    
    const earliestHour = findEarliestTaskTime();
    const scrollPosition = Math.max(0, (earliestHour - 1) * hourWidth);
    
    scrollRef.current.scrollLeft = scrollPosition;
    
    partsRef.current.forEach((part) => {
      if (part) part.scrollLeft = scrollPosition;
    });
  }, [hourWidth, selected, allVisits, findEarliestTaskTime]);

  const startDrag = useCallback((pageX) => {
    isDown.current = true;
    setIsDragging(true);
    scrollRef.current.classList.add('active');
    startX.current = pageX;
    scrollLeft.current = scrollRef.current.scrollLeft;
  }, []);

  const stopDrag = useCallback(() => {
    isDown.current = false;
    setIsDragging(false);
    scrollRef.current.classList.remove('active');
    setDragDirection(null);
  }, []);

  const onMove = useCallback((currentX) => {
    if (!isDown.current) return;
    const walk = (startX.current - currentX) * 2;
    const newScrollLeft = scrollLeft.current + walk;
    if (walk > 0) setDragDirection('right');
    else if (walk < 0) setDragDirection('left');
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = newScrollLeft;
        partsRef.current.forEach((part) => {
          if (part) part.scrollLeft = newScrollLeft;
        });
      }
    });
  }, []);

  const onMouseDown = useCallback((e) => startDrag(e.pageX), [startDrag]);
  const onMouseUp = useCallback(() => stopDrag(), [stopDrag]);
  const onMouseLeave = useCallback(() => stopDrag(), [stopDrag]);
  const onMouseMove = useCallback((e) => {
    e.preventDefault();
    onMove(e.pageX);
  }, [onMove]);
  
  const onTouchStart = useCallback((e) => startDrag(e.touches[0].pageX), [startDrag]);
  const onTouchMove = useCallback((e) => {
    e.preventDefault();
    onMove(e.touches[0].pageX);
  }, [onMove]);
  const onTouchEnd = useCallback(() => stopDrag(), [stopDrag]);

  const formattedDate = selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const panelFormattedDate = selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  // Show loading state
  if (isLoading) {
    return <LoadingState text="Loading roster data..." />;
  }

  const isEmptyState = groupedVisits.length === 0;

  return (
    <div className="TAx-AMijs">
      <div className="TAx-AMijs-2">
        <div className="Task-Calindees HYH-CCBAGs" style={{ position: 'relative' }}>
          <div className="Taxy-Days Wide-Taxy-Days">
            <div className="DD-Day top-Uj">
              <div className='GGH-TTOpl'>
                <div className='KLk-TTTOpa'>
                  <ul className='Ul-OKik'>
                    <li onClick={handlePrevDay}><ChevronLeftIcon /></li>
                    <li onClick={handleToggleCalendar} style={{ cursor: 'pointer', position: 'relative' }}>
                      <span className='cccal-BGbss'>{formattedDate}</span>
                      {showCalendar && (
                        <div
                          className="OOcalendar-container OOKls-Calendar-PP"
                          ref={calendarRef}
                        >
                          <CalendarDropdown
                            selectedDate={selectedDate}
                            onSelect={handleDateSelect}
                            onClose={() => setShowCalendar(false)}
                          />
                        </div>
                      )}
                    </li>
                    <li onClick={handleNextDay}><ChevronRightIcon /></li>
                    <li className='WIthBRd-UIK-VBOx' onClick={handleTodayClick} style={{ cursor: 'pointer' }}>
                      <CalendarDaysIcon /> Today
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {effectiveGroups.map((group, i) => {
              const entity = group.entity;
              const visits = group.visits;
              const isEmptyRow = entity.name === '';
              const displayName = isEmptyRow 
                ? (isEmptyState && i === 0 ? `No ${selected === 'Client' ? 'Clients' : 'Carers'} Scheduled` : '') 
                : entity.name;
              const onRowClick = isEmptyRow ? undefined : () => onItemClick(i);
              const rowClassName = `DD-Day ${i === activeIndex ? 'actived' : ''}`;
              
              let rowContent;
              if (isEmptyRow) {
                rowContent = (
                  <div className="DDD-Booxs">
                    <div className={selected === 'Client' ? 'Roosth-Gb-S-Top' : 'NGbas-CCads'}>
                      {selected === 'Client' ? (
                        <h2>{displayName}</h2>
                      ) : (
                        <div className="HGh-Tabl-Gbs">
                          <div className="HGh-Tabl-Gbs-Tit">
                            <h3>
                              <span className="Cree-Name">
                                <span>{displayName}</span>
                              </span>
                            </h3>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              } else if (selected === 'Client') {
                const taskCount = visits.length;
                const sortedVisits = [...visits].sort((a, b) => 
                  new Date(a.startDate) - new Date(b.startDate)
                );
                const firstVisit = sortedVisits[0];
                const lastVisit = sortedVisits[sortedVisits.length - 1];
                
                const timeRange = firstVisit && lastVisit
                  ? `${formatTime(firstVisit.startDate)} - ${formatTime(lastVisit.endDate)}`
                  : 'N/A';
                
                const totalDuration = firstVisit && lastVisit
                  ? calculateDuration(firstVisit.startDate, lastVisit.endDate)
                  : '0hrs 0min';
                
                const uniqueCarersSet = new Set();
                visits.forEach(visit => {
                  visit.assignees?.forEach(assignee => uniqueCarersSet.add(assignee.carerId));
                });
                const uniqueCarersCount = uniqueCarersSet.size;
                
                rowContent = (
                  <div className="DDD-Booxs">
                    <div className="Roosth-Gb-S-Top">
                      <h2>{entity.name}</h2>
                    </div>
                    <div className="Roosth-Gb-S-Sub">
                      <h5>
                        <b><CheckCircleIcon /> {taskCount}/20</b> 
                        <b><UserIcon /> {uniqueCarersCount}</b> 
                        <span><ClockIcon /> {timeRange}</span>
                      </h5>
                      <h6>{totalDuration}</h6>
                    </div>
                  </div>
                );
              } else {
                // Calculate actual distance from the carer's visits
                const actualDistance = visits.length > 0 && visits[0].assignees?.[0]?.distance 
                  ? visits[0].assignees[0].distance
                  : 'N/A';
                
                rowContent = (
                  <div className="DDD-Booxs">
                    <div className="NGbas-CCads">
                      <div className="HGh-Tabl-Gbs">
                        <div className="HGh-Tabl-Gbs-Tit">
                          <h3>
                            {getProfileImage(entity.profile) ? (
                              <img src={getProfileImage(entity.profile)} alt={entity.name} />
                            ) : (
                              <b className="initials">{getInitials(entity.name)}</b>
                            )}
                            <span className="Cree-Name">
                              <span>{entity.name}</span>
                            </span>
                          </h3>
                        </div>
                        <div className="HGh-Tabl-Gbs-Badgs">
                          <span><IconWalk /></span>
                          <span><ArrowsRightLeftIcon /></span>
                          <span>{actualDistance}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              
              const wrappedContent = isEmptyRow ? rowContent : <div className='Roosth-Gb-S'>{rowContent}</div>;
              
              return (
                <div
                  key={entity.id}
                  className={rowClassName}
                  onClick={onRowClick}
                >
                  {wrappedContent}
                </div>
              );
            })}
          </div>
          <AnimatePresence>
            {dragDirection === 'left' && (
              <motion.div
                key="left-arrow"
                className="drag-arrow left"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ChevronLeftIcon className="arrow-icon" />
              </motion.div>
            )}
            {dragDirection === 'right' && (
              <motion.div
                key="right-arrow"
                className="drag-arrow right"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <ChevronRightIcon className="arrow-icon" />
              </motion.div>
            )}
          </AnimatePresence>
          <div
            className="GBj-Mainso"
            ref={scrollRef}
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="GBJ-Parts top-Uj">
              {[...Array(24)].map((_, i) => {
                const hour = String(i).padStart(2, '0');
                return (
                  <div className="Div-DR" key={i} style={{ width: `${hourWidth}px` }}>
                    <p className="Tol-OPLSA">{`${hour}:00`}</p>
                  </div>
                );
              })}
            </div>
            {isEmptyState && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                  backgroundColor: 'transparent',
                  pointerEvents: 'none'
                }}
              >
                <EmptyState 
                  message="No visits scheduled for this date"
                  description="Try selecting a different date to view scheduled visits."
                />
              </div>
            )}
            {effectiveGroups.map((group, itemIndex) => (
              <div 
                className="GBJ-Parts task-row OUka-DropsDA" 
                key={group.entity.id}
                ref={(el) => { if (el) partsRef.current[itemIndex] = el; }}
                style={{ position: 'relative', width: `${24 * hourWidth}px` }}
              >
                {/* Time slots */}
                {[...Array(24)].map((_, hourIndex) => (
                  <div 
                    className="Div-DR" 
                    key={`${itemIndex}-${hourIndex}`}
                    style={{ width: `${hourWidth}px` }}
                  >
                  </div>
                ))}
                
                {/* Tasks */}
                {group.visits.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    selected={selected}
                    hourWidth={hourWidth}
                    onTaskClick={handleTaskClick}
                    carerProfiles={carerProfiles}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showSidePanel && (
          <motion.div 
            key="side-panel"
            ref={sidePanelRef}
            className='Rooster-SSIde-Sec'
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            onAnimationComplete={(definition) => {
              if (definition === 'exit') {
                setSelectedTask(null);
              }
            }}
          >
            {selectedTask && (
              <>
                <button className='Rooster-SSIde-Close' onClick={handleCloseSidePanel}><XMarkIcon /></button>
                <div className='Rooster-SSIde-Sec-TOP'>
                  <h3>
                    <b>{getInitials(selectedTask.client_name || 'Unknown')}</b>
                 <Link 
                  to='/company/rostering/profile' 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {selectedTask.client_name || 'Unknown Client'}
                </Link>
                  </h3>
                  <p>{`${formatTime(selectedTask.startDate)} - ${formatTime(selectedTask.endDate)}, ${panelFormattedDate}`}</p>
                  <h6>
                    <span className={`sttahs-SPOPSna ${selectedTask.status}`}>{capitalize(selectedTask.status)}</span>
                  </h6>
                </div>
                <div className='Rooster-SSIde-Sec-SSUb-TTO'>
                  <ul>
                    {tabs.map(tab => (
                      <li 
                        key={tab} 
                        className={activeTab === tab ? 'active' : ''} 
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className='Rooster-SSIde-Sec-MMMAins custom-scroll-bar'>
                  {activeTab === 'Details' && <RosterDetails task={selectedTask} carerProfiles={carerProfiles} />}
                  {activeTab === 'Carer' && <CareTeam task={selectedTask} carerProfiles={carerProfiles} activeIndex={activeIndex} onItemClick={onItemClick} />}
                  {activeTab === 'Tasks' && <RosterTask task={selectedTask} />}
                  {activeTab === 'Activities' && <RosterActivities />}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RosterCalendar;