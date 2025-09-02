// js/index-page.js
// Carga data/profile.json y renderiza la sección "Sobre mí" SIN mostrar "Conexiones"
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('aboutContainer');
  const DATA = 'data/profile.json';

  // fallback escapeHtml si no existe en utils.js
  function escapeHtmlSafe(s){
    if(s === undefined || s === null) return '';
    if(typeof escapeHtml === 'function') {
      try { return escapeHtml(s); } catch(e){ /* fallthrough */ }
    }
    return String(s)
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'",'&#39;');
  }

  try {
    const res = await fetch(DATA, { cache: 'no-store' });
    if(!res.ok) throw new Error('No se pudo cargar ' + DATA + ' (status ' + res.status + ')');
    const p = await res.json();

    // genera HTML: OBSERVA que NO incluimos "Conexiones"
    const html = `
      <div class="about-inner">
        <div class="about-left avatar-wrap">
          <img src="${escapeHtmlSafe(p.avatar || 'assets/avatar.jpg')}" alt="${escapeHtmlSafe(p.name || '')}">
        </div>

        <div class="about-right">
          <h1 class="about-name">${escapeHtmlSafe(p.name || '')}</h1>
          <div class="about-sub">${escapeHtmlSafe(p.work_status || '')} · ${escapeHtmlSafe(p.location || '')}</div>

          <div class="links-row about-links">
            ${p.links && p.links.linkedin ? `<a href="${escapeHtmlSafe(p.links.linkedin)}" target="_blank" rel="noopener" class="link-pill">LinkedIn</a>` : ''}
            ${p.links && p.links.github ? `<a href="${escapeHtmlSafe(p.links.github)}" target="_blank" rel="noopener" class="link-pill">GitHub</a>` : ''}
            ${p.links && p.links.pinterest ? `<a href="${escapeHtmlSafe(p.links.pinterest)}" target="_blank" rel="noopener" class="link-pill">Pinterest</a>` : ''}
          </div>

          <hr class="sep">

          <h2 class="section-title">Información personal</h2>
          <div class="info-grid">
            <div><strong>Nombre:</strong> ${escapeHtmlSafe(p.name || '')}</div>
            <div><strong>Ubicación:</strong> ${escapeHtmlSafe(p.location || '')}</div>
            <div><strong>Estado laboral:</strong> ${escapeHtmlSafe(p.work_status || '')}</div>
            <!-- Conexiones INTENCIONALMENTE OMITIDAS -->
          </div>

          <h2 class="section-title">Formación académica</h2>
          ${(p.education || []).map(ed => `
            <div class="info-block">
              <strong>${escapeHtmlSafe(ed.degree)}</strong><br>
              ${escapeHtmlSafe(ed.institution)} · ${escapeHtmlSafe(ed.period)}${ed.gpa ? ' · Nota media: ' + escapeHtmlSafe(ed.gpa) : ''}
            </div>
          `).join('')}

          <h2 class="section-title">Experiencia</h2>
          ${(p.experience || []).map(ex => `
            <div class="info-block">
              <strong>${escapeHtmlSafe(ex.role)}</strong><br>
              ${escapeHtmlSafe(ex.organization || ex.institution || '')} · ${escapeHtmlSafe(ex.period || '')}<br>
              ${escapeHtmlSafe(ex.notes || '')}
            </div>
          `).join('')}

          <h2 class="section-title">Habilidades</h2>
          <div class="info-block">
            <strong>Lenguajes:</strong> ${escapeHtmlSafe((p.skills?.languages||[]).join(', '))}<br>
            <strong>Aptitudes:</strong> ${escapeHtmlSafe((p.skills?.aptitudes||[]).join(' · '))}<br>
            <strong>Sistemas:</strong> ${escapeHtmlSafe((p.skills?.systems||[]).join(', '))}
          </div>

          <h2 class="section-title">Idiomas</h2>
          <div class="info-block">
            Español: ${escapeHtmlSafe(p.languages?.es || '')}. · Inglés: ${escapeHtmlSafe(p.languages?.en || '')}.
          </div>

          <h2 class="section-title">Intereses</h2>
          <div class="info-block">
            <strong>Profesionales:</strong> ${escapeHtmlSafe((p.interests?.professional||[]).join(', '))}.<br>
            <strong>Extracurriculares:</strong> ${escapeHtmlSafe((p.interests?.extracurricular||[]).join(', '))}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  } catch (err) {
    console.error('[index-page] ', err);
    container.innerHTML = `<div class="card">No se pudo cargar el perfil. Revisa <code>data/profile.json</code> y la consola (F12).</div>`;
  }
});
