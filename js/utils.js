// js/utils.js
// Pequeñas utilidades exposadas en window.utils

(function(){
  function escapeHtml(s){
    if(s == null) return '';
    return String(s)
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'",'&#39;');
  }

  function formatDateToDDMMYYYY(raw){
    if(!raw) return '';
    // si ya está en formato YYYY-MM-DD
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
    // fallback
    return String(raw);
  }

  // export
  window.utils = {
    escapeHtml,
    formatDateToDDMMYYYY
  };
})();
