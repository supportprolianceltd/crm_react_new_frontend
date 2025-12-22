import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "../../../../components/Modal";
import StatusBadge from "../../../../components/StatusBadge";
import { fetchSingleClient } from "../config/apiService";

// Modal animation variants
const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: -20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 500,
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

const ClientInfoModal = ({ clientId, isOpen, onClose }) => {
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log(clientId);

  // Fetch client details when modal opens
  useEffect(() => {
    if (isOpen && clientId) {
      const fetchClientDetails = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const clientData = await fetchSingleClient(clientId);
          setClient(clientData);
        } catch (err) {
          setError("Failed to fetch client details");
        } finally {
          setIsLoading(false);
        }
      };

      fetchClientDetails();
    }
  }, [isOpen, clientId]);

  // Parse the preferred care times if available
  const parseCareTimes = (careTimesString) => {
    try {
      return JSON.parse(careTimesString);
    } catch (e) {
      return null;
    }
  };

  const careTimes = client?.profile?.preferred_care_times
    ? parseCareTimes(client.profile.preferred_care_times)
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose} title="Client Details">
          <motion.div
            className="client-details-modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {isLoading && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  margin: "0 auto",
                }}
                className="loading-spinner"
              ></div>
            )}

            {error && <div className="error-message">{error}</div>}

            {client && !isLoading && (
              <>
                {/* Client Photo Section */}
                <div className="client-photo-section">
                  <div className="client-photo-container">
                    {client.profile?.photo ? (
                      <img
                        src={client.profile.photo}
                        alt={`${client.first_name} ${client.last_name}`}
                        className="client-photo"
                      />
                    ) : (
                      <div className="client-photo-placeholder">
                        {client.first_name?.charAt(0)}
                        {client.last_name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h2 className="client-name">
                    {client.first_name} {client.last_name}
                  </h2>
                  <div className="client-status-badge">
                    <StatusBadge
                      status={
                        client.profile?.status?.toLowerCase() || "inactive"
                      }
                    />
                  </div>
                </div>

                <div className="client-details-section">
                  <h3>Personal Information</h3>
                  <div className="client-details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Client ID:</span>
                      <span className="detail-value">
                        {client.profile?.client_id || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{client.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">
                        {client.profile?.contact_number || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Date of Birth:</span>
                      <span className="detail-value">
                        {client.profile?.dob || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Gender:</span>
                      <span className="detail-value">
                        {client.profile?.gender || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Address:</span>
                      <span className="detail-value">
                        {client.profile?.address || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Zip Code:</span>
                      <span className="detail-value">
                        {client.profile?.zip_code || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Marital Status:</span>
                      <span className="detail-value">
                        {client.profile?.marital_status || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="client-details-section">
                  <h3>Next of Kin Information</h3>
                  <div className="client-details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Name:</span>
                      <span className="detail-value">
                        {client.profile?.next_of_kin_name || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Relationship:</span>
                      <span className="detail-value">
                        {client.profile?.next_of_kin_relationship || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Address:</span>
                      <span className="detail-value">
                        {client.profile?.next_of_kin_address || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">
                        {client.profile?.next_of_kin_phone || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">
                        {client.profile?.next_of_kin_email || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="client-details-section">
                  <h3>Care Information</h3>
                  <div className="client-details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Care Plan:</span>
                      <span className="detail-value">
                        {client.profile?.care_plan || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Care Tasks:</span>
                      <span className="detail-value">
                        {client.profile?.care_tasks || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Care Type:</span>
                      <span className="detail-value">
                        {client.profile?.care_type || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Special Needs:</span>
                      <span className="detail-value">
                        {client.profile?.special_needs || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">
                        Preferred Carer Gender:
                      </span>
                      <span className="detail-value">
                        {client.profile?.preferred_carer_gender || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Language Preference:</span>
                      <span className="detail-value">
                        {client.profile?.language_preference || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Frequency of Care:</span>
                      <span className="detail-value">
                        {client.profile?.frequency_of_care || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Flexibility:</span>
                      <span className="detail-value">
                        {client.profile?.flexibility ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Funding Type:</span>
                      <span className="detail-value">
                        {client.profile?.funding_type || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">
                        Care Package Start Date:
                      </span>
                      <span className="detail-value">
                        {client.profile?.care_package_start_date || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">
                        Care Package Review Date:
                      </span>
                      <span className="detail-value">
                        {client.profile?.care_package_review_date || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Status:</span>
                      <span className="detail-value">
                        {client.profile?.status || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {careTimes && (
                  <div className="client-details-section">
                    <h3>Preferred Care Times</h3>
                    <div className="care-times-grid">
                      <div className="care-time-period">
                        <h4>AM</h4>
                        {Object.entries(careTimes.Am || {}).map(
                          ([day, selected]) => (
                            <div key={`am-${day}`} className="care-time-day">
                              <span className="day-label">{day}:</span>
                              <span className="day-value">
                                {selected ? "Yes" : "No"}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                      <div className="care-time-period">
                        <h4>PM</h4>
                        {Object.entries(careTimes.PM || {}).map(
                          ([day, selected]) => (
                            <div key={`pm-${day}`} className="care-time-day">
                              <span className="day-label">{day}:</span>
                              <span className="day-value">
                                {selected ? "Yes" : "No"}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                      <div className="care-time-period">
                        <h4>Night</h4>
                        {Object.entries(careTimes.Night || {}).map(
                          ([day, selected]) => (
                            <div key={`night-${day}`} className="care-time-day">
                              <span className="day-label">{day}:</span>
                              <span className="day-value">
                                {selected ? "Yes" : "No"}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default ClientInfoModal;
