// import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
// import ReactDOMServer from 'react-dom/server';
// import tt from "@tomtom-international/web-sdk-maps";
// import "@tomtom-international/web-sdk-maps/dist/maps.css";
// import { IconWalk, IconBus, IconCar } from "@tabler/icons-react";
// import "./TomTomMap.css";
// import { fetchClientCarers } from '../../Cluster/config/apiConfig';
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

// const TomTomMap = ({ clusters = [], selectedCluster = null, onClusterSelect, clusterIds = [], clusterClientIds = {}, allClients = [] }) => {
//   console.log('Cluster IDs:', clusterIds);
//   console.log('Cluster Client IDs:', clusterClientIds);
//   console.log('All Clients:', allClients);
//   const mapElement = useRef(null);
//   const mapRef = useRef(null);
//   const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;
//   const [caretakers, setCaretakers] = useState([]);
//   const [clientCarers, setClientCarers] = useState({});

//   // Employee images array
//   const employeeImages = useMemo(() => [
//     Employee1, Employee2, Employee3, Employee4, Employee5,
//     Employee6, Employee7, Employee8, Employee9, Employee10
//   ], []);

//   // Geocode postcode to coordinates
//   const geocodePostcode = async (postcode) => {
//     try {
//       const response = await fetch(`https://api.tomtom.com/search/2/geocode/${encodeURIComponent(postcode)}.json?key=${apiKey}`);
//       const data = await response.json();
//       if (data.results && data.results.length > 0) {
//         const { lat, lon } = data.results[0].position;
//         return [lon, lat];
//       }
//     } catch (error) {
//       console.error('Geocoding error:', error);
//     }
//     return [-0.1278, 51.5074]; // default London coords
//   };

//   // Lists for generating client names
//   const clientFirstNames = useMemo(() => [
//     'Alice', 'Bob', 'Carol', 'David', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack',
//     'Katherine', 'Leo', 'Mia', 'Noah', 'Olivia', 'Paul', 'Quinn', 'Rose', 'Sam', 'Tina',
//     'Uma', 'Victor', 'Wendy', 'Xander', 'Yara', 'Zoe', 'Aaron', 'Bella', 'Chris', 'Diana'
//   ], []);

//   const clientSurnames = useMemo(() => [
//     'Smith', 'Jones', 'Williams', 'Taylor', 'Brown', 'Davies', 'Evans', 'Wilson', 'Thomas', 'Johnson',
//     'Roberts', 'Robinson', 'Thompson', 'Wright', 'Walker', 'White', 'Hall', 'Green', 'Lewis', 'Harris',
//     'Clarke', 'Patel', 'Jackson', 'Wood', 'Turner', 'King', 'Barnes', 'Lee', 'Allen', 'Young'
//   ], []);

//   // Memoize static data to prevent recreation on every render
//   const clients = useMemo(() => {
//     // Generate 3 clients per cluster with real UK names
//     const allClients = [];
//     let clientIndex = 0;
//     clusters.forEach((cluster) => {
//       // Base coords for the cluster
//       const baseLng = cluster.coords[0];
//       const baseLat = cluster.coords[1];
//       // Generate 3 clients with small offsets
//       for (let i = 0; i < 3; i++) {
//         const offsetLng = (Math.random() - 0.5) * 0.005; // ~500m offset
//         const offsetLat = (Math.random() - 0.5) * 0.005;
//         const first = clientFirstNames[clientIndex % clientFirstNames.length];
//         const last = clientSurnames[clientIndex % clientSurnames.length];
//         allClients.push({
//           name: `${first} ${last}`,
//           address: `${i + 1} Sample Street, ${cluster.region}, ${cluster.postcode}`,
//           coords: [baseLng + offsetLng, baseLat + offsetLat],
//           region: cluster.region
//         });
//         clientIndex++;
//       }
//     });
//     return allClients;
//   }, [clusters, clientFirstNames, clientSurnames]);

//   // Sample caretakers with real UK names
//   const caretakerData = useMemo(() => [
//     {
//       id: 1,
//       name: "Emma Davies",
//       role: "Senior Care Coordinator",
//       specialty: "Elderly Care",
//       phone: "+44 161 123 4567",
//       email: "e.davies@careprovider.co.uk",
//       maxClients: 8,
//       vehicle: "Hybrid - Toyota Prius",
//       transportation: "Private Car",
//       image: employeeImages[0]
//     },
//     {
//       id: 2,
//       name: "Oliver Taylor",
//       role: "Community Nurse",
//       specialty: "Mobility Support",
//       phone: "+44 121 234 5678",
//       email: "o.taylor@careprovider.co.uk",
//       maxClients: 6,
//       vehicle: "Vauxhall Corsa",
//       transportation: "Private Car",
//       image: employeeImages[1]
//     },
//     {
//       id: 3,
//       name: "Amelia Brown",
//       role: "Healthcare Assistant",
//       specialty: "Daily Living Support",
//       phone: "+44 141 345 6789",
//       email: "a.brown@careprovider.co.uk",
//       maxClients: 5,
//       vehicle: "Nissan Leaf",
//       transportation: "Public Transportation",
//       image: employeeImages[2]
//     },
//     {
//       id: 4,
//       name: "Noah Wilson",
//       role: "Clinical Specialist",
//       specialty: "Complex Care",
//       phone: "+44 161 456 7890",
//       email: "n.wilson@careprovider.co.uk",
//       maxClients: 4,
//       vehicle: "Ford Focus",
//       transportation: "Private Car",
//       image: employeeImages[3]
//     },
//     {
//       id: 5,
//       name: "Isla Evans",
//       role: "Support Worker",
//       specialty: "Dementia Care",
//       phone: "+44 121 567 8901",
//       email: "i.evans@careprovider.co.uk",
//       maxClients: 7,
//       vehicle: "Peugeot 208",
//       transportation: "Walking",
//       image: employeeImages[4]
//     },
//     {
//       id: 6,
//       name: "Jack Thomas",
//       role: "Occupational Therapist",
//       specialty: "Rehabilitation",
//       phone: "+44 141 678 9012",
//       email: "j.thomas@careprovider.co.uk",
//       maxClients: 5,
//       vehicle: "Volkswagen Golf",
//       transportation: "Private Car",
//       image: employeeImages[5]
//     },
//     {
//       id: 7,
//       name: "Ava Johnson",
//       role: "Care Assistant",
//       specialty: "Personal Care",
//       phone: "+44 161 789 0123",
//       email: "a.johnson@careprovider.co.uk",
//       maxClients: 6,
//       vehicle: "Renault Clio",
//       transportation: "Private Car",
//       image: employeeImages[6]
//     },
//     {
//       id: 8,
//       name: "Harry Roberts",
//       role: "Support Coordinator",
//       specialty: "Mental Health",
//       phone: "+44 121 890 1234",
//       email: "h.roberts@careprovider.co.uk",
//       maxClients: 5,
//       vehicle: "Honda Civic",
//       transportation: "Public Transportation",
//       image: employeeImages[7]
//     },
//     {
//       id: 9,
//       name: "Willow Robinson",
//       role: "Healthcare Worker",
//       specialty: "Palliative Care",
//       phone: "+44 141 901 2345",
//       email: "w.robinson@careprovider.co.uk",
//       maxClients: 4,
//       vehicle: "Toyota Yaris",
//       transportation: "Private Car",
//       image: employeeImages[8]
//     },
//     {
//       id: 10,
//       name: "Freya Walker",
//       role: "Care Manager",
//       specialty: "Home Care",
//       phone: "+44 161 012 3456",
//       email: "f.walker@careprovider.co.uk",
//       maxClients: 6,
//       vehicle: "Skoda Octavia",
//       transportation: "Walking",
//       image: employeeImages[9]
//     },
//     {
//       id: 11,
//       name: "Luca Wright",
//       role: "Nurse Practitioner",
//       specialty: "Wound Care",
//       phone: "+44 121 123 4567",
//       email: "l.wright@careprovider.co.uk",
//       maxClients: 5,
//       vehicle: "Kia Sportage",
//       transportation: "Private Car",
//       image: employeeImages[9] // Reuse last image
//     },
//     {
//       id: 12,
//       name: "Poppy White",
//       role: "Social Worker",
//       specialty: "Family Support",
//       phone: "+44 141 234 5678",
//       email: "p.white@careprovider.co.uk",
//       maxClients: 7,
//       vehicle: "Seat Leon",
//       transportation: "Public Transportation",
//       image: employeeImages[8] // Reuse previous image
//     }
//   ], [employeeImages]);

