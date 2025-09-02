// js/index-page.js
// Carga data/profile.json y renderiza la sección "Sobre mí" dentro de #aboutContainer
// Se carga con defer.

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('aboutContainer');
  const DATA = 'data/profile.json';
  const esc = window.utils && window.utils.escapeHtml ? window.utils.escapeHtml : (s=>String(s));

  try {
    const res = await fetch(DATA, {cache: 'no-store'});
    if(!res.ok) throw new Error('No se pudo cargar ' + DATA + ' (status ' + res.status + ')');
    const p = await res.json();

    // construir HTML sin emoticonos, con tamaños responsivos
    const educationHtml = (p.education || []).map(ed => `
      <div class="info-block">
        <strong>${esc(ed.degree)}</strong><br>
        ${esc(ed.institution)} · ${esc(ed.period)} · Nota media: ${esc(ed.gpa || '')}
      </div>
    `).join('');

    const experienceHtml = (p.experience || []).map(ex => `
      <div class="info-block">
        <strong>${esc(ex.role)}</strong><br>
        ${esc(ex.organization)} · ${esc(ex.period)}<br>
        ${esc(ex.notes || '')}
      </div>
    `).join('');

    const skills = p.skills || {};
    const links = p.links || {};

    const html = `
      <div class="about-inner">
        <div class="about-left avatar-wrap">
          <img src="${esc(p.avatar || 'assets/avatar.jpg')}" alt="${esc(p.name || '')}">
        </div>

        <div class="about-right">
          <div style="display:flex;flex-direction:column;gap:6px">
            <h1 class="about-name">${esc(p.name || '')}</h1>
            <div class="about-role">${esc(p.work_status || '')} · ${esc(p.location || '')}</div>
            <div class="about-note">Conexiones: ${esc(p.connections || '')}</div>

            <div class="links-row" style="margin-top:8px">
              ${ links.linkedin ? `<a href="${esc(links.linkedin)}" target="_blank" rel="noopener" class="link-pill">LinkedIn</a>` : '' }
              ${ links.github   ? `<a href="${esc(links.github)}"   target="_blank" rel="noopener" class="link-pill">GitHub</a>` : '' }
              ${ links.pinterest? `<a href="${esc(links.pinterest)}" target="_blank" rel="noopener" class="link-pill">Pinterest</a>` : '' }
            </div>
          </div>

          <div class="sep" role="separator" aria-hidden="true"></div>

          <h2 class="section-title">Información personal</h2>
          <div class="info-grid">
            <div><strong>Nombre:</strong> ${esc(p.name || '')}</div>
            <div><strong>Ubicación:</strong> ${esc(p.location || '')}</div>
            <div><strong>Estado laboral:</strong> ${esc(p.work_status || '')}</div>
            <div><strong>Conexiones:</strong> ${esc(p.connections || '')}</div>
          </div>

          <h2 class="section-title">Formación académica</h2>
          ${educationHtml}

          <h2 class="section-title">Experiencia</h2>
          ${experienceHtml}

          <h2 class="section-title">Habilidades y competencias</h2>
          <div class="info-block">
            <strong>Lenguajes:</strong> ${esc((skills.languages||[]).join(', '))}<br>
            <strong>Aptitudes:</strong> ${esc((skills.aptitudes||[]).join(' · '))}<br>
            <strong>Sistemas:</strong> ${esc((skills.systems||[]).join(', '))}
          </div>

          <h2 class="section-title">Idiomas</h2>
          <div class="info-block">
            Español: ${esc(p.languages?.es || '')}. · Inglés: ${esc(p.languages?.en || '')}.
          </div>

          <h2 class="section-title">Intereses y actividades</h2>
          <div class="info-block">
            <strong>Intereses profesionales:</strong> ${esc((p.interests?.professional||[]).join(', '))}.<br>
            <strong>Actividades extracurriculares:</strong> ${esc((p.interests?.extracurricular||[]).join(', '))}
          </div>

        </div>
      </div>
    `;

    container.innerHTML = html;

    // Ajuste estético: si la imagen no tiene buena proporción, usa object-fit:contain en pantallas pequeñas
    const avatarImg = container.querySelector('.avatar-wrap img');
    if (avatarImg) {
      // si la imagen es muy alta o muy estrecha, cambiar object-fit para evitar zoom recortado
      avatarImg.addEventListener('load', () => {
        try {
          const ratio = avatarImg.naturalWidth / avatarImg.naturalHeight;
          if (ratio < 0.75 || ratio > 1.6) {
            avatarImg.style.objectFit = 'contain'; // evita recortes extremos
            avatarImg.style.background = '#f3f4f6';
            avatarImg.style.padding = '6px';
          } else {
            avatarImg.style.objectFit = 'cover';
          }
        } catch(e) { /* ignore */ }
      });
    }

  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="card">No se pudo cargar el perfil. Revisa <code>data/profile.json</code> y la consola (F12).</div>`;
  }
});
