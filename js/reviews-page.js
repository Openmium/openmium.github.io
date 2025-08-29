// js/reviews-page.js
// Carga data/reviews.json, rellena selects, render lista, modal detalle.

const DATA_PATH = 'data/reviews.json';
let REVIEWS = [];
let CATEGORIES = [];

function escapeHtml(s){ if(!s) return ''; return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

function formatDateToDDMMYYYY(raw){
  if(!raw) return '';
  if(/^\d{4}-\d{2}-\d{2}$/.test(raw)){ const [y,m,d] = raw.split('-'); return `${d}-${m}-${y}`; }
  const dt = new Date(raw);
  if(!isNaN(dt)){ const d = String(dt.getDate()).padStart(2,'0'); const m = String(dt.getMonth()+1).padStart(2,'0'); const y = dt.getFullYear(); return `${d}-${m}-${y}`; }
  return raw;
}

function renderStars(rating){
  if(rating == null) return '';
  const full = Math.floor(rating);
  const half = (rating - full) >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  let out = '<span class="stars" aria-hidden="true">';
  for(let i=0;i<full;i++) out += '<span class="star full">★</span>';
  if(half) out += '<span class="star half">★</span>';
  for(let i=0;i<empty;i++) out += '<span class="star empty">★</span>';
  out += `</span> <span style="font-size:13px;color:var(--muted);margin-left:6px">(${rating}/5)</span>`;
  return out;
}

async function loadData(){
  try{
    const res = await fetch(DATA_PATH, { cache: "no-store" });
    if(!res.ok) throw new Error('No se pudo cargar ' + DATA_PATH + ' — status ' + res.status);
    const json = await res.json();
    REVIEWS = json.reviews || [];
    CATEGORIES = json.categories || [];
  } catch(err){
    console.error('[loadData]', err);
    REVIEWS = []; CATEGORIES = [];
    const container = document.getElementById('reviewsList');
    if(container) container.innerHTML = `<div class="card">Error cargando datos: revisa la consola (F12). ${escapeHtml(err.message||'')}</div>`;
  }
  populateCategoryFilters();
  renderList(REVIEWS);
}

function populateCategoryFilters(){
  const catSel = document.getElementById('categorySelect');
  if(!catSel) return;
  catSel.innerHTML = '<option value="all">Todas las categorías</option>';
  CATEGORIES.forEach(c => {
    const o = document.createElement('option'); o.value = c.id; o.textContent = c.label; catSel.appendChild(o);
  });
}

function populateSubSelect(catId){
  const subSel = document.getElementById('subSelect');
  if(!subSel) return;
  subSel.innerHTML = '<option value="all">Todas las subcategorías</option>';
  if(!catId || catId === 'all') return;
  const cat = CATEGORIES.find(c => c.id === catId);
  if(cat && Array.isArray(cat.subs)){
    cat.subs.forEach(s => { const o = document.createElement('option'); o.value = s; o.textContent = s; subSel.appendChild(o); });
  }
}

function renderList(list){
  const el = document.getElementById('reviewsList');
  if(!el) return;
  el.innerHTML = '';
  if(!list.length){ el.innerHTML = '<div class="card">No hay reseñas.</div>'; return; }

  list.forEach(r => {
    const dateStr = formatDateToDDMMYYYY(r.date || '');
    const thumb = (r.images && r.images[0]) ? r.images[0] : 'assets/covers/placeholder.jpg';
    const priceHtml = r.price ? `<div class="price">${escapeHtml(r.price)}</div>` : '';
    const starsHtml = (r.rating || r.rating === 0) ? renderStars(r.rating) : '';
    const card = document.createElement('article');
    card.className = 'review-card';
    card.tabIndex = 0;

    // estructura: thumb | body | right (botón)
    card.innerHTML = `
      <div class="review-thumb"><img src="${thumb}" alt=""></div>
      <div class="review-body">
        <div class="meta">${escapeHtml(dateStr)} · ${escapeHtml(r.category||'')} › ${escapeHtml(r.sub||'')}</div>
        <h3 style="margin:6px 0;color:var(--title)">${escapeHtml(r.title)}</h3>
        <p class="note">${escapeHtml(r.summary || '')}</p>
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:8px">${starsHtml}${priceHtml}</div>
      </div>
      <div class="review-right">
        ${ r.link ? `<a class="product-link-btn" href="${escapeHtml(r.link)}" target="_blank" rel="noopener">Ver producto</a>` : `<span class="no-link">Sin enlace</span>` }
      </div>
    `;

    // Click en tarjeta abre modal (si se hace click en enlace, dejar que navegue)
    card.addEventListener('click', (e) => {
      if(e.target.closest('a')) return;
      openDetail(r.id);
    });
    card.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' ') openDetail(r.id); });

    el.appendChild(card);
  });
}

