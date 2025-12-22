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
import { ChevronDownIcon, ChevronRightIcon, CheckIcon } from '@heroicons/react/24/outline';
import './VisitMap.css';

const statusColors = {
  Active: "#7226ff",
  "Temporarily Inactive": "#f9a825",
  Inactive: "#F03D3D",
};

const createClientIcon = (status) => {
  const fillColor = statusColors[status] || "#F03D3D";
  const statusClass = status.toLowerCase().replace(/\s+/g, '-');
  return L.divIcon({
    className: `custom-client-icon ${statusClass}`,
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

function getPositionFromDistance(distanceKm, bearingDegrees) {
  const R = 6371; // Earth's radius in km
  const lat1 = 53.4808 * Math.PI / 180; // Manchester lat
  const lon1 = -2.2426 * Math.PI / 180; // Manchester lon
  const d = distanceKm / R;
  const theta = bearingDegrees * Math.PI / 180;
  const sinLat1 = Math.sin(lat1);
  const cosLat1 = Math.cos(lat1);
  const lat2 = Math.asin(sinLat1 * Math.cos(d) + cosLat1 * Math.sin(d) * Math.cos(theta));
  const lon2 = lon1 + Math.atan2(
    Math.sin(theta) * Math.sin(d) * cosLat1,
    Math.cos(d) - sinLat1 * Math.sin(lat2)
  );
  return [lat2 * 180 / Math.PI, lon2 * 180 / Math.PI];
}

const clients = [
  // Reduced to one client (Tina in Manchester)
  { id: 20, name: "Tina", position: [53.4808, -2.2426], status: "Active", location: "Manchester" },
];

const selectedClient = clients.find(c => c.id === 20);

const createEmployeeIcon = (emp, isSelected = false) => {
  let htmlContent = '';
  if (emp.photo) {
    // Use full image
    htmlContent = `
      <div class="employee-img-wrapper" style="position: relative;">
        <img src="${emp.photo}" alt="Employee" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;" />
        ${isSelected ? `
          <span class="selected-check-icon" title="Selected">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#fff" width="10" height="10">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        ` : ''}
      </div>
    `;
  } else {
    // Use initials
    const initials = emp.name.split(' ').map(n => n[0]).join('').toUpperCase();
    htmlContent = `
      <div class="employee-initials-wrapper" style="position: relative; width: 30px; height: 30px; background: #7226ff; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">
        ${initials}
        ${isSelected ? `
          <span class="selected-check-icon" title="Selected" style="position: absolute; bottom: -2px; right: -2px; background: white; border-radius: 50%; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="green" width="8" height="8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        ` : ''}
      </div>
    `;
  }
  return L.divIcon({
    className: `employee-photo-icon ${isSelected ? 'selected-employee' : ''}`,
    html: htmlContent,
    iconSize: [30, 41],
    iconAnchor: [15, 41],
    popupAnchor: [0, -41],
  });
};

const createDistanceIcon = (distance) => {
  return L.divIcon({
    className: 'distance-marker',
    html: `
      <span class="distance-label">${distance}</span>
    `,
    iconSize: [40, 20],
    iconAnchor: [20, 10],
    popupAnchor: [0, -10],
  });
};

function MapZoomListener({ onZoomChange }) {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });
  return null;
}

export default function VisitMap({ carers = [], selectedCarerIds = [] }) {
  const [zoomLevel, setZoomLevel] = useState(13);
  const mapRef = useRef();

  const employees = carers.map((carer, index) => {
    const distNum = parseFloat(carer.distance);
    const bearing = index * 60;
    const position = getPositionFromDistance(distNum, bearing);
    const distStr = carer.distance;
    const isSelected = selectedCarerIds.includes(carer.id);
    return {
      id: carer.id,
      name: carer.name,
      position,
      travelMethod: carer.mobilityDisplay,
      photo: carer.image,
      distStr,
      isSelected,
    };
  });

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <MapContainer
        center={selectedClient ? selectedClient.position : [53.4808, -2.2426]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        whenCreated={mapInstance => { mapRef.current = mapInstance }}
        attributionControl={false}
      >
        <MapZoomListener onZoomChange={setZoomLevel} />
        <TileLayer
          attribution=''
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Client marker (only one) */}
        {selectedClient && (
          <>
            <Marker position={selectedClient.position} icon={createClientIcon(selectedClient.status)}>
              <Popup>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <strong>{selectedClient.name}</strong>
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      backgroundColor: statusColors[selectedClient.status] || "#F03D3D",
                      borderRadius: "3px",
                      border: "1px solid #555",
                    }}
                    title={`Status: ${selectedClient.status}`}
                  />
                </div>
                <div>Status: <em>{selectedClient.status}</em></div>
                <div>Location: <strong>{selectedClient.location}</strong></div>
              </Popup>
            </Marker>
            <Circle
              center={selectedClient.position}
              radius={500} // 0.5 km radius for a smaller circle
              color="#7226ff"
              fillColor="#7226ff"
              fillOpacity={0.2}
              weight={2}
            >
              <Tooltip permanent>{selectedClient.name}</Tooltip>
            </Circle>
          </>
        )}
        {/* Employee markers */}
        {employees.map((emp) => {
          const nearestDist = emp.distStr;
          const labelPosition = [emp.position[0], emp.position[1] + 0.001]; // Offset to the right
          return (
            <>
              <Marker
                key={`${emp.id}-employee`}
                position={emp.position}
                icon={createEmployeeIcon(emp, emp.isSelected)}
              >
                <Popup>
                  <div className="employee-popup-header">
                    {emp.photo ? (
                      <img src={emp.photo} alt={emp.name} className="employee-popup-photo" />
                    ) : (
                      <div className="employee-popup-initials">
                        {emp.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                    )}
                    <strong>{emp.name}</strong>
                  </div>
                  <div>(Carer)</div>
                  <div>Travel Method: {emp.travelMethod}</div>
                  <div>Distance to client: {nearestDist}</div>
                  {emp.isSelected && <div><strong>Status: Selected</strong></div>}
                </Popup>
              </Marker>
              <Marker
                key={`${emp.id}-distance`}
                position={labelPosition}
                icon={createDistanceIcon(nearestDist)}
              />
            </>
          );
        })}
      </MapContainer>
    </div>
  );
}