//   // Function to get initials from name
//   const getInitials = (name) => {
//     return name.split(' ').map(n => n[0]).join('').toUpperCase();
//   };

//   // Function to get transport icon SVG using React components
//   const getTransportIcon = (mode) => {
//     let IconComponent;
//     switch (mode) {
//       case 'Walking':
//         IconComponent = IconWalk;
//         break;
//       case 'Public Transportation':
//         IconComponent = IconBus;
//         break;
//       case 'Private Car':
//         IconComponent = IconCar;
//         break;
//       default:
//         IconComponent = IconCar;
//     }
//     const svgString = ReactDOMServer.renderToString(
//       <IconComponent size={16} stroke={2} />
//     );
//     return svgString;
//   };

//   // Function to create custom marker with circled initials
//   const createCustomMarker = (lngLat, initials, color) => {
//     const markerElement = document.createElement('div');
//     markerElement.className = 'custom-marker';
//     markerElement.style.backgroundColor = color;
//     markerElement.innerHTML = initials;
//     return new tt.Marker({
//       element: markerElement,
//       anchor: 'center'
//     }).setLngLat(lngLat);
//   };

//   // Function to create caretaker marker (with image)
//   const createCaretakerMarker = (lngLat, caretaker, color, clientCoords, clientName, clientAddress) => {
//     const markerElement = document.createElement('div');
//     markerElement.className = 'caretaker-marker';
//     markerElement.style.borderColor = color;
//     markerElement.innerHTML = `
//       <div class="caretaker-inner">
//         <img src="${caretaker.image}" alt="${caretaker.name}" class="caretaker-image" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; flex-shrink: 0;" />
//         <span class="caretaker-initials">${getInitials(caretaker.name)}</span>
//       </div>
//     `;
//     const marker = new tt.Marker({
//       element: markerElement,
//       anchor: 'center'
//     }).setLngLat(lngLat);
//     // Calculate distance
//     const distance = calculateDistance(lngLat, clientCoords).toFixed(1);
//     // Get icon SVG
//     const iconSvg = getTransportIcon(caretaker.transportation);
//     // Popup for caretaker with name, client address (as "full address"), distance, transportation with icon
//     const popup = new tt.Popup({ offset: 30 })
//       .setHTML(`
//         <div style="padding: 10px; max-width: 250px;">
//           <strong style="font-size: 14px;">${caretaker.name}</strong><br/><br/>
//           <strong>Client:</strong> ${clientName}<br/>
//           <strong>Full Address:</strong><br/>
//           <small>${clientAddress}</small><br/><br/>
//           <strong>Distance to Client:</strong> ${distance} km<br/>
//           <strong>Transportation:</strong> <span style="vertical-align: middle;">${iconSvg}</span> ${caretaker.transportation}
//         </div>
//       `);
//     marker.setPopup(popup);
//     return marker;
//   };

//   // Function to calculate distance between two coordinates using Haversine formula
//   const calculateDistance = (coord1, coord2) => {
//     const [lng1, lat1] = coord1;
//     const [lng2, lat2] = coord2;
   
//     const R = 6371; // Earth's radius in km
//     const dLat = (lat2 - lat1) * Math.PI / 180;
//     const dLng = (lng2 - lng1) * Math.PI / 180;
//     const a =
//       Math.sin(dLat/2) * Math.sin(dLat/2) +
//       Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//       Math.sin(dLng/2) * Math.sin(dLng/2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//     return R * c; // Distance in km
//   };

//   // Function to group clients within 5km of each other
//   const groupClientsByProximity = (clients, maxDistance = 5) => {
//     const groups = [];
//     const used = new Set();
   
//     clients.forEach((client, index) => {
//       if (used.has(index)) return;
     
//       const group = [client];
//       used.add(index);
     
//       // Find all clients within maxDistance of any client in the current group
//       let foundNew = true;
//       while (foundNew) {
//         foundNew = false;
//         clients.forEach((otherClient, otherIndex) => {
//           if (!used.has(otherIndex)) {
//             // Check if this client is close to any client in the current group
//             const isClose = group.some(groupClient =>
//               calculateDistance(groupClient.coords, otherClient.coords) <= maxDistance
//             );
           
//             if (isClose) {
//               group.push(otherClient);
//               used.add(otherIndex);
//               foundNew = true;
//             }
//           }
//         });
//       }
     
//       groups.push(group);
//     });
   
//     return groups;
//   };

//   // Function to calculate optimal caretaker location (centroid of cluster)
//   const calculateCaretakerLocation = (group) => {
//     // Calculate centroid of all client coordinates
//     const sumLng = group.reduce((sum, client) => sum + client.coords[0], 0);
//     const sumLat = group.reduce((sum, client) => sum + client.coords[1], 0);
   
//     return [
//       sumLng / group.length,
//       sumLat / group.length
//     ];
//   };

