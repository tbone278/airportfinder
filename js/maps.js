export function openAppleMaps(airport){
  const { lat, lon, name } = airport;
  const url = `https://maps.apple.com/?ll=${lat},${lon}&q=${encodeURIComponent(name || 'Airport')}`;
  window.open(url, '_blank', 'noopener');
}

export function openGoogleMaps(airport){
  const { lat, lon, name } = airport;
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}&query_place_id=${encodeURIComponent(name || 'Airport')}`;
  window.open(url, '_blank', 'noopener');
}
