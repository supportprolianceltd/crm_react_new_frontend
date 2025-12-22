import React, { useRef, useEffect, useState } from 'react';
import {
  ChevronRightIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  CalendarDaysIcon,
  CubeTransparentIcon,
  UserPlusIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  BriefcaseIcon,
  UserIcon,
  UsersIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { IconUserCheck, IconProgressCheck, IconUserHeart, IconAlertTriangle } from '@tabler/icons-react';
import { IconCarGarage } from '@tabler/icons-react';
import './CareVisits.css';
import { fetchClientVisits } from '../../../config/apiConfig';
import { apiClient } from '../../../../../../config';
import { fetchSingleEmployee } from '../../../../Employees/config/apiService';
import MyTasksContent from './MyTasksContent/MyTasksContent';

const CareVisits = ({clientData}) => {
  const clientId = clientData?.id;
  const [visits, setVisits] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const partsRef = useRef([]);
  const rafRef = useRef(null);
  const [dragDirection, setDragDirection] = useState(null);
  const [activeIndex, setActiveIndex] = useState(new Date().getDay() - 1 >= 0 ? new Date().getDay() - 1 : 6);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [isDragging, setIsDragging] = useState(false);
  const shouldAutoScroll = useRef(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState('weekly');
  const [openItems, setOpenItems] = useState(new Set());
  const [tasksData, setTasksData] = useState([]);
  const [weekDays, setWeekDays] = useState(() => {
    const baseDate = new Date();
    const day = baseDate.getDay();
    const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(baseDate);
    monday.setDate(diff);
    return [...Array(7)].map((_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date;
    });
  });
  // New states for modal
  const [showModal, setShowModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  // Helper to remove sensitive fields from employee objects before logging/attaching
  const sanitizeEmployee = (emp = {}) => {
    const { password, two_factor_secret, two_factor_backup_codes, ...rest } = emp;
    return rest;
  };
  // Map a sanitized employee object into a small UI-friendly carer object
  const mapEmployeeToUiCarer = (u = {}) => {
    const profile = u.profile || {};
    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username || u.email || '';
    return {
      id: u.id,
      name: fullName,
      image: profile.profile_image_url || null,
      distance: '0.0km',
      mobility: profile.is_driver ? 'car' : 'walk',
      mobilityDisplay: profile.is_driver ? 'Driving' : 'Walking',
      location: [profile.street, profile.city, profile.state, profile.country].filter(Boolean).join(', '),
      availability: profile.availability ? 'Available' : 'Not available',
      maxHours: '40 hours per week',
      specialisation: (profile.skill_details && profile.skill_details[0] && (profile.skill_details[0].skill_name || profile.skill_details[0].name)) || 'No skill provided',
      availableTime: '8:00 am - 5:00 pm',
      raw: u,
    };
  };
    useEffect(() => {
      const loadVisits = async () => {
        if (!clientId) {
          setError("Client ID is required");
          setLoading(false);
          return;
        }
 
          try {
            setLoading(true);
            const data = await fetchClientVisits(clientId);
            // Do not change rendering yet — just store the raw response
            // Support several response shapes: array, { results: [] }, or { items: [] }
            let payload = [];
            if (data) {
              if (Array.isArray(data)) payload = data;
              else if (Array.isArray(data.results)) payload = data.results;
              else if (Array.isArray(data.items)) payload = data.items;
              else payload = [];
            }
            setVisits(payload);
            // If any visits include a carerId, fetch those carer details, sanitize and attach them to visits.
            try {
                // Collect carerIds from both top-level `carerId` and `assignees` entries
                const carerIds = Array.from(
                  new Set(
                    payload.flatMap((v) => {
                      if (!v) return [];
                      const ids = [];
                      if (v.carerId) ids.push(v.carerId);
                      if (Array.isArray(v.assignees)) {
                        v.assignees.forEach((a) => {
                          if (a && a.carerId) ids.push(a.carerId);
                        });
                      }
                      return ids;
                    })
                  )
                );

                if (carerIds.length > 0) {
                  const carerPromises = carerIds.map((id) =>
                    fetchSingleEmployee(id).catch((e) => {
                      return null;
                    })
                  );
                  const carerResults = await Promise.all(carerPromises);
                  const carersById = {};
                  carerResults.forEach((c, idx) => {
                    if (c) carersById[carerIds[idx]] = c;
                  });
                  // Sanitize carers and map to UI-friendly carer objects before attaching
                  const sanitizedCarersById = {};
                  const uiCarersById = {};
                  Object.keys(carersById).forEach((k) => {
                    const s = sanitizeEmployee(carersById[k]);
                    sanitizedCarersById[k] = s;
                    uiCarersById[k] = mapEmployeeToUiCarer(s);
                  });
                  // Attach sanitized UI carer objects into each visit. If a visit has multiple assignees, create `carers` array.
                  const enriched = payload.map((v) => {
                    const ids = [];
                    if (v.carerId) ids.push(v.carerId);
                    if (Array.isArray(v.assignees)) {
                      v.assignees.forEach((a) => {
                        if (a && a.carerId) ids.push(a.carerId);
                      });
                    }
                    const uniqueIds = Array.from(new Set(ids));
                    const carers = uniqueIds.map((id) => uiCarersById[id]).filter(Boolean);
                    return {
                      ...v,
                      carers,
                      carer: carers[0] || null,
                    };
                  });
                  setVisits(enriched);
                  // Extract all tasks from visits (guard against missing tasks)
                  const allTasks = enriched.flatMap((visit) => (Array.isArray(visit.tasks) ? visit.tasks.map((task) => ({ ...task, visitId: visit.id })) : []));
                  setTasksData(allTasks);
                }
            } catch (e) {
            }
          } catch (err) {
            setError('Failed to fetch client visits');
          } finally {
            setLoading(false);
          }
      };
 
      loadVisits();
    }, [clientId]);
  // Helper to parse startTime (e.g., '6:00 AM') to 24-hour integer
  const getStartHour = (startTime) => {
    if (!startTime) return 0;
    const [time, period] = startTime.split(' ');
    let [hourStr, minStr] = time.split(':');
    let hour = parseInt(hourStr, 10);
    const min = parseInt(minStr, 10);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return hour;
  };
  // Helper to get hour from ISO date string
  const getHourFromISO = (iso) => {
    const date = new Date(iso);
    return date.getHours();
  };
  // Helper to format time from ISO date string
  const formatTimeFromISO = (iso) => {
    const date = new Date(iso);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };
  const getStatusClass = (status) => {
    switch (status) {
      case 'Scheduled':
      case 'SCHEDULED':
        return 'Isstatus-scheduled';
      case 'In Progress':
      case 'IN_PROGRESS':
        return 'Isstatus-in-progress';
      case 'Completed':
      case 'COMPLETED':
        return 'Isstatus-completed';
      default:
        return 'status-default';
    }
  };
  const completeTask = (taskId) => {
    setTasksData(prev => {
      const task = prev.find(t => t.id === taskId);
      if (!task) return prev;
      const hasProgress = task.progress && task.progress.total > 0;
      const hasCarers = task.allocatedCarers > 0 && task.carer;
      if (!hasProgress || !hasCarers) {
        // Optionally, you could add a toast/alert here to notify the user
        // e.g., alert('Cannot complete task: Missing progress or carer assignment.');
        return prev;
      }
      return prev.map(t => t.id === taskId ? {...t, status: 'Completed'} : t);
    });
  };
  // New handler for closing modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVisit(null);
    setSelectedTask(null);
  };

  // Persist staged carers/drivers for a visit when user clicks Save Visit
  const handleSaveVisit = async (visit, selectedCarers = [], selectedDrivers = []) => {
    if (!visit || !visit.id) throw new Error('No visit to save');
    const visitId = visit.id;
    // build carer ids
    const carerIds = selectedCarers.filter(Boolean).map((c) => String(c.id));

    try {
      if (carerIds.length === 0) {
        // nothing to assign
        return;
      }

      if (carerIds.length === 1) {
        // single assign
        await apiClient.post(`/api/rostering/tasks/visits/${visitId}/assign`, {
          carerId: String(carerIds[0]),
          propagate: true,
        });
      } else {
        // batch assign
        await apiClient.post(`/api/rostering/tasks/visits/${visitId}/assign-batch`, {
          carerIds,
          propagate: true,
        });
      }

      // optimistic local update: attach carers to visit object
      const updatedVisit = {
        ...visit,
        carers: selectedCarers,
        carer: selectedCarers[0] || null,
        allocatedCarers: selectedCarers.filter(Boolean).length,
        carerId: carerIds[0] || null,
        assignees: carerIds.map(carerId => ({ carerId }))
      };

      setVisits((prev) =>
        prev.map((v) =>
          v.id === visitId ? updatedVisit : v
        )
      );

      // Also update selectedVisit if it matches
      setSelectedVisit((prevSelected) =>
        prevSelected && prevSelected.id === visitId ? updatedVisit : prevSelected
      );
    } catch (err) {
      throw err;
    }
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInside = event.target.closest('.visit-Main') || event.target.closest('.Visit-Dlt-DropDonw');
      if (!isClickInside) {
        setOpenItems(new Set());
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  useEffect(() => {
    if (!scrollRef.current || !shouldAutoScroll.current || isDragging) return;
    const topRow = scrollRef.current.querySelector('.GBJ-Parts.top-Uj');
    if (!topRow) return;
    const hourBlocks = topRow.querySelectorAll('.Div-DR');
    const hourWidth = hourBlocks[0]?.offsetWidth || 100;
    const selectedDateStr = selectedDay.toDateString();
    const dayVisits = visits.filter((visit) => {
      const visitDate = new Date(visit.startDate);
      return visitDate.toDateString() === selectedDateStr;
    });
    let earliestHour = 7; // Default to 7am if no visits
    if (dayVisits.length > 0) {
      earliestHour = Math.min(...dayVisits.map((visit) => getHourFromISO(visit.startDate)));
    }
    const targetScrollLeft = earliestHour * hourWidth;
    scrollRef.current.scrollLeft = targetScrollLeft;
    // Sync other day columns
    partsRef.current.forEach((part) => {
      if (part) {
        part.scrollLeft = targetScrollLeft;
      }
    });
  }, [selectedDay, isDragging, visits]);
  const startDrag = (pageX) => {
    isDown.current = true;
    setIsDragging(true);
    shouldAutoScroll.current = false;
    scrollRef.current.classList.add('active');
    startX.current = pageX;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };
  const stopDrag = () => {
    isDown.current = false;
    setIsDragging(false);
    scrollRef.current.classList.remove('active');
    setDragDirection(null);
  };
  const onMove = (currentX) => {
    if (!isDown.current) return;
    const walk = (startX.current - currentX) * 2;
    const newScrollLeft = scrollLeft.current + walk;
    if (walk > 0) setDragDirection('right');
    else if (walk < 0) setDragDirection('left');
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = newScrollLeft;
        partsRef.current.forEach((part) => (part.scrollLeft = newScrollLeft));
      }
    });
  };
  const onMouseDown = (e) => startDrag(e.pageX);
  const onMouseUp = stopDrag;
  const onMouseLeave = stopDrag;
  const onMouseMove = (e) => {
    e.preventDefault();
    onMove(e.pageX);
  };
  const onTouchStart = (e) => startDrag(e.touches[0].pageX);
  const onTouchMove = (e) => {
    e.preventDefault();
    onMove(e.touches[0].pageX);
  };
  const onTouchEnd = stopDrag;
  const handlePrevious = () => {
    const newDate = new Date(selectedDay);
    if (viewMode === 'weekly' || viewMode === 'today') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1, 1);
    }
    setSelectedDay(newDate);
    setWeekDays(getWeekDays(newDate));
    setActiveIndex(0);
    shouldAutoScroll.current = true;
  };
  const handleNext = () => {
    const newDate = new Date(selectedDay);
    if (viewMode === 'weekly' || viewMode === 'today') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1, 1);
    }
    setSelectedDay(newDate);
    setWeekDays(getWeekDays(newDate));
    setActiveIndex(0);
    shouldAutoScroll.current = true;
  };
  const handleToday = () => {
    const today = new Date();
    const todayIndex = today.getDay() - 1 >= 0 ? today.getDay() - 1 : 6;
    setSelectedDay(today);
    setWeekDays(getWeekDays(today));
    setActiveIndex(todayIndex);
    setViewMode('today');
    shouldAutoScroll.current = true;
  };
  const handleViewChange = (mode) => {
    setViewMode(mode);
    const newDate = new Date(selectedDay);
    if (mode === 'monthly') {
      newDate.setDate(1);
    }
    setSelectedDay(newDate);
    setWeekDays(getWeekDays(newDate));
    setActiveIndex(0);
    shouldAutoScroll.current = true;
  };
  const getWeekDays = (baseDate) => {
    const day = baseDate.getDay();
    const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(baseDate);
    monday.setDate(diff);
    return [...Array(7)].map((_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date;
    });
  };
  const getDateDisplay = () => {
    if (viewMode === 'today') {
      return selectedDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else if (viewMode === 'weekly') {
      const start = weekDays[0];
      const end = weekDays[6];
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(
        'en-US',
        { month: 'short', day: 'numeric', year: 'numeric' }
      )}`;
    } else {
      return selectedDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };
  const handleDayClick = (index, date) => {
    setActiveIndex(index);
    setSelectedDay(date);
    shouldAutoScroll.current = true;
  };
  const renderTaskDetail = (task, dayDate) => {
    const hasProgress = task.progress && task.progress.total > 0;
    const progressText = hasProgress ? `${task.progress.current}/${task.progress.total}` : null;
    const hasCarers = task.allocatedCarers > 0 && task.carer;
    const carersText = hasCarers ? task.allocatedCarers : null;
    const carers = hasCarers ? (Array.isArray(task.carer) ? task.carer : [task.carer]) : [];
    const firstCarer = carers[0];
    const secondCarer = carers.length > 1 ? carers[1] : null;
    const carerInitial = firstCarer ? firstCarer.name.charAt(0).toUpperCase() : '';
    return (
      <>
        <div className='Vistiit-TOop'>
          <h5>Visit Summary</h5>
          <p><CalendarDaysIcon /> {dayDate}</p>
          <p><ClockIcon /> {task.startTime} - {task.endTime}</p>
          {task.driver && (
            <p>
              <IconCarGarage/>
               <span className='yhaks-Driver'>Distance</span>
               {task.distance} km
            </p>
          )}
          <div className='Prog-Tastg'>
            {hasProgress && progressText && (
              <span className="task-progress-detail">
                <IconProgressCheck />
                {progressText}
              </span>
            )}
            {hasCarers && carersText && (
              <span className="carers-progress-detail">
                <IconUserHeart />
                {carersText}
              </span>
            )}
          </div>
        </div>
        {!hasProgress && (
          <div className='missing-notice'>
            <p>No task</p>
          </div>
        )}
        {!hasCarers && (
          <div className='missing-notice'>
            <p>No carer assigned</p>
          </div>
        )}
        <div className={`Vistiit-Foot ${getStatusClass(task.status)}`}>
          <p>{task.status}</p>
          {hasCarers && (
            <div className="carer-display">
              {firstCarer && (firstCarer.image ? (
                <img
                  src={firstCarer.image}
                  alt={firstCarer.name}
                />
              ) : (
                <span>
                  {carerInitial}
                </span>
              ))}
              {secondCarer && (secondCarer.image ? (
                <img
                  src={secondCarer.image}
                  alt={secondCarer.name}
                />
              ) : (
                <span>
                  {secondCarer.name.charAt(0).toUpperCase()}
                </span>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };
  const renderVisitDetail = (visit, dayDate) => {
    const hasCarer = visit.carer;
    const hasTasks = visit.tasks.length > 0;
    return (
      <>
        <div className='Vistiit-TOop'>
          <h5>Care Visit Summary</h5>
          <p><CalendarDaysIcon /> {dayDate}</p>
          <p><ClockIcon /> {formatTimeFromISO(visit.startDate)} - {formatTimeFromISO(visit.endDate)}</p>
          <p>Care Type: {formatCareType(visit.careType)}</p>
          <div className='Prog-Tastg'>
            {hasTasks && <span>Tasks: {visit.tasks.length}</span>}
          </div>
        </div>
        {!hasTasks && (
          <div className='missing-notice'>
            <p>No tasks assigned</p>
          </div>
        )}
        {!hasCarer && (
          <div className='missing-notice'>
            <p>No carer assigned</p>
          </div>
        )}
        <div className={`Vistiit-Foot ${getStatusClass(visit.status)}`}>
          <p>{visit.status}</p>
          {hasCarer && (
            <div className="carer-display" style={{ display: 'flex', alignItems: 'center' }}>
              {visit.carers && visit.carers.length > 0 ? (
                <>
                  {visit.carers.slice(0, 2).filter(carer => carer != null).map((carer, index) => (
                    <div 
                      key={carer.id || index} 
                      className="carer-avatar"
                      style={{
                        position: 'relative',
                        marginLeft: index > 0 ? '-8px' : '0',
                        zIndex: visit.carers.length - index,
                        border: '2px solid white',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f0f0f0',
                        fontSize: '10px',
                        fontWeight: '600'
                      }}
                    >
                      {carer?.image ? (
                        <img 
                          src={carer.image} 
                          alt={carer.name || 'Carer'}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                          }}
                        />
                      ) : (
                        <span>{getCarerInitials(carer?.name || 'Unknown')}</span>
                      )}
                    </div>
                  ))}
                  {visit.carers.length > 2 && (
                    <div 
                      className="carer-avatar carer-count"
                      style={{
                        position: 'relative',
                        marginLeft: '-8px',
                        zIndex: 0,
                        border: '2px solid white',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#e0e0e0',
                        fontSize: '9px',
                        fontWeight: '600',
                        color: '#666'
                      }}
                    >
                      <span>+{visit.carers.length - 2}</span>
                    </div>
                  )}
                </>
              ) : (
                // Fallback to single carer display if carers array not available
                visit.carer && (
                  <div 
                    className="carer-avatar"
                    style={{
                      border: '2px solid white',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f0f0f0',
                      fontSize: '10px',
                      fontWeight: '600'
                    }}
                  >
                    {visit.carer.image ? (
                      <img 
                        src={visit.carer.image} 
                        alt={visit.carer.name}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover' 
                        }}
                      />
                    ) : (
                      <span>{getCarerInitials(visit.carer.name)}</span>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </>
    );
  };
  const renderVisitsForHour = (dayIndex, hourIndex) => {
    const dayDate = weekDays[dayIndex].toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    const filteredVisits = visits.filter((visit) => {
      const visitDate = new Date(visit.startDate);
      return visitDate.toDateString() === weekDays[dayIndex].toDateString() && getHourFromISO(visit.startDate) === hourIndex;
    });
    if (filteredVisits.length === 0) return null;
    const isSundayDropdown = dayIndex === 6;
    const dropdownPositionStyle = isSundayDropdown
      ? { top: 'auto', bottom: '85%' }
      : { top: '85%' };
    const dropdownAnimation = {
      initial: { opacity: 0, y: -5 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -5 }
    };
    return filteredVisits.map((visit) => {
      const isVisitOpen = openItems.has(visit.id);
      const hasCarer = visit.carerId;
      const hasTasks = visit.tasks.length > 0;
      const hasMissing = !hasCarer || !hasTasks;
      return (
        <div
          key={visit.id}
          className="visit-item"
          style={{ position: 'relative' }}
          onMouseEnter={() => setOpenItems(prev => {
            const newSet = new Set(prev);
            newSet.add(visit.id);
            return newSet;
          })}
          onMouseLeave={() => setOpenItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(visit.id);
            return newSet;
          })}
        >
          <div className={`visit-Main ${getStatusClass(visit.status)}`}>
            <div className='TGhs-Pols'
              onClick={() => {
                    setSelectedVisit(visit);
                    setShowModal(true);
                    // Close the dropdown to avoid overlap/confusion
                    setOpenItems(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(visit.id);
                      return newSet;
                    });
                  }}
            ></div>
            <div className='ooka-Dlt'>
              <p>
                Care Visit <span className='Ghggs-Spans'>{formatTimeFromISO(visit.startDate)} - {formatTimeFromISO(visit.endDate)}</span>
              </p>

            </div>
            <div className='ooka-IICon'>
              <span className={hasMissing ? 'error-icon' : ''}>
                {hasMissing ? <IconAlertTriangle /> : <IconUserCheck />}
              </span>
            </div>

          <AnimatePresence>
            {isVisitOpen && (
              <motion.div
                initial={dropdownAnimation.initial}
                animate={dropdownAnimation.animate}
                exit={dropdownAnimation.exit}
                transition={{ duration: 0.2 }}
                className="Visit-Dlt-DropDonw"
                style={{
                  ...dropdownPositionStyle,
                }}
              >
                <div
                  className='Visit-Dlt-DropDonw-Main'
                  onClick={() => {
                    setSelectedVisit(visit);
                    setShowModal(true);
                    // Close the dropdown to avoid overlap/confusion
                    setOpenItems(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(visit.id);
                      return newSet;
                    });
                  }}
                >
                  {renderVisitDetail(visit, dayDate)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </div>
      );
    });
  };
  // Helper to get carer initials (adapted from MyTasks)
  const getCarerInitials = (carerName) => {
    if (!carerName) return "";
    const names = carerName.split(" ");
    return names.map((name) => name.charAt(0).toUpperCase()).join("");
  };
  // Map backend careType enums to user-friendly labels
  const formatCareType = (careType) => {
    if (!careType) return 'Single handed call';
    switch (careType) {
      case 'DOUBLE_HANDED_CALL':
        return 'Double handed call';
      case 'SPECIALCARE':
        return 'Special';
      case 'SINGLE_HANDED_CALL':
      default:
        return 'Single handed call';
    }
  };
  return (
    <div className="MyTasks_Sec">
      <div className="CareVisits-PPmana">
        <div className="TAx-AMijs-2">
          <div className="PPl-Tops">
            <ul className="Ul-OKik">
            
              <li onClick={handlePrevious}>
                <ChevronLeftIcon />
              </li>
              <li onClick={handleNext}>
                <ChevronRightIcon />
              </li>
              <li>
                {getDateDisplay()}
              </li>
               <li
                className={`WIthBRd-UIK-VBOx ${viewMode === 'today' ? 'active-view' : ''}`}
                onClick={handleToday}
              >
                <CalendarDaysIcon /> Today
              </li>
            </ul>
           <div className='JJujn-Btnshs'>
            {/* <button className='btn-primary-bg'><UserPlusIcon />Schedule care visit</button> */}
            <button className='download-Viss-Btn'>Download care visits<ArrowDownTrayIcon /></button>
           </div>
          </div>
          <div className="Task-Calindees" style={{ position: 'relative' }}>
            <div className="Taxy-Days">
              <div className="DD-Day top-Uj"></div>
              {weekDays.map((date, i) => {
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={i}
                    className={`DD-Day ${isToday ? 'active-today' : ''} ${activeIndex === i ? 'active' : ''}`}
                    onClick={() => handleDayClick(i, date)}
                  >
                    <h3>{String(date.getDate()).padStart(2, '0')}</h3>
                    <p>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]}</p>
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
                  const hour = i % 12 === 0 ? 12 : i % 12;
                  const ampm = i < 12 ? "am" : "pm";
                  return (
                    <div className="Div-DR" key={i}>
                      <p className="Tol-OPLSA">{`${hour}${ampm}`}</p>
                    </div>
                  );
                })}
              </div>
              {[...Array(7)].map((_, dayIndex) => (
                <div className="GBJ-Parts" key={dayIndex} ref={(el) => partsRef.current[dayIndex] = el}>
                  {[...Array(24)].map((_, hourIndex) => (
                    <div
                      className="Div-DR"
                      key={`${dayIndex}-${hourIndex}`}
                    >
                      {renderVisitsForHour(dayIndex, hourIndex)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Modal from MyTasks, adapted for CareVisits */}
      <AnimatePresence>
        {showModal && (selectedVisit || selectedTask) && (
          <motion.div
            className="modal-overlay" // You can add dynamic classes like in MyTasks if needed (e.g., based on time)
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 99999,
            }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="TaSt-Modal-COntsn" // Reuse class from MyTasks CSS
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="TAxT-close-modal-button"
                onClick={handleCloseModal}
              >
                <XMarkIcon />
              </button>

              {selectedVisit ? (
                <MyTasksContent visit={selectedVisit} clientName={clientData?.name} onComplete={(taskId) => completeTask(taskId)} onSaveVisit={handleSaveVisit} />
              ) : selectedTask ? (
                <MyTasksContent task={selectedTask} onComplete={() => completeTask(selectedTask.id)} onSaveVisit={handleSaveVisit} />
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default CareVisits;

