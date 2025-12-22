import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconWalk, IconBus, IconCar } from "@tabler/icons-react";

const backdropStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "white",
  borderRadius: "8px",
  padding: "20px",
  width: "90%",
  maxWidth: "600px",
  maxHeight: "80vh",
  overflowY: "auto",
  boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
};

const ClientModal = ({ visible, client, onClose }) => {
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getTransportIcon = (type) => {
    switch (type) {
      case "walking":
        return <IconWalk size={16} />;
      case "car":
        return <IconCar size={16} />;
      case "bus":
        return <IconBus size={16} />;
      default:
        return null;
    }
  };

  const getTransportText = (type) => {
    switch (type) {
      case "walking":
        return "Walking";
      case "car":
        return "Private Car";
      case "bus":
        return "Public Transport";
      default:
        return "Unknown";
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          style={backdropStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // click outside closes
        >
          <motion.div
            style={modalStyle}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
          >
            <div style={{ textAlign: "center" }}>
              {client.image ? (
                <img
                  src={client.image}
                  alt={client.name}
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginBottom: "10px",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    background: "#4CAF50",
                    color: "white",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "32px",
                    fontWeight: "bold",
                    margin: "0 auto 10px",
                  }}
                >
                  {client.initials}
                </div>
              )}
              <h2>{client.name}</h2>
              <p>
                <b>Address:</b> {client.address}
              </p>
              <p>
                <b>Coordinates:</b> {client.position[0].toFixed(5)},{" "}
                {client.position[1].toFixed(5)}
              </p>
            </div>

            {client.staff && client.staff.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <h3 style={{ marginBottom: "10px" }}>Allocated Staff</h3>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    border: "1px solid #ddd",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                      <th style={{ padding: "8px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Name</th>
                      <th style={{ padding: "8px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Role</th>
                      <th style={{ padding: "8px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Distance (km)</th>
                      <th style={{ padding: "8px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Transportation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {client.staff.map((staff, index) => {
                      const distance = staff.homePosition
                        ? haversineDistance(
                            client.position[0],
                            client.position[1],
                            staff.homePosition[0],
                            staff.homePosition[1]
                          ).toFixed(2)
                        : "N/A";
                      return (
                        <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                          <td style={{ padding: "8px" }}>{staff.name}</td>
                          <td style={{ padding: "8px" }}>{staff.role}</td>
                          <td style={{ padding: "8px" }}>{distance}</td>
                          <td style={{ padding: "8px" }}>
                            {getTransportIcon(staff.transportation)}
                            <span style={{ marginLeft: "4px" }}>{getTransportText(staff.transportation)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <button
              style={{
                marginTop: "20px",
                padding: "8px 16px",
                background: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                width: "100%",
              }}
              onClick={onClose}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ClientModal;