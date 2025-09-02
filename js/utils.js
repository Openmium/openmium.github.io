// js/utils.js
// Funciones utilitarias globales usadas por otras páginas.
// Se carga con defer.

(function(window){
  'use strict';

  // escapeHtml: evita inyección al insertar texto en innerHTML
  function escapeHtml(input){
    if (input === null || input === undefined) return '';
    return String(input)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  // formatea fecha ISO yyyy-mm-dd -> dd-mm-yyyy (o devuelve raw si no coincide)
  function formatDateToDDMMYYYY(raw){
    if(!raw) return '';
    if(/^\d{4}-\d{2}-\d{2}$/.test(raw)){
      const [y,m,d] = raw.split('-');
      return `${d}-${m}-${y}`;
    }
    // intenta Date fallback
    const dObj = new Date(raw);
    if(!isNaN(dObj)){
      const d = String(dObj.getDate()).padStart(2,'0');
      const m = String(dObj.getMonth()+1).padStart(2,'0');
      const y = dObj.getFullYear();
      return `${d}-${m}-${y}`;
    }
    return String(raw);
  }

  window.utils = {
    escapeHtml,
    formatDateToDDMMYYYY
  };
})(window);
