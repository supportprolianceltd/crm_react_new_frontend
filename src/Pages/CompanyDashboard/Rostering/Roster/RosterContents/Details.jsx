import React, { useState, useEffect } from 'react';
import { fetchSingleClient } from '../../config/apiConfig';

const Details = ({ task, carerProfiles }) => {
  const [clientAddress, setClientAddress] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(false);

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

  // Fetch client address
  useEffect(() => {
    const loadClientAddress = async () => {
      if (!task?.clientId) return;
      
      setLoadingAddress(true);
      try {
        const clientData = await fetchSingleClient(task.clientId);
        if (clientData?.profile) {
          const { address_line, town, county, postcode } = clientData.profile;
          const addressParts = [address_line, town, county, postcode].filter(Boolean);
          setClientAddress(addressParts.join(', ') || 'Address not available');
        } else {
          setClientAddress('Address not available');
        }
      } catch (error) {
        setClientAddress('Address not available');
      } finally {
        setLoadingAddress(false);
      }
    };

    loadClientAddress();
  }, [task?.clientId]);

  const handleMapClick = () => {
    const address = clientAddress || 'Unknown address';
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };

  if (!task) return null;

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const capitalize = (str) => {
    if (!str) return 'N/A';
    return str.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Get carer names
  const carerNames = task.assignees?.map(assignee => {
    const profile = carerProfiles[assignee.carerId];
    return profile ? `${profile.first_name} ${profile.last_name}` : 'Unassigned';
  }) || [];

  const callType = task.careType ? capitalize(task.careType) : 'N/A';

  return (
<div className='Ddelajs-SEcs'>
    <div className='Ddelajs-BoXX'>
        <h3>Visit Details</h3>
        <p>
            <span>Call</span>
            <b>{callType}</b>
        </p>
        <p>
            <span>Carer</span>
            <b>
              {carerNames.length === 1 
                ? carerNames[0] 
                : carerNames.length > 1
                ? carerNames.join(', ')
                : 'Unassigned'}
            </b>
        </p>
         <p>
            <span>Cluster</span>
            <b>{task.cluster_name || 'N/A'}</b>
        </p>
         <p>
            <span>Travel Time</span>
            <b>{formatDurationToHours(task.assignees?.[0]?.duration || 'N/A')}</b>
        </p>
         <p>
            <span>Driver</span>
            <b>{task.driver_assigned ? 'Assigned' : 'Not Assigned'}</b>
        </p>
         <p>
            <span>Status</span>
            <b><span className={`sttahs-SPOPSna ${task.status?.toLowerCase()}`}>{capitalize(task.status)}</span></b>
        </p>
    </div>

     <div className='Ddelajs-BoXX'>
        <h3>Visit Time</h3>
        <p>
            <span>Planned</span>
            <b>{formatTime(task.startDate)} - {formatTime(task.endDate)}</b>
        </p>
        <p>
            <span>Actual</span>
            <b>
              {task.clockInAt && task.clockOutAt
                ? `${formatTime(task.clockInAt)} - ${formatTime(task.clockOutAt)}`
                : task.clockInAt
                ? `${formatTime(task.clockInAt)} - In Progress`
                : 'Not started'}
            </b>
        </p>
     
    </div>

         <div className='Ddelajs-BoXX'>
        <h3>Client Location</h3>
        <p 
          className='TTThabs-LCLient-MMap'
          onClick={handleMapClick}
          style={{ cursor: 'pointer' }}
        >
            <span>{loadingAddress ? 'Loading address...' : clientAddress}</span>
        </p>
     
    </div>


</div>
  );
};


export default Details;