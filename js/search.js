async function loadJsonFromFirstAvailable(paths, optional = false) {
  let lastError = null;
  for (const path of paths) {
    try {
      const response = await fetch(path, { cache: "no-cache" });
      if (response.ok) return await response.json();
      lastError = new Error(`${path} returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
  }
  if (optional) return [];
  throw lastError || new Error("Unable to load JSON data.");
}

export async function loadAirports() {
  const airports = await loadJsonFromFirstAvailable([
    "data/airports.json",
    "./data/airports.json",
    "airports.json",
    "./airports.json"
  ]);

  const overrides = await loadJsonFromFirstAvailable([
    "data/overrides.json",
    "./data/overrides.json"
  ], true);

  return mergeAirports(airports, overrides);
}

function normalizeCode(value) {
  return (value || "").toString().trim().toUpperCase();
}

function normalizeText(value) {
  return (value || "").toString().trim().toUpperCase();
}

function normalizeAirport(raw) {
  return {
    ...raw,
    iata: normalizeCode(raw.iata || raw.iata_code),
    icao: normalizeCode(raw.icao || raw.icao_code || raw.gps_code),
    name: raw.name || raw.airport || "",
    city: raw.city || raw.municipality || "",
    country: raw.country || raw.iso_country || "",
    lat: raw.lat ?? raw.latitude ?? raw.latitude_deg ?? raw.latitudeDeg,
    lon: raw.lon ?? raw.lng ?? raw.longitude ?? raw.longitude_deg ?? raw.longitudeDeg,
    timezone: raw.timezone || raw.tz || raw.tz_database_timezone || raw.iana_timezone || "",
    utc: raw.utc ?? raw.utc_offset ?? raw.timezone_offset ?? "",
    dst: raw.dst || ""
  };
}

function mergeAirports(airports, overrides) {
  const airportMap = new Map();

  airports.map(normalizeAirport).forEach(airport => {
    if (airport.iata) airportMap.set(airport.iata, airport);
  });

  overrides.map(normalizeAirport).forEach(override => {
    if (override.iata) {
      airportMap.set(override.iata, {
        ...(airportMap.get(override.iata) || {}),
        ...override
      });
    }
  });

  return Array.from(airportMap.values());
}

function scoreAirport(airport, query) {
  const q = normalizeCode(query);
  const iata = normalizeCode(airport.iata);
  const icao = normalizeCode(airport.icao);
  const city = normalizeText(airport.city);
  const name = normalizeText(airport.name);
  const country = normalizeText(airport.country);

  if (iata === q) return 1000;
  if (icao === q) return 950;
  if (iata.startsWith(q)) return 900;
  if (icao.startsWith(q)) return 850;
  if (city === q) return 800;
  if (city.startsWith(q)) return 750;
  if (name === q) return 725;
  if (name.startsWith(q)) return 700;
  if (country === q) return 650;
  if (country.startsWith(q)) return 600;
  if (name.includes(q)) return 500;
  if (city.includes(q)) return 450;
  if (country.includes(q)) return 350;
  return 0;
}

export function searchAirports(data, query) {
  const q = normalizeCode(query);
  if (!q || !Array.isArray(data)) return [];

  return data
    .map(airport => ({ ...airport, _score: scoreAirport(airport, q) }))
    .filter(airport => airport._score > 0)
    .sort((a, b) => b._score - a._score || normalizeCode(a.iata).localeCompare(normalizeCode(b.iata)))
    .slice(0, 25);
}
