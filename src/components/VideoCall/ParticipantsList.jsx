import "./styles.css";

const ParticipantList = ({ participants }) => {
  return (
    <div className="participant-list">
      <h4>Participants ({participants.length})</h4>
      <ul>
        {participants.map((participant, index) => (
          <li key={index}>
            <span className="participant-name">{participant.name}</span>
            {participant.isMuted && <span className="muted-indicator">🔇</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ParticipantList;