//   const updateVisibility = (map, clientMarkers, caretakerMarkers, lineLayerIds, distanceLabelIds, clusterMarkers, clusterLabelIds, currentClusterPopup, clusterZoomThreshold) => {
//     const currentZoom = map.getZoom();
//     const showClusters = currentZoom < clusterZoomThreshold;
//     // Close cluster popup if zooming in
//     if (!showClusters && currentClusterPopup) {
//       currentClusterPopup.remove();
//       currentClusterPopup = null;
//     }
//     // Control client markers
//     clientMarkers.forEach(marker => {
//       marker.getElement().style.display = showClusters ? "none" : "";
//     });
//     // Control caretaker markers (show when zoomed in)
//     caretakerMarkers.forEach(marker => {
//       marker.getElement().style.display = showClusters ? "none" : "";
//     });
//     // Control line layers
//     lineLayerIds.forEach(id => {
//       map.setLayoutProperty(id, "visibility", showClusters ? "none" : "visible");
//     });
//     // Control distance labels
//     distanceLabelIds.forEach(id => {
//       map.setLayoutProperty(id, "visibility", showClusters ? "none" : "visible");
//     });
//     // Control cluster markers
//     clusterMarkers.forEach(marker => {
//       marker.getElement().style.display = showClusters ? "" : "none";
//     });
//     // Control cluster labels
//     clusterLabelIds.forEach(id => {
//       map.setLayoutProperty(id, "visibility", showClusters ? "visible" : "none");
//     });
//     return currentClusterPopup;
//   };

//   useEffect(() => {
//     if (!mapElement.current) return;
//     const map = tt.map({
//       key: apiKey,
//       container: mapElement.current,
//       center: [-0.1278, 51.5074], // London center
//       zoom: 10
//     });
//     mapRef.current = map;
//     let currentClusterPopup = null;
//     map.on("load", () => {

//       // Use clusters as regions
//       const regions = clusters.map(cluster => ({
//         name: cluster.region,
//         coords: cluster.coords,
//         radius: 1000, // 1km for postcode areas
//         zoom: 16
//       }));

//       const createCircle = (center, radius, points = 64) => {
//         const coords = [];
//         const [lng, lat] = center;
//         for (let i = 0; i < points; i++) {
//           const angle = (i * 360) / points;
//           const offsetX = radius * Math.cos((angle * Math.PI) / 180);
//           const offsetY = radius * Math.sin((angle * Math.PI) / 180);
//           coords.push([lng + offsetX / 111320, lat + offsetY / 110540]);
//         }
//         coords.push(coords[0]);
//         return { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [coords] } };
//       };
//       // Draw region circles
//       regions.forEach((region, idx) => {
//         const circleGeoJSON = createCircle(region.coords, region.radius);
//         map.addSource(`circle-${idx}`, { type: "geojson", data: circleGeoJSON });
//         map.addLayer({
//           id: `circle-layer-${idx}`,
//           type: "fill",
//           source: `circle-${idx}`,
//           paint: {
//             "fill-color": "rgba(114,38,255,0.2)",
//             "fill-outline-color": "#7226ff"
//           }
//         });
//         map.on("click", `circle-layer-${idx}`, () => {
//           map.flyTo({ center: region.coords, zoom: 16, duration: 1000 });
//           if (onClusterSelect) {
//             onClusterSelect(clusters[idx]);
//           }
//         });
//         map.on("mouseenter", `circle-layer-${idx}`, () => (map.getCanvas().style.cursor = "pointer"));
//         map.on("mouseleave", `circle-layer-${idx}`, () => (map.getCanvas().style.cursor = ""));
//       });
//       // Make circles transparent when zoomed in
//       map.on("zoom", () => {
//         const currentZoom = map.getZoom();
//         regions.forEach((region, idx) => {
//           const isZoomedIn = currentZoom >= 12;
//           map.setPaintProperty(
//             `circle-layer-${idx}`,
//             "fill-color",
//             isZoomedIn ? "rgba(114,38,255,0)" : "rgba(114,38,255,0.2)"
//           );
//           map.setPaintProperty(
//             `circle-layer-${idx}`,
//             "fill-outline-color",
//             isZoomedIn ? "rgba(114,38,255,0)" : "#7226ff"
//           );
//         });
//       });
//       // Arrays to control visibility
//       let clientMarkers = [];
//       let caretakerMarkers = [];
//       let lineLayerIds = [];
//       let distanceLabelIds = [];
//       let clusterMarkers = [];
//       let clusterLabelIds = [];
//       const clusterZoomThreshold = 12; // Adjusted for smaller areas
//       let globalCarerIndex = 0;
//       let globalGroupIndex = 0;
//       // Group clients by region and then by proximity
//       regions.forEach((region, regionIndex) => {
//         const regionClients = clients.filter(client => client.region === region.name);
//         const clientGroups = groupClientsByProximity(regionClients, 1); // Small distance for tight groups
       
//         // Different colors for different groups
//         const groupColors = [
//           "#7226ff", "#44ff44", "#4444ff", "#ffff44", "#ff44ff",
//           "#44ffff", "#ff8844", "#8844ff", "#44ff88", "#ff4488"
//         ];
       
//         clientGroups.forEach((group, groupIndex) => {
//           const color = groupColors[groupIndex % groupColors.length];
//           globalGroupIndex++;
         
//           // For one carer per client
//           const startingCarerIndex = globalCarerIndex;
//           group.forEach((client, clientIndex) => {
//             const caretaker = caretakerData[globalCarerIndex % caretakerData.length];
//             globalCarerIndex++;
           
//             // Place carer slightly offset from client
//             const angle = (clientIndex / group.length) * 2 * Math.PI;
//             const offsetDist = 0.001; // Smaller offset ~100m
//             const offsetLng = Math.cos(angle) * offsetDist;
//             const offsetLat = Math.sin(angle) * offsetDist;
//             const carerPos = [
//               client.coords[0] + offsetLng,
//               client.coords[1] + offsetLat
//             ];
           
