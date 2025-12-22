import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardDocumentListIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import TaskList from './TaskList';
import Info from './Info';

const ModalTask = ({ tasks = [], onTaskUpdate }) => {
  // Map relatedTable to friendly labels
  const labelMap = {
    'PersonalCare': 'Care Essentials',
    'Medication': 'Medication',
    'EverydayActivityPlan': 'Everyday Activities',
    'FallsAndMobility': 'Falls & Mobility',
    'MedicalInformation': 'Medical Information',
    'PsychologicalInformation': 'Psychological Wellbeing',
    'FoodNutritionHydration': 'Nutrition & Hydration',
    'RoutinePreference': 'Routine Preferences',
    'CultureValues': 'Culture & Values',
    'BodyMap': 'Body Map',
    'MovingHandling': 'Moving & Handling',
    'LegalRequirement': 'Legal Requirements',
    'CareRequirements': 'Care Requirements',
    'RiskAssessment': 'Risk Assessment',
  };

  // Get unique categories from tasks
  const categories = [...new Set(tasks.map(t => t.relatedTable || t.category))];
  const checkboxes = categories.length > 0 
    ? categories.map(cat => labelMap[cat] || cat)
    : ['Care Essentials', 'Medication', 'Nutrition & Hydration', 'Moving & Handling', 'Psychological Wellbeing', 'Social Support'];

  const [activeLabel, setActiveLabel] = useState(checkboxes[0] || '');
  const [activeButton, setActiveButton] = useState('Task'); // 'Task' or 'Info'

  // Group tasks by category (memoized so it doesn't recreate every render)
  const tasksMap = useMemo(() => {
    const map = {};
    checkboxes.forEach(label => {
      const category = Object.keys(labelMap).find(key => labelMap[key] === label) || label;
      map[label] = tasks.filter(t => (t.relatedTable || t.category) === category);
    });
    return map;
  }, [tasks, checkboxes]);

  const [tasksState, setTasksState] = useState(tasksMap[activeLabel] || []);

  // Transform API task to TaskList format
  const transformTask = (apiTask) => {
    // Calculate session based on startDate UTC hours
    let session = 'Morning';
    let time = '';
    if (apiTask.startDate) {
      const startDate = new Date(apiTask.startDate);
      const utcHour = startDate.getUTCHours();
      if (utcHour >= 6 && utcHour <= 11) {
        session = 'Morning';
      } else if (utcHour >= 12 && utcHour <= 17) {
        session = 'Afternoon';
      } else if (utcHour >= 18 && utcHour <= 21) {
        session = 'Evening';
      } else {
        session = 'Night';
      }
      // Format time as HH:MM am/pm
      const utcMinutes = startDate.getUTCMinutes();
      const period = utcHour < 12 ? 'am' : 'pm';
      const displayHour = utcHour % 12 === 0 ? 12 : utcHour % 12;
      time = `${displayHour}:${utcMinutes.toString().padStart(2, '0')} ${period}`;
    }

    return {
      id: apiTask.id,
      title: apiTask.title || apiTask.name || 'Untitled Task',
      description: apiTask.description || '',
      status: apiTask.status || 'PENDING',
      completed: apiTask.status === 'COMPLETED' || apiTask.completed || false,
      priority: apiTask.priority || 'medium',
      dueDate: apiTask.dueDate || null,
      assignedTo: apiTask.assignedTo || null,
      category: apiTask.relatedTable || apiTask.category || 'General',
      riskCategory: apiTask.riskCategory || '',
      session: session,
      time: time,
      frequency: apiTask.riskFrequency || apiTask.frequency || 'Once',
      preferredTiming: apiTask.preferredTiming || 'Anytime',
      startTime: apiTask.startTime || '',
      endTime: apiTask.endTime || ''
    };
  };

  // Load tasks when activeLabel changes
  useEffect(() => {
    setTasksState(tasksMap[activeLabel] || []);
  }, [activeLabel, tasks]);

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
  };

  const handleCheckboxChange = (label) => {
    setActiveLabel(label);
  };

  // Framer Motion animation variants
  const contentVariants = {
    hidden: { opacity: 0, x: -5 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 5 },
  };

  const currentTasks = tasksState.map(transformTask);
  const totalTasksInCategory = currentTasks.length;
  const completedTasksInCategory = currentTasks.filter(t => t.completed || t.status === 'COMPLETED').length;
  const pendingCount = currentTasks.filter(t => t.status === 'PENDING' || !t.completed).length;

  return (
    <div className='Moduls-SeCC'>
      {/* Left Sidebar */}
      <div className='Moduls-LefNV custom-scroll-bar'>
        {checkboxes.map((label) => (
          <label key={label}>
            <span className={activeLabel === label ? 'active' : ''}>
              <input
                type='checkbox'
                checked={activeLabel === label}
                onChange={() => handleCheckboxChange(label)}
              />
              {label}
            </span>
          </label>
        ))}
      </div>

      {/* Main Content */}
      <div className='Moduls-Mains'>
        <div className='Moduls-Top'>
          <h3>
            {activeLabel}
            <span>Total task: {totalTasksInCategory}</span>
          </h3>

          <div className='Moduls-Top-Btns'>
            <button
              className={activeButton === 'Task' ? 'active' : ''}
              onClick={() => handleButtonClick('Task')}
            >
              <span>
                <ClipboardDocumentListIcon className='w-5 h-5' />
                Task
              </span>
              <b>{completedTasksInCategory}/{totalTasksInCategory}</b>
            </button>

            <button
              className={activeButton === 'Info' ? 'active' : ''}
              onClick={() => handleButtonClick('Info')}
            >
              <span>
                <InformationCircleIcon className='w-5 h-5' />
                Info
              </span>
            </button>
          </div>
        </div>

        {/* Animated Section */}
        <div className='Moduls-Content'>
          <AnimatePresence mode='wait'>
            {activeButton === 'Task' && (
              <motion.div
                key='task'
                variants={contentVariants}
                initial='hidden'
                animate='visible'
                exit='exit'
                transition={{ duration: 0.3 }}
              >
                <TaskList 
                  tasks={currentTasks}
                  onTaskUpdate={onTaskUpdate}
                  onTasksChange={(updatedTasks) => {
                    // Update the tasks state when TaskList changes tasks
                    const newTasksMap = { ...tasksMap };
                    newTasksMap[activeLabel] = updatedTasks;
                    setTasksState(updatedTasks);
                  }}
                />
              </motion.div>
            )}

            {activeButton === 'Info' && (
              <motion.div
                key='info'
                variants={contentVariants}
                initial='hidden'
                animate='visible'
                exit='exit'
                transition={{ duration: 0.3 }}
              >
                <Info />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ModalTask;
