// clusterUtils.js
export function haversineDistance(coord1, coord2) {
  const R = 6371; // Earth's radius in km
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) *
      Math.cos(coord2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Group locations within maxRadius (km)
export function clusterLocations(locations, maxRadius = 5) {
  const clusters = [];
  const visited = new Array(locations.length).fill(false);

  for (let i = 0; i < locations.length; i++) {
    if (visited[i]) continue;
    const cluster = [locations[i]];
    visited[i] = true;

    for (let j = i + 1; j < locations.length; j++) {
      if (!visited[j]) {
        const distance = haversineDistance(locations[i], locations[j]);
        if (distance <= maxRadius) {
          cluster.push(locations[j]);
          visited[j] = true;
        }
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}
