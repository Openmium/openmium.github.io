// js/index-page.js
// Carga data/profile.json y renderiza la sección "Sobre mí"
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('aboutContainer');
  const DATA = 'data/profile.json';

  function esc(s){ return escapeHtml(s); } // usa escapeHtml de js/utils.js

  try {
    const res = await fetch(DATA, {cache: 'no-store'});
    if(!res.ok) throw new Error('No se pudo cargar ' + DATA + ' (status ' + res.status + ')');
    const p = await res.json();

    // genera HTML
    const html = `
      <div class="about-inner">
        <div class="about-left avatar-wrap">
          <img src="${esc(p.avatar || 'assets/avatar.jpg')}" alt="${esc(p.name || '')}">
        </div>

        <div class="about-right">
          <h1 class="about-name">${esc(p.name || '')}</h1>
          <div class="about-sub">${esc(p.work_status || '')} · ${esc(p.location || '')}</div>
          <p class="about-note">Conexiones: ${esc(p.connections || '')}</p>

          <div class="links-row">
            ${p.links && p.links.linkedin ? `<a href="${esc(p.links.linkedin)}" target="_blank" rel="noopener" class="small-link">LinkedIn</a>` : ''}
            ${p.links && p.links.github ? `<a href="${esc(p.links.github)}" target="_blank" rel="noopener" class="small-link">GitHub</a>` : ''}
            ${p.links && p.links.pinterest ? `<a href="${esc(p.links.pinterest)}" target="_blank" rel="noopener" class="small-link">Pinterest</a>` : ''}
          </div>

          <hr class="sep">

          <h2 class="section-title">📇 Información Personal</h2>
          <div class="info-grid">
            <div><strong>Nombre:</strong> ${esc(p.name || '')}</div>
            <div><strong>Ubicación:</strong> ${esc(p.location || '')}</div>
            <div><strong>Estado laboral:</strong> ${esc(p.work_status || '')}</div>
            <div><strong>Conexiones:</strong> ${esc(p.connections || '')}</div>
          </div>

          <h2 class="section-title">🎓 Formación Académica</h2>
          ${ (p.education || []).map(ed => `
            <div class="info-block">
              <strong>${esc(ed.degree)}</strong><br>
              ${esc(ed.institution)} · ${esc(ed.period)} · Nota media: ${esc(ed.gpa || '')}
            </div>
          `).join('') }

          <h2 class="section-title">💼 Experiencia Profesional y Voluntariado</h2>
          ${ (p.experience || []).map(ex => `
            <div class="info-block">
              <strong>${esc(ex.role)}</strong><br>
              ${esc(ex.organization)} · ${esc(ex.period)}<br>
              ${esc(ex.notes || '')}
            </div>
          `).join('') }

          <h2 class="section-title">🛠️ Habilidades y Competencias</h2>
          <div class="info-block">
            <strong>Lenguajes:</strong> ${ (p.skills && p.skills.languages) ? esc((p.skills.languages||[]).join(', ')) : '' }<br>
            <strong>Aptitudes:</strong> ${ (p.skills && p.skills.aptitudes) ? esc((p.skills.aptitudes||[]).join(' · ')) : '' }<br>
            <strong>Sistemas:</strong> ${ esc((p.skills && p.skills.systems) ? (p.skills.systems.join(', ')) : '') }
          </div>

          <h2 class="section-title">🌐 Idiomas</h2>
          <div class="info-block">
            Español: ${esc(p.languages?.es || '')}. · Inglés: ${esc(p.languages?.en || '')}.
          </div>

          <h2 class="section-title">🎯 Intereses y Actividades</h2>
          <div class="info-block">
            <strong>Intereses profesionales:</strong> ${esc((p.interests?.professional||[]).join(', '))}.<br>
            <strong>Actividades extracurriculares:</strong> ${esc((p.interests?.extracurricular||[]).join(', '))}
          </div>

          <footer class="mini-footer">Última actualización: ${esc(p.last_updated || '')}</footer>
        </div>
      </div>
    `;

    container.innerHTML = html;

  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="card">No se pudo cargar el perfil. Revisa <code>data/profile.json</code> y la consola (F12).</div>`;
  }
});
