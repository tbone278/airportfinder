export function countryFlag(countryCode){
  if(!countryCode || countryCode.length !== 2) return '🏳️';
  return countryCode.toUpperCase().replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt()));
}

export function formatNumber(value){
  if(value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return Number(value).toFixed(4);
}

export function formatElevation(value){
  if(value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  const meters = Math.round(Number(value) * 0.3048);
  return `${value} ft / ${meters} m`;
}

export function formatUtc(value){
  if(value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  if(Number.isNaN(n)) return '—';
  const sign = n >= 0 ? '+' : '';
  return `UTC ${sign}${n}`;
}

export function localTime(timezone){
  if(!timezone) return '—';
  try{
    return new Intl.DateTimeFormat('en-GB', { timeZone: timezone, hour:'2-digit', minute:'2-digit', hour12:false }).format(new Date());
  }catch(error){ return '—'; }
}

export async function copyText(text){
  if(navigator.clipboard) return navigator.clipboard.writeText(text);
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

export function showToast(message){
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(()=>toast.remove(), 1800);
}
