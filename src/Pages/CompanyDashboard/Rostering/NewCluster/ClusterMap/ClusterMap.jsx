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
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

import './ClusterMap.css';

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
  // London Cluster
  { id: 1, name: "Alice", position: [51.5074, -0.1278], status: "Active", location: "Central London", fullAddress: "Flat 1, 123 Baker Street, London W1U 6EQ" },
  { id: 2, name: "Bob", position: [51.5115, -0.116], status: "Temporarily Inactive", location: "Westminster", fullAddress: "10 Downing Street, Westminster, London SW1A 2AA" },
  { id: 3, name: "Charlie", position: [51.509, -0.142], status: "Inactive", location: "South Bank", fullAddress: "1 Waterloo Road, South Bank, London SE1 8SW" },
  { id: 4, name: "Diana", position: [51.503, -0.113], status: "Active", location: "Shoreditch", fullAddress: "123 City Road, Shoreditch, London EC1V 1AF" },
  { id: 5, name: "Ethan", position: [51.515, -0.092], status: "Inactive", location: "Hackney", fullAddress: "1 Mare Street, Hackney, London E8 1AA" },
  
  // Manchester Cluster
  { id: 6, name: "Fiona", position: [53.4808, -2.2426], status: "Active", location: "Manchester City Centre", fullAddress: "1 Deansgate, Manchester M3 2BQ" },
  { id: 7, name: "George", position: [53.469, -2.238], status: "Temporarily Inactive", location: "Salford", fullAddress: "1 Abram Street, Salford M7 1AB" },
  { id: 8, name: "Hannah", position: [53.485, -2.231], status: "Inactive", location: "Ancoats", fullAddress: "1 Great Ancoats Street, Manchester M4 7BT" },
  { id: 9, name: "Ian", position: [53.476, -2.252], status: "Active", location: "Hulme", fullAddress: "1 Trinity Way, Hulme, Manchester M15 6FD" },
  { id: 10, name: "Julia", position: [53.466, -2.214], status: "Active", location: "Trafford", fullAddress: "Trafford House, Chester Road, Stretford, Manchester M32 0RS" },
  
  // Birmingham Cluster
  { id: 11, name: "Kevin", position: [52.4862, -1.8904], status: "Inactive", location: "Birmingham City Centre", fullAddress: "1 New Street, Birmingham B2 4AS" },
  { id: 12, name: "Laura", position: [52.479, -1.902], status: "Temporarily Inactive", location: "Digbeth", fullAddress: "1 Digbeth High Street, Birmingham B5 6DY" },
  { id: 13, name: "Michael", position: [52.495, -1.883], status: "Active", location: "Aston", fullAddress: "1 Ettington Road, Aston, Birmingham B6 6ES" },
  { id: 14, name: "Nina", position: [52.462, -1.874], status: "Inactive", location: "Bournville", fullAddress: "1 Bournville Lane, Bournville, Birmingham B30 1QX" },
  
  // Liverpool Cluster
  { id: 15, name: "Oliver", position: [53.4084, -2.9916], status: "Temporarily Inactive", location: "Liverpool City Centre", fullAddress: "1 Castle Street, Liverpool L2 4TA" },
  { id: 16, name: "Paul", position: [53.416, -2.982], status: "Active", location: "Bootle", fullAddress: "1 Stanley Road, Bootle L20 3DY" },
  { id: 17, name: "Quinn", position: [53.392, -3.002], status: "Inactive", location: "Speke", fullAddress: "31 Tarbock Road, Speke, Liverpool L24 0SN" },
  { id: 18, name: "Rachel", position: [53.378, -2.977], status: "Active", location: "Crosby", fullAddress: "1 Liverpool Road, Crosby, Liverpool L23 2SR" },
  
  // Bristol Cluster
  { id: 19, name: "Steve", position: [51.4545, -2.5879], status: "Inactive", location: "Bristol City Centre", fullAddress: "42 Triangle West, Bristol BS8 1ES" },
  { id: 20, name: "Tina", position: [51.449, -2.592], status: "Active", location: "Clifton", fullAddress: "1 Clifton Down, Bristol BS8 4AF" },
  { id: 21, name: "Uma", position: [51.459, -2.572], status: "Temporarily Inactive", location: "Redfield", fullAddress: "1 Verrier Road, Redfield, Bristol BS5 7NP" },
  { id: 22, name: "Victor", position: [51.467, -2.601], status: "Inactive", location: "Filton", fullAddress: "1 Gloucester Road North, Filton, Bristol BS34 7BQ" },
  { id: 23, name: "Wendy", position: [51.441, -2.612], status: "Active", location: "Bedminster", fullAddress: "3 Princess Street, Bedminster, Bristol BS3 4AG" },
  { id: 24, name: "Xavier", position: [51.425, -2.583], status: "Inactive", location: "Brislington", fullAddress: "1 Bath Road, Brislington, Bristol BS4 5NL" },
];

