// js/reviews-page.js
// cargará data/reviews.json, poblará selects, renderizará lista y modal

const DATA_REV = 'data/reviews.json';
let REVIEWS = [];
let CATEGORIES = [];

function escapeHtml(s){ if(!s) return ''; return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

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
    const res = await fetch(DATA_REV, {cache: 'no-store'});
    if(!res.ok) throw new Error('No se pudo cargar ' + DATA_REV + ' - ' + res.status);
    const json = await res.json();
    REVIEWS = json.reviews || [];
    CATEGORIES = json.categories || [];
  }catch(err){
    console.error(err);
    document.getElementById('reviewsList').innerHTML = `<div class="card">Error cargando datos. Mira la consola.</div>`;
    REVIEWS = []; CATEGORIES = [];
  }
  populateCategoryFilters();
  renderList(REVIEWS);
}

function populateCategoryFilters(){
  const catSel = document.getElementById('categorySelect');
  catSel.innerHTML = '<option value="all">Todas las categorías</option>';
  CATEGORIES.forEach(c => {
    const o = document.createElement('option'); o.value = c.id; o.textContent = c.label; catSel.appendChild(o);
  });
}

function populateSubSelect(catId){
  const subSel = document.getElementById('subSelect');
  subSel.innerHTML = '<option value="all">Todas las subcategorías</option>';
  if(catId && catId !== 'all'){
    const cat = CATEGORIES.find(c => c.id === catId);
    if(cat && Array.isArray(cat.subs)){
      cat.subs.forEach(s => { const o = document.createElement('option'); o.value = s; o.textContent = s; subSel.appendChild(o); });
    }
  }
}

function renderList(list){
  const el = document.getElementById('reviewsList'); el.innerHTML = '';
  if(!list.length){
    el.innerHTML = '<div class="card">No hay reseñas.</div>'; return;
  }
  list.forEach(r => {
    const dateStr = formatDateToDDMMYYYY(r.date || '');
    const thumb = (r.images && r.images[0]) ? r.images[0] : 'assets/covers/placeholder.jpg';
    const priceHtml = r.price ? `<div class="price">${escapeHtml(r.price)}</div>` : '';
    const starsHtml = r.rating ? renderStars(r.rating) : '';
    const card = document.createElement('article');
    card.className = 'review-card';
    card.tabIndex = 0;
    // build inner
    const rightHtml = r.link ? `<a class="product-link-btn" href="${r.link}" target="_blank" rel="noopener">Ver producto</a>` : `<span class="no-link">Sin enlace</span>`;
    card.innerHTML = `
      <div style="display:flex;gap:12px;align-items:flex-start;flex:1;min-width:0">
        <div class="review-thumb"><img src="${thumb}" alt=""></div>
        <div class="review-body">
          <div class="meta">${escapeHtml(dateStr)} · ${escapeHtml(r.category||'')} › ${escapeHtml(r.sub||'')}</div>
          <h3 style="margin:0 0 4px 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--title)">${escapeHtml(r.title)}</h3>
          <p class="note" style="margin:0">${escapeHtml(r.summary || '')}</p>
          <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:8px">
            ${starsHtml}
            ${priceHtml}
          </div>
        </div>
      </div>
      <div class="review-right">
        ${rightHtml}
      </div>
    `;
    // click opens detail
    card.addEventListener('click', ()=> openDetail(r.id));
    card.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') openDetail(r.id); });
    el.appendChild(card);
    // stop propagation for link button
    const btn = card.querySelector('.product-link-btn');
    if(btn) btn.addEventListener('click', (ev)=> ev.stopPropagation());
  });
}

/* Modal detail */
function openDetail(id){
  const item = REVIEWS.find(x=>x.id===id); if(!item) return;
  const imgs = (item.images||[]).slice(0,8);
  let galleryHtml = '';
  if(imgs.length){
    galleryHtml += '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px;align-items:flex-start">';
    galleryHtml += `<div id="mainImg" style="flex:1;min-width:220px"><img src="${imgs[0]}" style="width:100%;height:auto;max-height:420px;object-fit:cover;border-radius:6px"></div>`;
    galleryHtml += '<div style="display:flex;flex-direction:column;gap:8px;min-width:110px">';
    imgs.forEach(u => { galleryHtml += `<img class="thumb" src="${u}" data-src="${u}" style="width:100px;height:70px;object-fit:cover;border-radius:4px;cursor:pointer">`; });
    galleryHtml += '</div></div>';
  }
  const dateStr = formatDateToDDMMYYYY(item.date || '');
  const starsHtml = item.rating ? renderStars(item.rating) : '';
  const priceHtml = item.price ? `<div class="price">${escapeHtml(item.price)}</div>` : '';
  const linkHtml = item.link ? `<div style="margin-top:12px"><a class="btn btn-primary" href="${item.link}" target="_blank" rel="noopener">Ver producto</a></div>` : '';
  document.getElementById('detailContent').innerHTML = `
    ${galleryHtml}
    <div class="meta">${escapeHtml(dateStr)} · ${escapeHtml(item.category||'')} / ${escapeHtml(item.sub||'')}</div>
    <h2 style="margin:8px 0;color:var(--title)">${escapeHtml(item.title)}</h2>
    ${starsHtml}
    ${priceHtml}
    <p class="note" style="margin-top:8px">${escapeHtml(item.content || item.summary || '')}</p>
    ${linkHtml}
  `;
  // thumb handlers
  setTimeout(()=> {
    document.querySelectorAll('#detailContent .thumb').forEach(t => t.addEventListener('click', e => {
      const src = e.currentTarget.dataset.src;
      const main = document.getElementById('mainImg');
      if(main) main.querySelector('img').src = src;
    }));
  },20);
  const modal = document.getElementById('detailModal');
  modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
}

/* close modal handlers */
document.addEventListener('click', (e) => {
  const modal = document.getElementById('detailModal');
  if(!modal) return;
  if(modal.classList.contains('open')){
    const card = modal.querySelector('.modal-card');
    if(card && !card.contains(e.target) && !e.target.closest('.review-card')){
      modal.classList.remove('open'); modal.setAttribute('aria-hidden','true');
    }
  }
});
function setupModalClose(){
  const closeBtn = document.getElementById('closeDetail');
  if(closeBtn) closeBtn.addEventListener('click', ()=> {
    const modal = document.getElementById('detailModal'); modal.classList.remove('open'); modal.setAttribute('aria-hidden','true');
  });
}

/* Filters */
function applyFilters(){
  const q = document.getElementById('searchBox').value.trim().toLowerCase();
  const cat = document.getElementById('categorySelect').value;
  const sub = document.getElementById('subSelect').value;
  const date = document.getElementById('dateFilter').value;
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

/* set listeners for filters */
function setupFilters(){
  document.getElementById('searchBox').addEventListener('input', applyFilters);
  document.getElementById('categorySelect').addEventListener('change', (e) => { populateSubSelect(e.currentTarget.value); applyFilters(); });
  document.getElementById('subSelect').addEventListener('change', applyFilters);
  document.getElementById('dateFilter').addEventListener('change', applyFilters);
  document.getElementById('clearFilters').addEventListener('click', ()=> {
    document.getElementById('searchBox').value='';
    document.getElementById('categorySelect').value='all';
    document.getElementById('subSelect').innerHTML = '<option value="all">Todas las subcategorías</option>';
    document.getElementById('dateFilter').value='';
    renderList(REVIEWS);
  });
}

/* init */
document.addEventListener('DOMContentLoaded', ()=> {
  loadData().then(()=> {
    setupFilters();
    setupModalClose();
  });
});
