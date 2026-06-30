const DATA_URL = './data/airports.json';

export async function loadAirports(){
  const response = await fetch(DATA_URL, { cache: 'no-cache' });
  if(!response.ok) throw new Error(`Unable to load ${DATA_URL}`);
  return response.json();
}

function normalize(value){
  return String(value || '').normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase().trim();
}

function scoreAirport(airport, query){
  const q = normalize(query);
  const iata = normalize(airport.iata);
  const icao = normalize(airport.icao);
  const city = normalize(airport.city);
  const name = normalize(airport.name);
  const country = normalize(airport.country);

  if(iata && iata === q) return 1000;
  if(icao && icao === q) return 950;
  if(iata && iata.startsWith(q)) return 850;
  if(icao && icao.startsWith(q)) return 820;
  if(city && city === q) return 760;
  if(name && name === q) return 720;
  if(city && city.startsWith(q)) return 650;
  if(name && name.startsWith(q)) return 610;
  if(country && country.startsWith(q)) return 520;
  if(city.includes(q)) return 420;
  if(name.includes(q)) return 390;
  if(country.includes(q)) return 250;
  return 0;
}

export function searchAirports(airports, query, limit = 8){
  const q = normalize(query);
  if(q.length < 2) return [];

  const ranked = airports
    .map(airport => ({...airport, _score: scoreAirport(airport, q)}))
    .filter(airport => airport._score > 0)
    .sort((a,b) => b._score - a._score || (a.iata || a.icao).localeCompare(b.iata || b.icao));

  const exactIata = ranked.find(a => normalize(a.iata) === q);
  if(exactIata) return [exactIata, ...ranked.filter(a => a.id !== exactIata.id).slice(0, limit-1)];

  const exactIcao = ranked.find(a => normalize(a.icao) === q);
  if(exactIcao) return [exactIcao, ...ranked.filter(a => a.id !== exactIcao.id).slice(0, limit-1)];

  return ranked.slice(0, limit);
}
