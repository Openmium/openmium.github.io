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

  // simple validator: comprueba que cada review/book tenga assets referenciadas
  async function validateDataWithAssets(jsonPath, assetPrefix = 'assets/'){
    const missing = [];
    try{
      const data = await fetchJSON(jsonPath);
      const keys = [];
      if(data.reviews) keys.push(...data.reviews.flatMap(r => (r.images||[])));
      if(data.books) keys.push(...data.books.flatMap(b => [b.cover, b.sample].filter(Boolean)));
      // remove duplicates
      const uniq = Array.from(new Set(keys));
      await Promise.all(uniq.map(async (p) => {
        if(!p) return;
        try{
          const r = await fetch(p, {method:'HEAD'});
          if(!r.ok) missing.push(p);
        }catch(e){
          missing.push(p);
        }
      }));
    }catch(err){
      console.warn('[validateDataWithAssets] no se pudo validar', err);
      return { ok: false, missing, error: err.message };
    }
    return { ok: missing.length === 0, missing };
  }

  return { escapeHtml, fetchJSON, formatDateToDDMMYYYY, validateDataWithAssets };
})();