const carers = [
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





const clusters = [
  {
    name: "London Cluster",
    clusterLabel: "Cluster A",
    color: "#7226FF",
    members: [1, 2, 3, 4, 5],
    locations: ["Central London", "Westminster", "South Bank", "Shoreditch", "Hackney"]
  },
  {
    name: "Manchester Cluster",
    clusterLabel: "Cluster B",
    color: "#7226FF",
    members: [6, 7, 8, 9, 10],
    locations: ["Manchester City Centre", "Salford", "Ancoats", "Hulme", "Trafford"]
  },
  {
    name: "Birmingham Cluster",
    clusterLabel: "Cluster C",
    color: "#7226FF",
    members: [11, 12, 13, 14],
    locations: ["Birmingham City Centre", "Digbeth", "Aston", "Bournville"]
  },
  {
    name: "Liverpool Cluster",
    clusterLabel: "Cluster D",
    color: "#7226FF",
    members: [15, 16, 17, 18],
    locations: ["Liverpool City Centre", "Bootle", "Speke", "Crosby"]
  },
  {
    name: "Bristol Cluster",
    clusterLabel: "Cluster E",
    color: "#7226FF",
    members: [19, 20, 21, 22, 23, 24],
    locations: ["Bristol City Centre", "Clifton", "Redfield", "Filton", "Bedminster", "Brislington"]
  },
];


const getClusterByClientId = (clientId) => {
  return clusters.find(cluster => cluster.members.includes(clientId));
};

const clusterLines = clusters.flatMap((cluster) => {
  const clusterClients = cluster.members.map(id => 
    clients.find(client => client.id === id)
  );
  const lines = [];

  for (let i = 0; i < clusterClients.length; i++) {
    for (let j = i + 1; j < clusterClients.length; j++) {
      const from = clusterClients[i];
      const to = clusterClients[j];
      lines.push({
        positions: [from.position, to.position],
        color: cluster.color,
        distance: getDistanceFromLatLonInKm(
          from.position[0], from.position[1],
          to.position[0], to.position[1]
        ).toFixed(2),
      });
    }
  }
  return lines;
});

const calculateClusterCentroid = (memberIds) => {
  const members = memberIds.map(id => clients.find(c => c.id === id));
  const avgLat = members.reduce((sum, c) => sum + c.position[0], 0) / members.length;
  const avgLng = members.reduce((sum, c) => sum + c.position[1], 0) / members.length;
  return [avgLat, avgLng];
};

const createClusterLabelIcon = (clusterLabel, color) => {
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
      ">${clusterLabel}</div>
    `,
    iconSize: null,
    iconAnchor: [0, 0]
  });
};

// Create a clickable dot icon for clusters
const createClusterDotIcon = (color) => {
  return L.divIcon({
    className: "group-dot-icon",
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.7); cursor: pointer;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

function ClusterSummary({ clusters, show }) {
  const [expandedClusters, setExpandedClusters] = useState([]);

  const toggleCluster = (clusterName) => {
    if (expandedClusters.includes(clusterName)) {
      setExpandedClusters(expandedClusters.filter(name => name !== clusterName));
    } else {
      setExpandedClusters([...expandedClusters, clusterName]);
    }
  };

}

function MapZoomListener({ onZoomChange }) {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });
  return null;
}

// Component for cluster markers that handles zoom-to-cluster functionality
function ClusterMarker({ cluster, zoomLevel }) {
  const map = useMap();
  
  // Calculate the cluster bounds to zoom to
  const getClusterBounds = () => {
    const memberPositions = cluster.members.map(id => {
      const client = clients.find(c => c.id === id);
      return client.position;
    });
    return L.latLngBounds(memberPositions);
  };
  
  // Handle click to zoom to cluster
const handleClusterClick = () => {
  const bounds = getClusterBounds();
map.flyToBounds(bounds, {
  padding: [50, 50],
  animate: true,
  duration: 0.8,     // faster = less blurry loading
  maxZoom: 15,       // go closer
  easeLinearity: 0.25
});

};



  const centroid = calculateClusterCentroid(cluster.members);
  
  return (
    <Marker
      position={centroid}
      icon={zoomLevel >= 8 ? createClusterLabelIcon(cluster.clusterLabel, cluster.color) : createClusterDotIcon(cluster.color)}
      zIndexOffset={1000}
      eventHandlers={{ click: handleClusterClick }}
    >
      <Tooltip 
        permanent={zoomLevel >= 8} 
        direction="top" 
        offset={zoomLevel >= 8 ? [0, -10] : [0, 0]}
        className={zoomLevel >= 8 ? '' : 'group-dot-tooltip'}
        >
        {`${cluster.clusterLabel} (${cluster.name}): ${cluster.members.length} clients in ${cluster.locations.length} locations`}
        </Tooltip>

    </Marker>
  );
}

export default function ClientEmployeeMap() {
  const [zoomLevel, setZoomLevel] = useState(6);
  const showClusterDetails = true;
  const mapRef = useRef();

const getCircleRadius = (zoom) => {
  if (zoom > 6) return 0;      // Hide the circle when zoomed in
  return 50000;                // Very big radius when zoomed out
};

const BouncingMapTooltip = ({ position, label, color }) => {
  const tooltipRef = useRef(null);
  const controls = useAnimation();
  const map = useMap();

  const [screenPos, setScreenPos] = useState(() =>
    map.latLngToContainerPoint(L.latLng(position[0], position[1]))
  );

  useEffect(() => {
    const updatePosition = () => {
      const point = map.latLngToContainerPoint(L.latLng(position[0], position[1]));
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




const zoomToClusterLocations = (cluster) => {
  if (!mapRef.current) return;

  // Get all client positions for this cluster
  const positions = cluster.members.map(id => {
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

  {/* ✅ Cluster Cluster Circles - one for each cluster with different color */}
  {clusters.map((cluster) => {
    const centroid = calculateClusterCentroid(cluster.members);
    return (
      <Circle
        key={`circle-${cluster.name}`}
        center={centroid}
        radius={getCircleRadius(zoomLevel)}
        pathOptions={{
          color: cluster.color,
          fillColor: cluster.color,
          fillOpacity: 0.2,
        }}
      >
        {zoomLevel <= 6 && (
          <BouncingMapTooltip
            position={centroid}
            label={cluster.clusterLabel}
            color={cluster.color}
          />
        )}
      </Circle>
    );
  })}

  {/* Polyline routes between clients */}
  {zoomLevel >= 8 && clusterLines.map((line, idx) => (
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

  {/* Client markers */}
  {clients.map((client) => {
    const icon = createClientIcon(client.status);
    const cluster = getClusterByClientId(client.id);
    const boxColor = statusColors[client.status] || "#F03D3D";

    return (
      <Marker key={client.id} position={client.position} icon={icon}>
        <Popup>
          <div>(Client)</div>
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
          <div>Cluster: {cluster ? cluster.name : "None"}</div>
          <div>Location: <strong>{client.fullAddress}</strong></div>
        </Popup>
      </Marker>
    );
  })}

  {/* ✅ Carer markers (formerly Employee markers) */}
  {carers.map((carer) => {
    const nearestDist = getNearestClientDistance(carer.position);
    const photoUrl = carer.photo;
    const assignmentClass = carer.assignedToClientStatus;
    const isAvailable = carer.availabilityStatus === "Available";
    const clientPresence = carer.clientPresence;

    const activeStatusText = isAvailable ? "Yes" : "Not Active";
    const clientStatusText = assignmentClass.startsWith("assigned")
      ? `Assigned (${clientPresence || "Unknown"})`
      : "Not Assigned";

    const showAssignmentIndicator = isAvailable;

    const iconHtml = showAssignmentIndicator
      ? `
        <div class="employee-img-wrapper ${assignmentClass}">
          <img src="${photoUrl}" alt="Carer" />
          <i class="assignment-indicator ${assignmentClass}"></i>
        </div>
      `
      : `
        <div class="employee-img-wrapper not-available">
          <img src="${photoUrl}" alt="Carer" />
        </div>
      `;

    return (
      <Marker
        key={carer.id}
        position={carer.position}
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
            <img src={photoUrl} alt={carer.name} className="employee-popup-photo" />
            <strong>{carer.name}</strong>
          </div>
          <div>(Carer)</div>
          <div>Travel Method: {carer.travelMethod}</div>
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

  {/* Cluster markers */}
  {clusters.map((cluster) => (
    <ClusterMarker 
      key={`cluster-${cluster.name}`} 
      cluster={cluster} 
      zoomLevel={zoomLevel} 
    />
  ))}
</MapContainer>



      
    
    </div>
  );
}



































// import React, { useState, useRef, useEffect } from "react";
// import { motion, useAnimation } from "framer-motion";
// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Popup,
//   Polyline,
//   Tooltip,
//   useMapEvents,
//   useMap,
//   Circle,
// } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// import './ClusterMap.css';

// import Employee1 from './Img/Employees/1.jpg';
// import Employee2 from './Img/Employees/2.jpg';
// import Employee3 from './Img/Employees/3.jpg';
// import Employee4 from './Img/Employees/4.jpg';
// import Employee5 from './Img/Employees/5.jpg';
// import Employee6 from './Img/Employees/6.jpg';
// import Employee7 from './Img/Employees/7.jpg';
// import Employee8 from './Img/Employees/8.jpg';
// import Employee9 from './Img/Employees/9.jpg';
// import Employee10 from './Img/Employees/10.jpg';

// const statusColors = {
//   Active: "#35C220",
//   "Temporarily Inactive": "#f9a825",
//   Inactive: "#F03D3D",
// };



// const createClientIcon = (status) => {
//   const fillColor = statusColors[status] || "#F03D3D";
//   return L.divIcon({
//     className: "custom-client-icon",
//     html: `
//       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//         <path d="M12 1.25C16.4778 1.25 20.25 5.01859 20.25 9.58691C20.25 14.2513 16.402 17.4123 13.1699 19.4297L13.1465 19.4434C12.7977 19.6441 12.4025 19.75 12 19.75C11.5975 19.75 11.2023 19.6441 10.8535 19.4434L10.8398 19.4355L10.8271 19.4277C7.6076 17.3948 3.75001 14.2671 3.75 9.58691C3.75 5.01859 7.52225 1.25 12 1.25ZM12 6C10.067 6 8.5 7.567 8.5 9.5C8.5 11.433 10.067 13 12 13C13.933 13 15.5 11.433 15.5 9.5C15.5 7.567 13.933 6 12 6Z" fill="${fillColor}"/>
//         <path d="M6 18.75C6.5212 18.75 6.94927 19.1487 6.99581 19.6578C7.01311 19.6768 7.04258 19.7053 7.09048 19.7431C7.26885 19.8836 7.58893 20.054 8.07359 20.2155C9.03245 20.5352 10.4207 20.75 12 20.75C13.5793 20.75 14.9675 20.5352 15.9264 20.2155C16.4111 20.054 16.7311 19.8836 16.9095 19.7431C16.9574 19.7053 16.9869 19.6768 17.0042 19.6578C17.0507 19.1487 17.4788 18.75 18 18.75C18.5523 18.75 19 19.1977 19 19.75C19 20.4639 18.5651 20.9848 18.1475 21.3139C17.7186 21.6519 17.16 21.9125 16.5589 22.1129C15.3462 22.5171 13.7344 22.75 12 22.75C10.2656 22.75 8.65384 22.5171 7.44113 22.1129C6.84 21.9125 6.2814 21.6519 5.85254 21.3139C5.43495 20.9848 5 20.4639 5 19.75C5 19.1977 5.44772 18.75 6 18.75Z" fill="${fillColor}"/>
//       </svg>
//     `,
//     iconSize: [24, 24],
//     iconAnchor: [12, 24],
//     popupAnchor: [0, -24],
//   });
// };

// function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
//   const R = 6371;
//   const dLat = ((lat2 - lat1) * Math.PI) / 180;
//   const dLon = ((lon2 - lon1) * Math.PI) / 180;
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos((lat1 * Math.PI) / 180) *
//       Math.cos((lat2 * Math.PI) / 180) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// }



// const clients = [
//   // London Cluster
//   { id: 1, name: "Alice", position: [51.5074, -0.1278], status: "Active", location: "Central London", fullAddress: "Flat 1, 123 Baker Street, London W1U 6EQ" },
//   { id: 2, name: "Bob", position: [51.5115, -0.116], status: "Temporarily Inactive", location: "Westminster", fullAddress: "10 Downing Street, Westminster, London SW1A 2AA" },
//   { id: 3, name: "Charlie", position: [51.509, -0.142], status: "Inactive", location: "South Bank", fullAddress: "1 Waterloo Road, South Bank, London SE1 8SW" },
//   { id: 4, name: "Diana", position: [51.503, -0.113], status: "Active", location: "Shoreditch", fullAddress: "123 City Road, Shoreditch, London EC1V 1AF" },
//   { id: 5, name: "Ethan", position: [51.515, -0.092], status: "Inactive", location: "Hackney", fullAddress: "1 Mare Street, Hackney, London E8 1AA" },
  
//   // Manchester Cluster
//   { id: 6, name: "Fiona", position: [53.4808, -2.2426], status: "Active", location: "Manchester City Centre", fullAddress: "1 Deansgate, Manchester M3 2BQ" },
//   { id: 7, name: "George", position: [53.469, -2.238], status: "Temporarily Inactive", location: "Salford", fullAddress: "1 Abram Street, Salford M7 1AB" },
//   { id: 8, name: "Hannah", position: [53.485, -2.231], status: "Inactive", location: "Ancoats", fullAddress: "1 Great Ancoats Street, Manchester M4 7BT" },
//   { id: 9, name: "Ian", position: [53.476, -2.252], status: "Active", location: "Hulme", fullAddress: "1 Trinity Way, Hulme, Manchester M15 6FD" },
//   { id: 10, name: "Julia", position: [53.466, -2.214], status: "Active", location: "Trafford", fullAddress: "Trafford House, Chester Road, Stretford, Manchester M32 0RS" },
  
//   // Birmingham Cluster
//   { id: 11, name: "Kevin", position: [52.4862, -1.8904], status: "Inactive", location: "Birmingham City Centre", fullAddress: "1 New Street, Birmingham B2 4AS" },
//   { id: 12, name: "Laura", position: [52.479, -1.902], status: "Temporarily Inactive", location: "Digbeth", fullAddress: "1 Digbeth High Street, Birmingham B5 6DY" },
//   { id: 13, name: "Michael", position: [52.495, -1.883], status: "Active", location: "Aston", fullAddress: "1 Ettington Road, Aston, Birmingham B6 6ES" },
//   { id: 14, name: "Nina", position: [52.462, -1.874], status: "Inactive", location: "Bournville", fullAddress: "1 Bournville Lane, Bournville, Birmingham B30 1QX" },
  
//   // Liverpool Cluster
//   { id: 15, name: "Oliver", position: [53.4084, -2.9916], status: "Temporarily Inactive", location: "Liverpool City Centre", fullAddress: "1 Castle Street, Liverpool L2 4TA" },
//   { id: 16, name: "Paul", position: [53.416, -2.982], status: "Active", location: "Bootle", fullAddress: "1 Stanley Road, Bootle L20 3DY" },
//   { id: 17, name: "Quinn", position: [53.392, -3.002], status: "Inactive", location: "Speke", fullAddress: "31 Tarbock Road, Speke, Liverpool L24 0SN" },
//   { id: 18, name: "Rachel", position: [53.378, -2.977], status: "Active", location: "Crosby", fullAddress: "1 Liverpool Road, Crosby, Liverpool L23 2SR" },
  
//   // Bristol Cluster
//   { id: 19, name: "Steve", position: [51.4545, -2.5879], status: "Inactive", location: "Bristol City Centre", fullAddress: "42 Triangle West, Bristol BS8 1ES" },
//   { id: 20, name: "Tina", position: [51.449, -2.592], status: "Active", location: "Clifton", fullAddress: "1 Clifton Down, Bristol BS8 4AF" },
//   { id: 21, name: "Uma", position: [51.459, -2.572], status: "Temporarily Inactive", location: "Redfield", fullAddress: "1 Verrier Road, Redfield, Bristol BS5 7NP" },
//   { id: 22, name: "Victor", position: [51.467, -2.601], status: "Inactive", location: "Filton", fullAddress: "1 Gloucester Road North, Filton, Bristol BS34 7BQ" },
//   { id: 23, name: "Wendy", position: [51.441, -2.612], status: "Active", location: "Bedminster", fullAddress: "3 Princess Street, Bedminster, Bristol BS3 4AG" },
//   { id: 24, name: "Xavier", position: [51.425, -2.583], status: "Inactive", location: "Brislington", fullAddress: "1 Bath Road, Brislington, Bristol BS4 5NL" },
// ];

// const carers = [
//   {
//     id: 1,
//     name: "John Smith",
//     position: [51.5074, -0.1278],
//     travelMethod: "Driving",
//     photo: Employee1,
//     assignedToClientStatus: "assigned-active",
//     availabilityStatus: "Available",
//     clientPresence: "Present",
//   },
//   {
//     id: 2,
//     name: "Sarah Johnson",
//     position: [53.4808, -2.2426],
//     travelMethod: "Walking",
//     photo: Employee2,
//     assignedToClientStatus: "not-assigned",
//     availabilityStatus: "Not Available",
//     clientPresence: null,
//   },
//   {
//     id: 3,
//     name: "David Brown",
//     position: [52.4862, -1.8904],
//     travelMethod: "Public Transport",
//     photo: Employee3,
//     assignedToClientStatus: "assigned-inactive",
//     availabilityStatus: "Available",
//     clientPresence: "Absent",
//   },
//   {
//     id: 4,
//     name: "Emma Wilson",
//     position: [53.4084, -2.9916],
//     travelMethod: "Driving",
//     photo: Employee4,
//     assignedToClientStatus: "assigned-active",
//     availabilityStatus: "Available",
//     clientPresence: "Present",
//   },
//   {
//     id: 5,
//     name: "James Taylor",
//     position: [51.4545, -2.5879],
//     travelMethod: "Public Transport",
//     photo: Employee5,
//     assignedToClientStatus: "not-assigned",
//     availabilityStatus: "Not Available",
//     clientPresence: null,
//   },
//   {
//     id: 6,
//     name: "Olivia Martinez",
//     position: [51.515, -0.09],
//     travelMethod: "Bicycle",
//     photo: Employee6,
//     assignedToClientStatus: "assigned-active",
//     availabilityStatus: "Available",
//     clientPresence: "Present",
//   },
//   {
//     id: 7,
//     name: "Liam Davis",
//     position: [53.47, -2.25],
//     travelMethod: "Walking",
//     photo: Employee7,
//     assignedToClientStatus: "assigned-inactive",
//     availabilityStatus: "Available",
//     clientPresence: "Absent",
//   },
//   {
//     id: 8,
//     name: "Sophia Garcia",
//     position: [52.49, -1.89],
//     travelMethod: "Driving",
//     photo: Employee8,
//     assignedToClientStatus: "not-assigned",
//     availabilityStatus: "Not Available",
//     clientPresence: null,
//   },
//   {
//     id: 9,
//     name: "Mason Lee",
//     position: [53.41, -2.98],
//     travelMethod: "Public Transport",
//     photo: Employee9,
//     assignedToClientStatus: "not-assigned",
//     availabilityStatus: "Not Available",
//     clientPresence: null,
//   },
//   {
//     id: 10,
//     name: "Isabella Taylor",
//     position: [51.45, -2.59],
//     travelMethod: "Walking",
//     photo: Employee10,
//     assignedToClientStatus: "assigned-active",
//     availabilityStatus: "Available",
//     clientPresence: "Present",
//   },
// ];


// const clusters = [
//   {
//     name: "London Cluster",
//     clusterLabel: "Cluster A",
//     color: "#7226FF",
//     members: [1, 2, 3, 4, 5],
//     locations: ["Central London", "Westminster", "South Bank", "Shoreditch", "Hackney"]
//   },
//   {
//     name: "Manchester Cluster",
//     clusterLabel: "Cluster B",
//     color: "#7226FF",
//     members: [6, 7, 8, 9, 10],
//     locations: ["Manchester City Centre", "Salford", "Ancoats", "Hulme", "Trafford"]
//   },
//   {
//     name: "Birmingham Cluster",
//     clusterLabel: "Cluster C",
//     color: "#7226FF",
//     members: [11, 12, 13, 14],
//     locations: ["Birmingham City Centre", "Digbeth", "Aston", "Bournville"]
//   },
//   {
//     name: "Liverpool Cluster",
//     clusterLabel: "Cluster D",
//     color: "#7226FF",
//     members: [15, 16, 17, 18],
//     locations: ["Liverpool City Centre", "Bootle", "Speke", "Crosby"]
//   },
//   {
//     name: "Bristol Cluster",
//     clusterLabel: "Cluster E",
//     color: "#7226FF",
//     members: [19, 20, 21, 22, 23, 24],
//     locations: ["Bristol City Centre", "Clifton", "Redfield", "Filton", "Bedminster", "Brislington"]
//   },
// ];


// const getClusterByClientId = (clientId) => {
//   return clusters.find(cluster => cluster.members.includes(clientId));
// };

// const clusterLines = clusters.flatMap((cluster) => {
//   const clusterClients = cluster.members.map(id => 
//     clients.find(client => client.id === id)
//   );
//   const lines = [];

//   for (let i = 0; i < clusterClients.length; i++) {
//     for (let j = i + 1; j < clusterClients.length; j++) {
//       const from = clusterClients[i];
//       const to = clusterClients[j];
//       lines.push({
//         positions: [from.position, to.position],
//         color: cluster.color,
//         distance: getDistanceFromLatLonInKm(
//           from.position[0], from.position[1],
//           to.position[0], to.position[1]
//         ).toFixed(2),
//       });
//     }
//   }
//   return lines;
// });

// const calculateClusterCentroid = (memberIds) => {
//   const members = memberIds.map(id => clients.find(c => c.id === id));
//   const avgLat = members.reduce((sum, c) => sum + c.position[0], 0) / members.length;
//   const avgLng = members.reduce((sum, c) => sum + c.position[1], 0) / members.length;
//   return [avgLat, avgLng];
// };

// const createClusterLabelIcon = (clusterLabel, color) => {
//   return L.divIcon({
//     className: "group-label-icon",
//     html: `
//       <div style="
//         background: ${color};
//         color: white;
//         padding: 4px 8px;
//         border-radius: 4px;
//         font-weight: bold;
//         font-size: 12px;
//         text-shadow: 0 0 2px rgba(0,0,0,0.5);
//         white-space: nowrap;
//         display:inline-flex;
//       ">${clusterLabel}</div>
//     `,
//     iconSize: null,
//     iconAnchor: [0, 0]
//   });
// };

// // Create a clickable dot icon for clusters
// const createClusterDotIcon = (color) => {
//   return L.divIcon({
//     className: "group-dot-icon",
//     html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.7); cursor: pointer;"></div>`,
//     iconSize: [16, 16],
//     iconAnchor: [8, 8],
//   });
// };

// function ClusterSummary({ clusters, show }) {
//   const [expandedClusters, setExpandedClusters] = useState([]);

//   const toggleCluster = (clusterName) => {
//     if (expandedClusters.includes(clusterName)) {
//       setExpandedClusters(expandedClusters.filter(name => name !== clusterName));
//     } else {
//       setExpandedClusters([...expandedClusters, clusterName]);
//     }
//   };

// }

// function MapZoomListener({ onZoomChange }) {
//   const map = useMapEvents({
//     zoomend: () => {
//       onZoomChange(map.getZoom());
//     },
//   });
//   return null;
// }

// // Component for cluster markers that handles zoom-to-cluster functionality
// function ClusterMarker({ cluster, zoomLevel }) {
//   const map = useMap();
  
//   // Calculate the cluster bounds to zoom to
//   const getClusterBounds = () => {
//     const memberPositions = cluster.members.map(id => {
//       const client = clients.find(c => c.id === id);
//       return client.position;
//     });
//     return L.latLngBounds(memberPositions);
//   };
  
//   // Handle click to zoom to cluster
// const handleClusterClick = () => {
//   const bounds = getClusterBounds();
// map.flyToBounds(bounds, {
//   padding: [50, 50],
//   animate: true,
//   duration: 0.8,     // faster = less blurry loading
//   maxZoom: 15,       // go closer
//   easeLinearity: 0.25
// });

// };



//   const centroid = calculateClusterCentroid(cluster.members);
  
//   return (
//     <Marker
//       position={centroid}
//       icon={zoomLevel >= 8 ? createClusterLabelIcon(cluster.clusterLabel, cluster.color) : createClusterDotIcon(cluster.color)}
//       zIndexOffset={1000}
//       eventHandlers={{ click: handleClusterClick }}
//     >
//       <Tooltip 
//         permanent={zoomLevel >= 8} 
//         direction="top" 
//         offset={zoomLevel >= 8 ? [0, -10] : [0, 0]}
//         className={zoomLevel >= 8 ? '' : 'group-dot-tooltip'}
//         >
//         {`${cluster.clusterLabel} (${cluster.name}): ${cluster.members.length} clients in ${cluster.locations.length} locations`}
//         </Tooltip>

//     </Marker>
//   );
// }

// export default function ClientEmployeeMap({ clusters: clusterData = [] }) {
//   const [zoomLevel, setZoomLevel] = useState(6);
//   const showClusterDetails = true;
//   const mapRef = useRef();

// const getCircleRadius = (zoom) => {
//   if (zoom > 6) return 0;      // Hide the circle when zoomed in
//   return 50000;                // Very big radius when zoomed out
// };

// const BouncingMapTooltip = ({ position, label, color }) => {
//   const tooltipRef = useRef(null);
//   const controls = useAnimation();
//   const map = useMap();

//   const [screenPos, setScreenPos] = useState(() =>
//     map.latLngToContainerPoint(L.latLng(position[0], position[1]))
//   );

//   useEffect(() => {
//     const updatePosition = () => {
//       const point = map.latLngToContainerPoint(L.latLng(position[0], position[1]));
//       setScreenPos(point);
//     };

//     updatePosition(); // Initial position
//     map.on("zoom", updatePosition);
//     map.on("move", updatePosition);

//     return () => {
//       map.off("zoom", updatePosition);
//       map.off("move", updatePosition);
//     };
//   }, [map, position]);

//   useEffect(() => {
//     const animate = () => {
//       controls.start({
//         scale: [1, 1.2, 1],
//         transition: { duration: 1, ease: "easeInOut" },
//       });
//     };

//     animate(); // Initial bounce
//     const interval = setInterval(animate, 5000); // Re-trigger every 5 seconds
//     return () => clearInterval(interval);
//   }, [controls]);

//   return (
//     <motion.div
//     ref={tooltipRef}
//     animate={controls}
//     initial={{ scale: 1 }}
//     className="bouncing-tooltip"
//     style={{
//         top: `${screenPos.y - 30}px`, 
//         left: `${screenPos.x}px`,    
//         backgroundColor: color || "#7226FF",
//     }}
//     >
//     {label || "Loading..."}
//     </motion.div>

//   );
// };




// const zoomToClusterLocations = (cluster) => {
//   if (!mapRef.current) return;

//   // Get all client positions for this cluster
//   const positions = cluster.members.map(id => {
//     const client = clients.find(c => c.id === id);
//     return client.position;
//   });

//   if (positions.length === 1) {
//     // If only one location, just fly to it
//     mapRef.current.flyTo(positions[0], 14, { duration: 1 });
//   } else {
//     // If multiple, fit bounds
//     const bounds = L.latLngBounds(positions);
//     mapRef.current.flyToBounds(bounds, { padding: [50, 50], duration: 1 });
//   }
// };

  
//   const getNearestClientDistance = (empPos) => {
//     let minDistance = Infinity;
//     for (const client of clients) {
//       const dist = getDistanceFromLatLonInKm(
//         empPos[0],
//         empPos[1],
//         client.position[0],
//         client.position[1]
//       );
//       if (dist < minDistance) minDistance = dist;
//     }
//     return minDistance.toFixed(2);
//   };

//   const createEmployeeIcon = (photoUrl, status) => {
//     return L.divIcon({
//       className: `employee-photo-icon ${status}`,
//       html: `<img src="${photoUrl}" alt="Employee" />`,
//       iconSize: [30, 41],
//       iconAnchor: [15, 41],
//       popupAnchor: [0, -41],
//     });
//   };

//   return (
//     <div style={{ height: "100%", width: "100%", position: "relative" }}>
// <MapContainer
//   center={clusterData.length > 0 ? [clusterData[0].latitude, clusterData[0].longitude] : [6.5, 3.4]}
//   zoom={clusterData.length > 0 ? 10 : 6}
//   style={{ height: "100%", width: "100%" }}
//   whenCreated={mapInstance => { mapRef.current = mapInstance }}
// >

//   <MapZoomListener onZoomChange={setZoomLevel} />

//   <TileLayer
//     attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//   />

//   {/* ✅ Real Cluster Circles - one for each cluster */}
//   {clusterData.map((cluster) => {
//     const center = [cluster.latitude, cluster.longitude];
//     return (
//       <Circle
//         key={`circle-${cluster.id}`}
//         center={center}
//         radius={cluster.radiusMeters}
//         pathOptions={{
//           color: "#7226FF",
//           fillColor: "#7226FF",
//           fillOpacity: 0.2,
//           weight: 2,
//         }}
//       />
//     );
//   })}

//   {/* Polyline routes between clients */}
//   {zoomLevel >= 8 && clusterLines.map((line, idx) => (
//     <Polyline
//       key={idx}
//       positions={line.positions}
//       color={line.color}
//       weight={2}
//       opacity={0.7}
//     >
//       {zoomLevel >= 9 && (
//         <Tooltip permanent sticky direction="center" offset={[0, 0]} opacity={1} className="dstn-Box">
//           {line.distance} km
//         </Tooltip>
//       )}
//     </Polyline>
//   ))}

//   {/* Client markers */}
//   {clients.map((client) => {
//     const icon = createClientIcon(client.status);
//     const cluster = getClusterByClientId(client.id);
//     const boxColor = statusColors[client.status] || "#F03D3D";

//     return (
//       <Marker key={client.id} position={client.position} icon={icon}>
//         <Popup>
//           <div>(Client)</div>
//           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//             <strong>{client.name}</strong>
//             <div
//               style={{
//                 width: "14px",
//                 height: "14px",
//                 backgroundColor: boxColor,
//                 borderRadius: "3px",
//                 border: "1px solid #555",
//               }}
//               title={`Status: ${client.status}`}
//             />
//           </div>
//           <div>Status: <em>{client.status}</em></div>
//           <div>Cluster: {cluster ? cluster.name : "None"}</div>
//           <div>Location: <strong>{client.fullAddress}</strong></div>
//         </Popup>
//       </Marker>
//     );
//   })}

//   {/* ✅ Carer markers (formerly Employee markers) */}
//   {carers.map((carer) => {
//     const nearestDist = getNearestClientDistance(carer.position);
//     const photoUrl = carer.photo;
//     const assignmentClass = carer.assignedToClientStatus;
//     const isAvailable = carer.availabilityStatus === "Available";
//     const clientPresence = carer.clientPresence;

//     const activeStatusText = isAvailable ? "Yes" : "Not Active";
//     const clientStatusText = assignmentClass.startsWith("assigned")
//       ? `Assigned (${clientPresence || "Unknown"})`
//       : "Not Assigned";

//     const showAssignmentIndicator = isAvailable;

//     const iconHtml = showAssignmentIndicator
//       ? `
//         <div class="employee-img-wrapper ${assignmentClass}">
//           <img src="${photoUrl}" alt="Carer" />
//           <i class="assignment-indicator ${assignmentClass}"></i>
//         </div>
//       `
//       : `
//         <div class="employee-img-wrapper not-available">
//           <img src="${photoUrl}" alt="Carer" />
//         </div>
//       `;

//     return (
//       <Marker
//         key={carer.id}
//         position={carer.position}
//         icon={L.divIcon({
//           className: `employee-photo-icon ${assignmentClass} ${
//             !isAvailable ? "not-available" : ""
//           }`,
//           html: iconHtml,
//           iconSize: [30, 41],
//           iconAnchor: [15, 41],
//           popupAnchor: [0, -41],
//         })}
//       >
//         <Popup>
//           <div className="employee-popup-header">
//             <img src={photoUrl} alt={carer.name} className="employee-popup-photo" />
//             <strong>{carer.name}</strong>
//           </div>
//           <div>(Carer)</div>
//           <div>Travel Method: {carer.travelMethod}</div>
//           <div>Nearest client: {nearestDist} km</div>
//           <div className="employee-popup-status">
//             <div>
//               <strong>Client:</strong>{" "}
//               <i
//                 className={`client-indicator ${assignmentClass} ${
//                   clientPresence ? clientPresence.toLowerCase() : ""
//                 }`}
//                 title={`Client status: ${clientStatusText}`}
//               />
//               {clientStatusText}
//             </div>
//             <div>
//               <strong>Active:</strong>{" "}
//               <i
//                 className={`active-indicator ${assignmentClass} ${
//                   isAvailable ? "yes" : "not-active"
//                 }`}
//                 title={`Active status: ${activeStatusText}`}
//               />
//               {activeStatusText}
//             </div>
//           </div>
//         </Popup>
//       </Marker>
//     );
//   })}

//   {/* Real Cluster markers */}
//   {clusterData.map((cluster) => (
//     <Marker
//       key={`cluster-${cluster.id}`}
//       position={[cluster.latitude, cluster.longitude]}
//       icon={L.divIcon({
//         className: "cluster-marker-icon",
//         html: `
//           <div style="
//             background-color: #7226FF;
//             color: white;
//             padding: 6px 12px;
//             border-radius: 20px;
//             font-weight: bold;
//             font-size: 12px;
//             text-align: center;
//             border: 2px solid white;
//             box-shadow: 0 2px 4px rgba(0,0,0,0.3);
//             white-space: nowrap;
//           ">
//             ${cluster.postcode}
//           </div>
//         `,
//         iconSize: null,
//         iconAnchor: [0, 0]
//       })}
//     >
//       <Popup>
//         <div style={{ minWidth: '200px' }}>
//           <h4 style={{ margin: '0 0 8px 0', color: '#7226FF' }}>{cluster.name}</h4>
//           <div style={{ marginBottom: '4px' }}>
//             <strong>Postcode:</strong> {cluster.postcode}
//           </div>
//           <div style={{ marginBottom: '4px' }}>
//             <strong>Location:</strong> {cluster.location}
//           </div>
//           <div style={{ marginBottom: '4px' }}>
//             <strong>Active Requests:</strong> {cluster.activeRequestCount}
//           </div>
//           <div style={{ marginBottom: '4px' }}>
//             <strong>Active Carers:</strong> {cluster.activeCarerCount}
//           </div>
//           <div style={{ marginBottom: '4px' }}>
//             <strong>Radius:</strong> {(cluster.radiusMeters / 1000).toFixed(1)} km
//           </div>
//           {cluster.description && (
//             <div style={{ marginTop: '8px', fontStyle: 'italic' }}>
//               {cluster.description}
//             </div>
//           )}
//         </div>
//       </Popup>
//     </Marker>
//   ))}
// </MapContainer>



      
    
//     </div>
//   );
// }