import { FaIdCard, FaEnvelope, FaPhone } from "react-icons/fa";

const CarePlanProfileCard = ({ client }) => {
  return (
    <div className="care-plan-profile-section">
      <div className="profile-container">
        <img
          src={client.profile?.photo_url || "/default-avatar.png"}
          alt={`${client.first_name} ${client.last_name}`}
          className="profile-image"
        />
        <div className="profile-details">
          <h2>
            {client.first_name} {client.last_name}
          </h2>
          <div className="card-detail-item">
            <FaIdCard />
            <span>Client ID: {client?.profile.client_id}</span>
          </div>
          <div className="card-detail-item">
            <FaEnvelope />
            <span>{client.email}</span>
          </div>
          <div className="card-detail-item">
            <FaPhone />
            <span>{client.profile?.contact_number || "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarePlanProfileCard;
