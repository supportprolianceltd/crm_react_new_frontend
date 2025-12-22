
import React, { useState, useRef, useEffect } from "react";
import {
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  UserMinusIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";


import {
  IconHourglassHigh,
  IconGauge,
} from "@tabler/icons-react";

import OverviewVisits from './OverviewVisits';
import OverViewGraphs from './OverViewGraphs';
import OverviewBottomSec from './OverviewBottomSec';
import CalendarDropdown from '../../../../components/CalendarDropdown/CalendarDropdown';
import { fetchScheduledVisits, fetchBulkUserDetails } from '../config/apiConfig';
import '../../../../components/SkeletonLoader.jsx';

// Reusable Overview Card Component
const OverviewCard = ({ icon: Icon, label, value, isLoading }) => (
  <li>
    <a href="#">
      {isLoading ? (
        <>
          <p>
            <span className="skeleton" style={{width: '140px', height: '16px', borderRadius: '4px', display: 'inline-block'}}></span>
          </p>
          <h3>
            <span className="skeleton" style={{width: '60px', height: '28px', borderRadius: '4px', display: 'inline-block'}}></span>
          </h3>
        </>
      ) : (
        <>
          <p>
            <Icon className="h-5 w-5 inline" /> {label}
          </p>
          <h3>{value}</h3>
        </>
      )}
    </a>
  </li>
);

const Overview = ({ openCoverageModal }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const calendarRef = useRef(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [checkedInVisitsCount, setCheckedInVisitsCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [lateArrivalsCount, setLateArrivalsCount] = useState(0);
  const [totalCurrentHours, setTotalCurrentHours] = useState(0);
  const [totalEmployeeHours, setTotalEmployeeHours] = useState(0);
  const [filteredVisits, setFilteredVisits] = useState([]);
  const [allVisits, setAllVisits] = useState([]);
  const [carerProfiles, setCarerProfiles] = useState({});
  const [isLoadingVisits, setIsLoadingVisits] = useState(true);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

  const handleToggleCalendar = () => {
    setShowCalendar((s) => !s);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    }

    function handleKey(e) {
      if (e.key === 'Escape') setShowCalendar(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  // Use dummy pending requests count (no external endpoint)
  useEffect(() => {
    setPendingCount(2); // dummy value
  }, []);

  // Fetch all visits once on mount and store for all children
  useEffect(() => {
    let mounted = true;
    const fetchAllData = async () => {
      try {
        const data = await fetchScheduledVisits();

        let visits = [];
        if (Array.isArray(data?.items)) {
          visits = data.items;
        } else if (Array.isArray(data)) {
          visits = data;
        }

        if (mounted) {
          setAllVisits(visits);
          setScheduledCount(visits.length);
        }
      } catch (err) {
        if (mounted) {
          setAllVisits([]);
          setScheduledCount(0);
        }
      }
    };

    fetchAllData();

    return () => {
      mounted = false;
    };
  }, []);

  // Fetch carer profiles once for all components
  useEffect(() => {
    const fetchCarerProfiles = async () => {
      if (allVisits.length === 0) return;

      const carerIds = new Set();
      
      allVisits.forEach((visit) => {
        visit.assignees?.forEach((assignee) => {
          const carerId = assignee.carerId || assignee.id || assignee.employeeId;
          if (carerId) carerIds.add(carerId);
        });
      });

      if (carerIds.size === 0) {
        setIsLoadingProfiles(false);
        return;
      }

      setIsLoadingProfiles(true);

      try {
        const profiles = await fetchBulkUserDetails(Array.from(carerIds));
        setCarerProfiles(profiles);
      } catch (err) {
        // Error handled silently
      } finally {
        setIsLoadingProfiles(false);
      }
    };

    fetchCarerProfiles();
  }, [allVisits]);

  useEffect(() => {
    let mounted = true;
    const calculateEmployeeStatus = () => {
      // Only show loading if we're still fetching initial data
      if (allVisits.length === 0) {
        setIsLoadingVisits(true);
        return;
      }

      setIsLoadingVisits(true);
      try {
        if (!mounted) return;

        // Filter visits by selected date from already fetched allVisits
        const selectedDateStart = new Date(selectedDate);
        selectedDateStart.setHours(0, 0, 0, 0);
        const selectedDateEnd = new Date(selectedDate);
        selectedDateEnd.setHours(23, 59, 59, 999);

        const filtered = allVisits.filter(visit => {
          const visitDate = new Date(visit.startDate);
          return visitDate >= selectedDateStart && visitDate <= selectedDateEnd;
        });

        const now = new Date();
    let checkedInVisitsCount = 0;
    const allScheduledEmployees = new Set();
    const lateEmployees = new Set();
    let totalOvertimeMs = 0;
    let totalCurrentMs = 0;
    let totalCompletedMs = 0;

    filtered.forEach(visit => {
          const startTime = new Date(visit.startDate);
          const endTime = new Date(visit.endDate);
          
          // Get unique employee IDs from assignees
          const employeeIds = visit.assignees?.map(assignee => 
            assignee.carerId || assignee.id || assignee.employeeId
          ).filter(Boolean) || [];

          // Add all assigned employees to the scheduled set
          employeeIds.forEach(employeeId => {
            allScheduledEmployees.add(employeeId);
          });

          // Calculate overtime if employee clocked out after scheduled end time
          if (visit.clockOutAt) {
            const clockOutTime = new Date(visit.clockOutAt);
            if (clockOutTime > endTime) {
              const overtimeMs = clockOutTime - endTime;
              totalOvertimeMs += overtimeMs;
            }
          }

          // Check for late arrivals (clocked in after scheduled start time)
          if (visit.clockInAt) {
            const clockInTime = new Date(visit.clockInAt);
            if (clockInTime > startTime) {
              employeeIds.forEach(employeeId => {
                lateEmployees.add(employeeId);
              });
            }

            // Calculate current hours (for employees currently working)
            if (!visit.clockOutAt) {
              const currentWorkMs = now - clockInTime;
              if (currentWorkMs > 0) {
                totalCurrentMs += currentWorkMs;
              }
            }

            // Count this visit as checked in
            checkedInVisitsCount++;
          }

          // Calculate completed hours (for employees who have clocked out)
          if (visit.clockInAt && visit.clockOutAt) {
            const clockInTime = new Date(visit.clockInAt);
            const clockOutTime = new Date(visit.clockOutAt);
            const completedWorkMs = clockOutTime - clockInTime;
            if (completedWorkMs > 0) {
              totalCompletedMs += completedWorkMs;
            }
          }
        });

        // Calculate absent visits: visits that haven't been checked into
        const absentVisitsCount = filtered.length - checkedInVisitsCount;

        // Count scheduled visits for the day
        const scheduledVisitsCount = filtered.length;

        // Convert total overtime from milliseconds to hours
        const overtimeHrs = totalOvertimeMs / (1000 * 60 * 60);
        const currentHrs = totalCurrentMs / (1000 * 60 * 60);
        const completedHrs = totalCompletedMs / (1000 * 60 * 60);

        if (mounted) {
          setFilteredVisits(filtered);
          setScheduledCount(scheduledVisitsCount);
          setCheckedInVisitsCount(checkedInVisitsCount);
          setAbsentCount(absentVisitsCount);
          setOvertimeHours(Math.round(overtimeHrs * 10) / 10);
          setLateArrivalsCount(lateEmployees.size);
          setTotalCurrentHours(Math.round(currentHrs * 10) / 10);
          setTotalEmployeeHours(Math.round(completedHrs * 10) / 10);
          setIsLoadingVisits(false);
        }
      } catch (err) {
        if (mounted) {
          setIsLoadingVisits(false);
          setScheduledCount(0);
          setCheckedInVisitsCount(0);
          setAbsentCount(0);
          setOvertimeHours(0);
          setLateArrivalsCount(0);
          setTotalCurrentHours(0);
          setTotalEmployeeHours(0);
        }
      }
    };

    calculateEmployeeStatus();

    return () => {
      mounted = false;
    };
  }, [selectedDate, allVisits]);

  
  
  return (
    <div className="Rostering-Overview-sec">
      <div className="TOT-Rost-Sec">
        <div className="RostDB-Envt-Container">
          {/* Header */}
          <div className="GGH-TOP">
            <div className="GGH-TOP-1">
              <h2>Rostering - Overview</h2>
            </div>
            <div className="GGH-TOP-2">
              <div className="cccll-Gbajjs">
                <div className="cccll-Gbajjs-Main">
                  <div style={{ position: 'relative' }}>
                    <button onClick={handleToggleCalendar} aria-label="Open calendar">
                      <CalendarDaysIcon className="icon-size inline" />
                      Today - {selectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </button>

                    {showCalendar && (
                      <div
                        className="OOcalendar-container OUkiaks-PPOlad"
                        ref={calendarRef}
                      >
                        <CalendarDropdown
                          selectedDate={selectedDate}
                          onSelect={handleDateSelect}
                          onClose={() => setShowCalendar(false)}
                        />
                      </div>
                    )}
                  </div>

                 {/* Coverage map not needed here now */}
                  {/* <button className="Gradient-Btn" onClick={openCoverageModal}>
                    <MapPinIcon />
                   Coverage Map
                  </button> */}

                </div>
              </div>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="GGH-Sub">
            <ul>
              <OverviewCard 
                icon={ClipboardDocumentListIcon} 
                label="Pending Requests" 
                value={pendingCount} 
                isLoading={isLoadingVisits} 
              />
              <OverviewCard 
                icon={CalendarDaysIcon} 
                label="Scheduled Visits" 
                value={scheduledCount} 
                isLoading={isLoadingVisits} 
              />
              <OverviewCard 
                icon={CheckCircleIcon} 
                label="Visits Checked-In" 
                value={checkedInVisitsCount} 
                isLoading={isLoadingVisits} 
              />
              <OverviewCard 
                icon={UserMinusIcon} 
                label="Visits Not Started" 
                value={absentCount} 
                isLoading={isLoadingVisits} 
              />
              <OverviewCard 
                icon={ClockIcon} 
                label="Overtime Hours" 
                value={`${overtimeHours} hrs`} 
                isLoading={isLoadingVisits} 
              />
              <OverviewCard 
                icon={ExclamationTriangleIcon} 
                label="Late Arrivals" 
                value={lateArrivalsCount} 
                isLoading={isLoadingVisits} 
              />
              <OverviewCard 
                icon={IconHourglassHigh} 
                label="Total Current Hours" 
                value={`${totalCurrentHours} hrs`} 
                isLoading={isLoadingVisits} 
              />
              <OverviewCard 
                icon={IconGauge} 
                label="Total Employees Hours" 
                value={`${totalEmployeeHours} hrs`} 
                isLoading={isLoadingVisits} 
              />
            </ul>
          </div>
        </div>
      </div>

     <div className="RostDB-Envt-Container">
       <OverviewVisits 
         visits={filteredVisits}
         allVisits={allVisits}
         carerProfiles={carerProfiles}
         selectedDate={selectedDate} 
         onDateChange={setSelectedDate}
         isLoading={isLoadingVisits || isLoadingProfiles}
       />
       <OverViewGraphs 
         selectedDate={selectedDate} 
         visits={filteredVisits}
         allVisits={allVisits}
       />
       <OverviewBottomSec 
         visits={filteredVisits}
         allVisits={allVisits}
         carerProfiles={carerProfiles}
         selectedDate={selectedDate} 
         onDateChange={setSelectedDate} 
       />
     </div>
      
    </div>
  );
};

export default Overview;
