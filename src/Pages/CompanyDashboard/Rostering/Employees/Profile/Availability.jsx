import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  ChevronRightIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  CalendarDaysIcon,
  CubeTransparentIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowDownIcon,
  BarsArrowDownIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const Availability = ({ employeeData }) => {
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

  // Modal states
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [availabilityDate, setAvailabilityDate] = useState('');
  const [startHour, setStartHour] = useState(9);
  const [startMin, setStartMin] = useState(0);
  const [endHour, setEndHour] = useState(17);
  const [endMin, setEndMin] = useState(0);
  const [type, setType] = useState('available');
  const [reason, setReason] = useState('');
  const [frequency, setFrequency] = useState('once');
  const [frequencyStartDate, setFrequencyStartDate] = useState('');
  const [frequencyEndDate, setFrequencyEndDate] = useState('');
  const [frequencyEndType, setFrequencyEndType] = useState('recurring');

  const availabilities = useMemo(() => {
    if (!employeeData?.availability) return [];

    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const result = [];

    daysOfWeek.forEach((day, index) => {
      const dayData = employeeData.availability[day];

      if (dayData?.available) {
        const [startHour, startMin] = dayData.start.split(':').map(Number);
        const [endHour, endMin] = dayData.end.split(':').map(Number);
        result.push({
          dayIndex: index,
          startHour,
          startMin,
          endHour,
          endMin,
          type: 'available',
        });
      } else {
        // If not available, add absent for the whole day or nothing
        // For simplicity, add absent from 9 to 17
        result.push({
          dayIndex: index,
          startHour: 9,
          startMin: 0,
          endHour: 17,
          endMin: 0,
          type: 'absent',
          reason: 'Not available',
        });
      }
    });

    return result;
  }, [employeeData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getFirstEventHour = (date) => {
    const dayStr = date.toDateString();
    const events = availabilities.filter(a => new Date(a.date).toDateString() === dayStr);
    if (events.length === 0) return 0;
    const earliest = events.reduce((min, a) => a.startHour < min.startHour ? a : min, events[0]);
    return earliest.startHour;
  };

  const getAvailabilityWidth = (availability) => {
    const startInMinutes = availability.startHour * 60 + availability.startMin;
    const endInMinutes = availability.endHour * 60 + availability.endMin;
    const duration = endInMinutes - startInMinutes;
    return (duration / 60) * 100;
  };

  const getAvailabilityOffset = (availability) => {
    const startInMinutes = availability.startHour * 60 + availability.startMin;
    return (startInMinutes % 60) / 60 * 100;
  };

  const formatTime = (hour, minute) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const getAvailabilityTimeLabel = (availability) => {
    const startTime = formatTime(availability.startHour, availability.startMin);
    const endTime = formatTime(availability.endHour, availability.endMin);
    return `${startTime} - ${endTime}`;
  };

  const getDurationLabel = (availability) => {
    const totalMinutes = (availability.endHour - availability.startHour) * 60 + (availability.endMin - availability.startMin);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const seconds = 0;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

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

  const [weekDays, setWeekDays] = useState(getWeekDays(new Date()));

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

  // Modal functions
  const resetForm = () => {
    setAvailabilityDate('');
    setStartHour(9);
    setStartMin(0);
    setEndHour(17);
    setEndMin(0);
    setType('available');
    setReason('');
    setFrequency('once');
    setFrequencyStartDate('');
    setFrequencyEndDate('');
    setFrequencyEndType('recurring');
    setIsDirty(false);
  };

  const handleFrequencyChange = (val) => {
    setFrequency(val);
    if (val !== 'custom') {
      setFrequencyStartDate('');
      setFrequencyEndDate('');
      setFrequencyEndType('recurring');
    }
  };

  const handleAddNew = () => {
    setEditIndex(null);
    resetForm();
    const today = new Date().toISOString().split('T')[0];
    setAvailabilityDate(today);
    setOpen(true);
  };

  const handleEdit = (index) => {
    const avail = availabilities[index];
    setEditIndex(index);
    setAvailabilityDate(avail.date);
    setStartHour(avail.startHour);
    setStartMin(avail.startMin);
    setEndHour(avail.endHour);
    setEndMin(avail.endMin);
    setType(avail.type);
    setReason(avail.reason || '');
    setFrequency('once'); // Default for edit
    setIsDirty(false);
    setOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!availabilityDate || startHour >= endHour || (startHour === endHour && startMin >= endMin)) {
      alert('Please fill in valid date and time range');
      return;
    }
    if (type === 'absent' && !reason) {
      alert('Please provide a reason for absence');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      const newAvail = {
        date: availabilityDate,
        startHour,
        startMin,
        endHour,
        endMin,
        type,
        reason: type === 'absent' ? reason : undefined,
        frequency,
        frequencyStartDate: frequency === 'custom' ? frequencyStartDate : undefined,
        frequencyEndDate: frequency === 'custom' ? frequencyEndDate : undefined,
        frequencyEndType: frequency === 'custom' ? frequencyEndType : undefined,
      };
      if (editIndex !== null) {
        // Update existing - but since availabilities is static, simulate by logging or use state
        console.log('Updated availability:', newAvail);
      } else {
        // Add new
        console.log('Added availability:', newAvail);
      }
      setSaving(false);
      setOpen(false);
      setEditIndex(null);
      resetForm();
    }, 1000);
  };

  const handleCancel = () => {
    setOpen(false);
    setEditIndex(null);
    resetForm();
  };

  const handleFormChange = () => {
    if (editIndex !== null) setIsDirty(true);
  };

  const isMuted = editIndex !== null && !isDirty;

  const startTimeValue = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
  const endTimeValue = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

  const handleStartTimeChange = (e) => {
    const [hour, min] = e.target.value.split(':').map(Number);
    setStartHour(hour);
    setStartMin(min);
    setIsDirty(true);
  };

  const handleEndTimeChange = (e) => {
    const [hour, min] = e.target.value.split(':').map(Number);
    setEndHour(hour);
    setEndMin(min);
    setIsDirty(true);
  };

  const handleDateChange = (e) => {
    if (frequency === 'once') {
      setAvailabilityDate(e.target.value);
    } else {
      setFrequencyStartDate(e.target.value);
    }
    setIsDirty(true);
  };

  const handleEndDateRadioChange = (val) => {
    setFrequencyEndType(val);
    if (val === 'recurring') {
      setFrequencyEndDate('');
    }
    setIsDirty(true);
  };

  const handleEndDateInputChange = (e) => {
    setFrequencyEndDate(e.target.value);
    setIsDirty(true);
  };

  useEffect(() => {
    if (!scrollRef.current || !shouldAutoScroll.current || isDragging) return;
    const topRow = scrollRef.current.querySelector('.GBJ-Parts.top-Uj');
    if (!topRow) return;
    const hourBlocks = topRow.querySelectorAll('.Div-DR');
    const hourWidth = hourBlocks[0]?.offsetWidth || 100;
    const dayDate = weekDays[activeIndex];
    const firstHour = getFirstEventHour(dayDate);
    const scrollTo = firstHour * hourWidth;
    scrollRef.current.scrollLeft = scrollTo;
    partsRef.current.forEach((part) => (part.scrollLeft = scrollTo));
  }, [selectedDay, activeIndex, isDragging, weekDays, availabilities]);

  return (
    <div className="Availability_Sec Mains-TThabs-Page">
      <div className="YUhsn-Avvains">
        <div className="TAx-AMijs-2">
          <div className="PPl-Tops">
            <ul className="Ul-OKik">
              <li
                className={`WIthBRd-UIK-VBOx ${viewMode === 'today' ? 'active-view' : ''}`}
                onClick={handleToday}
              >
                <CalendarDaysIcon /> Today
              </li>
              <li onClick={handlePrevious}>
                <ChevronLeftIcon />
              </li>
              <li onClick={handleNext}>
                <ChevronRightIcon />
              </li>
              <li>
                {getDateDisplay()} <ChevronDownIcon />
              </li>
            </ul>
            <div className='cccll-Gbajjs-Main'>
              <button className='btn-primary-bg' onClick={handleAddNew}>
                <PlusIcon /> Add Availability
              </button>
              <button className='btn-primary-bg'>Schedule Absence</button>
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
                  const hourStr = i.toString().padStart(2, '0');
                  return (
                    <div className="Div-DR" key={i}>
                      <p className="Tol-OPLSA">{`${hourStr}:00`}</p>
                    </div>
                  );
                })}
              </div>
              {[...Array(7)].map((_, dayIndex) => (
                <div className="GBJ-Parts" key={dayIndex} ref={(el) => partsRef.current[dayIndex] = el}>
                  {[...Array(24)].map((_, hourIndex) => (
                    <div className="Div-DR" key={`${dayIndex}-${hourIndex}`}>
                      {availabilities
                        .filter((availability) => {
                          return availability.dayIndex === dayIndex && availability.startHour === hourIndex;
                        })
                        .map((availability, idx) => {
                          const width = getAvailabilityWidth(availability);
                          const offset = getAvailabilityOffset(availability);
                          const timeLabel = getAvailabilityTimeLabel(availability);
                          const durationLabel = getDurationLabel(availability);
                          const isAvailable = availability.type === 'available';
                          const bgColor = isAvailable ? '#d4edda' : '#FFF8E6';
                          const borderColor = isAvailable ? '#28a745' : '#ffe29aff';
                          const textColor = isAvailable ? '#155724' : '#b0934aff';
                          return (
                            <div
                              key={idx}
                              className="AvailabilityBar"
                              style={{
                                width: `${width}%`,
                                left: `${offset}%`,
                                backgroundColor: bgColor,
                                border: `1px solid ${borderColor}`,
                                color: textColor,
                              }}
                              title={isAvailable ? `${timeLabel} - ${durationLabel}` : `${timeLabel} - ${availability.reason}`}
                              onClick={() => handleEdit(availabilities.findIndex(a => a.dayIndex === availability.dayIndex && a.startHour === availability.startHour && a.startMin === availability.startMin))}
                            >
                              {isAvailable ? (
                                <>
                                  <div>{timeLabel}</div>
                                  <span className="duration-label">{durationLabel}</span>
                                </>
                              ) : (
                                <div>{availability.reason}</div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className='add-task-backdrop'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
            />

            <motion.div
              className='add-task-panel'
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className='TTas-Boxxs custom-scroll-bar'>
                <div className='TTas-Boxxs-Top'>
                  <h4>{editIndex !== null ? 'Edit Availability' : 'Add Availability'}</h4>
                  <p>Schedule your available time slots</p>
                </div>

                <div className='TTas-Boxxs-Body'>
                  <form onSubmit={handleSave} className='add-task-form'>

                    <div className="TTtata-Selltss">
                      <h4>Select Frequency</h4>
                      <div className="TTtata-Selltss-LInBt">
                        <label>
                          <input
                            type="radio"
                            name="frequency"
                            value="once"
                            checked={frequency === "once"}
                            onChange={() => handleFrequencyChange("once")}
                          />
                          Once
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="frequency"
                            value="weekly"
                            checked={frequency === "weekly"}
                            onChange={() => handleFrequencyChange("weekly")}
                          />
                          Weekly
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="frequency"
                            value="monthly"
                            checked={frequency === "monthly"}
                            onChange={() => handleFrequencyChange("monthly")}
                          />
                          Monthly
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="frequency"
                            value="custom"
                            checked={frequency === "custom"}
                            onChange={() => handleFrequencyChange("custom")}
                          />
                          Custom
                        </label>
                      </div>
                    </div>

                    <AnimatePresence>
                      {frequency === "custom" && (
                        <motion.div
                          className="cusTom-Sec"
                          initial={{ opacity: 0, height: 0, y: -6 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -6 }}
                          transition={{ type: "tween", duration: 0.22 }}
                        >
                          <div className="cusTom-Sec-Maind">
                          
                            <div className="TTtata-Selltss">
                              <div className="TTtata-Selltss-LInBt Yhsa-Pola">
                                <label>
                                  Repeat Every
                                </label>
                                <div className='Yhsa-Pola-Inputs'>
                                <input type="number" />
                                <select>
                                  <option value="">Days</option>
                                   <option value="">Weeks</option>
                                    <option value="">Months</option>
                                </select>
                                </div>
                               
                              </div>
                            </div>
                            
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                      <div className="cusTom-Sec">
                          <h3>Select time</h3>
                          <div className="cusTom-Sec-Main">
                            <div className="TTtata-Input">
                              <label>Start Time</label>
                              <input
                                type="time"
                                value={startTimeValue}
                                onChange={handleStartTimeChange}
                                required
                              />
                            </div>
                                  <div className="TTtata-Input">
                              <label>End Time</label>
                              <input
                                type="time"
                                value={endTimeValue}
                                onChange={handleEndTimeChange}
                                required
                              />
                            </div>
                          </div>
                        </div>

                    
               <div className="cusTom-Sec">
                          <div className="Hyhs-POlsa">
                            <div className="TTtata-Input">
                              <label>Start Date*</label>
                              <input
                                type="date"
                                value={frequency === "once" ? availabilityDate : frequencyStartDate}
                                onChange={handleDateChange}
                                required
                              />
                            </div>
                            <div className="TTtata-Selltss">
                              <h4>End Date* (select dates that suit)</h4>
                                     <div className="TTtata-Selltss-LInBt KKjm-OLks">
                                <label>
                                  <input
                                    type="radio"
                                    name="endTimeType"
                                    value="recurring"
                                    checked={frequencyEndType === "recurring"}
                                    onChange={() => handleEndDateRadioChange("recurring")}
                                  />
                                  Never
                                </label>
                              </div>

                              <div className="TTtata-Selltss-LInBt KKjm-OLks">
                                <label>
                                  <input
                                    type="radio"
                                    name="endTimeType"
                                    value="on"
                                    checked={frequencyEndType === "on"}
                                    onChange={() => handleEndDateRadioChange("on")}
                                  />
                                  On
                                </label>
                                {frequencyEndType === "on" && (
                                  <input
                                    type="date"
                                    value={frequencyEndDate}
                                    onChange={handleEndDateInputChange}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                    <div className='add-task-actions'>
                      <button type='button' className='close-task' onClick={handleCancel}>Cancel</button>
                      <button type='submit' className={`proceed-tast-btn btn-primary-bg ${isMuted ? 'muted' : ''}`} disabled={isMuted}>
                        {saving ? (
                          <>
                            <motion.div
                              initial={{ rotate: 0 }}
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              style={{
                                width: 15,
                                height: 15,
                                borderRadius: "50%",
                                border: "3px solid #fff",
                                borderTopColor: "transparent",
                                marginRight: "5px",
                                display: "inline-block",
                              }}
                            />
                            Saving..
                          </>
                        ) : (editIndex !== null ? 'Save Changes' : 'Add Availability')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Availability;