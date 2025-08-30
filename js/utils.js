// js/utils.js
function escapeHtml(s){ if(s===undefined||s===null) return ''; return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }
function formatDateToDDMMYYYY(raw){
  if(!raw) return '';
  if(/^\d{4}-\d{2}-\d{2}$/.test(raw)){ const [y,m,d]=raw.split('-'); return `${d}-${m}-${y}`; }
  const dObj = new Date(raw);
  if(!isNaN(dObj)) return `${String(dObj.getDate()).padStart(2,'0')}-${String(dObj.getMonth()+1).padStart(2,'0')}-${dObj.getFullYear()}`;
  return raw;
}
