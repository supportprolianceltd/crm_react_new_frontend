import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import clientsList from "./data/clientsData";
import ClientModal from "./ClientModal";

const HQ_LOCATION = [53.2074, -2.9095];
const hqIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [50, 50],
  iconAnchor: [25, 50],
  popupAnchor: [0, -40],
});

const menuButtonStyle = {
  display: "block",
  width: "150px",
  padding: "8px 10px",
  border: "none",
  borderBottom: "1px solid #eee",
  background: "white",
  cursor: "pointer",
  textAlign: "left",
};

const getInitials = (name) => {
  return name.split(' ').slice(0, 2).map(word => word[0]).join('').toUpperCase();
};

const ClientMarker = ({ client, onLeftClick, onRightClick }) => {
  const positions = [
    { top: '0px', left: '50%', transform: 'translateX(-50%)' }, // top center
    { top: '0px', left: '0px' }, // top left
    { top: '0px', right: '0px', left: 'auto' }, // top right
    { bottom: '0px', left: '50%', transform: 'translateX(-50%)' }, // bottom center
  ];

  const getStaffOverlays = (staff) => {
    return staff.map((s, i) => {
      const initials = getInitials(s.name);
      const pos = positions[i % positions.length];
      return `<div style="
          position: absolute;
          ${pos.top ? `top: ${pos.top};` : ''} ${pos.bottom ? `bottom: ${pos.bottom};` : ''}
          ${pos.left ? `left: ${pos.left};` : ''} ${pos.right ? `right: ${pos.right};` : ''}
          ${pos.transform ? `transform: ${pos.transform};` : ''}
          background: #4CAF50;
          color: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: bold;
          font-size: 8px;
          border: 1px solid white;
          box-shadow: 0 0 2px rgba(0,0,0,0.3);
          z-index: 1;">
          <b>${initials}</b>
        </div>`;
    }).join('');
  };

  let clientInnerHtml;
  if (client.image) {
    clientInnerHtml = `<img src="${client.image}" alt="${client.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
  } else {
    const initials = client.initials || getInitials(client.name);
    clientInnerHtml = `<b style="font-weight: bold; font-size: 16px;">${initials}</b>`;
  }

  const staffOverlays = client.staff ? getStaffOverlays(client.staff) : '';
  const hasStaff = !!client.staff && client.staff.length > 0;

  const divStyle = `position: relative;
    background: ${client.image ? 'white' : '#4CAF50'};
    border: 2px solid #4CAF50;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    ${!client.image ? 'color: white; box-shadow: 0 0 5px rgba(0,0,0,0.3);' : ''}`;

  const html = `<div style="${divStyle}">
      ${staffOverlays}
      ${clientInnerHtml}
    </div>`;

  const icon = new L.DivIcon({
    html,
    className: "",
    iconSize: [48, 48],
    iconAnchor: [24, 48],
  });

  return (
    <Marker
      position={client.position}
      icon={icon}
      draggable={client.draggable || false}
      eventHandlers={{
        click: () => onLeftClick(client),
        contextmenu: (e) => onRightClick(e, client),
        dragend: (e) => {
          const newPos = e.target.getLatLng();
          if (client.onDragEnd) client.onDragEnd(client.name, [newPos.lat, newPos.lng]);
        },
      }}
    />
  );
};

const MapWithMarkers = ({ clients, onClientLeftClick, onClientRightClick, onDragEnd }) => {
  const map = useMap();

  const handleLeftClick = (client) => {
    map.flyTo(client.position, 14, { duration: 2 });
    onClientLeftClick(client);
  };

  const handleRightClick = (e, client) => {
    e.originalEvent.preventDefault();
    onClientRightClick(e, client, map);
  };

  return (
    <>
      {clients.map((client, i) => (
        <ClientMarker
          key={i}
          client={{ ...client, onDragEnd }}
          onLeftClick={handleLeftClick}
          onRightClick={handleRightClick}
        />
      ))}
    </>
  );
};

const MapObject = () => {
  const [clients, setClients] = useState(clientsList);
  const [selectedClient, setSelectedClient] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false });
  const mapRef = useRef();

  const updatePosition = async (name, newPos) => {
    try {
      // Fetch new address via reverse geocoding (Nominatim API)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos[0]}&lon=${newPos[1]}&addressdetails=1`
      );
      const geoData = await response.json();
      const newAddress = geoData.display_name || `Lat: ${newPos[0].toFixed(6)}, Lng: ${newPos[1].toFixed(6)}`; // Fallback to coords if no address

      setClients((prev) =>
        prev.map((c) =>
          c.name === name
            ? { ...c, position: newPos, address: newAddress, draggable: false }
            : c
        )
      );

      // Update selectedClient if it's the dragged one, to reflect in modal
      if (selectedClient && selectedClient.name === name) {
        setSelectedClient({ ...selectedClient, position: newPos, address: newAddress, draggable: false });
      }
    } catch (error) {
      console.error("Error updating address:", error);
      // Still update position even if address fetch fails
      setClients((prev) =>
        prev.map((c) => (c.name === name ? { ...c, position: newPos, draggable: false } : c))
      );
      if (selectedClient && selectedClient.name === name) {
        setSelectedClient({ ...selectedClient, position: newPos, draggable: false });
      }
    }
    setContextMenu({ visible: false });
  };

  const handleDelete = (name) => {
    setClients((prev) => prev.filter((c) => c.name !== name));
    setContextMenu({ visible: false });
  };

  const handleChangeLocation = (client) => {
    setClients((prev) =>
      prev.map((c) =>
        c.name === client.name ? { ...c, draggable: true } : c
      )
    );
    setContextMenu({ visible: false });
  };

  const handleReassignStaff = (client) => {
    // TODO: Implement reassign staff logic (e.g., open a modal to select staff)
    console.log('Reassign staff for', client.name);
    setContextMenu({ visible: false });
  };

  const handleViewDetails = (client) => {
    setSelectedClient(client);
    setContextMenu({ visible: false });
    if (mapRef.current) {
      mapRef.current.flyTo(client.position, 14, { duration: 1.5 });
    }
  };

  const handleZoom = () => {
    if (!mapRef.current || !contextMenu.client) return;
    const map = mapRef.current;
    const currentZoom = map.getZoom();
    let delta = 2;  // Default to zoom in
    if (currentZoom >= 16) {
      delta = -2;  // Switch to zoom out only at cap (16)
    }
    const newZoom = Math.max(6, Math.min(16, currentZoom + delta));  // Cap max at 16 (not too deep)
    map.flyTo(contextMenu.client.position, newZoom, { duration: 1.5 });
    setContextMenu({ visible: false });
  };

  // Hide context menu on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) setContextMenu({ visible: false });
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [contextMenu.visible]);

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      <MapContainer
        center={[54.5, -3.5]}
        zoom={6}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        ref={(map) => (mapRef.current = map)}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* HQ Marker */}
        <Marker position={HQ_LOCATION} icon={hqIcon} />

        {/* Clients */}
        <MapWithMarkers
          clients={clients}
          onClientLeftClick={(client) => setSelectedClient(client)}
          onClientRightClick={(e, client) =>
            setContextMenu({
              visible: true,
              x: e.originalEvent.clientX,
              y: e.originalEvent.clientY,
              client,
            })
          }
          onDragEnd={updatePosition}
        />
      </MapContainer>

      {/* Client Modal */}
      <ClientModal
        visible={!!selectedClient}
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
      />

      {/* Right-click context menu */}
      {contextMenu.visible && (
        <div
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
            background: "white",
            border: "1px solid #ccc",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            zIndex: 1000,
            borderRadius: "4px",
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
        >
          <button
            style={menuButtonStyle}
            onClick={() => handleViewDetails(contextMenu.client)}
          >
            View Details
          </button>
          <button
            style={menuButtonStyle}
            onClick={() => handleChangeLocation(contextMenu.client)}
          >
            Change Client Location
          </button>
          <button
            style={menuButtonStyle}
            onClick={() => handleReassignStaff(contextMenu.client)}
          >
            Reassign Staff
          </button>
          <button
            style={menuButtonStyle}
            onClick={() => handleDelete(contextMenu.client.name)}
          >
            Delete
          </button>
          <button style={menuButtonStyle} onClick={handleZoom}>
            {mapRef.current && mapRef.current.getZoom() >= 16 ? "Zoom Out" : "Zoom In"}
          </button>
        </div>
      )}
    </div>
  );
};

export default MapObject;