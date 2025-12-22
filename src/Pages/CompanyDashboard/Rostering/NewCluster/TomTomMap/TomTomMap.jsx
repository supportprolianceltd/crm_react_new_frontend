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