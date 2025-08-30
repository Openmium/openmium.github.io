// js/utils.js
// Utilidades globales para cargar JSON y sanitizar textos.
// Pega este archivo exactamente como está en js/utils.js

(function (window, document) {
  'use strict';

  /**
   * escapeHtml(s)
   * Convierte caracteres peligrosos en entidades HTML para evitar XSS
   * Devuelve cadena vacía si null/undefined.
   */
  function escapeHtml(s) {
    if (s === undefined || s === null) return '';
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  /**
   * formatDateToDDMMYYYY(raw)
   * Acepta: 'YYYY-MM-DD' o un objeto Date o una cadena legible.
   * Devuelve 'DD-MM-YYYY' o la entrada sin cambios si no puede parsear.
   */
  function formatDateToDDMMYYYY(raw) {
    if (!raw) return '';
    // Si ya viene en formato DD-MM-YYYY
    if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(raw)) return raw.replace(/\//g, '-');
    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const [y, m, d] = raw.split('-');
      return `${d}-${m}-${y}`;
    }
    // Intentar Date() parse
    const dt = new Date(raw);
    if (!isNaN(dt)) {
      const d = String(dt.getDate()).padStart(2, '0');
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const y = dt.getFullYear();
      return `${d}-${m}-${y}`;
    }
    return raw;
  }

  /**
   * fetchJSON(path)
   * Fetch a JSON file with control de errores y mensaje claro.
   * Retorna el JSON o lanza Error con información (usa try/catch donde se llame).
   */
  async function fetchJSON(path, opts = {}) {
    // opts puede incluir { cache: "no-store" } u otros
    const fetchOpts = Object.assign({ cache: 'no-store' }, opts);
    try {
      const res = await fetch(path, fetchOpts);
      if (!res.ok) {
        // crear error con info útil
        const text = await res.text().catch(() => '');
        const msg = `Error cargando ${path} — status ${res.status} ${res.statusText}. ${text ? 'Respuesta: ' + text : ''}`;
        throw new Error(msg);
      }
      const json = await res.json();
      return json;
    } catch (err) {
      // Reenviar error con prefijo para identificar
      throw new Error(`[fetchJSON] ${err.message || err}`);
    }
  }

  /**
   * showLoadError(container, message)
   * Muestra un aviso bonito en el elemento contenedor (id o nodo).
   */
  function showLoadError(container, message) {
    let el = null;
    if (typeof container === 'string') el = document.getElementById(container);
    else el = container;
    if (!el) {
      // si no existe el contenedor, mostrar en console y crear un alert
      console.error('[showLoadError] contenedor inexistente:', container, message);
      return;
    }
    el.innerHTML = `
      <div class="card" style="border:1px solid #f3d6d6;background:#fff6f6;padding:12px;border-radius:8px;">
        <strong>No se pudo cargar los datos.</strong>
        <div style="margin-top:8px;color:#7a2b2b;font-size:13px">${escapeHtml(String(message))}</div>
        <div style="margin-top:8px;font-size:13px;color:#666">Abre la consola (F12) para ver detalles.</div>
      </div>
    `;
  }

  /**
   * onReady(fn)
   * Llama fn cuando el DOM está listo.
   */
  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  // Exportar funciones como globals y también en window.utils
  window.escapeHtml = escapeHtml;
  window.formatDateToDDMMYYYY = formatDateToDDMMYYYY;
  window.fetchJSON = fetchJSON;
  window.showLoadError = showLoadError;
  window.onReady = onReady;

  window.utils = {
    escapeHtml,
    formatDateToDDMMYYYY,
    fetchJSON,
    showLoadError,
    onReady
  };

})(window, document);