//             // Add carer marker for this assignment (pass client details for popup)
//             const carerMarker = createCaretakerMarker(carerPos, caretaker, color, client.coords, client.name, client.address);
//             carerMarker.addTo(map);
//             // Add click event for carer marker to zoom in and show popup
//             carerMarker.getElement().addEventListener('click', (e) => {
//               e.stopPropagation();
//               map.flyTo({ center: carerPos, zoom: 18 });
//               carerMarker.togglePopup();
//             });
//             caretakerMarkers.push(carerMarker);
//             // Add client marker
//             const initials = getInitials(client.name);
//             const clientMarker = createCustomMarker(client.coords, initials, color).addTo(map);
//             // Add click event for client marker to zoom in and show popup
//             clientMarker.getElement().addEventListener('click', (e) => {
//               e.stopPropagation();
//               map.flyTo({ center: client.coords, zoom: 18 });
//               clientMarker.togglePopup();
//             });
//             // Simplified popup for client: name and full address
//             const popup = new tt.Popup({ offset: 30 })
//               .setHTML(`
//                 <div style="padding: 8px;">
//                   <strong>${client.name}</strong><br/>
//                   <small>${client.address}</small>
//                 </div>
//               `);
//             clientMarker.setPopup(popup);
//             clientMarkers.push(clientMarker);
//             // Draw dotted line from carer to client
//             const lineId = `carer-line-${region.name}-${groupIndex}-${clientIndex}`;
//             const lineGeoJSON = {
//               type: "Feature",
//               geometry: {
//                 type: "LineString",
//                 coordinates: [carerPos, client.coords]
//               },
//               properties: {
//                 distance: calculateDistance(carerPos, client.coords).toFixed(2)
//               }
//             };
//             map.addSource(lineId, {
//               type: "geojson",
//               data: lineGeoJSON
//             });
//             map.addLayer({
//               id: lineId,
//               type: "line",
//               source: lineId,
//               layout: {
//                 visibility: "none"
//               },
//               paint: {
//                 "line-color": color,
//                 "line-width": 2,
//                 "line-opacity": 0.8,
//                 "line-dasharray": [1, 3]
//               }
//             });
//             lineLayerIds.push(lineId);
//             // Add distance label at midpoint
//             const midPoint = [
//               (carerPos[0] + client.coords[0]) / 2,
//               (carerPos[1] + client.coords[1]) / 2
//             ];
//             const labelId = `carer-label-${region.name}-${groupIndex}-${clientIndex}`;
//             const labelGeoJSON = {
//               type: "Feature",
//               geometry: {
//                 type: "Point",
//                 coordinates: midPoint
//               },
//               properties: {
//                 distance: `${calculateDistance(carerPos, client.coords).toFixed(1)}km`
//               }
//             };
//             map.addSource(labelId, {
//               type: "geojson",
//               data: labelGeoJSON
//             });
//             map.addLayer({
//               id: labelId,
//               type: "symbol",
//               source: labelId,
//               layout: {
//                 "text-field": ["get", "distance"],
//                 "text-size": 10,
//                 "text-offset": [0, 0],
//                 "text-anchor": "center",
//                 visibility: "none"
//               },
//               paint: {
//                 "text-color": color,
//                 "text-halo-color": "#ffffff",
//                 "text-halo-width": 1
//               }
//             });
//             distanceLabelIds.push(labelId);
//           });
//           // Use region center for cluster flag and label
//           const groupCenter = region.coords;
//           // Create cluster flag marker
//           const uniqueCarers = [...new Set(group.map((_, i) => caretakerData[(startingCarerIndex + i) % caretakerData.length].name))];
//           const popupHtml = `
//             <div style="padding: 10px; max-width: 250px;">
//               <strong>${region.name}</strong><br/>
//               <small>${group.length} clients</small><br/>
//               <small>Postcode: ${clusters[regionIndex].postcode}</small><br/>
//               <small>Each client assigned to one carer</small>
//               <hr style="margin: 8px 0; border: none; border-top: 1px solid #eee;">
//               <div style="font-size: 12px;">
//                 <strong>Carers used:</strong><br/>
//                 ${uniqueCarers.join(', ')}
//               </div>
//             </div>
//           `;
//           const popup = new tt.Popup({ offset: 30 }).setHTML(popupHtml);
//           const markerElement = document.createElement('div');
//           markerElement.style.width = '10px';
//           markerElement.style.height = '24px';
//           const flagSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 512 512">
//               <path fill="#ff4287ff" d="M80 0C71.2 0 64 7.2 64 16v480c0 8.8 7.2 16 16 16s16-7.2 16-16V288h320c8.8 0 16-7.2 16-16V64c0-8.8-7.2-16-16-16H96V16c0-8.8-7.2-16-16-16z"/>
//             </svg>
//             `;
//           markerElement.innerHTML = flagSvg;
//           const clusterMarker = new tt.Marker({
//             element: markerElement,
//             anchor: 'bottom'
//           }).setLngLat(groupCenter);
//           clusterMarker.setPopup(popup);
//           clusterMarker.addTo(map);
//           clusterMarkers.push(clusterMarker);
//           // Click event for cluster marker
//           clusterMarker.getElement().addEventListener('click', (e) => {
//             e.stopPropagation();
//             if (currentClusterPopup) {
//               currentClusterPopup.remove();
//             }
//             currentClusterPopup = clusterMarker.getPopup();
//             currentClusterPopup.addTo(map);
//             map.flyTo({ center: groupCenter, zoom: 16, duration: 1000 });
//             if (onClusterSelect) {
//               onClusterSelect(clusters[regionIndex]);
//             }
//           });
//           // Hover cursor for cluster marker
//           clusterMarker.getElement().addEventListener('mouseenter', () => {
//             map.getCanvas().style.cursor = "pointer";
//           });
//           clusterMarker.getElement().addEventListener('mouseleave', () => {
//             map.getCanvas().style.cursor = "";
//           });
//           // Add cluster label layer
//           const clusterLabelId = `cluster-label-${region.name}-${groupIndex}`;
//           const clusterLabelGeoJSON = {
//             type: "Feature",
//             geometry: {
//               type: "Point",
//               coordinates: groupCenter
//             },
//             properties: {
//               name: region.name
//             }
//           };
//           map.addSource(clusterLabelId, {
//             type: "geojson",
//             data: clusterLabelGeoJSON
//           });
//           map.addLayer({
//             id: clusterLabelId,
//             type: "symbol",
//             source: clusterLabelId,
//             layout: {
//               "text-field": ["get", "name"],
//               "text-size": 14,
//               "text-offset": [0, 1.5],
//               "text-anchor": "center",
//               "visibility": "none"
//             },
//             paint: {
//               "text-color": color,
//               "text-halo-color": "#ffffff",
//               "text-halo-width": 2
//             }
//           });
//           clusterLabelIds.push(clusterLabelId);
//           // Click event for cluster label
//           map.on("click", clusterLabelId, (e) => {
//             if (currentClusterPopup) {
//               currentClusterPopup.remove();
//             }
//             currentClusterPopup = new tt.Popup({ offset: 30 })
//               .setLngLat(groupCenter)
//               .setHTML(popupHtml)
//               .addTo(map);
//             map.flyTo({ center: groupCenter, zoom: 16, duration: 1000 });
//             if (onClusterSelect) {
//               onClusterSelect(clusters[regionIndex]);
//             }
//           });
//           // Hover cursor for cluster label
//           map.on("mouseenter", clusterLabelId, () => {
//             map.getCanvas().style.cursor = "pointer";
//           });
//           map.on("mouseleave", clusterLabelId, () => {
//             map.getCanvas().style.cursor = "";
//           });
//         });
//         // Add unassigned carers for this region
//         const numUnassigned = 1; // Reduced
//         const unassignedStartIdx = regionIndex * numUnassigned;
//         for (let u = 0; u < numUnassigned; u++) {
//           const unIdx = (unassignedStartIdx + u) % caretakerData.length;
//           const unassignedCaretaker = caretakerData[unIdx];
//           // Place unassigned carer offset from region center
//           const angle = (u / numUnassigned) * 2 * Math.PI;
//           const offsetDist = 0.002; // ~200m offset
//           const offsetLng = Math.cos(angle) * offsetDist;
//           const offsetLat = Math.sin(angle) * offsetDist;
//           const unPos = [
//             region.coords[0] + offsetLng,
//             region.coords[1] + offsetLat
//           ];
//           // Create unassigned marker with gray border
//           const unMarkerElement = document.createElement('div');
//           unMarkerElement.className = 'caretaker-marker';
//           unMarkerElement.style.borderColor = '#999';
//           unMarkerElement.innerHTML = `
//             <div class="caretaker-inner">
//               <img src="${unassignedCaretaker.image}" alt="${unassignedCaretaker.name}" class="caretaker-image" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; flex-shrink: 0;" />
//               <span class="caretaker-initials">${getInitials(unassignedCaretaker.name)}</span>
//             </div>
//           `;
//           const unMarker = new tt.Marker({
//             element: unMarkerElement,
//             anchor: 'center'
//           }).setLngLat(unPos);
//           // Get icon SVG for unassigned
//           const iconSvg = getTransportIcon(unassignedCaretaker.transportation);
//           // Popup for unassigned carer (no client-specific info)
//           const unPopup = new tt.Popup({ offset: 30 })
//             .setHTML(`
//               <div style="padding: 10px; max-width: 250px;">
//                 <strong style="font-size: 14px;">${unassignedCaretaker.name}</strong><br/><br/>
//                 <small style="color: #666;">Unassigned</small><br/><br/>
//                 <strong>Transportation:</strong> <span style="vertical-align: middle;">${iconSvg}</span> ${unassignedCaretaker.transportation}
//               </div>
//             `);
//           unMarker.setPopup(unPopup);
//           // Add click event for unassigned carer to zoom in and show popup
//           unMarker.getElement().addEventListener('click', (e) => {
//             e.stopPropagation();
//             map.flyTo({ center: unPos, zoom: 18 });
//             unMarker.togglePopup();
//           });
//           unMarker.addTo(map);
//           caretakerMarkers.push(unMarker);
//         }
//       });
//       // Initial visibility setup
//       currentClusterPopup = updateVisibility(map, clientMarkers, caretakerMarkers, lineLayerIds, distanceLabelIds, clusterMarkers, clusterLabelIds, currentClusterPopup, clusterZoomThreshold);
//       // Zoom event to control visibility
//       map.on("zoom", () => {
//         currentClusterPopup = updateVisibility(map, clientMarkers, caretakerMarkers, lineLayerIds, distanceLabelIds, clusterMarkers, clusterLabelIds, currentClusterPopup, clusterZoomThreshold);
//       });
//       // Add legend to the map
//       const legend = document.createElement('div');
//       legend.className = 'map-legend';
//       legend.innerHTML = `
//         <div class="legend-title">Map Legend</div>
//         <div class="legend-item">
//           <div class="legend-color" style="background-color: #7226ff;"></div>
//           <span>Cluster Boundary</span>
//         </div>
//         <div class="legend-item">
//           <svg width="20" height="20" viewBox="0 0 448 512" style="margin-right: 8px;">
//             <path d="M48 24C48 10.7 37.3 0 24 0S0 10.7 0 24V64 350.5 400v88c0 13.3 10.7 24 24 24s24-10.7 24-24V388l80.3-20.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30V66.1c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L48 52V24zm0 77.5l96.6-24.2c27-6.7 55.5-3.6 80.4 8.8c54.9 27.4 118.7 29.7 175 6.8V334.7l-24.4 9.1c-33.7 12.6-71.2 10.7-103.4-5.4c-48.2-24.1-103.3-30.1-155.6-17.1L48 338.5v-237z" fill="#7226ff"/>
//           </svg>
//           <span>Client</span>
//         </div>
//         <div class="legend-item">
//           <div class="legend-caretaker"></div>
//           <span>Assigned Carer (1 per client)</span>
//         </div>
//         <div class="legend-item">
//           <div class="legend-unassigned-caretaker" style="border-color: #999;"></div>
//           <span>Unassigned Carer</span>
//         </div>
//         <div class="legend-item">
//           <div style="width: 20px; height: 2px; border-bottom: 2px dotted #7226ff; margin-right: 8px; margin-top: 8px;"></div>
//           <span>Carer-Client Dotted Route</span>
//         </div>
//       `;
     
