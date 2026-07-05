import { loadAirports, searchAirports } from './search.js';
import { renderAirport, renderEmpty, renderError, renderLoading, bindResultList } from './ui.js';
import { openAppleMaps, openGoogleMaps } from './maps.js';
import { copyText, showToast } from './utils.js';

let airports = [];
const RECENT_SEARCHES_KEY = 'airportFinderRecentSearches';
const MAX_RECENT_SEARCHES = 5;

const searchInput = document.getElementById('search');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');
const recentSearchesEl = document.getElementById('recent-searches');

async function init(){
  renderLoading(statusEl);
  try{
    airports = await loadAirports();
    window.__airportFinderData = airports;
    statusEl.textContent = `OpenFlights database loaded · ${airports.length.toLocaleString()} airports`;
    renderEmpty(resultEl);
    renderRecentSearches();
  }catch(error){
    console.error(error);
    statusEl.textContent = 'Airport database failed to load';
    renderError(resultEl, 'Unable to load airport database.');
  }

  recentSearchesEl?.addEventListener('click', event=>{
    const recentButton = event.target.closest('[data-recent-search]');
    const clearButton = event.target.closest('[data-clear-recent-searches]');

    if(recentButton){
      const query = recentButton.dataset.recentSearch;
      searchInput.value = query;
      runSearch(query, { saveRecent: true });
      searchInput.focus();
      return;
    }

    if(clearButton){
      clearRecentSearches();
      renderRecentSearches();
      searchInput.focus();
    }
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

function runSearch(query, options = {}){
  const trimmed = query.trim();
  if(trimmed.length < 2){ renderEmpty(resultEl); return; }

  const matches = searchAirports(airports, trimmed, 8);
  if(!matches.length){ renderError(resultEl, 'No airport found.'); return; }

  const mainAirport = matches[0];
  const displayQuery = mainAirport.iata || mainAirport.icao || trimmed.toUpperCase();

  renderAirport(resultEl, mainAirport, matches.slice(1));
  bindResultList(resultEl, airport => {
    const selectedQuery = airport.iata || airport.icao || trimmed.toUpperCase();
    saveRecentSearch(selectedQuery);
    renderRecentSearches();
    renderAirport(resultEl, airport, matches.filter(m => m.id !== airport.id).slice(0,7));
    bindResultList(resultEl, nextAirport => renderAirport(resultEl, nextAirport, matches.filter(m => m.id !== nextAirport.id).slice(0,7)));
  });

  if(options.saveRecent !== false){
    saveRecentSearch(displayQuery);
    renderRecentSearches();
  }
}

function getRecentSearches(){
  try{
    const stored = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
    return Array.isArray(stored) ? stored.filter(Boolean).slice(0, MAX_RECENT_SEARCHES) : [];
  }catch(error){
    console.warn('Unable to read recent searches', error);
    return [];
  }
}

function saveRecentSearch(query){
  const normalized = query.trim().toUpperCase();
  if(normalized.length < 2) return;

  const recentSearches = getRecentSearches()
    .filter(item => item.toUpperCase() !== normalized);

  recentSearches.unshift(normalized);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches.slice(0, MAX_RECENT_SEARCHES)));
}

function clearRecentSearches(){
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

function renderRecentSearches(){
  if(!recentSearchesEl) return;

  const recentSearches = getRecentSearches();
  if(!recentSearches.length){
    recentSearchesEl.hidden = true;
    recentSearchesEl.innerHTML = '';
    return;
  }

  recentSearchesEl.hidden = false;
  recentSearchesEl.innerHTML = `
    <div class="recent-searches-header">
      <span>RECENT SEARCHES</span>
      <button type="button" class="recent-clear" data-clear-recent-searches>Clear</button>
    </div>
    <div class="recent-buttons">
      ${recentSearches.map(query => `<button type="button" data-recent-search="${query}">${query}</button>`).join('')}
    </div>
  `;
}

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
}

init();