function openDetail(id){
  const item = REVIEWS.find(x => x.id === id);
  if(!item) return;
  const imgs = (item.images || []).slice(0,8);
  let galleryHtml = '';
  if(imgs.length){
    galleryHtml += '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px;align-items:flex-start">';
    galleryHtml += `<div id="mainImg" style="flex:1;min-width:220px"><img src="${imgs[0]}" style="width:100%;height:auto;max-height:420px;object-fit:cover;border-radius:6px"></div>`;
    galleryHtml += '<div style="display:flex;flex-direction:column;gap:8px;min-width:110px">';
    imgs.forEach((u)=>{ galleryHtml += `<img class="thumb" src="${u}" data-src="${u}" style="width:100px;height:70px;object-fit:cover;border-radius:4px;cursor:pointer">`; });
    galleryHtml += '</div></div>';
  }

  const dateStr = formatDateToDDMMYYYY(item.date || '');
  const starsHtml = item.rating || item.rating === 0 ? renderStars(item.rating) : '';
  const priceHtml = item.price ? `<div class="price">${escapeHtml(item.price)}</div>` : '';
  const linkHtml = item.link ? `<div style="margin-top:12px"><a class="btn btn-primary" href="${escapeHtml(item.link)}" target="_blank" rel="noopener">Ver producto</a></div>` : '';

  document.getElementById('detailContent').innerHTML = `${galleryHtml}
    <div class="meta">${escapeHtml(dateStr)} · ${escapeHtml(item.category||'')} / ${escapeHtml(item.sub||'')}</div>
    <h2 style="margin:8px 0;color:var(--title)">${escapeHtml(item.title)}</h2>
    ${starsHtml}
    ${priceHtml}
    <p class="note" style="margin-top:8px">${escapeHtml(item.content || item.summary || '')}</p>
    ${linkHtml}
  `;
  setTimeout(()=>{
    document.querySelectorAll('#detailContent .thumb').forEach(t => t.addEventListener('click', (e)=>{
      const src = e.currentTarget.dataset.src;
      const main = document.getElementById('mainImg');
      if(main) main.querySelector('img').src = src;
    }));
  }, 20);

  const modal = document.getElementById('detailModal');
  if(!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');

  // cerrar modal: boton X y click fuera (ya en DOMContentLoaded se asignan)
}

document.addEventListener('DOMContentLoaded', () => {
  // handlers de cierre modal
  const modal = document.getElementById('detailModal');
  const closeBtn = document.getElementById('closeDetail');
  if(closeBtn && modal){
    closeBtn.addEventListener('click', ()=> { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); });
    modal.addEventListener('click', (e) => { if(e.target === modal) { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }});
  }

  // filtros / controles
  const searchBox = document.getElementById('searchBox');
  const catSelect = document.getElementById('categorySelect');
  const subSelect = document.getElementById('subSelect');
  const dateFilter = document.getElementById('dateFilter');
  const clearBtn = document.getElementById('clearFilters');

  if(searchBox) searchBox.addEventListener('input', applyFilters);
  if(catSelect) catSelect.addEventListener('change', (e) => { populateSubSelect(e.target.value); applyFilters(); });
  if(subSelect) subSelect.addEventListener('change', applyFilters);
  if(dateFilter) dateFilter.addEventListener('change', applyFilters);
  if(clearBtn) clearBtn.addEventListener('click', () => {
    if(searchBox) searchBox.value = '';
    if(catSelect) catSelect.value = 'all';
    if(subSelect) subSelect.innerHTML = '<option value="all">Todas las subcategorías</option>';
    if(dateFilter) dateFilter.value = '';
    renderList(REVIEWS);
  });

  loadData();
});

function applyFilters(){
  const q = (document.getElementById('searchBox')?.value || '').trim().toLowerCase();
  const cat = (document.getElementById('categorySelect')?.value) || 'all';
  const sub = (document.getElementById('subSelect')?.value) || 'all';
  const date = (document.getElementById('dateFilter')?.value) || '';
  let filtered = REVIEWS.slice();
  if(cat && cat !== 'all') filtered = filtered.filter(r => r.category === cat);
  if(sub && sub !== 'all') filtered = filtered.filter(r => r.sub === sub);
  if(q) filtered = filtered.filter(r => (r.title + ' ' + (r.summary||'') + ' ' + (r.tags||[]).join(' ')).toLowerCase().includes(q));
  if(date){
    const target = formatDateToDDMMYYYY(date);
    filtered = filtered.filter(r => {
      const rd = formatDateToDDMMYYYY(r.date || '');
      return rd === target;
    });
  }
  renderList(filtered);
}