//       mapElement.current.appendChild(legend);

//       // Load real data for selected cluster
//       const loadRealData = async () => {
//         if (!selectedCluster || allClients.length === 0) return;
//         const geocodedClients = await Promise.all(allClients.map(async (client) => {
//           const coords = await geocodePostcode(client.postcode);
//           return { ...client, coords };
//         }));
//         const allCarers = [];
//         Object.values(clientCarers).forEach(carers => {
//           carers.forEach(carer => {
//             if (!allCarers.find(c => c.id === carer.id)) {
//               allCarers.push(carer);
//             }
//           });
//         });
//         const geocodedCarers = await Promise.all(allCarers.map(async (carer) => {
//           const coords = await geocodePostcode(carer.postcode);
//           return { ...carer, coords };
//         }));
//         // Create markers
//         geocodedClients.forEach((client, index) => {
//           const carer = geocodedCarers[index % geocodedCarers.length];
//           if (carer) {
//             const clientMarker = createCustomMarker(client.coords, getInitials(client.fullName), '#7226ff');
//             clientMarker.addTo(map);
//             const carerData = {
//               name: `${carer.firstName} ${carer.lastName}`,
//               image: employeeImages[index % employeeImages.length],
//               transportation: 'Private Car', // placeholder
//               role: carer.role
//             };
//             const carerMarker = createCaretakerMarker(carer.coords, carerData, '#7226ff', client.coords, client.fullName, client.address);
//             carerMarker.addTo(map);
//             // Draw line
//             const lineId = `real-line-${client.id}-${carer.id}`;
//             const lineGeoJSON = {
//               type: "Feature",
//               geometry: {
//                 type: "LineString",
//                 coordinates: [carer.coords, client.coords]
//               }
//             };
//             map.addSource(lineId, { type: "geojson", data: lineGeoJSON });
//             map.addLayer({
//               id: lineId,
//               type: "line",
//               source: lineId,
//               paint: {
//                 "line-color": '#7226ff',
//                 "line-width": 2,
//                 "line-dasharray": [1, 3]
//               }
//             });
//           }
//         });
//       };
//       loadRealData();
//     });
//     return () => {
//       if (mapElement.current) {
//         const legend = mapElement.current.querySelector('.map-legend');
//         const header = mapElement.current.querySelector('.map-header');
//         if (legend) {
//           legend.remove();
//         }
//         if (header) {
//           header.remove();
//         }
//       }
//       if (mapRef.current) {
//         mapRef.current.remove();
//       }
//     };
//   }, [apiKey, clients, caretakerData, clusters, onClusterSelect, clusterClientIds, selectedCluster, allClients, clientCarers]);

