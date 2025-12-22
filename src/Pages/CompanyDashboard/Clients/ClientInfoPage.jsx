import React, { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ClientInfo from "./ClientInfo/ClientInfo";
import "./styles/ClientInfoPage.css";

const ClientInfoPage = ({ client, onBack, onUpdate }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState({});
  const [formData, setFormData] = useState(null);

  return (
    <div className="">
      <button className="back-button" onClick={onBack}>
        <FiArrowLeft size={16} />
        Back
      </button>
      <div className="client-info-container">
        <ClientInfo clientData={client} onUpdate={onUpdate} />
      </div>
    </div>
  );
};

export default ClientInfoPage;
