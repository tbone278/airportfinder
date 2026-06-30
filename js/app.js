import { loadAirports, searchAirports } from './search.js';
import { renderAirport, renderEmpty, renderError, renderLoading, bindResultList } from './ui.js';
import { openAppleMaps, openGoogleMaps } from './maps.js';
import { copyText, showToast } from './utils.js';

let airports = [];
const searchInput = document.getElementById('search');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');

async function init(){
  renderLoading(statusEl);
  try{
    airports = await loadAirports();
    window.__airportFinderData = airports;
    statusEl.textContent = `OpenFlights database loaded · ${airports.length.toLocaleString()} airports`;
    renderEmpty(resultEl);
  }catch(error){
    console.error(error);
    statusEl.textContent = 'Airport database failed to load';
    renderError(resultEl, 'Unable to load airport database.');
  }

  document.querySelectorAll('[data-example]').forEach(button=>{
    button.addEventListener('click',()=>{
      searchInput.value = button.dataset.example;
      runSearch(button.dataset.example);
      searchInput.focus();
    });
  });

  searchInput.addEventListener('input',()=>runSearch(searchInput.value));

  resultEl.addEventListener('click',event=>{
    const action = event.target.closest('[data-action]');
    if(!action) return;
    const iata = action.dataset.iata;
    const airport = airports.find(a => a.iata === iata) || airports.find(a => a.icao === iata);
    if(!airport) return;
    if(action.dataset.action === 'apple') openAppleMaps(airport);
    if(action.dataset.action === 'google') openGoogleMaps(airport);
    if(action.dataset.action === 'copy') copyText(airport.iata || airport.icao).then(()=>showToast(`Copied ${airport.iata || airport.icao}`));
  });
}

function runSearch(query){
  const trimmed = query.trim();
  if(trimmed.length < 2){ renderEmpty(resultEl); return; }
  const matches = searchAirports(airports, trimmed, 8);
  if(!matches.length){ renderError(resultEl, 'No airport found.'); return; }
  renderAirport(resultEl, matches[0], matches.slice(1));
  bindResultList(resultEl, airport => renderAirport(resultEl, airport, matches.filter(m => m.id !== airport.id).slice(0,7)));
}

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
}

init();
