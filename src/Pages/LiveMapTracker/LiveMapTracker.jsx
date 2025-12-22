import React, { useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Tooltip,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import './LiveMapTracker.css';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

import Employee1 from './Img/Employees/1.jpg';
import Employee2 from './Img/Employees/2.jpg';
import Employee3 from './Img/Employees/3.jpg';
import Employee4 from './Img/Employees/4.jpg';
import Employee5 from './Img/Employees/5.jpg';
import Employee6 from './Img/Employees/6.jpg';
import Employee7 from './Img/Employees/7.jpg';
import Employee8 from './Img/Employees/8.jpg';
import Employee9 from './Img/Employees/9.jpg';
import Employee10 from './Img/Employees/10.jpg';

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

const clients = [
  // London Group
  { id: 1, name: "Alice", position: [51.5074, -0.1278], status: "Active", location: "Central London" },
  { id: 2, name: "Bob", position: [51.5115, -0.116], status: "Temporarily Inactive", location: "Westminster" },
  { id: 3, name: "Charlie", position: [51.509, -0.142], status: "Inactive", location: "South Bank" },
  { id: 4, name: "Diana", position: [51.503, -0.113], status: "Active", location: "Shoreditch" },
  { id: 5, name: "Ethan", position: [51.515, -0.092], status: "Inactive", location: "Hackney" },
  
  // Manchester Group
  { id: 6, name: "Fiona", position: [53.4808, -2.2426], status: "Active", location: "Manchester City Centre" },
  { id: 7, name: "George", position: [53.469, -2.238], status: "Temporarily Inactive", location: "Salford" },
  { id: 8, name: "Hannah", position: [53.485, -2.231], status: "Inactive", location: "Ancoats" },
  { id: 9, name: "Ian", position: [53.476, -2.252], status: "Active", location: "Hulme" },
  { id: 10, name: "Julia", position: [53.466, -2.214], status: "Active", location: "Trafford" },
  
  // Birmingham Group
  { id: 11, name: "Kevin", position: [52.4862, -1.8904], status: "Inactive", location: "Birmingham City Centre" },
  { id: 12, name: "Laura", position: [52.479, -1.902], status: "Temporarily Inactive", location: "Digbeth" },
  { id: 13, name: "Michael", position: [52.495, -1.883], status: "Active", location: "Aston" },
  { id: 14, name: "Nina", position: [52.462, -1.874], status: "Inactive", location: "Bournville" },
  
  // Liverpool Group
  { id: 15, name: "Oliver", position: [53.4084, -2.9916], status: "Temporarily Inactive", location: "Liverpool City Centre" },
  { id: 16, name: "Paul", position: [53.416, -2.982], status: "Active", location: "Bootle" },
  { id: 17, name: "Quinn", position: [53.392, -3.002], status: "Inactive", location: "Speke" },
  { id: 18, name: "Rachel", position: [53.378, -2.977], status: "Active", location: "Crosby" },
  
  // Bristol Group
  { id: 19, name: "Steve", position: [51.4545, -2.5879], status: "Inactive", location: "Bristol City Centre" },
  { id: 20, name: "Tina", position: [51.449, -2.592], status: "Active", location: "Clifton" },
  { id: 21, name: "Uma", position: [51.459, -2.572], status: "Temporarily Inactive", location: "Redfield" },
  { id: 22, name: "Victor", position: [51.467, -2.601], status: "Inactive", location: "Filton" },
  { id: 23, name: "Wendy", position: [51.441, -2.612], status: "Active", location: "Bedminster" },
  { id: 24, name: "Xavier", position: [51.425, -2.583], status: "Inactive", location: "Brislington" },
];

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





const groups = [
  {
    name: "London Group",
    color: "#7226FF",
    members: [1, 2, 3, 4, 5],
    locations: ["Central London", "Westminster", "South Bank", "Shoreditch", "Hackney"]
  },
  {
    name: "Manchester Group",
    color: "#FF2626",
    members: [6, 7, 8, 9, 10],
    locations: ["Manchester City Centre", "Salford", "Ancoats", "Hulme", "Trafford"]
  },
  {
    name: "Birmingham Group",
    color: "#26FF72",
    members: [11, 12, 13, 14],
    locations: ["Birmingham City Centre", "Digbeth", "Aston", "Bournville"]
  },
  {
    name: "Liverpool Group",
    color: "#FFA726",
    members: [15, 16, 17, 18],
    locations: ["Liverpool City Centre", "Bootle", "Speke", "Crosby"]
  },
  {
    name: "Bristol Group",
    color: "#2672FF",
    members: [19, 20, 21, 22, 23, 24],
    locations: ["Bristol City Centre", "Clifton", "Redfield", "Filton", "Bedminster", "Brislington"]
  },
];

const getGroupByClientId = (clientId) => {
  return groups.find(group => group.members.includes(clientId));
};

const groupLines = groups.flatMap((group) => {
  const groupClients = group.members.map(id => 
    clients.find(client => client.id === id)
  );
  const lines = [];

  for (let i = 0; i < groupClients.length; i++) {
    for (let j = i + 1; j < groupClients.length; j++) {
      const from = groupClients[i];
      const to = groupClients[j];
      lines.push({
        positions: [from.position, to.position],
        color: group.color,
        distance: getDistanceFromLatLonInKm(
          from.position[0], from.position[1],
          to.position[0], to.position[1]
        ).toFixed(2),
      });
    }
  }
  return lines;
});

const calculateGroupCentroid = (memberIds) => {
  const members = memberIds.map(id => clients.find(c => c.id === id));
  const avgLat = members.reduce((sum, c) => sum + c.position[0], 0) / members.length;
  const avgLng = members.reduce((sum, c) => sum + c.position[1], 0) / members.length;
  return [avgLat, avgLng];
};

const createGroupLabelIcon = (groupName, color) => {
  return L.divIcon({
    className: "group-label-icon",
    html: `
      <div style="
        background: ${color};
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-weight: bold;
        font-size: 12px;
        text-shadow: 0 0 2px rgba(0,0,0,0.5);
        white-space: nowrap;
        display:inline-flex;
      ">${groupName}</div>
    `,
    iconSize: null,
    iconAnchor: [0, 0]
  });
};

// Create a clickable dot icon for groups
const createGroupDotIcon = (color) => {
  return L.divIcon({
    className: "group-dot-icon",
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.7); cursor: pointer;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

function GroupSummary({ groups, show }) {
  const [expandedGroups, setExpandedGroups] = useState([]);

  const toggleGroup = (groupName) => {
    if (expandedGroups.includes(groupName)) {
      setExpandedGroups(expandedGroups.filter(name => name !== groupName));
    } else {
      setExpandedGroups([...expandedGroups, groupName]);
    }
  };

  return (
    <div className={`group-summary ${show ? '' : 'hidden'}`}>
      <h3>Client Groups Coverage</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {groups.map((group, i) => {
          const isExpanded = expandedGroups.includes(group.name);
          return (
            <li key={i} style={{ marginBottom: "12px" }}>
              <div 
                className="group-header"
                onClick={() => toggleGroup(group.name)}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span 
                    className="color-box" 
                    style={{ backgroundColor: group.color }}
                  />
                  <strong>{group.name}</strong>
                </div>
                {isExpanded ? (
                  <ChevronDownIcon className="chevron-icon chevron-down" />
                ) : (
                  <ChevronRightIcon className="chevron-icon chevron-right" />
                )}
              </div>
              <div style={{ fontSize: '12px', marginTop: '4px', marginLeft: '22px' }}>
                {group.members.length} clients, {group.locations.length} locations
              </div>
              <div 
                className={`group-locations ${isExpanded ? 'expanded' : ''}`}
              >
                {isExpanded && (
                  <div>
                    Locations covered:
                    <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px' }}>
                      {group.locations.map((loc, j) => (
                        <li key={j} className="location-item">{loc}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MapZoomListener({ onZoomChange }) {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });
  return null;
}

// Component for group markers that handles zoom-to-group functionality
function GroupMarker({ group, zoomLevel }) {
  const map = useMap();
  
  // Calculate the group bounds to zoom to
  const getGroupBounds = () => {
    const memberPositions = group.members.map(id => {
      const client = clients.find(c => c.id === id);
      return client.position;
    });
    return L.latLngBounds(memberPositions);
  };
  
  // Handle click to zoom to group
const handleGroupClick = () => {
  const bounds = getGroupBounds();
map.flyToBounds(bounds, {
  padding: [50, 50],
  animate: true,
  duration: 0.8,     // faster = less blurry loading
  maxZoom: 15,       // go closer
  easeLinearity: 0.25
});

};



  const centroid = calculateGroupCentroid(group.members);
  
  return (
    <Marker
      position={centroid}
      icon={zoomLevel >= 8 ? createGroupLabelIcon(group.name, group.color) : createGroupDotIcon(group.color)}
      zIndexOffset={1000}
      eventHandlers={{ click: handleGroupClick }}
    >
      <Tooltip 
        permanent={zoomLevel >= 8} 
        direction="top" 
        offset={zoomLevel >= 8 ? [0, -10] : [0, 0]}
        className={zoomLevel >= 8 ? '' : 'group-dot-tooltip'}
      >
        {`${group.name}: ${group.members.length} clients in ${group.locations.length} locations`}
      </Tooltip>
    </Marker>
  );
}

export default function ClientEmployeeMap() {
  const [zoomLevel, setZoomLevel] = useState(6);
  const showGroupDetails = true;
  const mapRef = useRef();


const zoomToGroupLocations = (group) => {
  if (!mapRef.current) return;

  // Get all client positions for this group
  const positions = group.members.map(id => {
    const client = clients.find(c => c.id === id);
    return client.position;
  });

  if (positions.length === 1) {
    // If only one location, just fly to it
    mapRef.current.flyTo(positions[0], 14, { duration: 1 });
  } else {
    // If multiple, fit bounds
    const bounds = L.latLngBounds(positions);
    mapRef.current.flyToBounds(bounds, { padding: [50, 50], duration: 1 });
  }
};

  
  const getNearestClientDistance = (empPos) => {
    let minDistance = Infinity;
    for (const client of clients) {
      const dist = getDistanceFromLatLonInKm(
        empPos[0],
        empPos[1],
        client.position[0],
        client.position[1]
      );
      if (dist < minDistance) minDistance = dist;
    }
    return minDistance.toFixed(2);
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

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <MapContainer 
        center={[53.0, -1.5]} 
        zoom={6} 
        style={{ height: "100%", width: "100%" }}
        whenCreated={mapInstance => { mapRef.current = mapInstance }}
      >
        <MapZoomListener onZoomChange={setZoomLevel} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

      {zoomLevel >= 8 && groupLines.map((line, idx) => (
      <Polyline
        key={idx}
        positions={line.positions}
        color={line.color}
        weight={2}
        opacity={0.7}
      >
        {zoomLevel >= 9 && (
          <Tooltip permanent sticky direction="center" offset={[0, 0]} opacity={1} className="dstn-Box">
            {line.distance} km
          </Tooltip>
        )}
      </Polyline>
    ))}



        {clients.map((client) => {
          const icon = createClientIcon(client.status);
          const group = getGroupByClientId(client.id);
          const boxColor = statusColors[client.status] || "#F03D3D";

          return (
            <Marker key={client.id} position={client.position} icon={icon}>
              <Popup>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <strong>{client.name}</strong>
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      backgroundColor: boxColor,
                      borderRadius: "3px",
                      border: "1px solid #555",
                    }}
                    title={`Status: ${client.status}`}
                  />
                </div>
                <div>Status: <em>{client.status}</em></div>
                <div>Group: {group ? group.name : "None"}</div>
                <div>Location: <strong>{client.location}</strong></div>
              </Popup>
            </Marker>
          );
        })}
{employees.map((emp) => {
  const nearestDist = getNearestClientDistance(emp.position);
  const photoUrl = emp.photo;
  const assignmentClass = emp.assignedToClientStatus; // e.g. assigned-active, not-assigned
  const isAvailable = emp.availabilityStatus === "Available";
  const clientPresence = emp.clientPresence; // "Present", "Absent", or null

  // Active status: Yes if available, No otherwise
  const activeStatusText = isAvailable ? "Yes" : "Not Active";

  // Client status text
  const clientStatusText = assignmentClass.startsWith("assigned")
    ? `Assigned (${clientPresence || "Unknown"})`
    : "Not Assigned";

  // Show assignment indicator icon only if available
  const showAssignmentIndicator = isAvailable;

  const iconHtml = showAssignmentIndicator
    ? `
      <div class="employee-img-wrapper ${assignmentClass}">
        <img src="${photoUrl}" alt="Employee" />
        <i class="assignment-indicator ${assignmentClass}"></i>
      </div>
    `
    : `
      <div class="employee-img-wrapper not-available">
        <img src="${photoUrl}" alt="Employee" />
      </div>
    `;

  return (
    <Marker
      key={emp.id}
      position={emp.position}
      icon={L.divIcon({
        className: `employee-photo-icon ${assignmentClass} ${
          !isAvailable ? "not-available" : ""
        }`,
        html: iconHtml,
        iconSize: [30, 41],
        iconAnchor: [15, 41],
        popupAnchor: [0, -41],
      })}
    >
    <Popup>
  <div className="employee-popup-header">
    <img src={photoUrl} alt={emp.name} className="employee-popup-photo" />
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



        {/* Always render group markers - they handle their own visibility */}
        {groups.map((group) => (
          <GroupMarker 
            key={`group-${group.name}`} 
            group={group} 
            zoomLevel={zoomLevel} 
          />
        ))}
      </MapContainer>

      <GroupSummary groups={groups} show={showGroupDetails} onGroupExpand={zoomToGroupLocations} />

      
    
    </div>
  );
}