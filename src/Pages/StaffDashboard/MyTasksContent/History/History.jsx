// MyTasksContent/History/History.jsx
import React from 'react';
const History = ({ history = [], actualClockIn, actualClockOut, formatDuration }) => {
  let displayHistory = [...history];
  if (actualClockIn && actualClockOut && displayHistory.length === 0) {
    const durationMs = actualClockOut.getTime() - actualClockIn.getTime();
    displayHistory = [
      {
        type: "clock-in",
        time: actualClockIn,
      },
      {
        type: "clock-out",
        time: actualClockOut,
        duration: durationMs,
      },
    ];
  }
  const hasHistory = displayHistory.length > 0;
  if (!hasHistory) {
    return <p>No history available.</p>;
  }
  const getEventText = (entry) => {
    return entry.type === "clock-in" ? "Clocked In" : "Clocked Out";
  };
  const getNotes = (entry) => {
    const notes = [];
    if (entry.isForced) notes.push("(Forced)");
    if (entry.isLate) notes.push("(Late)");
    if (entry.isRestart) notes.push("(Restart)");
    if (entry.isOffTime) notes.push("(Off time)");
    if (entry.extraTime) notes.push(`(Extra: ${entry.extraTime})`);
    if (entry.offTime) notes.push(`(Off: ${entry.offTime})`);
    if (entry.isEarlyClockOut) notes.push("(Early Clock Out)");
    return notes.join(" ");
  };
  return (
    <div className="Ggen-BDa custom-scroll-bar">
    <div className='Ujs-Hyha'>
          <h3>Visit History</h3>
    </div>
      <div className="table-container">
        <table className="KLk-TTabsg" style={{ minWidth: "100%" }}>
          <thead>
            <tr>
              <th>Event</th>
              <th>Time</th>
              <th>Duration</th>
              <th>Notes</th>
              <th>Reason</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {displayHistory.map((entry, index) => (
              <tr key={index}>
                <td>{getEventText(entry)}</td>
                <td>{entry.time.toLocaleTimeString()}</td>
                <td>{entry.duration ? formatDuration(entry.duration) : "---"}</td>
                <td>{getNotes(entry)}</td>
                <td>{entry.reason || '---'}</td>
                <td>{entry.comments || '---'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default History;