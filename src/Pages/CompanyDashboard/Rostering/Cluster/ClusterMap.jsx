import React, { useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Tooltip,
  useMapEvents,
  useMap,
  Circle,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import "./ClusterMap.css";

import Employee1 from "./Img/Employees/1.jpg";
import Employee2 from "./Img/Employees/2.jpg";
import Employee3 from "./Img/Employees/3.jpg";
import Employee4 from "./Img/Employees/4.jpg";
import Employee5 from "./Img/Employees/5.jpg";
import Employee6 from "./Img/Employees/6.jpg";
import Employee7 from "./Img/Employees/7.jpg";
import Employee8 from "./Img/Employees/8.jpg";
import Employee9 from "./Img/Employees/9.jpg";
import Employee10 from "./Img/Employees/10.jpg";

const statusColors = {
  Active: "#35C220",
  "Temporarily Inactive": "#f9a825",
  Inactive: "#F03D3D",
};

const createClientIcon = (status) => {
  const fillColor = statusColors[status] || "#F03D3D";
  return L.divIcon({
    className: "custom-client-icon",
    html: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 1.25C16.4778 1.25 20.25 5.01859 20.25 9.58691C20.25 14.2513 16.402 17.4123 13.1699 19.4297L13.1465 19.4434C12.7977 19.6441 12.4025 19.75 12 19.75C11.5975 19.75 11.2023 19.6441 10.8535 19.4434L10.8398 19.4355L10.8271 19.4277C7.6076 17.3948 3.75001 14.2671 3.75 9.58691C3.75 5.01859 7.52225 1.25 12 1.25ZM12 6C10.067 6 8.5 7.567 8.5 9.5C8.5 11.433 10.067 13 12 13C13.933 13 15.5 11.433 15.5 9.5C15.5 7.567 13.933 6 12 6Z" fill="${fillColor}"/>
        <path d="M6 18.75C6.5212 18.75 6.94927 19.1487 6.99581 19.6578C7.01311 19.6768 7.04258 19.7053 7.09048 19.7431C7.26885 19.8836 7.58893 20.054 8.07359 20.2155C9.03245 20.5352 10.4207 20.75 12 20.75C13.5793 20.75 14.9675 20.5352 15.9264 20.2155C16.4111 20.054 16.7311 19.8836 16.9095 19.7431C16.9574 19.7053 16.9869 19.6768 17.0042 19.6578C17.0507 19.1487 17.4788 18.75 18 18.75C18.5523 18.75 19 19.1977 19 19.75C19 20.4639 18.5651 20.9848 18.1475 21.3139C17.7186 21.6519 17.16 21.9125 16.5589 22.1129C15.3462 22.5171 13.7344 22.75 12 22.75C10.2656 22.75 8.65384 22.5171 7.44113 22.1129C6.84 21.9125 6.2814 21.6519 5.85254 21.3139C5.43495 20.9848 5 20.4639 5 19.75C5 19.1977 5.44772 18.75 6 18.75Z" fill="${fillColor}"/>
      </svg>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const employees = [
  {
    id: 1,
    name: "John Smith",
    position: [51.5074, -0.1278],
    travelMethod: "Driving",
    photo: Employee1,
    assignedToClientStatus: "assigned-active",
    availabilityStatus: "Available",
    clientPresence: "Present",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    position: [53.4808, -2.2426],
    travelMethod: "Walking",
    photo: Employee2,
    assignedToClientStatus: "not-assigned",
    availabilityStatus: "Not Available",
    clientPresence: null,
  },
  {
    id: 3,
    name: "David Brown",
    position: [52.4862, -1.8904],
    travelMethod: "Public Transport",
    photo: Employee3,
    assignedToClientStatus: "assigned-inactive",
    availabilityStatus: "Available",
    clientPresence: "Absent",
  },
  {
    id: 4,
    name: "Emma Wilson",
    position: [53.4084, -2.9916],
    travelMethod: "Driving",
    photo: Employee4,
    assignedToClientStatus: "assigned-active",
    availabilityStatus: "Available",
    clientPresence: "Present",
  },
  {
    id: 5,
    name: "James Taylor",
    position: [51.4545, -2.5879],
    travelMethod: "Public Transport",
    photo: Employee5,
    assignedToClientStatus: "not-assigned",
    availabilityStatus: "Not Available",
    clientPresence: null,
  },
  {
    id: 6,
    name: "Olivia Martinez",
    position: [51.515, -0.09],
    travelMethod: "Bicycle",
    photo: Employee6,
    assignedToClientStatus: "assigned-active",
    availabilityStatus: "Available",
    clientPresence: "Present",
  },
  {
    id: 7,
    name: "Liam Davis",
    position: [53.47, -2.25],
    travelMethod: "Walking",
    photo: Employee7,
    assignedToClientStatus: "assigned-inactive",
    availabilityStatus: "Available",
    clientPresence: "Absent",
  },
  {
    id: 8,
    name: "Sophia Garcia",
    position: [52.49, -1.89],
    travelMethod: "Driving",
    photo: Employee8,
    assignedToClientStatus: "not-assigned",
    availabilityStatus: "Not Available",
    clientPresence: null,
  },
  {
    id: 9,
    name: "Mason Lee",
    position: [53.41, -2.98],
    travelMethod: "Public Transport",
    photo: Employee9,
    assignedToClientStatus: "not-assigned",
    availabilityStatus: "Not Available",
    clientPresence: null,
  },
  {
    id: 10,
    name: "Isabella Taylor",
    position: [51.45, -2.59],
    travelMethod: "Walking",
    photo: Employee10,
    assignedToClientStatus: "assigned-active",
    availabilityStatus: "Available",
    clientPresence: "Present",
  },
];

function MapZoomListener({ onZoomChange }) {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });
  return null;
}

const BouncingMapTooltip = ({ position, label, color }) => {
  const tooltipRef = useRef(null);
  const controls = useAnimation();
  const map = useMap();

  const [screenPos, setScreenPos] = useState(() =>
    map.latLngToContainerPoint(L.latLng(position[0], position[1]))
  );

  useEffect(() => {
    const updatePosition = () => {
      const point = map.latLngToContainerPoint(
        L.latLng(position[0], position[1])
      );
      setScreenPos(point);
    };

    updatePosition(); // Initial position
    map.on("zoom", updatePosition);
    map.on("move", updatePosition);

    return () => {
      map.off("zoom", updatePosition);
      map.off("move", updatePosition);
    };
  }, [map, position]);

  useEffect(() => {
    const animate = () => {
      controls.start({
        scale: [1, 1.2, 1],
        transition: { duration: 1, ease: "easeInOut" },
      });
    };

    animate(); // Initial bounce
    const interval = setInterval(animate, 5000); // Re-trigger every 5 seconds
    return () => clearInterval(interval);
  }, [controls]);

  return (
    <motion.div
      ref={tooltipRef}
      animate={controls}
      initial={{ scale: 1 }}
      className="bouncing-tooltip"
      style={{
        top: `${screenPos.y - 30}px`,
        left: `${screenPos.x}px`,
        backgroundColor: color || "#7226FF",
      }}
    >
      {label || "Loading..."}
    </motion.div>
  );
};

const getNearestClientDistance = (empPos, clients) => {
  let minDistance = Infinity;
  for (const client of clients) {
    if (client.position) {
      const dist = getDistanceFromLatLonInKm(
        empPos[0],
        empPos[1],
        client.position[0],
        client.position[1]
      );
      if (dist < minDistance) minDistance = dist;
    }
  }
  return minDistance === Infinity ? "N/A" : minDistance.toFixed(2);
};

const createEmployeeIcon = (photoUrl, status) => {
  return L.divIcon({
    className: `employee-photo-icon ${status}`,
    html: `<img src="${photoUrl}" alt="Employee" />`,
    iconSize: [30, 41],
    iconAnchor: [15, 41],
    popupAnchor: [0, -41],
  });
};

export default function ClusterMap({ cluster = null, clients = [] }) {
  const [zoomLevel, setZoomLevel] = useState(6);
  const mapRef = useRef();
  const center =
    cluster && cluster.latitude && cluster.longitude
      ? [cluster.latitude, cluster.longitude]
      : [53.0, -1.5];
  const initialZoom = cluster ? 12 : 6;

  // Recenter map when cluster changes
  useEffect(() => {
    if (mapRef.current && cluster && cluster.latitude && cluster.longitude) {
      mapRef.current.setView(
        [cluster.latitude, cluster.longitude],
        initialZoom,
        { animate: true, duration: 1.5 }
      );
    }
  }, [cluster, initialZoom]);

  const getCircleRadius = (zoom) => {
    if (zoom > 6) return 0; // Hide the circle when zoomed in
    return cluster ? cluster.radiusMeters : 50000; // Use cluster radius or default
  };

  const bristolCentroid = center; // Reuse for demo, but align to cluster center

  const createEmployeeIconHtml = (emp) => {
    const assignmentClass = emp.assignedToClientStatus;
    const isAvailable = emp.availabilityStatus === "Available";
    const clientPresence = emp.clientPresence;

    const showAssignmentIndicator = isAvailable;

    const iconHtml = showAssignmentIndicator
      ? `
        <div class="employee-img-wrapper ${assignmentClass}">
          <img src="${emp.photo}" alt="Employee" />
          <i class="assignment-indicator ${assignmentClass}"></i>
        </div>
      `
      : `
        <div class="employee-img-wrapper not-available">
          <img src="${emp.photo}" alt="Employee" />
        </div>
      `;

    return L.divIcon({
      className: `employee-photo-icon ${assignmentClass} ${
        !isAvailable ? "not-available" : ""
      }`,
      html: iconHtml,
      iconSize: [30, 41],
      iconAnchor: [15, 41],
      popupAnchor: [0, -41],
    });
  };

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <MapContainer
        center={center}
        zoom={initialZoom}
        style={{ height: "100%", width: "100%" }}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
        }}
      >
        <MapZoomListener onZoomChange={setZoomLevel} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Cluster Circle */}
        {cluster && cluster.latitude && cluster.longitude && (
          <Circle
            center={[cluster.latitude, cluster.longitude]}
            radius={getCircleRadius(zoomLevel)}
            pathOptions={{
              color: "#7226FF",
              fillColor: "#7226FF",
              fillOpacity: 0.2,
            }}
          />
        )}

        {/* Bouncing Tooltip - moved outside Circle to ensure context */}
        {zoomLevel <= 6 && cluster && cluster.latitude && cluster.longitude && (
          <BouncingMapTooltip
            position={[cluster.latitude, cluster.longitude]}
            label={cluster.name}
            color="#7226FF"
          />
        )}

        {/* Client markers (from props, aligned with cluster) */}
        {clients.map((client, index) => {
          // Assume clients have position; if not, skip or geocode (mock for now)
          if (!client.position) return null;
          const icon = createClientIcon(client.status || "Active");
          const boxColor = statusColors[client.status || "Active"] || "#F03D3D";

          return (
            <Marker
              key={`client-${index}`}
              position={client.position}
              icon={icon}
            >
              <Popup>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <strong>{client.fullName || client.name}</strong>
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      backgroundColor: boxColor,
                      borderRadius: "3px",
                      border: "1px solid #555",
                    }}
                    title={`Status: ${client.status || "Active"}`}
                  />
                </div>
                <div>Postcode: {client.postcode}</div>
                <div>Visit Time: {client.visitTime}</div>
              </Popup>
            </Marker>
          );
        })}

        {/* Employee markers (kept for demo, but can be passed as prop) */}
        {employees.map((emp) => {
          const nearestDist = getNearestClientDistance(emp.position, clients);
          const photoUrl = emp.photo;
          const assignmentClass = emp.assignedToClientStatus;
          const isAvailable = emp.availabilityStatus === "Available";
          const clientPresence = emp.clientPresence;

          const activeStatusText = isAvailable ? "Yes" : "Not Active";
          const clientStatusText = assignmentClass.startsWith("assigned")
            ? `Assigned (${clientPresence || "Unknown"})`
            : "Not Assigned";

          return (
            <Marker
              key={emp.id}
              position={emp.position}
              icon={createEmployeeIconHtml(emp)}
            >
              <Popup>
                <div className="employee-popup-header">
                  <img
                    src={photoUrl}
                    alt={emp.name}
                    className="employee-popup-photo"
                  />
                  <strong>{emp.name}</strong>
                </div>
                <div>(Employee)</div>
                <div>Travel Method: {emp.travelMethod}</div>
                <div>Nearest client: {nearestDist} km</div>
                <div className="employee-popup-status">
                  <div>
                    <strong>Client:</strong>{" "}
                    <i
                      className={`client-indicator ${assignmentClass} ${
                        clientPresence ? clientPresence.toLowerCase() : ""
                      }`}
                      title={`Client status: ${clientStatusText}`}
                    />
                    {clientStatusText}
                  </div>
                  <div>
                    <strong>Active:</strong>{" "}
                    <i
                      className={`active-indicator ${assignmentClass} ${
                        isAvailable ? "yes" : "not-active"
                      }`}
                      title={`Active status: ${activeStatusText}`}
                    />
                    {activeStatusText}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
