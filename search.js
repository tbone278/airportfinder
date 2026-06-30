import {loadAirports,searchAirports} from './search.js';
import {renderAirport,renderMessage} from './ui.js';
let airports=[];
const input=document.getElementById('search');
async function init(){try{airports=await loadAirports();renderMessage('Airport database loaded.');}catch(e){renderMessage('Unable to load airport database.');}
input?.addEventListener('input',()=>{const q=input.value.trim();if(!q){renderMessage('Type an IATA, ICAO, airport or city.');return;}const r=searchAirports(airports,q);renderAirport(r[0]||null);});}
window.addEventListener('DOMContentLoaded',init);