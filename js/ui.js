export async function loadAirports(){const r=await fetch('data/airports.json');return await r.json();}
export function searchAirports(data,q){q=q.toUpperCase();const score=a=>a.iata===q?100:a.icao===q?95:(a.iata||'').startsWith(q)?90:(a.icao||'').startsWith(q)?85:(a.city||'').toUpperCase().startsWith(q)?75:(a.name||'').toUpperCase().startsWith(q)?70:((a.name||'')+(a.city||'')).toUpperCase().includes(q)?50:0;
return data.map(a=>({...a,_s:score(a)})).filter(a=>a._s>0).sort((a,b)=>b._s-a._s);}
