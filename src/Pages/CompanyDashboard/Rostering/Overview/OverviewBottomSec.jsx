import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AiIcon from '../AiIcon';
import { Link } from "react-router-dom";
import CalendarDropdown from '../../../../components/CalendarDropdown/CalendarDropdown';
import {
  ClipboardDocumentListIcon,
  EllipsisHorizontalIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import {
  IconLayoutGrid,
  IconUserHeart,
  IconWalk,
  IconBus,
  IconCar,
} from "@tabler/icons-react";
import CareerImg1 from '../Img/Careers/1.jpg';
import CareerImg2 from '../Img/Careers/2.jpg';
import CareerImg3 from '../Img/Careers/3.jpg';
import CareerImg4 from '../Img/Careers/4.jpg';
import { apiClient } from '../../../../config';
import '../../../../components/SkeletonLoader.jsx';
import { fetchBulkUserDetails } from '../config/apiConfig';

const OverviewBottomSec = ({ visits = [], allVisits = [], carerProfiles = {}, selectedDate: parentSelectedDate, onDateChange }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(parentSelectedDate || new Date());
  const [weekDays, setWeekDays] = useState([]);
  // ✅ Compute week (Mon–Sun) for selected date
  const getWeekDays = (date) => {
    const dayOfWeek = date.getDay(); // Sunday = 0, Monday = 1
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((dayOfWeek + 6) % 7)); // Move to Monday
    const week = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
    return week;
  };
  useEffect(() => {
    setWeekDays(getWeekDays(selectedDate));
  }, [selectedDate]);

  // Update local selectedDate when parent changes
  useEffect(() => {
    if (parentSelectedDate) {
      setSelectedDate(parentSelectedDate);
    }
  }, [parentSelectedDate]);

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setShowCalendar(false);
    if (onDateChange) {
      onDateChange(date);
    }
  };

  // Get unique staff members on visits with their details (from all visits)
  const getStaffOnVisits = () => {
    const staffMap = new Map();
    
    allVisits.forEach(visit => {
      // Only process assignees (not main carerId)
      if (visit.assignees && Array.isArray(visit.assignees)) {
        visit.assignees.forEach(assignee => {
          if (assignee.carerId) {
            const profile = carerProfiles[assignee.carerId];
            if (profile) {
              if (!staffMap.has(assignee.carerId)) {
                staffMap.set(assignee.carerId, {
                  id: assignee.carerId,
                  profile,
                  visit,
                  isOnsite: visit.clockInAt && !visit.clockOutAt,
                  transportType: profile.profile?.is_driver ? 'car' : 'walk',
                  distance: assignee.distance || 'N/A'
                });
              }
            }
          }
        });
      }
    });
    
    const result = Array.from(staffMap.values()).slice(0, 6); // Limit to 6 staff members
    return result;
  };

  const getLatestRequests = () => {
    // Group visits by task type and count (using filtered visits for selected date)
    const taskCounts = {};
    
    visits.forEach(visit => {
      if (visit.tasks && Array.isArray(visit.tasks)) {
        visit.tasks.forEach(task => {
          const taskType = task.type || 'General Care';
          if (!taskCounts[taskType]) {
            taskCounts[taskType] = {
              name: taskType,
              totalTasks: 0,
              completedTasks: 0,
              assignedStaff: new Set()
            };
          }
          taskCounts[taskType].totalTasks++;
          if (task.isCompleted) {
            taskCounts[taskType].completedTasks++;
          }
          if (visit.employeeIds) {
            visit.employeeIds.forEach(id => taskCounts[taskType].assignedStaff.add(id));
          }
        });
      } else {
        // Default task if no tasks specified
        const taskType = 'General Care';
        if (!taskCounts[taskType]) {
          taskCounts[taskType] = {
            name: taskType,
            totalTasks: 0,
            completedTasks: 0,
            assignedStaff: new Set()
          };
        }
        taskCounts[taskType].totalTasks++;
        if (visit.status === 'COMPLETED') {
          taskCounts[taskType].completedTasks++;
        }
        if (visit.employeeIds) {
          visit.employeeIds.forEach(id => taskCounts[taskType].assignedStaff.add(id));
        }
      }
    });
    
    return Object.values(taskCounts).slice(0, 2).map(task => ({
      ...task,
      completionRate: task.totalTasks > 0 ? ((task.completedTasks / task.totalTasks) * 100).toFixed(1) : '0',
      staffCount: task.assignedStaff.size
    }));
  };

  const staffOnVisits = getStaffOnVisits();
  const latestRequests = getLatestRequests();

  const TransportTooltip = ({ type = "walk", distance = "1km", name = "The carer" }) => {
    const [hover, setHover] = useState(false);
    const transportInfo = {
      walk: {
        icon: <IconWalk className="w-5 h-5 text-green-600" />,
        header: "Walking",
        body: `${name} walks ${distance} to the client’s place.`,
      },
      car: {
        icon: <IconCar className="w-5 h-5 text-blue-600" />,
        header: "Private Car",
        body: `${name} drives a private car for ${distance} to the client’s place.`,
      },
      bus: {
        icon: <IconBus className="w-5 h-5 text-yellow-600" />,
        header: "Public Transportation",
        body: `${name} uses public transportation to travel ${distance} to the client’s place.`,
      },
    };
    const { icon, header, body } = transportInfo[type] || transportInfo.walk;
    return (
      <div
        style={{ position: "relative", display: "inline-block" }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <span className="inline-flex items-center gap-1 cursor-pointer">
          {icon} <b>{distance}</b> <MapPinIcon className="w-4 h-4" />
        </span>
        <AnimatePresence>
          {hover && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="RRsyts-tooltip-root"
            >
              <div className="flex items-center gap-2 mb-1">
                <span>{icon}</span>
                <h4>{header}</h4>
              </div>
              <h6>{body}</h6>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };
  const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  return (
    <div className='OverviewBottomSec'>
      <div className='OverviewBottomSec-Card'>
        <div className='OverviewBottomSec-Card-Top'>
          <div className='OverviewBottomSec-Card-Top-Top'>
            <h3><ClipboardDocumentListIcon /> Latest Requests</h3>
            <div className='IIok-GGTHS'>
            <p>{selectedDate.toLocaleDateString('en-Gp', { weekday: 'short', day: '2-digit', month: 'short' })}</p>
            <span
              className="Triggh-Coks"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <EllipsisHorizontalIcon className="w-6 h-6" />
              <AnimatePresence>
                {showCalendar && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="ssess-CCaond"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="OOcalendar-container OUkiaks-PPOlad">
                    <CalendarDropdown
                      selectedDate={selectedDate}
                      onSelect={handleSelectDate}
                      onClose={() => setShowCalendar(false)}
                    />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
            </span>
            </div>
          </div>
          {/* ✅ Dynamic Week Days */}
          <div className='UJKI-Clad'>
            <div className='UJKI-Clad-Main'>
              {weekDays.map((day, i) => {
                const isActive =
                  day.toDateString() === selectedDate.toDateString();
                return (
                  <div
                    key={i}
                    className={`UJKI-GLid ${isActive ? "activeday" : ""}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <span>{dayNames[i]}</span>
                    <p>{day.getDate()}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className='KKKUJ-Sec'>
          {latestRequests.length > 0 ? (
            latestRequests.map((request, index) => (
              <a href='#' key={index} className='KKKUJ-Part'>
                <div className='HGh-Tabl-Gbs'>
                  <div className='HGh-Tabl-Gbs-Tit'>
                    <p>{request.name}</p>
                  </div>
                  <div className='HGh-Tabl-Gbs-Badgs'>
                    <p><AiIcon /> {request.completionRate}%</p>
                    <span><IconLayoutGrid /> {request.totalTasks}</span>
                    <span><IconUserHeart /> {request.staffCount}</span>
                  </div>
                </div>
              </a>
            ))
          ) : (
            <div className='KKKUJ-Part' style={{opacity: 0.6}}>
              <div className='HGh-Tabl-Gbs'>
                <div className='HGh-Tabl-Gbs-Tit'>
                  <p>No requests for selected date</p>
                </div>
                <div className='HGh-Tabl-Gbs-Badgs'>
                  <p><AiIcon /> 0%</p>
                  <span><IconLayoutGrid /> 0</span>
                  <span><IconUserHeart /> 0</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* ✅ Staff Section */}
      <div className='OverviewBottomSec-Card'>
        <div className='OVG-Header'>
          <div className='OVG-Header-L'>
            <h3>Staff on Visits</h3>
          </div>
          <div className="OVG-Header-R">
            <a href='#'>View all</a>
          </div>
        </div>
        <div className='PPl-MAns'>
          {Object.keys(carerProfiles).length === 0 ? (
            // Skeleton loader for 6 staff cards
            [...Array(6)].map((_, index) => (
              <div key={index} className='PPl-MAns-Card skeleton-card'>
                <div className='HGh-Tabl-Gbs'>
                  <div className='HGh-Tabl-Gbs-Tit'>
                    <h3>
                      <div className='HHj-IMgDIv skeleton' style={{width: '40px', height: '40px', borderRadius: '50%'}}></div>
                      <span className='Cree-Name'>
                        <div className='skeleton' style={{width: '120px', height: '16px', borderRadius: '4px'}}></div>
                      </span>
                    </h3>
                  </div>
                  <div className='HGh-Tabl-Gbs-Badgs'>
                    <div className='skeleton' style={{width: '80px', height: '14px', borderRadius: '4px'}}></div>
                  </div>
                </div>
              </div>
            ))
          ) : staffOnVisits.length > 0 ? (
            staffOnVisits.map((staff) => {
              const { profile, transportType, distance, isOnsite } = staff;
              const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown Staff';
              const initials = `${profile.first_name?.charAt(0) || ''}${profile.last_name?.charAt(0) || ''}`.toUpperCase();
              
              return (
                <a href='#' key={staff.id} className='PPl-MAns-Card'>
                  <div className='HGh-Tabl-Gbs'>
                    <div className='HGh-Tabl-Gbs-Tit'>
                      <h3>
                        <div className='HHj-IMgDIv'>
                          {profile.profile?.profile_image_url ? (
                            <img src={profile.profile.profile_image_url} alt={fullName} />
                          ) : (
                            <b>{initials}</b>
                          )}
                          {isOnsite && <i className='onsite-indi'></i>}
                        </div>
                        <span className='Cree-Name'><span>{fullName}</span></span>
                      </h3>
                    </div>
                    <div className='HGh-Tabl-Gbs-Badgs'>
                      <TransportTooltip type={transportType} distance={distance} name={fullName} />
                    </div>
                  </div>
                </a>
              );
            })
          ) : (
            <div style={{padding: '20px', textAlign: 'center', color: '#666'}}>
              {allVisits.length === 0 ? 'No visits found' : 'No staff assigned to visits'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default OverviewBottomSec;