import { countryFlag, formatElevation, formatNumber, formatUtc, localTime } from './utils.js';

export function renderLoading(statusEl){ statusEl.textContent = 'Loading OpenFlights airport database...'; }

export function renderEmpty(container){
  container.className = 'result-card empty-card';
  container.innerHTML = `<div class="empty-message"><div class="empty-icon">✈</div><h2>Airport information appears here</h2><p>Search by IATA, ICAO, airport name or city.</p></div>`;
}

export function renderError(container, message){
  container.className = 'result-card empty-card';
  container.innerHTML = `<div class="empty-message"><div class="empty-icon">!</div><h2>${message}</h2></div>`;
}

function airportType(airport){
  if((airport.name || '').toLowerCase().includes('international')) return 'International Airport';
  return airport.type === 'airport' ? 'Airport' : (airport.type || 'Airport');
}

export function renderAirport(container, airport, more = []){
  container.className = 'result-card';
  const code = airport.iata || airport.icao || '---';
  const mapsCode = airport.iata || airport.icao;
  const time = localTime(airport.timezone);
  container.innerHTML = `
    <div class="airport-head">
      <div class="flag">${countryFlag(airport.countryCode)}</div>
      <div class="airport-title">
        <div class="iata-main">${code}</div>
        <h2>${airport.name || 'Unknown Airport'}</h2>
        <p>${airport.city || 'Unknown city'}, ${airport.country || 'Unknown country'}</p>
      </div>
      <div class="match-pill">MATCH ${airport._score || ''}</div>
    </div>

    <div class="airport-grid">
      <div><span class="label">ICAO</span><span class="value">${airport.icao || '—'}</span></div>
      <div><span class="label">Latitude</span><span class="value">${formatNumber(airport.lat)}</span></div>
      <div><span class="label">IATA</span><span class="value">${airport.iata || '—'}</span></div>
      <div><span class="label">Longitude</span><span class="value">${formatNumber(airport.lon)}</span></div>
      <div><span class="label">Timezone</span><span class="value">${airport.timezone || '—'}</span></div>
      <div><span class="label">Local Time</span><span class="value">${time}</span></div>
      <div><span class="label">UTC</span><span class="value">${formatUtc(airport.utc)}</span></div>
      <div><span class="label">Type</span><span class="value">${airportType(airport)}</span></div>
      <div><span class="label">Elevation</span><span class="value">${formatElevation(airport.elevationFt)}</span></div>
      <div><span class="label">Country</span><span class="value">${airport.country || '—'}</span></div>
    </div>

    <div class="airport-actions">
      <button class="action-button" data-action="apple" data-iata="${mapsCode}"><span>⌖</span>APPLE MAPS</button>
      <button class="action-button" data-action="google" data-iata="${mapsCode}"><span>⌖</span>GOOGLE MAPS</button>
      <button class="action-button" data-action="copy" data-iata="${mapsCode}"><span>□</span>COPY IATA (${airport.iata || airport.icao})</button>
    </div>

    ${more.length ? `<div class="results-list"><strong>MORE MATCHES</strong>${more.map(a => `<div class="mini-result" data-result-id="${a.id}"><span><strong>${a.iata || a.icao}</strong> · ${a.name}</span><span>${a.city || ''}</span></div>`).join('')}</div>` : ''}
  `;
}

export function bindResultList(container, onSelect){
  container.querySelectorAll('[data-result-id]').forEach(row=>{
    row.addEventListener('click',()=>{
      const id = Number(row.dataset.resultId);
      const airport = window.__airportFinderData?.find(a => a.id === id);
      if(airport) onSelect(airport);
    });
  });
}