//   // Effect to zoom to selected cluster
//   useEffect(() => {
//     if (!selectedCluster || !mapRef.current) return;

//     const map = mapRef.current;
//     const targetCenter = selectedCluster.coords;
//     const targetZoom = 16;

//     map.flyTo({
//       center: targetCenter,
//       zoom: targetZoom,
//       duration: 1000
//     });
//   }, [selectedCluster]);

//   // Effect to fetch carers for clients in selected cluster
//   useEffect(() => {
//     if (!selectedCluster || !clusterClientIds[selectedCluster.id]) return;
//     const clientIds = clusterClientIds[selectedCluster.id];
//     const fetchCarers = async () => {
//       try {
//         const carerPromises = clientIds.map(clientId => fetchClientCarers(clientId));
//         const carerResults = await Promise.all(carerPromises);
//         const carersData = {};
//         carerResults.forEach((result, index) => {
//           const clientId = clientIds[index];
//           carersData[clientId] = result.carers || [];
//         });
//         setClientCarers(carersData);
//       } catch (error) {
//         console.error('Error fetching carers:', error);
//       }
//     };
//     fetchCarers();
//   }, [selectedCluster, clusterClientIds]);

//   return <div ref={mapElement} style={{ width: "100%", height: "100%" }} />;
// };

// export default TomTomMap;



import React, { useEffect, useRef, useState } from "react";
import ReactDOMServer from 'react-dom/server';
import tt from "@tomtom-international/web-sdk-maps";
import "@tomtom-international/web-sdk-maps/dist/maps.css";
import { IconWalk, IconBus, IconCar } from "@tabler/icons-react";
import { fetchClientCarers } from "../../Cluster/config/apiConfig";
import "./TomTomMap.css";

