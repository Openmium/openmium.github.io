// js/utils.js
window.AppUtils = (function(){
  function escapeHtml(s){ if(!s) return ''; return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

  async function fetchJSON(path){
    try{
      const res = await fetch(path, {cache: 'no-store'});
      if(!res.ok) throw new Error(`Fetch ${path} failed (status ${res.status})`);
      return await res.json();
    }catch(err){
      console.error('[fetchJSON] ', err);
      throw err;
    }
  }

  function formatDateToDDMMYYYY(raw){
    if(!raw) return '';
    if(/^\d{2}-\d{2}-\d{4}$/.test(raw)) return raw;
    if(/^\d{4}-\d{2}-\d{2}$/.test(raw)){
      const [y,m,d] = raw.split('-'); return `${d}-${m}-${y}`;
    }
    const date = new Date(raw);
    if(!isNaN(date)){
      const d = String(date.getDate()).padStart(2,'0');
      const m = String(date.getMonth()+1).padStart(2,'0');
      const y = date.getFullYear();
      return `${d}-${m}-${y}`;
    }
    return raw;
  }

  return { escapeHtml, fetchJSON, formatDateToDDMMYYYY };
})();
