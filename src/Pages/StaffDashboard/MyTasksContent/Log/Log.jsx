// CareLog.jsx
import React, { useState, useEffect } from "react";
import { apiClient } from "../../../../config";

const Log = ({ visitData = null }) => {
  // States
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Load visit logs from API
  const loadLogs = async () => {
    if (!visitData || !visitData.id) {
      setLogs([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/api/rostering/tasks/visits/${visitData.id}/logs`);
      const logsData = Array.isArray(response.data) ? response.data : [];
      setLogs(logsData);
    } catch (err) {
      console.error('Failed to load visit logs:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to load visit logs');
      setLogs([]);
    } finally {
      setLoading(false);
    };
  };

  useEffect(() => {
    loadLogs();
  }, [visitData]);
  // Get status display
  const getStatusDisplay = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  // Get date time display
  const getDateTimeDisplay = (log) => {
    return log.dateTime || `${log.date} at ${log.time}`;
  };
  return (
    <div className="GenReq-Page">
      <div className="PPOl-COnt">
        <div className='Ujs-Hyha'>
          <h3>Visit Log</h3>
        </div>
        
        {error && (
          <div style={{ 
            color: 'var(--danger-color, #c53030)', 
            padding: '1rem', 
            marginBottom: '1rem',
            backgroundColor: '#fed7d7',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}
        
        <div className="table-container">
            <table className="KLk-TTabsg" style={{ minWidth: "100%" }}>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Date & Time</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>
                      Loading visit logs...
                    </td>
                  </tr>
                ) : logs.length > 0 ? (
                  logs.map((log, index) => (
                    <tr key={log.taskId || index}>
                      <td>{log.task || log.title}</td>
                      <td>
                        <span className={`GthStatus ${log.status?.toLowerCase()}`}>
                          {getStatusDisplay(log.status)}
                        </span>
                      </td>
                      <td>{getDateTimeDisplay(log)}</td>
                      <td>{log.comment}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>
                      {!visitData ? "No visit selected" : "No care logs added yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
};
export default Log;