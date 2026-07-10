export async function loadAirports(){
  const baseResponse = await fetch("data/airports.json");
  const airports = await baseResponse.json();
  let overrides = [];
  try{
    const overrideResponse = await fetch("data/overrides.json", {cache:"no-cache"});
    if(overrideResponse.ok){ overrides = await overrideResponse.json(); }
  }catch(e){ console.warn("overrides.json not loaded", e); }
  return mergeAirports(airports, overrides);
}

function code(v){ return (v||"").toString().trim().toUpperCase(); }

function mergeAirports(airports, overrides){
  const map = new Map();
  airports.forEach(a => { const k = code(a.iata); if(k) map.set(k, a); });
  overrides.forEach(o => {
    const k = code(o.iata);
    if(k) map.set(k, {...(map.get(k)||{}), ...o, iata:k, icao:code(o.icao)});
  });
  return Array.from(map.values());
}

export function searchAirports(data, query){
  const q = code(query);
  if(!q) return [];
  const score = a => {
    const iata = code(a.iata), icao = code(a.icao);
    const city = (a.city||"").toString().toUpperCase();
    const name = (a.name||"").toString().toUpperCase();
    const country = (a.country||"").toString().toUpperCase();
    if(iata === q) return 1000;
    if(icao === q) return 950;
    if(iata.startsWith(q)) return 900;
    if(icao.startsWith(q)) return 850;
    if(city === q) return 800;
    if(city.startsWith(q)) return 750;
    if(name.startsWith(q)) return 700;
    if(country.startsWith(q)) return 600;
    if(name.includes(q)) return 500;
    if(city.includes(q)) return 450;
    if(country.includes(q)) return 350;
    return 0;
  };
  return data.map(a => ({...a, _score:score(a)}))
    .filter(a => a._score > 0)
    .sort((a,b) => b._score - a._score || code(a.iata).localeCompare(code(b.iata)))
    .slice(0,25);
}
