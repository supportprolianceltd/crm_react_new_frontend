import React from 'react';
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

const activities = [
  {
    id: 1,
    type: 'alert',
    title: 'Forced Clocked Out',
    message: 'Client was not ready to be taken to the hospital',
    time: '12/9/2025 - 4:03pm by Prince Godson',
  },
  {
    id: 2,
    type: 'completed',
    title: 'Shift Completed',
    message: 'Caregiver successfully completed assigned shift',
    time: '12/9/2025 - 3:10pm by Prince Godson',
  },
  {
    id: 3,
    type: 'completed',
    title: 'Client Delivered',
    message: 'Client safely dropped off at hospital',
    time: '12/9/2025 - 1:45pm by Prince Godson',
  },
  {
    id: 4,
    type: 'alert',
    title: 'Late Arrival',
    message: 'Caregiver arrived 25 minutes late',
    time: '12/9/2025 - 12:30pm by Prince Godson',
  },
];

const RosterActivities = () => {
  return (
    <div className='Ddelajs-SEcs'>

      {activities.map((activity) => (
        <div className='OOLsolso-SSCD' key={activity.id}>

          <div className='OOLsolso-SSCD-1'>
            {activity.type === 'completed' ? (
              <CheckCircleIcon style={{ color: '#16a34a' }} />
            ) : (
              <ExclamationTriangleIcon style={{ color: '#edb51eff' }} />
            )}
          </div>

          <div className='OOLsolso-SSCD-2'>
            <h3>{activity.title}</h3>
            <p>{activity.message}</p>
            <span>{activity.time}</span>
          </div>

        </div>
      ))}

    </div>
  );
};

export default RosterActivities;
