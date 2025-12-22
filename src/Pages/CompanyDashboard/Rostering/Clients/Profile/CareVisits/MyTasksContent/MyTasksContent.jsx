// MyTasksContent.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './MyTasksContent.css';
import ModalTask from './ModalTask/ModalTask';
import History from './History/History';
import Log from './Log/Log';
import AssignCarer from './AssignCarer/AssignCarer';
import MembImg1 from '../Img/memberIcon1.jpg';
import { IconCarGarage } from '@tabler/icons-react';
import {
  CheckCircleIcon,
  PhoneIcon,
  ClockIcon,
  CalendarIcon,
  MapPinIcon,
  InformationCircleIcon,
  UserIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  BookOpenIcon,
  DocumentTextIcon,
  XCircleIcon, // Added for error/completed status if needed
  PencilIcon,
  ArchiveBoxArrowDownIcon,
  CogIcon,
} from '@heroicons/react/24/outline';


import {
  UserIcon as UserSolidIcon,
  UsersIcon as UsersSolidIcon, // Added for solid UsersIcon
  ClipboardDocumentListIcon as ClipboardSolidIcon,
  BookOpenIcon as BookOpenSolidIcon,
  DocumentTextIcon as DocumentTextSolidIcon,
  CogIcon as CogSolidIcon,
} from '@heroicons/react/24/solid';
// ✅ Reusable animation variants
const tabAnimation = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
  transition: { duration: 0.3 },
};
const tabs = [
  { id: 'task', label: 'Task', outline: ClipboardDocumentListIcon, solid: ClipboardSolidIcon },
  { id: 'visit-settings', label: 'Assign Carer', outline: UsersIcon, solid: UsersSolidIcon },
  { id: 'log', label: 'Log', outline: DocumentTextIcon, solid: DocumentTextSolidIcon },
  { id: 'history', label: 'History', outline: BookOpenIcon, solid: BookOpenSolidIcon },
];
const MyTasksContent = ({ visit, clientName, onComplete, onSaveVisit }) => {
  // Static data
  const selectedTask = {
    task: '5 Tasks',
    callType: 'single',
    startHour: 9,
    startMin: 0,
    endHour: 10,
    endMin: 0,
    date: new Date().toISOString().split('T')[0],
    distance: 5,
    clientName: 'John Doe',
    clientImage: null,
  };
  const isClockedIn = false;
  const taskStatus = 'Not Started';
  const history = [];
  const actualClockIn = null;
  const actualClockOut = null;
  const [selectedCarers, setSelectedCarers] = useState([]);
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize selected carers/drivers when visit changes
  useEffect(() => {
    if (!visit) {
      setSelectedCarers([]);
      setSelectedDrivers([]);
      return;
    }
    const initialCarers = [];
    if (Array.isArray(visit.carers) && visit.carers.length > 0) {
      initialCarers.push(...visit.carers.slice(0, 2));
    } else if (visit.carer) {
      initialCarers.push(visit.carer);
      if (visit.allocatedCarers && visit.allocatedCarers > 1) initialCarers.push(null);
    }
    if (initialCarers.length === 1) initialCarers.push(null);
    setSelectedCarers(initialCarers.slice(0, 2));
    if (visit.driver) setSelectedDrivers([visit.driver.id]);
    else if (Array.isArray(visit.drivers)) setSelectedDrivers(visit.drivers.map(d => d.id));
    else setSelectedDrivers([]);
  }, [visit]);
  const formatDuration = (ms) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const [activeTab, setActiveTab] = useState('task');
  // Helper function to format time
  const formatTime = (hour, minute) => {
    const period = hour < 12 ? "am" : "pm";
    const adjustedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${adjustedHour}:${minute.toString().padStart(2, "0")}${period}`;
  };
  // Helper function to get task duration in "Xhr Ymin Zsec" format
  const getExpectedDurationStr = (task) => {
    if (!task) return '0hr 0min 0sec';
    const totalMinutes = (task.endHour * 60 + task.endMin) - (task.startHour * 60 + task.startMin);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const seconds = 0; // Expected duration has no seconds
    return `${hours}hr ${minutes}min ${seconds}sec`;
  };
  // Helper function to get duration from ISO dates
  const getDurationFromDates = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate - startDate;
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    return `${hours}hr ${minutes}min 0sec`;
  };
  // Helper function to get client initials (copied from MyTasks)
  const getClientInitials = (clientName) => {
    if (!clientName) return '';
    const names = clientName.split(' ');
    return names.map((name) => name.charAt(0).toUpperCase()).join('');
  };
  // Helper function to get initials for carer (lowercase)
  const getCarerInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toLowerCase();
  };
  // Computed values based on visit or selectedTask
  const totalTasks = visit ? visit.tasks.length : parseInt(selectedTask?.task.split(' ')[0]) || 20;
  const taskCountStr = visit ? `0/${totalTasks}` : `0/${totalTasks}`;
  // Map backend careType enums to user-friendly, capitalized labels
  const formatCareType = (careType) => {
    if (!careType) return 'Double handed call';
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
  const callTypeStr = visit ? formatCareType(visit.careType) : 'Double handed call';
  const timeStr = visit ? `${formatTime(new Date(visit.startDate).getHours(), new Date(visit.startDate).getMinutes())} - ${formatTime(new Date(visit.endDate).getHours(), new Date(visit.endDate).getMinutes())}` : selectedTask ? `${formatTime(selectedTask.startHour, selectedTask.startMin)} - ${formatTime(selectedTask.endHour, selectedTask.endMin)}` : 'N/A';
  const durationStr = visit ? getDurationFromDates(visit.startDate, visit.endDate) : getExpectedDurationStr(selectedTask);
  const totalDistance = selectedCarers.filter(c => c).reduce((sum, c) => sum + parseFloat(c.distance?.replace('km', '') || 0), 0);
  const distanceStr = totalDistance > 0 ? `${totalDistance.toFixed(1)}km` : '0km';
  const numCarers = selectedCarers.filter(c => c != null).length;
  const carerSum = selectedCarers.filter(c => c).reduce((sum, c) => sum + parseFloat(c.distance?.replace('km', '') || 0), 0);
  const driverDistance = numCarers === 2 ? carerSum * 2 : carerSum;
  const driverDistanceStr = driverDistance > 0 ? `${driverDistance.toFixed(1)}km` : '0km';
  const clientNameDisplay = clientName || selectedTask?.clientName || 'Unknown Client';
  const clientInitials = getClientInitials(clientNameDisplay);
  // Determine status class based on clocked in state
  const isClockedOut = taskStatus.includes('Clocked out') || taskStatus.includes('Completed');
  const statusClass = isClockedIn ? 'OOStaTus in-progress' :
                     isClockedOut ? 'OOStaTus completed' : 'OOStaTus pending';
  return (
    <div className='MyTasksContent'>
      {/* ===== TOP SUMMARY ===== */}
      <div className='MyTasksContent-Top'>
        <ul>
          <li><span><CheckCircleIcon /> Task:</span><b>{taskCountStr}</b></li>
          <li><span><UserIcon /> Call:</span><b>{callTypeStr}</b></li>
           <li><span><CalendarIcon /> Date:</span><b>{visit ? new Date(visit.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '11/19/2025'}</b></li>
          <li><span><ClockIcon /> Time:</span><b>{timeStr}</b></li>
          <li><span><CalendarIcon /> Duration:</span><b className='durrad-Bbab'>{durationStr}</b></li>
          <li><span><MapPinIcon /> Distance:</span><b>{distanceStr}</b></li>
        </ul>
      </div>
      {/* ===== MAIN BODY ===== */}
      <div className='MyTasksContent-Mmain-BDy'>
        <div className='Mmain-BDy-Top'>
          <div className='Oo-ProFt'>
            <div className='Oo-ProFt-2'><p>{clientNameDisplay}'s Care visit</p></div>
          </div>
          <div className='Mmain-BDy-Top-Btns'>
            {selectedDrivers.length > 0 && (
              <div className='OOks-Us'>
                <p>Driver{selectedDrivers.length > 1 ? 's' : ''}</p>
                <IconCarGarage />
              <h6 className='sellct-Indio'>{selectedDrivers.length}</h6>
                <span>{driverDistanceStr}</span>
              </div>
            )}
            {selectedCarers[0] && (
              <div className='GThs-Inst-Ims'>
                {selectedCarers[0].image ? (
                  <img src={selectedCarers[0].image} alt={selectedCarers[0].name} />
                ) : (
                  <span>{getCarerInitials(selectedCarers[0].name)}</span>
                )}
              </div>
            )}
            {selectedCarers[1] && (
              <div className='GThs-Inst-Ims'>
                {selectedCarers[1].image ? (
                  <img src={selectedCarers[1].image} alt={selectedCarers[1].name} />
                ) : (
                  <span>{getCarerInitials(selectedCarers[1].name)}</span>
                )}
              </div>
            )}
            <button className='STtargs-Opa'>
              <span><InformationCircleIcon /> Status:</span>
              <b className={statusClass}>{taskStatus}</b>
            </button>
              <div style={{ display: 'inline-block' }}>
                <button
                  type="button"
                  className='btn-primary-bg Savebs-VVsi'
                  onClick={async () => {
                    if (!onSaveVisit) return;
                    setSaving(true);
                    setSaveError(null);
                    try {
                      await onSaveVisit(visit, selectedCarers, selectedDrivers);
                      setSaveSuccess(true);
                      setTimeout(() => setSaveSuccess(false), 2500);
                    } catch (e) {
                      console.error('Save visit failed', e);
                      setSaveError(e?.response?.data?.message || e.message || 'Failed to save visit');
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={!visit || saving}
                >
                  <span><ArchiveBoxArrowDownIcon /> {saving ? 'Saving...' : 'Save Visit'}</span>
                </button>
                {saveSuccess && <span style={{ marginLeft: 12, color: 'green' }}>Saved</span>}
                {saveError && <div style={{ marginTop: 8, color: 'var(--danger-color, #c53030)' }}>{saveError}</div>}
              </div>
          </div>
        </div>
        {/* ===== TABS ===== */}
        <div className='GGths-BBsyn'>
          <div className='GGths-BBsyn-1'>
            <div className='Hhsa-Btns'>
              {tabs.map(tab => {
                const Icon = activeTab === tab.id ? tab.solid : tab.outline;
                return (
                  <button
                    key={tab.id}
                    className={activeTab === tab.id ? 'active' : ''}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className='tab-icon' />
                    {tab.label}
                    {tab.id === 'task' && <b className='NumB-Task'>{visit ? `0/${visit.tasks.length}` : taskCountStr}</b>}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId='underline'
                        className='tab-underline'
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          {/* ===== CONTENT ===== */}
          <div className='GGths-BBsyn-2'>
            <AnimatePresence mode='wait'>
              {activeTab === 'visit-settings' && (
                <motion.div key='visit-settings' {...tabAnimation}>
                  <AssignCarer 
                    onCarersChange={setSelectedCarers} 
                    onDriversChange={setSelectedDrivers} 
                    visitData={visit}
                  />
                </motion.div>
              )}
              {activeTab === 'task' && (
                <motion.div key='task' {...tabAnimation}>
                     <ModalTask tasks={visit ? visit.tasks : []} />
                </motion.div>
              )}
              {activeTab === 'log' && (
                <motion.div key='log' {...tabAnimation}>
                 <Log visitData={visit} />
                </motion.div>
              )}
              {activeTab === 'history' && (
                <motion.div key='history' {...tabAnimation}>
                  <History
                    history={history}
                    actualClockIn={actualClockIn}
                    actualClockOut={actualClockOut}
                    formatDuration={formatDuration}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MyTasksContent;