const TomTomMap = ({ 
  clusters = [], 
  selectedCluster = null, 
  onClusterSelect, 
  allClients = [] 
}) => {
  const mapElement = useRef(null);
  const mapRef = useRef(null);
  const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;
  const [isLoadingCarers, setIsLoadingCarers] = useState(false);
  const [clientMarkers, setClientMarkers] = useState([]);
  const [carerMarkers, setCarerMarkers] = useState([]);
  const [lineLayerIds, setLineLayerIds] = useState([]);
  const [allCoordinates, setAllCoordinates] = useState([]);

  // Function to get initials from name
  const getInitials = (name) => {
    if (!name) return 'UK';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Function to get transport icon SVG
  const getTransportIcon = (mode) => {
    let IconComponent;
    switch (mode) {
      case 'Walking':
        IconComponent = IconWalk;
        break;
      case 'Public Transportation':
        IconComponent = IconBus;
        break;
      case 'Private Car':
      default:
        IconComponent = IconCar;
    }
    const svgString = ReactDOMServer.renderToString(
      <IconComponent size={16} stroke={2} />
    );
    return svgString;
  };

  // Function to create custom marker with circled initials
  const createCustomMarker = (lngLat, initials, color) => {
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    markerElement.style.backgroundColor = color;
    markerElement.innerHTML = initials;
    return new tt.Marker({
      element: markerElement,
      anchor: 'center'
    }).setLngLat(lngLat);
  };

  // Function to create carer marker
  const createCarerMarker = (lngLat, carer, color, clientCoords, clientName, clientAddress) => {
    const markerElement = document.createElement('div');
    markerElement.className = 'caretaker-marker';
    markerElement.style.borderColor = color;
    markerElement.innerHTML = `
      <div class="caretaker-inner">
        <span class="caretaker-initials">${getInitials(`${carer.firstName} ${carer.lastName}`)}</span>
      </div>
    `;
    const marker = new tt.Marker({
      element: markerElement,
      anchor: 'center'
    }).setLngLat(lngLat);

    // Get icon SVG
    const iconSvg = getTransportIcon('Private Car');
    
    // Popup for carer with distance and duration
    const popup = new tt.Popup({ offset: 30 })
      .setHTML(`
        <div style="padding: 10px; max-width: 250px;">
          <strong style="font-size: 14px;">${carer.firstName} ${carer.lastName}</strong><br/><br/>
          <strong>Client:</strong> ${clientName}<br/>
          <strong>Full Address:</strong><br/>
          <small>${clientAddress}</small><br/><br/>
          <strong>Distance to Client:</strong> ${carer.distance || 'N/A'}<br/>
          <strong>Duration:</strong> ${carer.duration || 'N/A'}<br/>
          <strong>Transportation:</strong> <span style="vertical-align: middle;">${iconSvg}</span> Private Car
        </div>
      `);
    marker.setPopup(popup);
    return marker;
  };

  // Update visibility based on zoom level
  const updateVisibility = (map, clientMarkers, carerMarkers, lineLayerIds, clusterMarkers, clusterLabelIds, clusterZoomThreshold) => {
    const currentZoom = map.getZoom();
    const showClusters = currentZoom < clusterZoomThreshold;

    // Control client markers
    clientMarkers.forEach(marker => {
      if (marker && marker.getElement()) {
        marker.getElement().style.display = showClusters ? "none" : "";
      }
    });

    // Control carer markers
    carerMarkers.forEach(marker => {
      if (marker && marker.getElement()) {
        marker.getElement().style.display = showClusters ? "none" : "";
      }
    });

    // Control line layers
    lineLayerIds.forEach(id => {
      try {
        map.setLayoutProperty(id, "visibility", showClusters ? "none" : "visible");
      } catch (e) {
        console.error(`Error setting visibility for line ${id}:`, e);
      }
    });

    // Control cluster markers
    clusterMarkers.forEach(marker => {
      if (marker && marker.getElement()) {
        marker.getElement().style.display = showClusters ? "" : "none";
      }
    });

    // Control cluster labels
    clusterLabelIds.forEach(id => {
      try {
        map.setLayoutProperty(id, "visibility", showClusters ? "visible" : "none");
      } catch (e) {
        console.error(`Error setting visibility for label ${id}:`, e);
      }
    });
  };

  // Initialize map
  useEffect(() => {
    if (!mapElement.current) return;

    // Use first cluster coords if available, otherwise default to world view
    const initialCenter = clusters.length > 0 ? clusters[0].coords : [0, 20];
    const initialZoom = clusters.length > 0 ? 10 : 2;

    const map = tt.map({
      key: apiKey,
      container: mapElement.current,
      center: initialCenter,
      zoom: initialZoom
    });

    mapRef.current = map;

    map.on("load", () => {
      const clusterZoomThreshold = 12;
      let clusterMarkers = [];
      let clusterLabelIds = [];

      // Draw cluster circles and markers
      clusters.forEach((cluster, idx) => {
        const createCircle = (center, radius, points = 64) => {
          const coords = [];
          const [lng, lat] = center;
          for (let i = 0; i < points; i++) {
            const angle = (i * 360) / points;
            const offsetX = radius * Math.cos((angle * Math.PI) / 180);
            const offsetY = radius * Math.sin((angle * Math.PI) / 180);
            coords.push([lng + offsetX / 111320, lat + offsetY / 110540]);
          }
          coords.push(coords[0]);
          return { 
            type: "Feature", 
            properties: {}, 
            geometry: { type: "Polygon", coordinates: [coords] } 
          };
        };

        const circleGeoJSON = createCircle(cluster.coords, 1000);
        map.addSource(`circle-${idx}`, { type: "geojson", data: circleGeoJSON });
        map.addLayer({
          id: `circle-layer-${idx}`,
          type: "line",
          source: `circle-${idx}`,
          paint: {
            "line-color": "#7226ff",
            "line-width": 3
          }
        });

        map.on("click", `circle-layer-${idx}`, () => {
          map.flyTo({ center: cluster.coords, zoom: 16, duration: 1000 });
          if (onClusterSelect) {
            onClusterSelect(cluster);
          }
        });

        map.on("mouseenter", `circle-layer-${idx}`, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", `circle-layer-${idx}`, () => {
          map.getCanvas().style.cursor = "";
        });

        // Create cluster flag marker
        const markerElement = document.createElement('div');
        markerElement.style.width = '10px';
        markerElement.style.height = '24px';
        const flagSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 512 512">
            <path fill="#ff4287ff" d="M80 0C71.2 0 64 7.2 64 16v480c0 8.8 7.2 16 16 16s16-7.2 16-16V288h320c8.8 0 16-7.2 16-16V64c0-8.8-7.2-16-16-16H96V16c0-8.8-7.2-16-16-16z"/>
          </svg>`;
        markerElement.innerHTML = flagSvg;

        const clusterMarker = new tt.Marker({
          element: markerElement,
          anchor: 'bottom'
        }).setLngLat(cluster.coords);

        const popup = new tt.Popup({ offset: 30 }).setHTML(`
          <div style="padding: 10px; max-width: 250px;">
            <strong>${cluster.name}</strong><br/>
            <small>Postcode: ${cluster.postcode}</small>
          </div>
        `);
        clusterMarker.setPopup(popup);
        clusterMarker.addTo(map);
        clusterMarkers.push(clusterMarker);

        clusterMarker.getElement().addEventListener('click', (e) => {
          e.stopPropagation();
          map.flyTo({ center: cluster.coords, zoom: 16, duration: 1000 });
          if (onClusterSelect) {
            onClusterSelect(cluster);
          }
        });

        // Add cluster label
        const clusterLabelId = `cluster-label-${idx}`;
        const clusterLabelGeoJSON = {
          type: "Feature",
          geometry: { type: "Point", coordinates: cluster.coords },
          properties: { name: cluster.name }
        };
        map.addSource(clusterLabelId, { type: "geojson", data: clusterLabelGeoJSON });
        map.addLayer({
          id: clusterLabelId,
          type: "symbol",
          source: clusterLabelId,
          layout: {
            "text-field": ["get", "name"],
            "text-size": 14,
            "text-offset": [0, 1.5],
            "text-anchor": "center",
            "visibility": "visible"
          },
          paint: {
            "text-color": "#7226ff",
            "text-halo-color": "#ffffff",
            "text-halo-width": 2
          }
        });
        clusterLabelIds.push(clusterLabelId);
      });

      // Update visibility on zoom
      map.on("zoom", () => {
        updateVisibility(
          map,
          clientMarkers,
          carerMarkers,
          lineLayerIds,
          clusterMarkers,
          clusterLabelIds,
          clusterZoomThreshold
        );
      });

      // Add legend
      const legend = document.createElement('div');
      legend.className = 'map-legend';
      legend.innerHTML = `
        <div class="legend-title">Map Legend</div>
        <div class="legend-item">
          <div style="width: 20px; height: 2px; background-color: #7226ff; margin-right: 8px;"></div>
          <span>Cluster Boundary</span>
        </div>
        <div class="legend-item">
          <svg width="20" height="20" viewBox="0 0 448 512" style="margin-right: 8px;">
            <path d="M48 24C48 10.7 37.3 0 24 0S0 10.7 0 24V64 350.5 400v88c0 13.3 10.7 24 24 24s24-10.7 24-24V388l80.3-20.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30V66.1c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L48 52V24zm0 77.5l96.6-24.2c27-6.7 55.5-3.6 80.4 8.8c54.9 27.4 118.7 29.7 175 6.8V334.7l-24.4 9.1c-33.7 12.6-71.2 10.7-103.4-5.4c-48.2-24.1-103.3-30.1-155.6-17.1L48 338.5v-237z" fill="#7226ff"/>
          </svg>
          <span>Client</span>
        </div>
        <div class="legend-item">
          <div class="legend-caretaker"></div>
          <span>Assigned Carer</span>
        </div>
        <div class="legend-item">
          <div style="width: 20px; height: 2px; border-bottom: 2px dotted #7226ff; margin-right: 8px; margin-top: 8px;"></div>
          <span>Carer-Client Route</span>
        </div>
      `;
      mapElement.current.appendChild(legend);
    });

    return () => {
      if (mapElement.current) {
        const legend = mapElement.current.querySelector('.map-legend');
        if (legend) legend.remove();
      }
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [apiKey, clusters, onClusterSelect]);

  // Load client and carer data when allClients changes
  useEffect(() => {
    const loadClientCarerData = async () => {
      if (!mapRef.current || allClients.length === 0) return;

      const map = mapRef.current;
      setIsLoadingCarers(true);

      // Clear existing markers and lines
      clientMarkers.forEach(m => m.remove());
      carerMarkers.forEach(m => m.remove());
      lineLayerIds.forEach(id => {
        if (map.getLayer(id)) map.removeLayer(id);
        if (map.getSource(id)) map.removeSource(id);
      });

      const newClientMarkers = [];
      const newCarerMarkers = [];
      const newLineLayerIds = [];
      const coordinates = [];
      const colors = ['#7226ff', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#ff8844', '#44ffff'];

      try {
        // Process each client
        for (let i = 0; i < allClients.length; i++) {
          const client = allClients[i];
          const color = colors[i % colors.length];

          console.log(`Processing client ${client.id}:`, client);

          // Fetch carers for this client
          const carerData = await fetchClientCarers(client.id);
          
          console.log(`Carer data for client ${client.id}:`, carerData);

          if (!carerData) {
            console.warn(`No carer data for client ${client.id}`);
            continue;
          }

          // Use coordinates from API response
          const clientCoords = [
            parseFloat(carerData.clientLongitude) || 0,
            parseFloat(carerData.clientLatitude) || 0
          ];

          console.log(`Client ${client.id} coordinates:`, clientCoords);

          // Skip if invalid coordinates
          if (clientCoords[0] === 0 || clientCoords[1] === 0) {
            console.warn(`Invalid coordinates for client ${client.id}:`, clientCoords);
            continue;
          }

          // Add to coordinates for bounds calculation
          coordinates.push(clientCoords);

          // Add client marker
          const clientInitials = getInitials(client.fullName || client.name || 'Unknown');
          const clientMarker = createCustomMarker(clientCoords, clientInitials, color);
          clientMarker.addTo(map);

          const clientPopup = new tt.Popup({ offset: 30 }).setHTML(`
            <div style="padding: 8px;">
              <strong>${client.fullName || client.name}</strong><br/>
              <small>${client.address || carerData.clientPostcode}</small><br/>
              <small>Total Carers: ${carerData.totalCarers || 0}</small><br/>
              <small>Total Visits: ${carerData.totalVisits || 0}</small>
            </div>
          `);
          clientMarker.setPopup(clientPopup);
          clientMarker.getElement().addEventListener('click', (e) => {
            e.stopPropagation();
            map.flyTo({ center: clientCoords, zoom: 15 });
            clientMarker.togglePopup();
          });
          newClientMarkers.push(clientMarker);

          // Process carers for this client
          if (carerData.carers && carerData.carers.length > 0) {
            const carersWithCoords = [];
            const carersWithoutCoords = [];

            for (const carer of carerData.carers) {
              if (carer.latitude && carer.longitude) {
                carersWithCoords.push(carer);
              } else {
                carersWithoutCoords.push(carer);
              }
            }

            console.log(`Client ${client.id} - Carers with coords: ${carersWithCoords.length}, without: ${carersWithoutCoords.length}`);

            // Process carers with coordinates
            for (const carer of carersWithCoords) {
              const carerCoords = [parseFloat(carer.longitude), parseFloat(carer.latitude)];
              console.log(`Carer ${carer.id} coordinates:`, carerCoords);

              // Add to coordinates for bounds calculation
              coordinates.push(carerCoords);

              // Create carer marker
              const carerMarker = createCarerMarker(
                carerCoords,
                carer,
                color,
                clientCoords,
                client.fullName || client.name,
                client.address || carerData.clientPostcode
              );
              carerMarker.addTo(map);
              carerMarker.getElement().addEventListener('click', (e) => {
                e.stopPropagation();
                map.flyTo({ center: carerCoords, zoom: 15 });
                carerMarker.togglePopup();
              });
              newCarerMarkers.push(carerMarker);

              // Draw line between carer and client
              const lineId = `line-${client.id}-${carer.id}`;
              const lineGeoJSON = {
                type: "Feature",
                geometry: {
                  type: "LineString",
                  coordinates: [carerCoords, clientCoords]
                }
              };
              map.addSource(lineId, { type: "geojson", data: lineGeoJSON });
              map.addLayer({
                id: lineId,
                type: "line",
                source: lineId,
                layout: { visibility: "visible" },
                paint: {
                  "line-color": color,
                  "line-width": 2,
                  "line-opacity": 0.8,
                  "line-dasharray": [1, 3]
                }
              });
              newLineLayerIds.push(lineId);
            }

            // Process carers without coordinates - place around client
            if (carersWithoutCoords.length > 0) {
              const radius = 500; // meters - increased for visibility
              const angleStep = 360 / carersWithoutCoords.length;

              for (let j = 0; j < carersWithoutCoords.length; j++) {
                const carer = carersWithoutCoords[j];
                const angle = j * angleStep;
                const offsetX = radius * Math.cos((angle * Math.PI) / 180);
                const offsetY = radius * Math.sin((angle * Math.PI) / 180);
                const carerCoords = [
                  clientCoords[0] + offsetX / 111320,
                  clientCoords[1] + offsetY / 110540
                ];

                console.log(`Carer ${carer.id} (no coords) placed at:`, carerCoords);

                // Add to coordinates for bounds calculation
                coordinates.push(carerCoords);

                // Create carer marker
                const carerMarker = createCarerMarker(
                  carerCoords,
                  carer,
                  color,
                  clientCoords,
                  client.fullName || client.name,
                  client.address || carerData.clientPostcode
                );
                carerMarker.addTo(map);
                carerMarker.getElement().addEventListener('click', (e) => {
                  e.stopPropagation();
                  map.flyTo({ center: carerCoords, zoom: 15 });
                  carerMarker.togglePopup();
                });
                newCarerMarkers.push(carerMarker);

                // Draw line between carer and client
                const lineId = `line-${client.id}-${carer.id}`;
                const lineGeoJSON = {
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: [carerCoords, clientCoords]
                  }
                };
                map.addSource(lineId, { type: "geojson", data: lineGeoJSON });
                map.addLayer({
                  id: lineId,
                  type: "line",
                  source: lineId,
                  layout: { visibility: "visible" },
                  paint: {
                    "line-color": color,
                    "line-width": 2,
                    "line-opacity": 0.8,
                    "line-dasharray": [1, 3]
                  }
                });
                newLineLayerIds.push(lineId);
              }
            }
          }
        }

        setClientMarkers(newClientMarkers);
        setCarerMarkers(newCarerMarkers);
        setLineLayerIds(newLineLayerIds);
        setAllCoordinates(coordinates);

        // Fit map to show all markers
        if (coordinates.length > 0) {
          console.log('Fitting map to coordinates:', coordinates);
          
          // Calculate bounds
          const lngs = coordinates.map(c => c[0]);
          const lats = coordinates.map(c => c[1]);
          
          const bounds = new tt.LngLatBounds(
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)]
          );

          // Add padding and fit bounds
          map.fitBounds(bounds, {
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
            maxZoom: 15,
            duration: 1000
          });
        }

      } catch (error) {
        console.error('Error loading client/carer data:', error);
      } finally {
        setIsLoadingCarers(false);
      }
    };

    // Only load if map is ready
    if (mapRef.current) {
      loadClientCarerData();
    }
  }, [allClients]);

  // Zoom to selected cluster
  useEffect(() => {
    if (!selectedCluster || !mapRef.current) return;

    const map = mapRef.current;
    map.flyTo({
      center: selectedCluster.coords,
      zoom: 14,
      duration: 1000
    });
  }, [selectedCluster]);

  return (
    <div style={{ position: 'relative', width: "100%", height: "100%" }}>
      <div ref={mapElement} style={{ width: "100%", height: "100%" }} />
      {isLoadingCarers && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 1000,
          fontWeight: 'bold'
        }}>
          Loading carers data...
        </div>
      )}
    </div>
  );
};

export default TomTomMap;